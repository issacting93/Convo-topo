
import json
import glob
import os
from collections import Counter

def get_dominant_role(distribution):
    if not distribution:
        return None, 0
    return max(distribution.items(), key=lambda x: x[1])

def calculate_authority_score(data):
    # Base score
    score = 0
    
    # 1. Power Dynamics (Category)
    pd = data.get('classification', {}).get('powerDynamics', {}).get('category', 'unknown')
    if pd == 'human-led': score += 0.3
    elif pd == 'balanced' or pd == 'symmetric': score += 0.15
    elif pd == 'ai-led': score += 0.0
    
    # 2. Human Role (Dominant)
    hr_dist = data.get('classification', {}).get('humanRole', {}).get('distribution', {})
    role, conf = get_dominant_role(hr_dist)
    
    # Role Authority Mapping (Hypothesis)
    role_weights = {
        'director': 0.7,      # High authority (directing the AI)
        'evaluator': 0.7,     # High authority (judging)
        'provider': 0.6,      # High authority (providing info)
        'collaborator': 0.4,  # Shared authority
        'social-expressor': 0.3, # Personal storage
        'relational-peer': 0.3, # Peer
        'information-seeker': 0.0, # Low authority (asking)
        'dependent': 0.0      # Low authority
    }
    
    role_score = role_weights.get(role, 0.3)
    
    # Combined
    total_score = score + role_score
    return round(total_score, 2), pd, role

files = glob.glob('public/output/*.json')
scores = []
roles = Counter()
pds = Counter()

print(f"Analyzing {len(files)} files...")

for f in files:
    try:
        with open(f, 'r') as file:
            data = json.load(file)
            score, pd, role = calculate_authority_score(data)
            scores.append(score)
            roles[role] += 1
            pds[pd] += 1
    except Exception as e:
        pass

# Distribution Analysis
print("\n--- Authority Score Distribution (Range 0.0 - 1.0) ---")
score_counts = Counter(scores)
for s in sorted(score_counts.keys()):
    print(f"Score {s}: {score_counts[s]}")

print("\n--- Role Counts ---")
for r, c in roles.most_common():
    print(f"{r}: {c}")

print("\n--- Power Dynamics Counts ---")
for p, c in pds.most_common():
    print(f"{p}: {c}")
