#!/usr/bin/env python3
"""
Re-classify files with old taxonomy using new Social Role Theory taxonomy.

This script:
1. Identifies files with old taxonomy (seeker, learner, sharer, etc.)
2. Re-classifies them using GPT-5.2 with Social Role Theory
3. Updates the files in place

Targets:
- cornell-*.json (10 files)
- kaggle-emo-*.json (9 files)
- chatbot_arena_22832.json (1 file)
Total: 19 files
"""

import json
import sys
import time
import os
from pathlib import Path
from datetime import datetime

# Add parent directory to path to import classifier
sys.path.insert(0, str(Path(__file__).parent.parent))

# Load environment
def load_env_file():
    env_path = Path(__file__).parent.parent / ".env"
    if env_path.exists():
        with open(env_path) as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    if line.startswith("export "):
                        line = line[7:]
                    parts = line.split("=", 1)
                    if len(parts) == 2:
                        key = parts[0].strip()
                        value = parts[1].strip().strip('"').strip("'")
                        os.environ[key] = value

load_env_file()

from openai import OpenAI

# Import the classifier code
import importlib.util
spec = importlib.util.spec_from_file_location(
    "classifier",
    Path(__file__).parent.parent / "classifier" / "classifier-openai-social-role-theory.py"
)
classifier_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(classifier_module)

# Files to re-classify
OLD_TAXONOMY_FILES = [
    "public/output/chatbot_arena_22832.json",
    "public/output/cornell-0.json",
    "public/output/cornell-1.json",
    "public/output/cornell-3.json",
    "public/output/cornell-4.json",
    "public/output/cornell-5.json",
    "public/output/cornell-6.json",
    "public/output/cornell-7.json",
    "public/output/cornell-8.json",
    "public/output/cornell-9.json",
    "public/output/kaggle-emo-0.json",
    "public/output/kaggle-emo-1.json",
    "public/output/kaggle-emo-3.json",
    "public/output/kaggle-emo-4.json",
    "public/output/kaggle-emo-5.json",
    "public/output/kaggle-emo-6.json",
    "public/output/kaggle-emo-7.json",
    "public/output/kaggle-emo-8.json",
    "public/output/kaggle-emo-9.json",
]

def main():
    print("Re-classifying 19 files with old taxonomy...")
    print("=" * 60)

    # Check API key
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        print("ERROR: OPENAI_API_KEY not found in environment")
        print("Please set it in .env file or export it")
        sys.exit(1)

    print(f"✓ API key found: {api_key[:10]}...")

    # Load few-shot examples
    few_shot_path = Path(__file__).parent.parent / "classifier" / "few-shot-examples-social-role-theory.json"
    if not few_shot_path.exists():
        print(f"ERROR: Few-shot examples not found at {few_shot_path}")
        sys.exit(1)

    print(f"✓ Few-shot examples loaded from: {few_shot_path.name}")

    with open(few_shot_path) as f:
        few_shot_examples = json.load(f)

    # Initialize OpenAI client
    client = OpenAI(api_key=api_key)

    # Statistics
    total = len(OLD_TAXONOMY_FILES)
    success = 0
    failed = 0
    skipped = 0

    print(f"\nProcessing {total} files...")
    print("=" * 60)

    for i, file_path in enumerate(OLD_TAXONOMY_FILES, 1):
        print(f"\n[{i}/{total}] {Path(file_path).name}")

        # Check if file exists
        if not Path(file_path).exists():
            print(f"  ⚠️  File not found, skipping")
            skipped += 1
            continue

        try:
            # Read conversation
            with open(file_path) as f:
                conversation = json.load(f)

            # Verify it needs reclassification
            if conversation.get("classification", {}).get("humanRole"):
                human_roles = list(conversation["classification"]["humanRole"].get("distribution", {}).keys())
                old_roles = ["seeker", "learner", "sharer", "challenger"]
                if any(role in old_roles for role in human_roles):
                    print(f"  ✓ Confirmed old taxonomy: {human_roles[:2]}")
                else:
                    print(f"  ⚠️  Already has new taxonomy, skipping")
                    skipped += 1
                    continue

            # Verify conversation has messages
            if not conversation.get("messages"):
                print(f"  ✗ No messages found")
                failed += 1
                continue

            # Call classifier
            print(f"  → Calling GPT-5.2...")

            classification = classifier_module.classify_conversation(
                client=client,
                conversation=conversation,
                few_shot_examples=json.dumps(few_shot_examples, indent=2),
                model="gpt-5.2",
                apply_corrections_flag=False
            )

            if not classification:
                print(f"  ✗ Classification failed")
                failed += 1
                continue

            # Update conversation with new classification
            conversation["classification"] = classification

            # Add metadata about reclassification
            if "metadata" not in conversation:
                conversation["metadata"] = {}
            conversation["metadata"]["reclassified"] = datetime.now().isoformat()
            conversation["metadata"]["reclassification_reason"] = "Updated from old taxonomy to Social Role Theory"

            # Save back to file
            with open(file_path, "w") as f:
                json.dump(conversation, f, indent=2)

            # Show new roles
            new_human_roles = list(classification.get("humanRole", {}).get("distribution", {}).keys())
            new_ai_roles = list(classification.get("aiRole", {}).get("distribution", {}).keys())
            print(f"  ✓ Success! New roles:")
            print(f"    Human: {', '.join(new_human_roles[:3])}")
            print(f"    AI: {', '.join(new_ai_roles[:3])}")

            success += 1

            # Rate limiting
            time.sleep(0.5)

        except Exception as e:
            print(f"  ✗ Error: {str(e)}")
            failed += 1
            continue

    # Summary
    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total files: {total}")
    print(f"✓ Successfully reclassified: {success}")
    print(f"⚠️  Skipped: {skipped}")
    print(f"✗ Failed: {failed}")

    if success > 0:
        print(f"\n✓ {success} files updated with new Social Role Theory taxonomy")
        print("\nNext steps:")
        print("1. Run: node check_data_integrity.cjs")
        print("   Expected: Valid conversations should increase from 543 to ~562")
        print("2. Run: python3 scripts/cluster-paths-proper.py")
        print("   This will regenerate cluster analysis with expanded dataset")

    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
