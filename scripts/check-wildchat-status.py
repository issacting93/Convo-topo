#!/usr/bin/env python3
"""
Quick status check for WildChat conversations
Shows classification and PAD status
"""

import json
from pathlib import Path
from collections import Counter

def check_wildchat_status():
    output_dir = Path('public/output-wildchat')
    if not output_dir.exists():
        print("❌ Directory not found: public/output-wildchat")
        return
    
    files = list(output_dir.glob('*.json'))
    if not files:
        print("❌ No JSON files found in public/output-wildchat")
        return
    
    classified = 0
    with_pad = 0
    complete = 0
    need_classification = []
    need_pad = []
    message_counts = []
    pad_diversity = []
    
    for file in sorted(files):
        try:
            with open(file, 'r') as f:
                data = json.load(f)
                
            has_classification = 'classification' in data and data.get('classification')
            has_pad = False
            pad_values = []
            
            if 'messages' in data:
                message_counts.append(len(data['messages']))
                for msg in data['messages']:
                    if isinstance(msg, dict) and 'pad' in msg:
                        has_pad = True
                        pad = msg['pad']
                        if isinstance(pad, dict):
                            pad_tuple = (
                                round(pad.get('pleasure', 0), 2),
                                round(pad.get('arousal', 0), 2),
                                round(pad.get('dominance', 0), 2)
                            )
                            pad_values.append(pad_tuple)
            
            if has_classification:
                classified += 1
            else:
                need_classification.append(file.name)
            
            if has_pad:
                with_pad += 1
                if pad_values:
                    unique_pads = len(set(pad_values))
                    total = len(pad_values)
                    diversity = unique_pads / total if total > 0 else 0
                    pad_diversity.append(diversity)
            else:
                if has_classification:
                    need_pad.append(file.name)
            
            if has_classification and has_pad:
                complete += 1
                
        except Exception as e:
            print(f"⚠️  Error reading {file.name}: {e}")
            continue
    
    print("=" * 60)
    print("📊 WildChat Status Report")
    print("=" * 60)
    print(f"\nTotal files: {len(files)}")
    print(f"✅ Classified: {classified} ({classified/len(files)*100:.1f}%)")
    print(f"✅ With PAD: {with_pad} ({with_pad/len(files)*100:.1f}%)")
    print(f"✅ Complete (both): {complete} ({complete/len(files)*100:.1f}%)")
    
    if need_classification:
        print(f"\n⏳ Need classification: {len(need_classification)}")
        if len(need_classification) <= 10:
            print(f"   Files: {', '.join(need_classification)}")
        else:
            print(f"   Examples: {', '.join(need_classification[:5])}...")
    
    if need_pad:
        print(f"\n⏳ Need PAD (but classified): {len(need_pad)}")
        if len(need_pad) <= 10:
            print(f"   Files: {', '.join(need_pad)}")
        else:
            print(f"   Examples: {', '.join(need_pad[:5])}...")
    
    if message_counts:
        avg_messages = sum(message_counts) / len(message_counts)
        print(f"\n📈 Message Statistics:")
        print(f"   Average: {avg_messages:.1f} messages/conversation")
        print(f"   Range: {min(message_counts)} - {max(message_counts)}")
    
    if pad_diversity:
        avg_diversity = sum(pad_diversity) / len(pad_diversity)
        low_diversity = sum(1 for d in pad_diversity if d < 0.3)
        print(f"\n📊 PAD Diversity Statistics:")
        print(f"   Average: {avg_diversity:.1%}")
        print(f"   Low diversity (<30%): {low_diversity} conversations")
        print(f"   Note: Short conversations (5-10 messages) naturally have lower diversity")
    
    print("\n" + "=" * 60)
    print("🎯 Next Steps:")
    print("=" * 60)
    
    if need_classification:
        print(f"\n1️⃣  Classify {len(need_classification)} conversations:")
        print("   python3 scripts/batch-classify-unclassified.py --directory public/output-wildchat")
    
    if need_pad:
        print(f"\n2️⃣  Generate PAD for {len(need_pad)} conversations:")
        print("   python3 scripts/regenerate-pad-for-low-diversity.py --output-dir public/output-wildchat")
    
    if complete > 0:
        print(f"\n3️⃣  Validate {complete} complete conversations:")
        print("   cp public/output-wildchat/*.json public/output/")
        print("   python3 scripts/validate-data-quality.py")
        
        print(f"\n4️⃣  Merge and run clustering:")
        print("   # (Already copied in step 3)")
        print("   python3 scripts/cluster-paths-proper.py")

if __name__ == '__main__':
    check_wildchat_status()

