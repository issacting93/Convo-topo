
import json
import os
import glob
import re

# Regex patterns (same as before)
SPANISH_PATTERN = re.compile(r'[ñáéíóúü¿¡]|hola|español|entender|gracias|por favor|puedes|quiero|dime|cosas bonitas', re.IGNORECASE)
FRENCH_PATTERN = re.compile(r'[çàâäéèêëïîôùûüÿ]|bonjour|merci|français|comprendre|salut|ça va', re.IGNORECASE)
GERMAN_PATTERN = re.compile(r'[äöüß]|guten tag|danke|verstehen|deutsch|ist ein|rechtwink', re.IGNORECASE)
CJK_PATTERN = re.compile(r'[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]')
ARABIC_PATTERN = re.compile(r'[\u0600-\u06ff]')

def is_english(data):
    messages = data.get('messages', [])
    if not messages: return True, "No messages" 
    sample = messages[:5]
    for msg in sample:
        content = msg.get('content', '')
        if len(content.strip()) < 3: continue
        if SPANISH_PATTERN.search(content): return False, "Spanish"
        if FRENCH_PATTERN.search(content): return False, "French"
        if GERMAN_PATTERN.search(content): return False, "German"
        if CJK_PATTERN.search(content): return False, "CJK"
        if ARABIC_PATTERN.search(content): return False, "Arabic"
    return True, "English"

def check_taxonomy(data):
    meta = data.get('classificationMetadata', {})
    if not meta:
        meta = data.get('classification', {}).get('metadata', {})
    if not meta: return False
    model = meta.get('model', '').lower().strip()
    prompt = meta.get('promptVersion', '').strip()
    is_gpt52 = model in ['gpt-5.2', 'gpt5.2']
    is_new_prompt = prompt == '2.0-social-role-theory'
    return is_gpt52 and is_new_prompt

def check_schema_strict(data):
    # 1. Basic Fields
    if 'id' not in data: return False, "Missing ID"
    
    # 2. Messages Array
    messages = data.get('messages')
    if messages is None or not isinstance(messages, list): return False, "Invalid Messages Array"
    
    # 3. Message Content (Strict)
    for i, msg in enumerate(messages):
        if not isinstance(msg, dict): return False, f"Message {i} not object"
        if 'role' not in msg: return False, f"Message {i} missing role"
        if 'content' not in msg: return False, f"Message {i} missing content"
        
    # 4. Classification Structure (Strict Role Checks)
    classification = data.get('classification')
    if classification:
        for role_type in ['humanRole', 'aiRole']:
            role_data = classification.get(role_type)
            if role_data:
                # Must be string OR object with distribution + confidence
                if isinstance(role_data, str):
                    pass # String is okay
                elif isinstance(role_data, dict):
                    if 'distribution' not in role_data: return False, f"{role_type} missing distribution"
                    if 'confidence' not in role_data: return False, f"{role_type} missing confidence"
                else:
                    return False, f"{role_type} invalid type"

    return True, "Valid"

files = glob.glob('public/output/*.json')
valid_files = []
seen_ids = set()
duplicates = 0
schema_failed = 0
schema_reasons = {}

for f in files:
    try:
        with open(f, 'r') as fh:
            data = json.load(fh)
            
            # 1. Strict Schema Check
            valid_schema, schema_reason = check_schema_strict(data)
            if not valid_schema:
                schema_failed += 1
                schema_reasons[schema_reason] = schema_reasons.get(schema_reason, 0) + 1
                continue

            # 2. Taxonomy Check
            if check_taxonomy(data):
                # 3. Language Check
                is_eng, lang_reason = is_english(data)
                if is_eng:
                    # 4. Duplicate Check
                    cid = data['id']
                    if cid in seen_ids:
                        duplicates += 1
                    else:
                        seen_ids.add(cid)
                        valid_files.append(f)
            
    except Exception as e:
        print(f"Error {f}: {e}")

print(f"Final Count: {len(valid_files)}")
print(f"Schema Validation Failed: {schema_failed}")
for r, c in schema_reasons.items():
    print(f"  {r}: {c}")
