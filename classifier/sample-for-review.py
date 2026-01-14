#!/usr/bin/env python3
"""
Sample conversations for manual review to validate classifications.

This script extracts conversations that are good candidates for manual review,
focusing on cases where the local model classified them as facilitator
(which we want to verify if they should actually be expert).
"""

import json
import sys
from pathlib import Path
from collections import Counter

def get_dominant_role(distribution):
    """Get the role with highest probability"""
    if not distribution:
        return None, 0.0
    max_role = max(distribution.items(), key=lambda x: x[1])
    return max_role[0], max_role[1]

def sample_conversations_for_review(
    input_file: str,
    output_file: str,
    sample_size: int = 20,
    focus_on: str = "facilitator"  # or "expert" or "mixed"
):
    """Sample conversations for manual review"""
    
    with open(input_file, 'r') as f:
        data = json.load(f)
    
    print(f"📊 Loading {len(data)} conversations from {input_file}")
    
    # Analyze what we have
    ai_role_counts = Counter()
    ai_role_details = []
    
    for item in data:
        if 'classification' not in item:
            continue
            
        ai_role_dist = item['classification'].get('aiRole', {}).get('distribution', {})
        dominant_role, prob = get_dominant_role(ai_role_dist)
        
        if dominant_role:
            ai_role_counts[dominant_role] += 1
            
            # Store details for sampling
            ai_role_details.append({
                'item': item,
                'dominant_role': dominant_role,
                'dominant_prob': prob,
                'confidence': item['classification'].get('aiRole', {}).get('confidence', 0),
            })
    
    print(f"\n📈 Current AI Role Distribution:")
    for role, count in ai_role_counts.most_common():
        pct = (count / len(ai_role_details)) * 100
        print(f"  {role:20s} {count:3d} ({pct:5.1f}%)")
    
    # Sample based on focus
    if focus_on == "facilitator":
        # Sample conversations classified as facilitator (the dominant classification)
        candidates = [d for d in ai_role_details if d['dominant_role'] == 'facilitator']
        print(f"\n🎯 Sampling {min(sample_size, len(candidates))} 'facilitator' classifications for review...")
        # Sort by confidence (medium confidence might be most ambiguous)
        candidates.sort(key=lambda x: abs(x['confidence'] - 0.7))  # Close to 0.7
        sample = candidates[:sample_size]
        
    elif focus_on == "expert":
        # Sample conversations classified as expert
        candidates = [d for d in ai_role_details if d['dominant_role'] == 'expert']
        print(f"\n🎯 Sampling {min(sample_size, len(candidates))} 'expert' classifications for review...")
        candidates.sort(key=lambda x: abs(x['confidence'] - 0.7))
        sample = candidates[:sample_size]
        
    elif focus_on == "mixed":
        # Sample conversations with mixed roles (not highly confident)
        candidates = [d for d in ai_role_details if d['dominant_prob'] < 0.7]
        print(f"\n🎯 Sampling {min(sample_size, len(candidates))} 'mixed' classifications for review...")
        sample = candidates[:sample_size]
        
    else:
        # Random sample
        import random
        random.shuffle(ai_role_details)
        sample = ai_role_details[:sample_size]
    
    # Format for review
    review_items = []
    for i, s in enumerate(sample, 1):
        item = s['item']
        conv_id = item.get('id', f'conv-{i}')
        
        # Format conversation for easy reading
        messages_text = []
        for msg in item.get('messages', [])[:10]:  # First 10 messages
            role = msg.get('role', 'unknown')
            content = msg.get('content', '')[:500]  # First 500 chars
            messages_text.append(f"[{role.upper()}] {content}")
        
        review_item = {
            'id': conv_id,
            'sequence': i,
            'conversation': {
                'messages': item.get('messages', []),
                'preview': '\n'.join(messages_text)
            },
            'classification': {
                'aiRole': {
                    'distribution': item['classification'].get('aiRole', {}).get('distribution', {}),
                    'confidence': item['classification'].get('aiRole', {}).get('confidence', 0),
                    'dominant_role': s['dominant_role'],
                    'dominant_prob': s['dominant_prob'],
                },
                'humanRole': {
                    'distribution': item['classification'].get('humanRole', {}).get('distribution', {}),
                    'confidence': item['classification'].get('humanRole', {}).get('confidence', 0),
                },
                'interactionPattern': item['classification'].get('interactionPattern', {}),
                'conversationPurpose': item['classification'].get('conversationPurpose', {}),
            },
            'manualReview': {
                'shouldBeExpert': None,  # True/False/null
                'shouldBeFacilitator': None,  # True/False/null
                'correctClassification': None,  # 'expert', 'facilitator', 'mixed', etc.
                'notes': '',
                'reviewed': False,
            }
        }
        review_items.append(review_item)
    
    # Save
    with open(output_file, 'w') as f:
        json.dump(review_items, f, indent=2)
    
    print(f"\n✅ Saved {len(review_items)} conversations to {output_file}")
    print(f"\n📝 Next steps:")
    print(f"   1. Open {output_file}")
    print(f"   2. For each conversation, read it and judge if it should be 'expert' or 'facilitator'")
    print(f"   3. Fill in the 'manualReview' section for each")
    print(f"   4. Run this script again with --analyze flag to compare with model classifications")
    
    return review_items

def analyze_review_results(review_file: str):
    """Analyze manual review results vs model classifications"""
    
    with open(review_file, 'r') as f:
        reviews = json.load(f)
    
    total = len(reviews)
    reviewed = sum(1 for r in reviews if r.get('manualReview', {}).get('reviewed', False))
    
    if reviewed == 0:
        print(f"❌ No reviews completed yet. Please review conversations first.")
        return
    
    print(f"📊 REVIEW ANALYSIS")
    print(f"=" * 60)
    print(f"Total sampled: {total}")
    print(f"Reviewed: {reviewed}")
    print()
    
    # Compare model vs manual
    agreement = {
        'expert_expert': 0,
        'expert_facilitator': 0,
        'expert_other': 0,
        'facilitator_expert': 0,
        'facilitator_facilitator': 0,
        'facilitator_other': 0,
    }
    
    for review in reviews:
        if not review.get('manualReview', {}).get('reviewed', False):
            continue
            
        model_role = review['classification']['aiRole']['dominant_role']
        manual_role = review['manualReview'].get('correctClassification')
        
        if not manual_role:
            continue
        
        key = f"{model_role}_{manual_role}"
        if key in agreement:
            agreement[key] += 1
        elif 'expert' in key or 'facilitator' in key:
            # Categorize others
            if model_role == 'expert':
                agreement['expert_other'] += 1
            elif model_role == 'facilitator':
                agreement['facilitator_other'] += 1
    
    print("Model Classification → Manual Classification:")
    print(f"  expert → expert: {agreement['expert_expert']}")
    print(f"  expert → facilitator: {agreement['expert_facilitator']}")
    print(f"  facilitator → expert: {agreement['facilitator_expert']}")
    print(f"  facilitator → facilitator: {agreement['facilitator_facilitator']}")
    print()
    
    # Calculate accuracy
    if agreement['expert_expert'] + agreement['facilitator_facilitator'] > 0:
        accuracy = (agreement['expert_expert'] + agreement['facilitator_facilitator']) / reviewed
        print(f"✅ Agreement Rate: {accuracy:.1%}")
        
        # Expert accuracy
        expert_total = agreement['expert_expert'] + agreement['expert_facilitator'] + agreement['expert_other']
        if expert_total > 0:
            expert_acc = agreement['expert_expert'] / expert_total
            print(f"   Expert accuracy: {expert_acc:.1%} ({agreement['expert_expert']}/{expert_total})")
        
        # Facilitator accuracy
        fac_total = agreement['facilitator_expert'] + agreement['facilitator_facilitator'] + agreement['facilitator_other']
        if fac_total > 0:
            fac_acc = agreement['facilitator_facilitator'] / fac_total
            print(f"   Facilitator accuracy: {fac_acc:.1%} ({agreement['facilitator_facilitator']}/{fac_total})")
        
        # Misclassification rate
        if agreement['facilitator_expert'] > 0:
            print(f"\n⚠️  {agreement['facilitator_expert']} conversations misclassified as facilitator (should be expert)")
            print(f"   This suggests the model is over-classifying as facilitator")
    
    print()

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Sample conversations for manual review')
    parser.add_argument('input_file', help='Input classification file (e.g., output-classified.json)')
    parser.add_argument('output_file', nargs='?', default='manual-review-sample.json', 
                       help='Output file for review (default: manual-review-sample.json)')
    parser.add_argument('--sample-size', type=int, default=20,
                       help='Number of conversations to sample (default: 20)')
    parser.add_argument('--focus-on', choices=['facilitator', 'expert', 'mixed', 'random'],
                       default='facilitator',
                       help='Focus sampling on specific role type (default: facilitator)')
    parser.add_argument('--analyze', action='store_true',
                       help='Analyze review results instead of sampling')
    
    args = parser.parse_args()
    
    if args.analyze:
        analyze_review_results(args.input_file)
    else:
        sample_conversations_for_review(
            args.input_file,
            args.output_file,
            args.sample_size,
            args.focus_on
        )

if __name__ == '__main__':
    main()

