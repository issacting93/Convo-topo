#!/usr/bin/env python3
"""
Script to classify remaining unclassified emo-*.json files
"""

import json
import sys
import os
from pathlib import Path

# Add parent directory to path to import classifier
sys.path.insert(0, str(Path(__file__).parent))

def find_unclassified_emo_files():
    """Find all emo files without classification"""
    output_dir = Path("../output")
    unclassified = []
    
    for emo_file in sorted(output_dir.glob("emo-*.json")):
        try:
            with open(emo_file) as f:
                data = json.load(f)
                if "classification" not in data:
                    unclassified.append({
                        'id': data.get('id', emo_file.stem),
                        'messages': data.get('messages', [])
                    })
        except Exception as e:
            print(f"⚠️  Error reading {emo_file}: {e}", file=sys.stderr)
    
    return unclassified

def main():
    unclassified = find_unclassified_emo_files()
    
    if len(unclassified) == 0:
        print("✅ All emo files are already classified!")
        return 0
    
    print(f"Found {len(unclassified)} unclassified emo files")
    
    # Save to temporary file for classification
    temp_file = Path("unclassified-emo-conversations.json")
    with open(temp_file, 'w') as f:
        json.dump(unclassified, f, indent=2)
    
    print(f"✅ Prepared {len(unclassified)} conversations in {temp_file}")
    print(f"\nNow run:")
    print(f"  python3 classifier-openai.py {temp_file} ../output/temp-combined.json --individual --output-dir ../output --prefix emo-")
    print(f"\nOr use the classify script:")
    print(f"  ./classify.sh {temp_file} ../output/temp-combined.json")
    
    return 0

if __name__ == "__main__":
    sys.exit(main())

