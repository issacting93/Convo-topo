#!/usr/bin/env python3
"""
Analyze classification results from the Ollama few-shot classifier
"""

import json
from collections import Counter, defaultdict

# Load the classified data
with open('output-classified.json', 'r') as f:
    data = json.load(f)

print(f'📊 CLASSIFICATION ANALYSIS')
print(f'=' * 60)
print(f'Total conversations classified: {len(data)}')
print()

# Analyze dimensions 1-8 (categorical)
dimensions = [
    'interactionPattern', 'powerDynamics', 'emotionalTone', 
    'engagementStyle', 'knowledgeExchange', 'conversationPurpose',
    'topicDepth', 'turnTaking'
]

print('📈 DIMENSION DISTRIBUTIONS (1-8):')
print('-' * 60)
for dim in dimensions:
    categories = []
    for item in data:
        if 'classification' in item and dim in item['classification']:
            cat = item['classification'][dim].get('category')
            if cat:
                categories.append(cat)
    
    if categories:
        counter = Counter(categories)
        print(f'\n{dim}:')
        for cat, count in counter.most_common():
            pct = (count / len(categories)) * 100
            print(f'  {cat:30s} {count:3d} ({pct:5.1f}%)')

# Analyze role distributions (dimensions 9-10)
print()
print('👥 ROLE DISTRIBUTIONS (9-10):')
print('-' * 60)

human_roles = defaultdict(float)
ai_roles = defaultdict(float)

for item in data:
    if 'classification' in item:
        hr = item['classification'].get('humanRole', {}).get('distribution', {})
        ar = item['classification'].get('aiRole', {}).get('distribution', {})
        for role, prob in hr.items():
            human_roles[role] += prob
        for role, prob in ar.items():
            ai_roles[role] += prob

print('\nHuman Roles (average probabilities):')
for role, total in sorted(human_roles.items(), key=lambda x: x[1], reverse=True):
    avg = total / len(data)
    print(f'  {role:20s} {avg:.3f}')

print('\nAI Roles (average probabilities):')
for role, total in sorted(ai_roles.items(), key=lambda x: x[1], reverse=True):
    avg = total / len(data)
    print(f'  {role:20s} {avg:.3f}')

# Check confidence scores
print()
print('🎯 CONFIDENCE ANALYSIS:')
print('-' * 60)
all_confidences = []
for item in data:
    if 'classification' in item:
        for dim in dimensions:
            if dim in item['classification']:
                conf = item['classification'][dim].get('confidence', 0)
                if conf:
                    all_confidences.append(conf)

if all_confidences:
    avg_conf = sum(all_confidences) / len(all_confidences)
    min_conf = min(all_confidences)
    max_conf = max(all_confidences)
    low_conf = sum(1 for c in all_confidences if c < 0.6)
    print(f'Average confidence: {avg_conf:.2f}')
    print(f'Min confidence: {min_conf:.2f}')
    print(f'Max confidence: {max_conf:.2f}')
    print(f'Low confidence (<0.6): {low_conf} ({low_conf/len(all_confidences)*100:.1f}%)')

# Check role distribution sums
print()
print('✅ VALIDATION CHECKS:')
print('-' * 60)
role_sum_errors = 0
for item in data:
    if 'classification' in item:
        hr = item['classification'].get('humanRole', {}).get('distribution', {})
        ar = item['classification'].get('aiRole', {}).get('distribution', {})
        hr_sum = sum(hr.values()) if hr else 0
        ar_sum = sum(ar.values()) if ar else 0
        if abs(hr_sum - 1.0) > 0.01:
            role_sum_errors += 1
        if abs(ar_sum - 1.0) > 0.01:
            role_sum_errors += 1

print(f'Role distribution sum errors: {role_sum_errors} (should be 0)')
print(f'All role distributions sum to 1.0: {role_sum_errors == 0}')

# Find dominant role pairs
print()
print('🔗 DOMINANT ROLE PAIRS:')
print('-' * 60)
role_pairs = defaultdict(int)
for item in data:
    if 'classification' in item:
        hr = item['classification'].get('humanRole', {}).get('distribution', {})
        ar = item['classification'].get('aiRole', {}).get('distribution', {})
        if hr and ar:
            top_hr = max(hr.items(), key=lambda x: x[1])[0]
            top_ar = max(ar.items(), key=lambda x: x[1])[0]
            role_pairs[f'{top_hr} → {top_ar}'] += 1

for pair, count in sorted(role_pairs.items(), key=lambda x: x[1], reverse=True):
    pct = (count / len(data)) * 100
    print(f'  {pair:30s} {count:2d} ({pct:5.1f}%)')

# Sample a few classifications
print()
print('📝 SAMPLE CLASSIFICATIONS:')
print('-' * 60)
for i, item in enumerate(data[:3]):
    print(f'\nConversation {i+1} (ID: {item.get("id", "unknown")}):')
    if 'classification' in item:
        print(f'  Pattern: {item["classification"].get("interactionPattern", {}).get("category", "N/A")}')
        print(f'  Purpose: {item["classification"].get("conversationPurpose", {}).get("category", "N/A")}')
        hr = item['classification'].get('humanRole', {}).get('distribution', {})
        ar = item['classification'].get('aiRole', {}).get('distribution', {})
        top_hr = max(hr.items(), key=lambda x: x[1]) if hr else None
        top_ar = max(ar.items(), key=lambda x: x[1]) if ar else None
        if top_hr:
            print(f'  Human Role: {top_hr[0]} ({top_hr[1]:.2f})')
        if top_ar:
            print(f'  AI Role: {top_ar[0]} ({top_ar[1]:.2f})')

