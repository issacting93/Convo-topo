#!/usr/bin/env python3
"""
Review and summarize data quality issues
"""

import json
from pathlib import Path
from collections import defaultdict

OUTPUT_DIR = Path("public/output")
ISSUES_DIR = Path("reports/data-quality-issues")

def load_issue_lists():
    """Load all issue lists"""
    issues = {}
    for filename in ['missing-metadata.json', 'missing-humanRole.json', 'missing-aiRole.json', 'all-issues.json']:
        file_path = ISSUES_DIR / filename
        if file_path.exists():
            with open(file_path, 'r') as f:
                issues[filename.replace('.json', '')] = json.load(f)
    return issues

def check_conversation(filename):
    """Check actual state of a conversation file"""
    file_path = OUTPUT_DIR / filename
    if not file_path.exists():
        return None
    
    with open(file_path, 'r') as f:
        data = json.load(f)
    
    has_metadata = bool(data.get('classificationMetadata'))
    classification = data.get('classification', {})
    
    hr = classification.get('humanRole', {})
    ar = classification.get('aiRole', {})
    
    hr_dist = hr.get('distribution', {}) if hr else {}
    ar_dist = ar.get('distribution', {}) if ar else {}
    
    has_hr = bool(hr_dist and any(v > 0 for v in hr_dist.values()))
    has_ar = bool(ar_dist and any(v > 0 for v in ar_dist.values()))
    
    metadata = data.get('classificationMetadata', {})
    provider = metadata.get('provider', 'none') if metadata else 'none'
    model = metadata.get('model', 'none') if metadata else 'none'
    
    return {
        'has_metadata': has_metadata,
        'provider': provider,
        'model': model,
        'has_humanRole': has_hr,
        'has_aiRole': has_ar,
        'hr_dist_keys': list(hr_dist.keys()) if hr_dist else [],
        'ar_dist_keys': list(ar_dist.keys()) if ar_dist else []
    }

def main():
    print("=" * 80)
    print("DATA QUALITY ISSUES REVIEW")
    print("=" * 80)
    print()
    
    # Load issue lists
    issues = load_issue_lists()
    
    print("ISSUE LIST SUMMARY:")
    print(f"  Missing metadata: {len(issues.get('missing-metadata', []))} conversations")
    print(f"  Missing humanRole: {len(issues.get('missing-humanRole', []))} conversations")
    print(f"  Missing aiRole: {len(issues.get('missing-aiRole', []))} conversations")
    print(f"  Total with issues: {len(issues.get('all-issues', []))} conversations")
    print()
    
    # Check overlap
    missing_hr = {i['id'] for i in issues.get('missing-humanRole', [])}
    missing_ar = {i['id'] for i in issues.get('missing-aiRole', [])}
    overlap = missing_hr & missing_ar
    
    print("ROLE ISSUE OVERLAP:")
    print(f"  Missing BOTH roles: {len(overlap)} conversations")
    print(f"  Missing only humanRole: {len(missing_hr - missing_ar)} conversations")
    print(f"  Missing only aiRole: {len(missing_ar - missing_hr)} conversations")
    print()
    
    # Sample check - verify a few files
    print("VERIFICATION (sampling 10 files):")
    print()
    
    sample_files = [
        'chatbot_arena_0450.json',  # Should be missing both roles
        'chatbot_arena_1650.json',  # Should have roles
        'chatbot_arena_0746.json',  # Should be missing roles
        'chatbot_arena_30428.json', # Should be missing metadata
    ]
    
    # Add more from issue lists
    for item in issues.get('missing-humanRole', [])[:3]:
        if item['file'] not in sample_files:
            sample_files.append(item['file'])
    
    for item in issues.get('missing-metadata', [])[:3]:
        if item['file'] not in sample_files:
            sample_files.append(item['file'])
    
    sample_files = sample_files[:10]
    
    for filename in sample_files:
        state = check_conversation(filename)
        if state:
            print(f"  {filename}:")
            print(f"    Metadata: {state['has_metadata']} (provider={state['provider']}, model={state['model']})")
            print(f"    humanRole: {state['has_humanRole']} (keys: {state['hr_dist_keys']})")
            print(f"    aiRole: {state['has_aiRole']} (keys: {state['ar_dist_keys']})")
        else:
            print(f"  {filename}: FILE NOT FOUND")
    print()
    
    # Count by provider (from metadata)
    print("METADATA ANALYSIS:")
    provider_counts = defaultdict(int)
    model_counts = defaultdict(int)
    
    all_files = list(OUTPUT_DIR.glob("*.json"))
    all_files = [f for f in all_files if f.name != "manifest.json"]
    
    for file_path in all_files:
        try:
            with open(file_path, 'r') as f:
                data = json.load(f)
            metadata = data.get('classificationMetadata', {})
            if metadata:
                provider = metadata.get('provider', 'unknown')
                model = metadata.get('model', 'unknown')
                provider_counts[provider] += 1
                model_counts[model] += 1
        except:
            pass
    
    print(f"  Conversations with metadata: {sum(provider_counts.values())}")
    print(f"  Conversations without metadata: {len(all_files) - sum(provider_counts.values())}")
    print()
    print("  By provider:")
    for provider, count in sorted(provider_counts.items(), key=lambda x: -x[1]):
        print(f"    {provider}: {count}")
    print()
    print("  By model:")
    for model, count in sorted(model_counts.items(), key=lambda x: -x[1])[:10]:
        print(f"    {model}: {count}")
    print()
    
    # Summary recommendations
    print("=" * 80)
    print("RECOMMENDATIONS")
    print("=" * 80)
    print()
    print("1. FIX MISSING ROLES (Priority: HIGH)")
    print(f"   - {len(issues.get('missing-humanRole', []))} missing humanRole")
    print(f"   - {len(issues.get('missing-aiRole', []))} missing aiRole")
    print(f"   - Cost: ~${len(issues.get('missing-aiRole', [])) * 0.02:.2f} (OpenAI GPT-4)")
    print(f"   - Command: python3 scripts/fix-missing-roles.py")
    print()
    print("2. BACKFILL METADATA (Priority: MEDIUM)")
    print(f"   - {len(issues.get('missing-metadata', []))} missing metadata")
    print(f"   - Cost: FREE (adds placeholder metadata)")
    print(f"   - Command: python3 scripts/backfill-metadata.py")
    print()
    print("3. VERIFY AFTER FIXES")
    print(f"   - Command: python3 scripts/identify-data-quality-issues.py")
    print(f"   - Command: python3 scripts/analyze-classified-data.py")

if __name__ == "__main__":
    main()

