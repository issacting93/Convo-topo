#!/usr/bin/env python3
"""
Migration Script: Convert Old Classifications to Reduced Role Taxonomy

Maps 19 roles (10 human + 9 AI) to 6 roles (3 human + 3 AI)

Old → New Mapping:
HUMAN:
- Seeker, Learner → Information-Seeker
- Sharer, Artist → Social-Expressor
- Collaborator, Director, Challenger → Co-Constructor

AI:
- Facilitator, Advisor, Reflector → Facilitator
- Expert → Expert System
- Peer, Affiliative, Creative-partner → Relational Peer
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Any

# Mapping from old roles to new roles
HUMAN_ROLE_MAPPING = {
    "seeker": "information-seeker",
    "learner": "information-seeker",
    "tester": "information-seeker",
    "philosophical-explorer": "information-seeker",  # Default to information-seeking
    "sharer": "social-expressor",
    "artist": "social-expressor",
    "collaborator": "co-constructor",
    "director": "co-constructor",
    "challenger": "co-constructor",
    "teacher-evaluator": "co-constructor",
}

AI_ROLE_MAPPING = {
    "facilitator": "facilitator",
    "advisor": "facilitator",  # Default to facilitator (supportive), could be expert-system if authoritative
    "reflector": "facilitator",
    "expert": "expert-system",
    "learner": "expert-system",  # When system adapts authoritatively
    "unable-to-engage": "expert-system",  # Failure mode of authority
    "peer": "relational-peer",
    "affiliative": "relational-peer",
    "creative-partner": "relational-peer",
}


def migrate_human_role(old_dist: Dict[str, float]) -> Dict[str, float]:
    """Map old human role distribution to new taxonomy"""
    new_dist = {
        "information-seeker": 0.0,
        "social-expressor": 0.0,
        "co-constructor": 0.0,
    }
    
    for old_role, prob in old_dist.items():
        if old_role in HUMAN_ROLE_MAPPING:
            new_role = HUMAN_ROLE_MAPPING[old_role]
            new_dist[new_role] += prob
    
    # Normalize to sum to 1.0
    total = sum(new_dist.values())
    if total > 0:
        new_dist = {k: v / total for k, v in new_dist.items()}
    else:
        # If no mapping found, default to information-seeker
        new_dist = {"information-seeker": 1.0, "social-expressor": 0.0, "co-constructor": 0.0}
    
    return new_dist


def migrate_ai_role(old_dist: Dict[str, float]) -> Dict[str, float]:
    """Map old AI role distribution to new taxonomy"""
    new_dist = {
        "facilitator": 0.0,
        "expert-system": 0.0,
        "relational-peer": 0.0,
    }
    
    for old_role, prob in old_dist.items():
        # Handle typo: "aiiRole" instead of "aiRole"
        if old_role == "aiiRole":
            continue
        
        if old_role in AI_ROLE_MAPPING:
            new_role = AI_ROLE_MAPPING[old_role]
            new_dist[new_role] += prob
    
    # Normalize to sum to 1.0
    total = sum(new_dist.values())
    if total > 0:
        new_dist = {k: v / total for k, v in new_dist.items()}
    else:
        # If no mapping found, default to facilitator
        new_dist = {"facilitator": 1.0, "expert-system": 0.0, "relational-peer": 0.0}
    
    return new_dist


def migrate_classification(old_cls: Dict[str, Any]) -> Dict[str, Any]:
    """Migrate a single classification from old to new taxonomy"""
    new_cls = old_cls.copy()
    
    # Migrate human role
    if "humanRole" in old_cls and "distribution" in old_cls["humanRole"]:
        old_dist = old_cls["humanRole"]["distribution"]
        new_cls["humanRole"]["distribution"] = migrate_human_role(old_dist)
        
        # Update evidence to use new role names
        if "evidence" in old_cls["humanRole"]:
            new_evidence = []
            for ev in old_cls["humanRole"]["evidence"]:
                old_role = ev.get("role", "")
                if old_role in HUMAN_ROLE_MAPPING:
                    new_role = HUMAN_ROLE_MAPPING[old_role]
                    new_ev = ev.copy()
                    new_ev["role"] = new_role
                    new_evidence.append(new_ev)
            new_cls["humanRole"]["evidence"] = new_evidence
    
    # Migrate AI role
    if "aiRole" in old_cls and "distribution" in old_cls["aiRole"]:
        old_dist = old_cls["aiRole"]["distribution"]
        new_cls["aiRole"]["distribution"] = migrate_ai_role(old_dist)
        
        # Update evidence to use new role names
        if "evidence" in old_cls["aiRole"]:
            new_evidence = []
            for ev in old_cls["aiRole"]["evidence"]:
                old_role = ev.get("role", "")
                if old_role in AI_ROLE_MAPPING:
                    new_role = AI_ROLE_MAPPING[old_role]
                    new_ev = ev.copy()
                    new_ev["role"] = new_role
                    new_evidence.append(new_ev)
            new_evidence.append(new_ev)
    
    # Update metadata
    if "classificationMetadata" in new_cls:
        new_cls["classificationMetadata"]["version"] = "reduced-roles-v1.0"
        new_cls["classificationMetadata"]["migrated_from"] = "19-roles"
    
    return new_cls


def migrate_conversation(conv: Dict[str, Any]) -> Dict[str, Any]:
    """Migrate a single conversation's classification"""
    new_conv = conv.copy()
    
    if "classification" in conv:
        new_conv["classification"] = migrate_classification(conv["classification"])
    
    return new_conv


def migrate_batch(input_file: Path, output_file: Path):
    """Migrate a batch of classified conversations"""
    print(f"Loading conversations from {input_file}...")
    
    with open(input_file) as f:
        conversations = json.load(f)
    
    print(f"Migrating {len(conversations)} conversations...")
    
    migrated = []
    for i, conv in enumerate(conversations, 1):
        migrated_conv = migrate_conversation(conv)
        migrated.append(migrated_conv)
        
        if i % 10 == 0:
            print(f"  Migrated {i}/{len(conversations)}...")
    
    print(f"Saving migrated conversations to {output_file}...")
    
    with open(output_file, 'w') as f:
        json.dump(migrated, f, indent=2)
    
    print(f"✓ Migration complete: {len(migrated)} conversations saved")
    
    # Print summary statistics
    print("\n📊 Migration Summary:")
    
    # Count new role distributions
    human_roles = {"information-seeker": 0, "social-expressor": 0, "co-constructor": 0}
    ai_roles = {"facilitator": 0, "expert-system": 0, "relational-peer": 0}
    
    for conv in migrated:
        if "classification" in conv:
            cls = conv["classification"]
            
            if "humanRole" in cls and "distribution" in cls["humanRole"]:
                dist = cls["humanRole"]["distribution"]
                max_role = max(dist.items(), key=lambda x: x[1])[0]
                human_roles[max_role] += 1
            
            if "aiRole" in cls and "distribution" in cls["aiRole"]:
                dist = cls["aiRole"]["distribution"]
                max_role = max(dist.items(), key=lambda x: x[1])[0]
                ai_roles[max_role] += 1
    
    print("\nHuman Roles (dominant counts):")
    for role, count in sorted(human_roles.items(), key=lambda x: x[1], reverse=True):
        print(f"  {role}: {count} ({count/len(migrated)*100:.1f}%)")
    
    print("\nAI Roles (dominant counts):")
    for role, count in sorted(ai_roles.items(), key=lambda x: x[1], reverse=True):
        print(f"  {role}: {count} ({count/len(migrated)*100:.1f}%)")


if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python migrate-classifications-to-reduced-roles.py <input.json> <output.json>")
        print("\nExample:")
        print("  python migrate-classifications-to-reduced-roles.py classifier/output-classified.json classifier/output-classified-migrated.json")
        sys.exit(1)
    
    input_file = Path(sys.argv[1])
    output_file = Path(sys.argv[2])
    
    if not input_file.exists():
        print(f"Error: Input file not found: {input_file}")
        sys.exit(1)
    
    migrate_batch(input_file, output_file)

