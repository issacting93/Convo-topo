#!/usr/bin/env python3
"""
Process WildChat conversations through the existing classification pipeline.

This script provides a quick status check and shows how to use existing scripts
to process WildChat conversations through the full pipeline.
"""

import json
from pathlib import Path

def check_classification_status(conv_file: Path) -> bool:
    """Check if conversation is already classified."""
    try:
        with open(conv_file, 'r', encoding='utf-8') as f:
            conv = json.load(f)
            return 'classification' in conv and conv.get('classification')
    except:
        return False

def check_pad_status(conv_file: Path) -> bool:
    """Check if conversation has PAD scores."""
    try:
        with open(conv_file, 'r', encoding='utf-8') as f:
            conv = json.load(f)
            messages = conv.get('messages', [])
            if not messages:
                return False
            # Check if first message has PAD
            return 'pad' in messages[0] or 'emotionalIntensity' in messages[0]
    except:
        return False

def main():
    """Main processing function."""
    project_root = Path(__file__).parent.parent
    wildchat_dir = project_root / 'public' / 'output-wildchat'
    
    if not wildchat_dir.exists():
        print(f"❌ WildChat directory not found: {wildchat_dir}")
        print(f"\n   First download conversations:")
        print(f"   python3 scripts/download-wildchat.py")
        return
    
    # Count conversations
    conv_files = list(wildchat_dir.glob('*.json'))
    print(f"📊 WildChat Status")
    print(f"=" * 60)
    print(f"Total conversations: {len(conv_files)}")
    
    # Check classification status
    classified = sum(1 for f in conv_files if check_classification_status(f))
    unclassified = len(conv_files) - classified
    
    # Check PAD status
    has_pad = sum(1 for f in conv_files if check_pad_status(f))
    
    print(f"  ✅ Classified: {classified}")
    print(f"  ⏳ Unclassified: {unclassified}")
    print(f"  📈 Has PAD scores: {has_pad}")
    print()
    
    if unclassified == 0 and has_pad == len(conv_files):
        print("✅ All conversations processed!")
        print(f"\n   Next: Merge with main dataset and run clustering")
        print(f"   cp public/output-wildchat/*.json public/output/")
        print(f"   python3 scripts/cluster-paths-proper.py")
        return
    
    print("📋 Processing Pipeline:")
    print()
    
    if unclassified > 0:
        print(f"1️⃣  Classify {unclassified} conversations:")
        print(f"   python3 scripts/batch-classify-unclassified.py --directory public/output-wildchat")
        print(f"   # Or with dry-run first:")
        print(f"   python3 scripts/batch-classify-unclassified.py --directory public/output-wildchat --dry-run")
        print()
    
    if has_pad < len(conv_files):
        print(f"2️⃣  Generate PAD scores ({len(conv_files) - has_pad} remaining):")
        print(f"   # Option A: Copy to main output, then generate PAD")
        print(f"   cp public/output-wildchat/*.json public/output/")
        print(f"   python3 scripts/generate-pad-with-llm-direct.py --all")
        print(f"   # Then copy back if needed")
        print()
        print(f"   # Option B: Use regenerate script (supports --output-dir):")
        print(f"   python3 scripts/regenerate-pad-for-low-diversity.py --output-dir public/output-wildchat")
        print()
    
    print(f"3️⃣  Validate data quality:")
    print(f"   # Note: validate-data-quality.py uses public/output/ by default")
    print(f"   # Copy files there first, or modify script to use custom directory")
    print(f"   python3 scripts/validate-data-quality.py")
    print()
    
    print(f"4️⃣  Merge with main dataset:")
    print(f"   cp public/output-wildchat/*.json public/output/")
    print()
    
    print(f"5️⃣  Run clustering on expanded dataset:")
    print(f"   python3 scripts/cluster-paths-proper.py")
    print()

if __name__ == '__main__':
    main()

