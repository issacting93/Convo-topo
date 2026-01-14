#!/usr/bin/env python3
"""
Comprehensive analysis of all classification results from the Ollama few-shot classifier
"""

import json
from collections import Counter, defaultdict

# Load all output files
print("📊 COMPREHENSIVE CLASSIFICATION ANALYSIS")
print("=" * 70)

files = {
    'Original (30)': 'output-classified.json',
    'Test Batch (20)': 'test-output-20.json',
    'Remaining (125)': 'output-remaining.json'
}

all_data = []
file_stats = {}

for name, filename in files.items():
    try:
        with open(filename, 'r') as f:
            data = json.load(f)
            all_data.extend(data)
            file_stats[name] = len(data)
            print(f"✅ {name:20s}: {len(data):3d} conversations")
    except Exception as e:
        print(f"❌ {name:20s}: Error - {e}")

print("=" * 70)

# Remove duplicates by ID (keep last occurrence)
seen = {}
duplicate_ids = []
for item in all_data:
    item_id = item.get('id')
    if item_id:
        if item_id in seen:
            duplicate_ids.append(item_id)
        seen[item_id] = item

unique_data = list(seen.values())
print(f"\n📊 TOTAL UNIQUE CONVERSATIONS: {len(unique_data)}")
if duplicate_ids:
    print(f"📉 DUPLICATES REMOVED: {len(all_data) - len(unique_data)}")
    print(f"   Duplicate IDs: {', '.join(set(duplicate_ids[:10]))}")

# Basic statistics
print(f"\n{'=' * 70}")
print("📋 BASIC STATISTICS")
print("=" * 70)

successful = sum(1 for item in unique_data if 'classification' in item and item.get('classification') and 'classificationError' not in item.get('classification', {}))
errors = sum(1 for item in unique_data if 'classificationError' in item or (item.get('classification') is None))
missing_cls = sum(1 for item in unique_data if 'classification' not in item or not item.get('classification'))

print(f"✅ Successful: {successful}/{len(unique_data)} ({successful/len(unique_data)*100:.1f}%)")
if errors > 0:
    print(f"❌ Errors: {errors}/{len(unique_data)} ({errors/len(unique_data)*100:.1f}%)")
if missing_cls > 0:
    print(f"⚠️  Missing: {missing_cls}/{len(unique_data)} ({missing_cls/len(unique_data)*100:.1f}%)")

# Analyze dimensions 1-8 (categorical)
print(f"\n{'=' * 70}")
print("📈 DIMENSION DISTRIBUTIONS (1-8)")
print("=" * 70)

dimensions = [
    'interactionPattern', 'powerDynamics', 'emotionalTone', 
    'engagementStyle', 'knowledgeExchange', 'conversationPurpose',
    'topicDepth', 'turnTaking'
]

for dim in dimensions:
    categories = []
    for item in unique_data:
        if 'classification' in item and dim in item['classification']:
            cat = item['classification'][dim].get('category')
            if cat:
                categories.append(cat)
    
    if categories:
        counter = Counter(categories)
        total = len(categories)
        print(f"\n{dim}:")
        print(f"  Total: {total} classifications")
        for cat, count in counter.most_common():
            pct = (count / total) * 100
            bar = "█" * int(pct / 2)
            print(f"  {cat:30s} {count:3d} ({pct:5.1f}%) {bar}")

# Analyze role distributions (dimensions 9-10)
print(f"\n{'=' * 70}")
print("👥 ROLE DISTRIBUTIONS (9-10)")
print("=" * 70)

human_roles = defaultdict(float)
ai_roles = defaultdict(float)
role_count = 0

for item in unique_data:
    if 'classification' in item:
        hr = item['classification'].get('humanRole', {}).get('distribution', {})
        ar = item['classification'].get('aiRole', {}).get('distribution', {})
        if hr or ar:
            role_count += 1
        for role, prob in hr.items():
            human_roles[role] += prob
        for role, prob in ar.items():
            ai_roles[role] += prob

print(f"\nTotal conversations with role distributions: {role_count}")

print("\nHuman Roles (average probabilities):")
for role, total in sorted(human_roles.items(), key=lambda x: x[1], reverse=True):
    avg = total / role_count if role_count > 0 else 0
    bar = "█" * int(avg * 100)
    print(f"  {role:25s} {avg:.3f} {bar}")

print("\nAI Roles (average probabilities):")
for role, total in sorted(ai_roles.items(), key=lambda x: x[1], reverse=True):
    avg = total / role_count if role_count > 0 else 0
    bar = "█" * int(avg * 100)
    print(f"  {role:25s} {avg:.3f} {bar}")

# Find dominant role pairs
print(f"\n{'=' * 70}")
print("🔗 DOMINANT ROLE PAIRS")
print("=" * 70)

role_pairs = defaultdict(int)
for item in unique_data:
    if 'classification' in item:
        hr = item['classification'].get('humanRole', {}).get('distribution', {})
        ar = item['classification'].get('aiRole', {}).get('distribution', {})
        if hr and ar:
            top_hr = max(hr.items(), key=lambda x: x[1])[0]
            top_ar = max(ar.items(), key=lambda x: x[1])[0]
            role_pairs[f'{top_hr} → {top_ar}'] += 1

for pair, count in sorted(role_pairs.items(), key=lambda x: x[1], reverse=True):
    pct = (count / role_count) * 100 if role_count > 0 else 0
    bar = "█" * int(pct / 2)
    print(f"  {pair:35s} {count:3d} ({pct:5.1f}%) {bar}")

# Check confidence scores
print(f"\n{'=' * 70}")
print("🎯 CONFIDENCE ANALYSIS")
print("=" * 70)

all_confidences = []
dimension_confidences = defaultdict(list)

for item in unique_data:
    if 'classification' in item:
        for dim in dimensions:
            if dim in item['classification']:
                conf = item['classification'][dim].get('confidence', 0)
                if conf:
                    all_confidences.append(conf)
                    dimension_confidences[dim].append(conf)

if all_confidences:
    avg_conf = sum(all_confidences) / len(all_confidences)
    min_conf = min(all_confidences)
    max_conf = max(all_confidences)
    low_conf = sum(1 for c in all_confidences if c < 0.6)
    medium_conf = sum(1 for c in all_confidences if 0.6 <= c < 0.8)
    high_conf = sum(1 for c in all_confidences if c >= 0.8)
    
    print(f"Total confidence scores: {len(all_confidences)}")
    print(f"\nOverall:")
    print(f"  Average: {avg_conf:.2f}")
    print(f"  Min:     {min_conf:.2f}")
    print(f"  Max:     {max_conf:.2f}")
    print(f"\nDistribution:")
    print(f"  Low (<0.6):     {low_conf:4d} ({low_conf/len(all_confidences)*100:5.1f}%)")
    print(f"  Medium (0.6-0.8): {medium_conf:4d} ({medium_conf/len(all_confidences)*100:5.1f}%)")
    print(f"  High (≥0.8):    {high_conf:4d} ({high_conf/len(all_confidences)*100:5.1f}%)")
    
    print(f"\nBy Dimension:")
    for dim in dimensions:
        if dimension_confidences[dim]:
            avg = sum(dimension_confidences[dim]) / len(dimension_confidences[dim])
            print(f"  {dim:25s}: {avg:.2f} (n={len(dimension_confidences[dim])})")

# Check role distribution sums
print(f"\n{'=' * 70}")
print("✅ VALIDATION CHECKS")
print("=" * 70)

role_sum_errors = 0
role_sum_issues = []

for item in unique_data:
    if 'classification' in item:
        hr = item['classification'].get('humanRole', {}).get('distribution', {})
        ar = item['classification'].get('aiRole', {}).get('distribution', {})
        hr_sum = sum(hr.values()) if hr else 0
        ar_sum = sum(ar.values()) if ar else 0
        if abs(hr_sum - 1.0) > 0.01:
            role_sum_errors += 1
            role_sum_issues.append((item.get('id', 'unknown'), 'human', hr_sum))
        if abs(ar_sum - 1.0) > 0.01:
            role_sum_errors += 1
            role_sum_issues.append((item.get('id', 'unknown'), 'ai', ar_sum))

print(f"Role distribution sum errors: {role_sum_errors} (should be 0)")
print(f"All role distributions sum to 1.0: {role_sum_errors == 0}")

if role_sum_issues:
    print(f"\n⚠️  Issues found:")
    for item_id, role_type, sum_val in role_sum_issues[:10]:
        print(f"  {item_id} ({role_type}): sum = {sum_val:.3f}")

# Quality checks
print(f"\n{'=' * 70}")
print("🔍 QUALITY CHECKS")
print("=" * 70)

unclear_human_roles = 0
unclear_ai_roles = 0
low_confidence_items = 0

for item in unique_data:
    if 'classification' in item:
        hr = item['classification'].get('humanRole', {}).get('distribution', {})
        ar = item['classification'].get('aiRole', {}).get('distribution', {})
        
        if hr:
            hr_max = max(hr.values())
            if hr_max < 0.5:
                unclear_human_roles += 1
        if ar:
            ar_max = max(ar.values())
            if ar_max < 0.5:
                unclear_ai_roles += 1
        
        # Check min confidence per item
        item_confidences = []
        for dim in dimensions:
            if dim in item['classification']:
                conf = item['classification'][dim].get('confidence', 0)
                if conf:
                    item_confidences.append(conf)
        if item_confidences and min(item_confidences) < 0.5:
            low_confidence_items += 1

print(f"Unclear human roles (max < 0.5): {unclear_human_roles}/{role_count}")
print(f"Unclear AI roles (max < 0.5): {unclear_ai_roles}/{role_count}")
print(f"Items with low confidence (< 0.5): {low_confidence_items}/{len(unique_data)}")

# Sample classifications
print(f"\n{'=' * 70}")
print("📝 SAMPLE CLASSIFICATIONS")
print("=" * 70)

for i, item in enumerate(unique_data[:5], 1):
    print(f"\nConversation {i} (ID: {item.get('id', 'unknown')}):")
    if 'classification' in item:
        cls = item['classification']
        print(f"  Pattern: {cls.get('interactionPattern', {}).get('category', 'N/A')}")
        print(f"  Purpose: {cls.get('conversationPurpose', {}).get('category', 'N/A')}")
        print(f"  Tone: {cls.get('emotionalTone', {}).get('category', 'N/A')}")
        
        hr = cls.get('humanRole', {}).get('distribution', {})
        ar = cls.get('aiRole', {}).get('distribution', {})
        top_hr = max(hr.items(), key=lambda x: x[1]) if hr else None
        top_ar = max(ar.items(), key=lambda x: x[1]) if ar else None
        if top_hr:
            print(f"  Human Role: {top_hr[0]} ({top_hr[1]:.2f})")
        if top_ar:
            print(f"  AI Role: {top_ar[0]} ({top_ar[1]:.2f})")
        
        # Show first message
        if item.get('messages'):
            first_msg = item['messages'][0].get('content', '')[:80]
            print(f"  First message: {first_msg}...")

# Summary
print(f"\n{'=' * 70}")
print("📊 SUMMARY")
print("=" * 70)
print(f"Total unique conversations: {len(unique_data)}")
print(f"Success rate: {successful/len(unique_data)*100:.1f}%")
print(f"Average confidence: {avg_conf:.2f}" if all_confidences else "N/A")
print(f"Most common role pair: {max(role_pairs.items(), key=lambda x: x[1])[0] if role_pairs else 'N/A'}")
print(f"Quality: {'✅ Excellent' if role_sum_errors == 0 and unclear_human_roles == 0 and unclear_ai_roles == 0 else '⚠️ Needs review'}")

