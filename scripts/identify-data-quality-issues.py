#!/usr/bin/env python3
"""
Identify conversations with data quality issues:
1. Missing classification metadata
2. Missing role distributions
3. Ollama quality issues
"""

import json
from pathlib import Path
from collections import defaultdict

OUTPUT_DIR = Path("public/output")

def analyze_conversation(file_path: Path) -> dict:
    """Analyze a single conversation file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    issues = {
        'file': file_path.name,
        'id': data.get('id', 'unknown'),
        'missing_metadata': False,
        'missing_humanRole': False,
        'missing_aiRole': False,
        'has_ollama': False,
        'provider': 'unknown',
        'model': 'unknown',
        'has_empty_role_dist': False
    }
    
    # Check metadata
    metadata = data.get('classificationMetadata')
    if not metadata:
        issues['missing_metadata'] = True
    else:
        issues['provider'] = metadata.get('provider', 'unknown')
        issues['model'] = metadata.get('model', 'unknown')
        if issues['provider'] == 'ollama' or 'ollama' in str(issues['model']).lower() or 'llama' in str(issues['model']).lower():
            issues['has_ollama'] = True
    
    # Check classification
    classification = data.get('classification', {})
    if classification:
        # Check humanRole
        humanRole = classification.get('humanRole', {})
        if not humanRole:
            issues['missing_humanRole'] = True
        else:
            dist = humanRole.get('distribution', {})
            if not dist or all(v == 0 for v in dist.values()):
                issues['missing_humanRole'] = True
                issues['has_empty_role_dist'] = True
        
        # Check aiRole
        aiRole = classification.get('aiRole', {})
        if not aiRole:
            issues['missing_aiRole'] = True
        else:
            dist = aiRole.get('distribution', {})
            if not dist or all(v == 0 for v in dist.values()):
                issues['missing_aiRole'] = True
                issues['has_empty_role_dist'] = True
    
    return issues

def main():
    print("🔍 Identifying data quality issues...")
    print("=" * 80)
    
    json_files = [f for f in OUTPUT_DIR.glob("*.json") if f.name != "manifest.json"]
    
    all_issues = []
    missing_metadata = []
    missing_humanRole = []
    missing_aiRole = []
    ollama_conversations = []
    
    for file_path in json_files:
        issues = analyze_conversation(file_path)
        all_issues.append(issues)
        
        if issues['missing_metadata']:
            missing_metadata.append(issues)
        if issues['missing_humanRole']:
            missing_humanRole.append(issues)
        if issues['missing_aiRole']:
            missing_aiRole.append(issues)
        if issues['has_ollama']:
            ollama_conversations.append(issues)
    
    print(f"\n📊 SUMMARY")
    print(f"Total conversations analyzed: {len(all_issues)}")
    print(f"Missing metadata: {len(missing_metadata)} ({len(missing_metadata)/len(all_issues)*100:.1f}%)")
    print(f"Missing humanRole: {len(missing_humanRole)} ({len(missing_humanRole)/len(all_issues)*100:.1f}%)")
    print(f"Missing aiRole: {len(missing_aiRole)} ({len(missing_aiRole)/len(all_issues)*100:.1f}%)")
    print(f"Ollama conversations: {len(ollama_conversations)} ({len(ollama_conversations)/len(all_issues)*100:.1f}%)")
    
    # Group by provider
    by_provider = defaultdict(list)
    for issue in all_issues:
        by_provider[issue['provider']].append(issue)
    
    print(f"\n📋 BY PROVIDER")
    for provider, issues_list in sorted(by_provider.items(), key=lambda x: -len(x[1])):
        missing_meta = sum(1 for i in issues_list if i['missing_metadata'])
        missing_hr = sum(1 for i in issues_list if i['missing_humanRole'])
        missing_ar = sum(1 for i in issues_list if i['missing_aiRole'])
        print(f"  {provider}: {len(issues_list)} conversations")
        print(f"    - Missing metadata: {missing_meta}")
        print(f"    - Missing humanRole: {missing_hr}")
        print(f"    - Missing aiRole: {missing_ar}")
    
    # Save lists to files
    output_dir = Path("reports/data-quality-issues")
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Missing metadata
    with open(output_dir / "missing-metadata.json", 'w') as f:
        json.dump([{'file': i['file'], 'id': i['id']} for i in missing_metadata], f, indent=2)
    print(f"\n✅ Saved missing metadata list: {output_dir / 'missing-metadata.json'}")
    print(f"   ({len(missing_metadata)} conversations)")
    
    # Missing humanRole
    with open(output_dir / "missing-humanRole.json", 'w') as f:
        json.dump([{'file': i['file'], 'id': i['id']} for i in missing_humanRole], f, indent=2)
    print(f"✅ Saved missing humanRole list: {output_dir / 'missing-humanRole.json'}")
    print(f"   ({len(missing_humanRole)} conversations)")
    
    # Missing aiRole
    with open(output_dir / "missing-aiRole.json", 'w') as f:
        json.dump([{'file': i['file'], 'id': i['id']} for i in missing_aiRole], f, indent=2)
    print(f"✅ Saved missing aiRole list: {output_dir / 'missing-aiRole.json'}")
    print(f"   ({len(missing_aiRole)} conversations)")
    
    # Ollama conversations
    with open(output_dir / "ollama-conversations.json", 'w') as f:
        json.dump([{'file': i['file'], 'id': i['id'], 'model': i['model']} for i in ollama_conversations], f, indent=2)
    print(f"✅ Saved Ollama conversations list: {output_dir / 'ollama-conversations.json'}")
    print(f"   ({len(ollama_conversations)} conversations)")
    
    # Combined issues
    combined_issues = []
    for issue in all_issues:
        if issue['missing_metadata'] or issue['missing_humanRole'] or issue['missing_aiRole']:
            combined_issues.append({
                'file': issue['file'],
                'id': issue['id'],
                'issues': {
                    'missing_metadata': issue['missing_metadata'],
                    'missing_humanRole': issue['missing_humanRole'],
                    'missing_aiRole': issue['missing_aiRole'],
                    'has_ollama': issue['has_ollama']
                }
            })
    
    with open(output_dir / "all-issues.json", 'w') as f:
        json.dump(combined_issues, f, indent=2)
    print(f"✅ Saved all issues list: {output_dir / 'all-issues.json'}")
    print(f"   ({len(combined_issues)} conversations with issues)")
    
    # Print sample of issues
    print(f"\n📝 SAMPLE ISSUES (first 10)")
    for issue in combined_issues[:10]:
        issue_list = [k for k, v in issue['issues'].items() if v]
        print(f"  {issue['file']}: {', '.join(issue_list)}")
    
    if len(combined_issues) > 10:
        print(f"  ... and {len(combined_issues) - 10} more")

if __name__ == "__main__":
    main()

