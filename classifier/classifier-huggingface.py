#!/usr/bin/env python3
"""
Conversation Metadata Classifier v1.2 (Hugging Face Version)
Level 3 (Macro) Analysis - Whole Episode Classification

This classifier operates at the MACRO level of the multi-resolution framework:
- Unit of analysis: Whole interaction/episode
- Supports: Role attribution with confidence bounds, comparative analysis
- Minimum level at which stable role claims become defensible

Uses Hugging Face Transformers for classification. Supports:
- Zero-shot classification models (for simpler tasks)
- Instruction-following models (LLaMA, Mistral, Phi, etc.) with JSON output
- Local models via transformers library

See docs/MULTI_RESOLUTION_FRAMEWORK.md for the full framework.

Requirements:
    pip install transformers torch accelerate

Usage:
    # Using a zero-shot classification model
    python classifier-huggingface.py conversations.json output.json --model typeform/distilbert-base-uncased-mnli
    
    # Using an instruction-following model (requires more memory)
    python classifier-huggingface.py conversations.json output.json --model meta-llama/Llama-2-7b-chat-hf
    
    # Using a smaller instruction model
    python classifier-huggingface.py conversations.json output.json --model microsoft/Phi-3-mini-4k-instruct
    
    # Using Mistral (good balance of quality and speed)
    python classifier-huggingface.py conversations.json output.json --model mistralai/Mistral-7B-Instruct-v0.2
    
    # Pin model revision (recommended for models with trust_remote_code=True)
    python classifier-huggingface.py conversations.json output.json --model microsoft/Phi-3-mini-4k-instruct --revision <commit_hash>
    
Options:
    --model MODEL_NAME      Hugging Face model identifier
    --revision REVISION     Pin model revision (commit hash) - recommended for trust_remote_code models
    --output-dir DIR        Save individual conversation files to directory
    --individual           Save individual files (default: output/)
    --max-length LENGTH     Maximum input token length (default: 2048, reduced for memory)
    --8bit                 Use 8-bit quantization (saves ~50% memory, requires bitsandbytes)
    --cpu                  Force CPU mode (slower but uses less memory than MPS)
"""

import json
import sys
import time
import os
import re
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, List, Any

try:
    from transformers import (
        pipeline,
        AutoTokenizer,
        AutoModelForCausalLM,
        AutoModelForSequenceClassification,
        GenerationConfig,
    )
    import torch
except ImportError:
    print("Error: transformers or torch not installed.")
    print("Install with: pip install transformers torch accelerate")
    sys.exit(1)

# ============================================================================
# PROMPT (Same as OpenAI/Ollama version)
# ============================================================================

CLASSIFICATION_PROMPT = """You are an academic conversation coder analyzing human–AI dialogues for research on conversational dynamics.

## ANALYSIS LEVEL: MACRO (Episode-Level)
You are analyzing the ENTIRE conversation as a single episode. This is the minimum resolution at which stable role claims become defensible.

## RULES
- Roles are interactional configurations observable in text, not identities or relationships.
- Do NOT infer private intent, diagnosis, or internal emotion beyond explicit wording.
- Use ONLY evidence from the provided conversation.
- Provide short evidence quotes (<= 20 words each).
- If confidence < 0.6, you MUST name one plausible alternative category.
- Evidence quotes must be EXACT excerpts from the conversation.

## TASK
Classify the conversation across 10 dimensions:
- Dimensions 1–8: choose ONE category
- Dimensions 9–10: output a PROBABILITY DISTRIBUTION over roles (values must sum to 1.0)

## CONFIDENCE CALIBRATION
- 0.9–1.0: Unambiguous, clear signals, no reasonable alternative
- 0.7–0.9: Strong fit, minor ambiguity or mixed signals
- 0.5–0.7: Moderate fit, could reasonably be another category
- 0.3–0.5: Weak fit, defaulting due to lack of better option / short conversation
- <0.3: Highly uncertain, conversation may be too short or ambiguous

## EDGE CASES
- If conversation is 1–2 turns: set confidence <= 0.5 for most dimensions
- If you cannot justify with quotes: set confidence <= 0.5
- Set "abstain": true if too short/ambiguous to meaningfully classify (still provide best-effort)

---

## DIMENSION DEFINITIONS

### 1. INTERACTION PATTERN
Categories: question-answer, storytelling, advisory, debate, collaborative, casual-chat

### 2. POWER DYNAMICS
Categories: human-led, ai-led, balanced, alternating

### 3. EMOTIONAL TONE
Categories: supportive, playful, serious, empathetic, professional, neutral

### 4. ENGAGEMENT STYLE
Categories: questioning, challenging, exploring, affirming, reactive

### 5. KNOWLEDGE EXCHANGE
Categories: personal-sharing, skill-sharing, opinion-exchange, factual-info, experience-sharing

### 6. CONVERSATION PURPOSE
Categories: information-seeking, problem-solving, entertainment, relationship-building, self-expression

### 7. TOPIC DEPTH
Categories: surface, moderate, deep

### 8. TURN TAKING
Categories: user-dominant, assistant-dominant, balanced

### 9. HUMAN ROLE (DISTRIBUTION REQUIRED)
Roles: seeker, learner, director, collaborator, sharer, challenger
Output probability weights that sum to 1.0.

### 10. AI ROLE (DISTRIBUTION REQUIRED)
Roles: expert, advisor, facilitator, reflector, peer, affiliative
Output probability weights that sum to 1.0.

---

## OUTPUT FORMAT
CRITICAL: You MUST return ONLY valid JSON. Nothing else. No markdown, no tables, no explanations, no category definitions.

RULES:
- Start with {{ and end with }}
- No text before or after the JSON
- No markdown code fences (no ```json)
- No markdown tables (no | Category | Definition |)
- No explanations or category descriptions
- Role distributions must sum to 1.0
- All confidence fields must be numbers between 0 and 1
- Evidence arrays must be arrays (possibly empty), never null

OUTPUT ONLY THIS JSON STRUCTURE:

{{
  "abstain": false,
  "interactionPattern": {{"category": "...", "confidence": 0.0, "evidence": ["..."], "rationale": "...", "alternative": null}},
  "powerDynamics": {{"category": "...", "confidence": 0.0, "evidence": ["..."], "rationale": "...", "alternative": null}},
  "emotionalTone": {{"category": "...", "confidence": 0.0, "evidence": ["..."], "rationale": "...", "alternative": null}},
  "engagementStyle": {{"category": "...", "confidence": 0.0, "evidence": ["..."], "rationale": "...", "alternative": null}},
  "knowledgeExchange": {{"category": "...", "confidence": 0.0, "evidence": ["..."], "rationale": "...", "alternative": null}},
  "conversationPurpose": {{"category": "...", "confidence": 0.0, "evidence": ["..."], "rationale": "...", "alternative": null}},
  "topicDepth": {{"category": "...", "confidence": 0.0, "evidence": ["..."], "rationale": "...", "alternative": null}},
  "turnTaking": {{"category": "...", "confidence": 0.0, "evidence": ["..."], "rationale": "...", "alternative": null}},
  "humanRole": {{
    "distribution": {{"seeker": 0, "learner": 0, "director": 0, "collaborator": 0, "sharer": 0, "challenger": 0}},
    "confidence": 0.0,
    "evidence": [{{"role": "seeker", "quote": "..."}}],
    "rationale": "...",
    "alternative": null
  }},
  "aiRole": {{
    "distribution": {{"expert": 0, "advisor": 0, "facilitator": 0, "reflector": 0, "peer": 0, "affiliative": 0}},
    "confidence": 0.0,
    "evidence": [{{"role": "expert", "quote": "..."}}],
    "rationale": "...",
    "alternative": null
  }}
}}

---

## CONVERSATION TO ANALYZE

"""

# ============================================================================
# UTILITY FUNCTIONS
# ============================================================================

def format_conversation(messages: List[Dict]) -> str:
    """Format messages for prompt"""
    lines = []
    for i, msg in enumerate(messages, 1):
        role = "HUMAN" if msg.get("role") == "user" else "AI"
        content = msg.get("content", "")
        lines.append(f"[{i}] {role}: {content}")
    return "\n\n".join(lines)


def extract_json(text: str) -> str:
    """Extract JSON from response with robust fallback"""
    text = text.strip()
    
    # Remove markdown code fences
    if text.startswith("```"):
        lines = text.split("\n")
        if len(lines) > 2:
            text = "\n".join(lines[1:-1])
        elif len(lines) == 2:
            text = lines[1]
        text = text.strip()
    
    # Try direct JSON parse first
    try:
        json.loads(text)
        return text
    except json.JSONDecodeError:
        pass
    
    # Find JSON object boundaries
    start = text.find("{")
    if start < 0:
        return text
    
    # Find matching closing brace
    brace_count = 0
    end = start
    for i in range(start, len(text)):
        if text[i] == '{':
            brace_count += 1
        elif text[i] == '}':
            brace_count -= 1
            if brace_count == 0:
                end = i + 1
                break
    
    if end > start:
        json_candidate = text[start:end]
        # Try parsing to validate
        try:
            json.loads(json_candidate)
            return json_candidate
        except json.JSONDecodeError:
            pass
    
    # Last resort: return what we found
    if start >= 0:
        end = text.rfind("}") + 1
        if end > start:
            return text[start:end]
    
    return text


def build_repair_prompt(bad_text: str) -> str:
    """Build a prompt to repair broken JSON (Patch C)"""
    return (
        "You must output ONLY valid JSON for the classification schema.\n"
        "Fix any JSON issues (missing quotes, trailing commas, extra text).\n"
        "Return JSON only. No markdown.\n\n"
        "BROKEN OUTPUT:\n"
        f"{bad_text}\n"
    )


def clamp01(x):
    """Clamp value to [0.0, 1.0] range, defaulting to 0.5 on error"""
    try:
        return max(0.0, min(1.0, float(x)))
    except Exception:
        return 0.5


def normalize_dist(dist: Dict[str, float]) -> Dict[str, float]:
    """Normalize distribution to sum EXACTLY 1.0 (Patch D)"""
    keys = list(dist.keys())
    vals = [float(dist.get(k, 0.0)) for k in keys]
    total = sum(vals)
    if total <= 0:
        # default to uniform if all zero
        n = len(keys)
        return {k: 1.0 / n for k in keys}

    raw = [v / total for v in vals]

    # Keep high precision but ensure exact sum == 1.0 via adjustment
    rounded = [round(x, 6) for x in raw]
    diff = 1.0 - sum(rounded)
    # Adjust the largest element by the diff
    j = max(range(len(rounded)), key=lambda i: rounded[i])
    rounded[j] = round(rounded[j] + diff, 6)

    return {k: rounded[i] for i, k in enumerate(keys)}


def validate_classification(data: Dict) -> Dict:
    """Validate and fix classification output"""
    # Normalize distributions
    if "humanRole" in data and "distribution" in data["humanRole"]:
        data["humanRole"]["distribution"] = normalize_dist(data["humanRole"]["distribution"])
    if "aiRole" in data and "distribution" in data["aiRole"]:
        data["aiRole"]["distribution"] = normalize_dist(data["aiRole"]["distribution"])
    
    # Clamp confidence values to [0.0, 1.0]
    confidence_fields = [
        "interactionPattern", "powerDynamics", "emotionalTone", "engagementStyle",
        "knowledgeExchange", "conversationPurpose", "topicDepth", "turnTaking"
    ]
    for field in confidence_fields:
        if field in data and isinstance(data[field], dict) and "confidence" in data[field]:
            data[field]["confidence"] = clamp01(data[field]["confidence"])
    
    # Clamp role confidences
    for role_field in ["humanRole", "aiRole"]:
        if role_field in data and isinstance(data[role_field], dict):
            if "confidence" in data[role_field]:
                data[role_field]["confidence"] = clamp01(data[role_field]["confidence"])
    
    return data


# ============================================================================
# CLASSIFIER (Hugging Face Version)
# ============================================================================

class HuggingFaceClassifier:
    """Classifier using Hugging Face models"""
    
    def __init__(self, model_name: str, device: str = None, revision: str = None, use_8bit: bool = False, force_cpu: bool = False):
        self.model_name = model_name
        # Patch A: Support MPS (Apple Silicon) device
        # Memory safety: Allow forcing CPU if MPS causes issues
        if force_cpu:
            self.device = "cpu"
        else:
            self.device = device or (
                "cuda" if torch.cuda.is_available()
                else "mps" if getattr(torch.backends, "mps", None) and torch.backends.mps.is_available()
                else "cpu"
            )
        self.revision = revision  # Pin revision to avoid remote code updates
        self.use_8bit = use_8bit  # 8-bit quantization for memory savings
        self.tokenizer = None
        self.model = None
        self.is_instruction_model = False
        
        # Check if this is an instruction-following model
        instruction_keywords = ["instruct", "chat", "llama", "mistral", "phi", "falcon"]
        self.is_instruction_model = any(kw in model_name.lower() for kw in instruction_keywords)
        
        self._load_model()
    
    def _load_model(self):
        """Load the model and tokenizer"""
        revision_str = f" (revision: {self.revision})" if self.revision else ""
        print(f"Loading model: {self.model_name} on {self.device}{revision_str}...")
        
        try:
            if self.is_instruction_model:
                # Patch E: Warn if trust_remote_code without revision
                load_kwargs = {"trust_remote_code": True}
                if self.revision:
                    load_kwargs["revision"] = self.revision
                else:
                    print("⚠️  Warning: trust_remote_code=True without --revision pin. "
                          "For reproducibility/safety, pass --revision <commit_hash>.")
                
                self.tokenizer = AutoTokenizer.from_pretrained(
                    self.model_name,
                    **load_kwargs
                )
                
                # Set padding token if not present
                if self.tokenizer.pad_token is None:
                    self.tokenizer.pad_token = self.tokenizer.eos_token
                
                # Memory optimization: Use float16 when possible, or 8-bit quantization
                if self.use_8bit:
                    try:
                        from transformers import BitsAndBytesConfig
                        quantization_config = BitsAndBytesConfig(load_in_8bit=True)
                        load_kwargs["quantization_config"] = quantization_config
                        dtype = None  # Quantization handles dtype
                        print("📦 Using 8-bit quantization for memory savings")
                    except ImportError:
                        print("⚠️  bitsandbytes not installed, falling back to float16")
                        self.use_8bit = False
                
                if not self.use_8bit:
                    # Use float16 on CUDA/MPS, float32 on CPU (more stable)
                    if self.device == "cuda":
                        dtype = torch.float16
                    elif self.device == "mps":
                        # MPS supports float16 but can be less stable - use float32 for safety
                        dtype = torch.float32
                    else:
                        dtype = torch.float32
                else:
                    dtype = None
                
                model_kwargs = {
                    "torch_dtype": dtype,
                    **load_kwargs
                }
                
                # low_cpu_mem_usage requires accelerate package
                try:
                    import accelerate
                    model_kwargs["low_cpu_mem_usage"] = True
                except ImportError:
                    print("⚠️  accelerate not installed - using standard loading (may use more memory)")
                    # Don't set low_cpu_mem_usage if accelerate isn't available
                
                # Only use device_map for CUDA (not for CPU/MPS)
                if self.device == "cuda":
                    try:
                        import accelerate
                        model_kwargs["device_map"] = "auto"
                    except ImportError:
                        print("⚠️  accelerate not installed - device_map not available")
                
                self.model = AutoModelForCausalLM.from_pretrained(
                    self.model_name,
                    **model_kwargs
                )
                
                # Patch A: Move to device for CPU/MPS (device_map handles CUDA)
                if self.device in ("cpu", "mps") and not self.use_8bit:
                    self.model = self.model.to(self.device)
                
                self.model.eval()
                print(f"✅ Loaded instruction model: {self.model_name}")
            else:
                # Patch 3: Remove recursion - raise error instead of infinite loop
                raise ValueError(
                    "This script requires an instruction-following causal LM for structured JSON. "
                    "Use --model microsoft/Phi-3-mini-4k-instruct (recommended) or mistralai/Mistral-7B-Instruct-v0.2."
                )
                
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            raise
    
    def classify(self, messages: List[Dict], max_length: int = 4096) -> Dict:
        """Classify a conversation"""
        if not self.is_instruction_model:
            raise ValueError("Only instruction-following models are supported for structured output")
        
        formatted = format_conversation(messages)
        user_prompt = CLASSIFICATION_PROMPT + formatted
        
        # Use proper chat template if available (especially for Phi-3)
        if hasattr(self.tokenizer, "apply_chat_template") and self.tokenizer.chat_template is not None:
            # Use chat template for proper formatting (updated system message)
            # Make it very explicit about JSON-only output
            system_msg = (
                "You are a JSON generator. Your ONLY job is to output valid JSON.\n"
                "CRITICAL RULES:\n"
                "- Output ONLY the JSON object, nothing else\n"
                "- No markdown, no explanations, no tables, no text before or after\n"
                "- Start with { and end with }\n"
                "- Follow the exact schema provided\n"
                "- Do NOT output markdown tables or category definitions"
            )
            chat_messages = [
                {"role": "system", "content": system_msg},
                {"role": "user", "content": user_prompt}
            ]
            prompt_text = self.tokenizer.apply_chat_template(
                chat_messages,
                tokenize=False,
                add_generation_prompt=True
            )
        else:
            # Fallback to manual formatting for models without chat templates
            if "llama" in self.model_name.lower():
                prompt_text = f"<s>[INST] {user_prompt} [/INST]\n"
            elif "mistral" in self.model_name.lower():
                prompt_text = f"<s>[INST] {user_prompt} [/INST]"
            elif "phi" in self.model_name.lower():
                prompt_text = f"<|user|>\n{user_prompt}<|end|>\n<|assistant|>\n"
            else:
                prompt_text = f"{user_prompt}\n\nReturn the JSON classification:\n"
        
        # Tokenize
        # Patch 1: Safer .to(self.device) for MPS compatibility
        inputs = self.tokenizer(
            prompt_text,
            return_tensors="pt",
            truncation=True,
            max_length=max_length,
            padding=False
        )
        inputs = {k: v.to(self.device) for k, v in inputs.items()}
        
        # Create GenerationConfig (avoids deprecation warning from mutating model.config)
        # Patch 2: Add eos_token_id for Phi-3 to stop generation properly
        # Note: temperature is not used when do_sample=False (greedy decoding)
        # Reduced max_new_tokens to prevent markdown table generation
        generation_config = GenerationConfig(
            do_sample=False,  # Deterministic output (greedy decoding)
            top_p=1.0,
            max_new_tokens=300,  # Reduced to prevent markdown output
            repetition_penalty=1.05,
            pad_token_id=self.tokenizer.eos_token_id,
            eos_token_id=self.tokenizer.eos_token_id,
        )
        
        # Generate with timing
        t0 = time.time()
        with torch.no_grad():
            outputs = self.model.generate(
                **inputs,
                generation_config=generation_config
            )
        generate_time = time.time() - t0
        
        # Patch B: Decode only the completion tokens (avoid fragile prompt splitting)
        input_len = inputs["input_ids"].shape[-1]
        gen_tokens = outputs[0][input_len:]
        response = self.tokenizer.decode(gen_tokens, skip_special_tokens=True).strip()
        
        # Extract and parse JSON with robust fallback
        json_text = extract_json(response)
        
        # Patch C: JSON repair retry mechanism
        def try_parse(s: str):
            data = json.loads(s)
            return validate_classification(data)
        
        try:
            return try_parse(json_text)
        except json.JSONDecodeError:
            # One deterministic repair attempt
            print(f"⚠️  Initial JSON parse failed, attempting repair...")
            repair_user = build_repair_prompt(response)
            repair_msgs = [
                {"role": "system", "content": "Return ONLY valid JSON. No other text."},
                {"role": "user", "content": repair_user},
            ]
            repair_prompt = (
                self.tokenizer.apply_chat_template(repair_msgs, tokenize=False, add_generation_prompt=True)
                if hasattr(self.tokenizer, "apply_chat_template") and self.tokenizer.chat_template is not None
                else repair_user
            )
            # Patch 1: Safer .to(self.device) for MPS compatibility
            repair_inputs = self.tokenizer(
                repair_prompt, return_tensors="pt", truncation=True, max_length=max_length, padding=False
            )
            repair_inputs = {k: v.to(self.device) for k, v in repair_inputs.items()}

            repair_t0 = time.time()
            with torch.no_grad():
                repair_out = self.model.generate(**repair_inputs, generation_config=generation_config)
            repair_time = time.time() - repair_t0

            # Patch B: Decode only new tokens from repair
            repair_input_len = repair_inputs["input_ids"].shape[-1]
            repair_resp = self.tokenizer.decode(repair_out[0][repair_input_len:], skip_special_tokens=True).strip()
            repaired = extract_json(repair_resp)

            try:
                return try_parse(repaired)
            except json.JSONDecodeError as e:
                print(f"⚠️  JSON decode error (after repair): {e}")
                print(f"Original response (first 500 chars): {response[:500]}")
                print(f"Repair response (first 500 chars): {repair_resp[:500]}")
                print(f"Generate time: {generate_time:.2f}s, Repair time: {repair_time:.2f}s")
                return self._default_classification()
    
    def _default_classification(self) -> Dict:
        """Return a default classification structure"""
        return {
            "abstain": True,
            "interactionPattern": {
                "category": "question-answer",
                "confidence": 0.5,
                "evidence": [],
                "rationale": "Failed to parse JSON response",
                "alternative": None
            },
            "powerDynamics": {
                "category": "balanced",
                "confidence": 0.5,
                "evidence": [],
                "rationale": "Default",
                "alternative": None
            },
            "emotionalTone": {
                "category": "neutral",
                "confidence": 0.5,
                "evidence": [],
                "rationale": "Default",
                "alternative": None
            },
            "engagementStyle": {
                "category": "reactive",
                "confidence": 0.5,
                "evidence": [],
                "rationale": "Default",
                "alternative": None
            },
            "knowledgeExchange": {
                "category": "factual-info",
                "confidence": 0.5,
                "evidence": [],
                "rationale": "Default",
                "alternative": None
            },
            "conversationPurpose": {
                "category": "information-seeking",
                "confidence": 0.5,
                "evidence": [],
                "rationale": "Default",
                "alternative": None
            },
            "topicDepth": {
                "category": "moderate",
                "confidence": 0.5,
                "evidence": [],
                "rationale": "Default",
                "alternative": None
            },
            "turnTaking": {
                "category": "balanced",
                "confidence": 0.5,
                "evidence": [],
                "rationale": "Default",
                "alternative": None
            },
            "humanRole": {
                "distribution": {
                    "seeker": 1.0,
                    "learner": 0.0,
                    "director": 0.0,
                    "collaborator": 0.0,
                    "sharer": 0.0,
                    "challenger": 0.0
                },
                "confidence": 0.5,
                "evidence": [],
                "rationale": "Default",
                "alternative": None
            },
            "aiRole": {
                "distribution": {
                    "expert": 1.0,
                    "advisor": 0.0,
                    "facilitator": 0.0,
                    "reflector": 0.0,
                    "peer": 0.0,
                    "affiliative": 0.0
                },
                "confidence": 0.5,
                "evidence": [],
                "rationale": "Default",
                "alternative": None
            }
        }


def classify_conversation_hf(
    classifier: HuggingFaceClassifier,
    conversation: Dict,
    max_length: int = 4096
) -> Dict:
    """Classify a conversation using Hugging Face"""
    messages = conversation.get("messages", [])
    
    if not messages:
        return classifier._default_classification()
    
    start_time = time.time()
    classification = classifier.classify(messages, max_length)
    processing_time = int((time.time() - start_time) * 1000)
    
    classification["classificationMetadata"] = {
        "model": classifier.model_name,
        "provider": "huggingface",
        "timestamp": datetime.now().isoformat(),
        "promptVersion": "v1.2-macro",
        "processingTimeMs": processing_time
    }
    
    return classification


def classify_batch_hf(
    conversations: List[Dict],
    model_name: str,
    output_dir: Optional[str] = None,
    max_length: int = 4096,
    revision: Optional[str] = None,
    use_8bit: bool = False,
    force_cpu: bool = False
) -> List[Dict]:
    """Classify a batch of conversations"""
    
    print(f"Initializing Hugging Face classifier with model: {model_name}")
    classifier = HuggingFaceClassifier(model_name, revision=revision, use_8bit=use_8bit, force_cpu=force_cpu)
    
    print(f"📋 Classifying {len(conversations)} conversations...\n")
    
    results = []
    
    for i, conversation in enumerate(conversations, 1):
        conv_id = conversation.get("id", f"conv-{i}")
        print(f"[{i}/{len(conversations)}] Processing {conv_id}...", end=" ", flush=True)
        
        try:
            classification = classify_conversation_hf(classifier, conversation, max_length)
            
            conversation["classification"] = classification
            
            results.append(conversation)
            
            processing_time = classification.get("classificationMetadata", {}).get("processingTimeMs", 0)
            
            # Save individual file if output_dir specified
            if output_dir:
                output_path = Path(output_dir)
                output_path.mkdir(parents=True, exist_ok=True)
                filename = f"{conv_id}.json"
                filepath = output_path / filename
                with open(filepath, "w") as f:
                    json.dump(conversation, f, indent=2)
                print(f"✅ Saved ({processing_time}ms)")
            else:
                print(f"✅ ({processing_time}ms)")
            
            # Small delay to avoid overwhelming the system
            time.sleep(0.1)
            
        except Exception as e:
            print(f"❌ Error: {e}")
            continue
    
    return results


# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print(__doc__)
        print("\nRecommended models:")
        print("  - microsoft/Phi-3-mini-4k-instruct (small, fast, good quality)")
        print("  - mistralai/Mistral-7B-Instruct-v0.2 (balanced)")
        print("  - meta-llama/Llama-2-7b-chat-hf (larger, higher quality)")
        print("\nNote: Models will be downloaded from Hugging Face on first use.")
        print("      You may need to authenticate: huggingface-cli login")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    # Parse options
    model_name = "microsoft/Phi-3-mini-4k-instruct"  # Default: small, fast model
    individual = False
    output_dir = None
    max_length = 2048  # Reduced default to save memory
    revision = None
    use_8bit = False
    force_cpu = False
    
    if "--model" in sys.argv:
        idx = sys.argv.index("--model")
        model_name = sys.argv[idx + 1]
    
    if "--revision" in sys.argv:
        idx = sys.argv.index("--revision")
        revision = sys.argv[idx + 1]
    
    if "--output-dir" in sys.argv:
        idx = sys.argv.index("--output-dir")
        output_dir = sys.argv[idx + 1]
        individual = True
    elif "--individual" in sys.argv:
        individual = True
        output_dir = "output"
    
    if "--max-length" in sys.argv:
        idx = sys.argv.index("--max-length")
        max_length = int(sys.argv[idx + 1])
    
    if "--8bit" in sys.argv or "--use-8bit" in sys.argv:
        use_8bit = True
        print("📦 8-bit quantization enabled for memory savings")
    
    if "--cpu" in sys.argv or "--force-cpu" in sys.argv:
        force_cpu = True
        print("💻 Forcing CPU mode (may be slower but uses less memory)")
    
    # Load conversations
    print(f"Loading from {input_file}...")
    with open(input_file, "r") as f:
        data = json.load(f)
        if isinstance(data, list):
            conversations = data
        elif isinstance(data, dict):
            conversations = [data]
        else:
            print("Error: Input file must be JSON")
            sys.exit(1)
    
    print(f"Found {len(conversations)} conversations")
    
    # Classify
    results = classify_batch_hf(
        conversations,
        model_name,
        output_dir if individual else None,
        max_length,
        revision,
        use_8bit,
        force_cpu
    )
    
    # Save output (if not using --individual or if --combined specified)
    if not individual or "--combined" in sys.argv:
        with open(output_file, "w") as f:
            if len(results) == 1:
                json.dump(results[0], f, indent=2)
            else:
                json.dump(results, f, indent=2)
        print(f"\n✅ Saved {len(results)} conversations to {output_file}")
    
    print(f"\n✅ Classification complete! Processed {len(results)}/{len(conversations)} conversations")

