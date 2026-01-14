#!/usr/bin/env python3
"""
Analyze conversations with new taxonomy (GPT-5.2 / 2.0-social-role-theory)
"""

import json
from pathlib import Path
from collections import Counter

OUTPUT_DIRS = [
    Path("public/output"),
    Path("public/output-wildchat")
]

def find_new_taxonomy_conversations():
    """Find all conversations classified with new taxonomy."""
    conversations = []

    for output_dir in OUTPUT_DIRS:
        if not output_dir.exists():
            continue

        json_files = [f for f in output_dir.glob("*.json") if f.name != "manifest.json"]

        for file_path in json_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                # Check metadata
                classification = data.get('classification', {})
                metadata = classification.get('metadata', {}) or data.get('classificationMetadata', {})

                if metadata:
                    model = metadata.get('model', '').strip()
                    prompt_version = metadata.get('promptVersion', '').strip()

                    if model and prompt_version:
                        conversations.append({
                            'id': data.get('id', file_path.stem),
                            'file': file_path.name,
                            'model': model,
                            'prompt_version': prompt_version
                        })
            except Exception as e:
                pass

    return conversations

print("Searching for conversations with classification metadata...")
convs = find_new_taxonomy_conversations()

print(f"\nTotal conversations with metadata: {len(convs)}")

if convs:
    models = Counter(c['model'] for c in convs)
    prompts = Counter(c['prompt_version'] for c in convs)

    print("\nModels:")
    for model, count in models.most_common():
        print(f"  {model}: {count}")

    print("\nPrompt versions:")
    for prompt, count in prompts.most_common():
        print(f"  {prompt}: {count}")

    # Filter to new taxonomy
    new_tax = [c for c in convs if c['model'] == 'gpt-5.2' and c['prompt_version'] == '2.0-social-role-theory']
    print(f"\nConversations with GPT-5.2 + 2.0-social-role-theory: {len(new_tax)}")

    if new_tax:
        print("\nSample files:")
        for c in new_tax[:10]:
            print(f"  - {c['file']}")
else:
    print("\n⚠️  No conversations have metadata stored. This might mean:")
    print("   1. Metadata is stored differently")
    print("   2. Classifications haven't been run yet")
    print("   3. Files are using an older format")
