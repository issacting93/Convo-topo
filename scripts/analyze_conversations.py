import json
import os
import glob
from pathlib import Path
import spacy
from tqdm import tqdm
import sys

# Try to load spaCy model, download if easier
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Downloading spaCy model 'en_core_web_sm'...")
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

# Initialize Zero-Shot Classifier (Lazy load or global)
classifier = None

def get_classifier():
    """
    Load the HuggingFace Zero-Shot Classification pipeline.
    This runs LOCALLY. The model is downloaded to ~/.cache/huggingface on first run.
    """
    global classifier
    if classifier is None:
        try:
            print("Loading Zero-Shot Classification model (facebook/bart-large-mnli)...")
            from transformers import pipeline
            # Use a smaller device if possible, or CPU (default)
            # device=-1 for CPU, 0 for GPU if available
            classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli")
        except Exception as e:
            print(f"Error loading transformer model: {e}")
            classifier = False # Mark as failed so we don't try again
    return classifier

def analyze_message_zeroshot(text):
    """
    Analyze text using Zero-Shot Classification for semantic stance.
    Labels: "supportive collaborative", "directive exertive"
    """
    clf = get_classifier()
    if not clf or clf is False:
        return None
        
    candidate_labels = ["supportive collaborative", "directive exertive"]
    
    try:
        result = clf(text, candidate_labels)
        # result is dict with 'labels' and 'scores'
        
        # Map back to our keys
        scores = {}
        for label, score in zip(result['labels'], result['scores']):
            if "supportive" in label:
                scores["supportive_ml_score"] = score
            elif "directive" in label:
                scores["directive_ml_score"] = score
        
        return scores
    except Exception as e:
        # print(f"ML Error: {e}")
        return None

def analyze_message_spacy(text):
    """
    Analyze a single message using spaCy to detect linguistic markers
    for Supportive/Collaborative vs Directive/Exertive stance.
    """
    doc = nlp(text)
    
    # ---------------------------------------------------------
    # 1. Directive/Exertive Markers
    # ---------------------------------------------------------
    
    # A. Imperatives: Root verb with no subject
    imperative_count = 0
    for sent in doc.sents:
        for token in sent:
            if token.dep_ == "ROOT" and token.pos_ == "VERB":
                # Check if it has a subject
                has_subject = any(child.dep_ in ["nsubj", "nsubjpass"] for child in token.children)
                # Check if it's a question (starts with auxiliary or has question mark)
                is_question = text.strip().endswith("?") or (sent[0].pos_ == "AUX" and sent[0].dep_ == "aux")
                
                if not has_subject and not is_question:
                    imperative_count += 1
    
    # B. Strong Modality (Must, Should, Need to)
    strong_modals = {"must", "should", "ought", "need", "have"} # 'have to' is harder, simplifying
    modality_count = 0
    for token in doc:
        if token.lemma_ in strong_modals:
            # Filter 'have' to only count 'have to' roughly (auxiliary usage)
            if token.lemma_ == "have" and any(child.text == "to" for child in token.children):
                modality_count += 1
            elif token.lemma_ != "have":
                modality_count += 1

    # ---------------------------------------------------------
    # 2. Supportive/Collaborative Markers
    # ---------------------------------------------------------

    # A. Hedges
    hedges = {"maybe", "perhaps", "possibly", "likely", "probably", "might", "could", "may", "seem", "appear"}
    hedge_count = 0
    for token in doc:
        if token.lemma_ in hedges:
            hedge_count += 1
            
    # B. Inclusive Language (First person plural)
    inclusive_pronouns = {"we", "us", "our", "ours", "ourselves", "let"} # 'let us' -> let
    inclusive_count = 0
    for token in doc:
        if token.lower_ in inclusive_pronouns:
            inclusive_count += 1

    # C. Epistemic Humility (I think, I believe)
    humility_count = 0
    # Simple pattern matching for "I think", "I believe"
    # A more robust way would be dependency parsing: nsubj(I) <- (think/believe/feel)
    for token in doc:
        if token.lemma_ in ["think", "believe", "feel", "suspect"] and token.pos_ == "VERB":
             # Check if subject is "I"
             children = [child.lower_ for child in token.children if child.dep_ == "nsubj"]
             if "i" in children:
                 humility_count += 1

    return {
        "imperative_count": imperative_count,
        "modality_count": modality_count,
        "hedge_count": hedge_count,
        "inclusive_count": inclusive_count,
        "humility_count": humility_count
    }

def process_file(file_path):
    """
    Load a JSON file, enrich it with linguistic analysis, and return the modified data.
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Check if messages exist
    if "messages" not in data:
        return None
    
    messages = data["messages"]
    
    # Only process a few messages if testing, but for full run do all
    # Optimization: Loading the ML model is slow, inference is slow.
    
    for msg in messages:
        content = msg.get("content", "")
        if not content or len(content) < 5:
            continue
            
        # Perform spaCy analysis (Fast)
        spacy_analysis = analyze_message_spacy(content)
        
        # Perform Zero-Shot analysis (Slow - only do if message is significant)
        ml_analysis = {}
        if len(content.split()) > 5: # Only run on sentences > 5 words
            ml_res = analyze_message_zeroshot(content)
            if ml_res:
                ml_analysis = ml_res
        
        # Add to message object
        if "linguistic_markers" not in msg:
            msg["linguistic_markers"] = {}
        
        msg["linguistic_markers"].update(spacy_analysis)
        msg["linguistic_markers"].update(ml_analysis)

    return data

def main():
    # Directory setup
    base_dir = Path("public/output")
    if not base_dir.exists():
        print(f"Error: Directory {base_dir} not found.")
        return

    # Get all JSON files
    files = list(base_dir.glob("*.json"))
    print(f"Found {len(files)} files to process in {base_dir}...")
    
    for file_path in tqdm(files):
        # Skip manifest or archive or already processed files if we had a naming convention
        if file_path.name == "manifest.json":
            continue
            
        try:
            enriched_data = process_file(file_path)
            
            if enriched_data:
                # Overwrite the file with enriched data
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(enriched_data, f, indent=2, ensure_ascii=False)
                    
        except Exception as e:
            print(f"Error processing {file_path.name}: {e}")

if __name__ == "__main__":
    main()
