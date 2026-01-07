#!/usr/bin/env python3
"""
Detect and Flag Problematic Conversations

Identifies inappropriate, adversarial, or boundary-testing conversations
that should be filtered out or flagged for review.

Issues detected:
- Inappropriate content (sexual, boundary-testing, adversarial prompts)
- Misclassified conversations (inappropriate content classified as normal)
- Duplicate/conversation content
- Very low-quality or spam-like content
"""

import json
import os
import re
from pathlib import Path
from typing import Dict, List, Tuple, Set
from collections import defaultdict

# ============================================================================
# DETECTION PATTERNS
# ============================================================================

# Inappropriate/boundary-testing patterns
INAPPROPRIATE_PATTERNS = [
    # Sexual/inappropriate requests
    (r'\b(breastfeed|act as my mom|act as.*mom|be my mom)\b', 'inappropriate_roleplay'),
    (r'\b(lay down|get on.*floor|naked|undress|strip)\b', 'inappropriate_physical'),
    (r'\b(sexual|sex|porn|nsfw|explicit|adult content)\b', 'sexual_content'),
    (r'\b(kill|murder|harm|violence|bomb|terrorist)\b', 'violent_content'),
    
    # Boundary testing/jailbreak attempts
    (r'\b(ignore|forget|disregard.*previous|override)\b.*\b(instruction|rule|guideline|policy)\b', 'boundary_testing'),
    (r'\b(pretend|simulate|roleplay|act as|you are now)\b.*\b(evil|unrestricted|unethical)\b', 'jailbreak_attempt'),
    (r'\b(dan|do anything now|developer mode|jailbreak)\b', 'jailbreak_attempt'),
    
    # Adversarial testing
    (r'\b(test|try to|attempt to|see if you)\b.*\b(break|violate|bypass|circumvent)\b', 'adversarial_testing'),
    (r'\b(what.*worst|most offensive|most inappropriate|say something bad)\b', 'adversarial_testing'),
]

# Low-quality/spam patterns
LOW_QUALITY_PATTERNS = [
    (r'^[a-z]{1,3}$', 'too_short'),  # Single word/short responses
    (r'^(.)\1{10,}$', 'repeated_char'),  # Repeated characters (e.g., "aaaaaaaaa")
    (r'\b(test|hello|hi|hey)\b', 'minimal_content'),  # Very minimal messages
]

# Classification mismatch patterns (when content suggests one thing but classification says another)
CLASSIFICATION_MISMATCH = {
    'inappropriate': ['supportive', 'relationship-building', 'casual-chat'],
    'adversarial': ['question-answer', 'advisory', 'collaborative'],
    'boundary_testing': ['supportive', 'professional'],
}

# ============================================================================
# DETECTION FUNCTIONS
# ============================================================================

def detect_inappropriate_content(messages: List[Dict]) -> List[Dict]:
    """Detect inappropriate or boundary-testing content"""
    issues = []
    
    combined_text = ' '.join([m.get('content', '') for m in messages]).lower()
    
    for pattern, issue_type in INAPPROPRIATE_PATTERNS:
        matches = re.finditer(pattern, combined_text, re.IGNORECASE)
        for match in matches:
            # Find which message contains this
            for msg_idx, msg in enumerate(messages):
                if match.group() in msg.get('content', '').lower():
                    issues.append({
                        'type': issue_type,
                        'severity': 'high',
                        'message_index': msg_idx,
                        'message_content': msg.get('content', '')[:100],
                        'matched_text': match.group(),
                    })
                    break
    
    return issues

def detect_low_quality(messages: List[Dict]) -> List[Dict]:
    """Detect low-quality or spam-like content"""
    issues = []
    
    for msg_idx, msg in enumerate(messages):
        content = msg.get('content', '').strip()
        if len(content) < 3:
            issues.append({
                'type': 'too_short',
                'severity': 'medium',
                'message_index': msg_idx,
                'message_content': content,
            })
        
        for pattern, issue_type in LOW_QUALITY_PATTERNS:
            if re.match(pattern, content, re.IGNORECASE):
                issues.append({
                    'type': issue_type,
                    'severity': 'medium',
                    'message_index': msg_idx,
                    'message_content': content[:100],
                })
    
    return issues

def check_classification_mismatch(conversation: Dict) -> List[Dict]:
    """Check if classification matches the actual content"""
    issues = []
    
    messages = conversation.get('messages', [])
    classification = conversation.get('classification', {})
    
    if not classification:
        return issues
    
    combined_text = ' '.join([m.get('content', '') for m in messages]).lower()
    
    # Check for inappropriate content but "supportive" classification
    has_inappropriate = any(
        re.search(pattern, combined_text, re.IGNORECASE)
        for pattern, _ in INAPPROPRIATE_PATTERNS[:4]  # First 4 are inappropriate
    )
    
    if has_inappropriate:
        emotional_tone = classification.get('emotionalTone', {}).get('category', '')
        pattern = classification.get('interactionPattern', {}).get('category', '')
        purpose = classification.get('conversationPurpose', {}).get('category', '')
        
        # Check if classified as something benign
        benign_classifications = ['supportive', 'relationship-building', 'casual-chat', 
                                  'question-answer', 'advisory', 'collaborative']
        
        if any(c in [emotional_tone, pattern, purpose] for c in benign_classifications):
            issues.append({
                'type': 'classification_mismatch',
                'severity': 'high',
                'details': f'Inappropriate content but classified as: tone={emotional_tone}, pattern={pattern}, purpose={purpose}',
            })
    
    return issues

def check_duplicate_pad_scores(messages: List[Dict]) -> List[Dict]:
    """Check for suspiciously duplicate PAD scores"""
    issues = []
    
    pad_scores = []
    for msg in messages:
        pad = msg.get('pad', {})
        if pad and 'emotionalIntensity' in pad:
            pad_scores.append(pad['emotionalIntensity'])
    
    if len(pad_scores) < 5:
        return issues
    
    # Check if too many are identical (suggesting defaults)
    from collections import Counter
    score_counts = Counter(pad_scores)
    most_common_count = score_counts.most_common(1)[0][1] if score_counts else 0
    
    # If more than 50% have the same score, it's suspicious
    if most_common_count > len(pad_scores) * 0.5:
        issues.append({
            'type': 'duplicate_pad_scores',
            'severity': 'medium',
            'details': f'{most_common_count}/{len(pad_scores)} messages have identical PAD scores',
            'common_score': score_counts.most_common(1)[0][0],
        })
    
    return issues

def analyze_conversation(conversation: Dict) -> Dict:
    """Analyze a single conversation for issues"""
    messages = conversation.get('messages', [])
    
    issues = {
        'inappropriate': detect_inappropriate_content(messages),
        'low_quality': detect_low_quality(messages),
        'classification_mismatch': check_classification_mismatch(conversation),
        'duplicate_pad': check_duplicate_pad_scores(messages),
    }
    
    # Flatten and categorize
    all_issues = []
    for category, issue_list in issues.items():
        for issue in issue_list:
            issue['category'] = category
            all_issues.append(issue)
    
    # Calculate severity score
    high_severity_count = sum(1 for i in all_issues if i.get('severity') == 'high')
    medium_severity_count = sum(1 for i in all_issues if i.get('severity') == 'medium')
    
    return {
        'issues': all_issues,
        'issue_count': len(all_issues),
        'high_severity_count': high_severity_count,
        'medium_severity_count': medium_severity_count,
        'is_problematic': high_severity_count > 0 or len(all_issues) >= 3,
    }

# ============================================================================
# MAIN SCRIPT
# ============================================================================

def scan_directory(directory: str = 'public/output') -> Dict:
    """Scan directory for problematic conversations"""
    directory_path = Path(directory)
    
    if not directory_path.exists():
        print(f"❌ Directory not found: {directory}")
        return {}
    
    results = {
        'total_conversations': 0,
        'problematic': [],
        'suspicious': [],
        'clean': [],
        'by_issue_type': defaultdict(list),
    }
    
    # Scan all JSON files
    json_files = list(directory_path.glob('*.json'))
    
    # Exclude manifest
    json_files = [f for f in json_files if f.name != 'manifest.json']
    
    print(f"Scanning {len(json_files)} conversations in {directory}...")
    print()
    
    for json_file in json_files:
        try:
            with open(json_file, 'r') as f:
                conversation = json.load(f)
            
            results['total_conversations'] += 1
            conv_id = conversation.get('id', json_file.stem)
            
            analysis = analyze_conversation(conversation)
            
            if analysis['is_problematic']:
                results['problematic'].append({
                    'file': json_file.name,
                    'id': conv_id,
                    'analysis': analysis,
                    'message_count': len(conversation.get('messages', [])),
                })
                
                # Categorize by issue type
                for issue in analysis['issues']:
                    issue_type = issue.get('type', 'unknown')
                    results['by_issue_type'][issue_type].append({
                        'file': json_file.name,
                        'id': conv_id,
                        'severity': issue.get('severity'),
                    })
            elif analysis['issue_count'] > 0:
                results['suspicious'].append({
                    'file': json_file.name,
                    'id': conv_id,
                    'analysis': analysis,
                })
            else:
                results['clean'].append(json_file.name)
        
        except Exception as e:
            print(f"⚠️  Error processing {json_file.name}: {e}")
    
    return results

def print_report(results: Dict):
    """Print a formatted report"""
    print("=" * 80)
    print("PROBLEMATIC CONVERSATIONS REPORT")
    print("=" * 80)
    print()
    
    print(f"Total conversations scanned: {results['total_conversations']}")
    print(f"✅ Clean: {len(results['clean'])}")
    print(f"⚠️  Suspicious: {len(results['suspicious'])}")
    print(f"❌ Problematic: {len(results['problematic'])}")
    print()
    
    if results['problematic']:
        print("=" * 80)
        print("PROBLEMATIC CONVERSATIONS")
        print("=" * 80)
        print()
        
        for item in results['problematic']:
            print(f"📄 {item['file']} (ID: {item['id']})")
            print(f"   Messages: {item['message_count']}")
            print(f"   Issues: {item['analysis']['issue_count']} "
                  f"({item['analysis']['high_severity_count']} high, "
                  f"{item['analysis']['medium_severity_count']} medium)")
            
            # Group issues by type
            issues_by_type = defaultdict(list)
            for issue in item['analysis']['issues']:
                issues_by_type[issue['type']].append(issue)
            
            for issue_type, issues_list in issues_by_type.items():
                print(f"   - {issue_type}: {len(issues_list)} issue(s)")
                for issue in issues_list[:2]:  # Show first 2
                    if 'message_content' in issue:
                        content = issue['message_content'][:60]
                        print(f"     • {content}...")
                    elif 'details' in issue:
                        print(f"     • {issue['details']}")
            
            print()
    
    # Issue type breakdown
    if results['by_issue_type']:
        print("=" * 80)
        print("ISSUES BY TYPE")
        print("=" * 80)
        print()
        
        for issue_type, files in sorted(results['by_issue_type'].items(), 
                                        key=lambda x: len(x[1]), reverse=True):
            print(f"{issue_type}: {len(files)} conversations")
            high_severity = sum(1 for f in files if f.get('severity') == 'high')
            if high_severity > 0:
                print(f"  High severity: {high_severity}")
            print()
    
    # Sample suspicious
    if results['suspicious']:
        print("=" * 80)
        print("SUSPICIOUS CONVERSATIONS (Minor Issues)")
        print("=" * 80)
        print()
        for item in results['suspicious'][:10]:  # First 10
            print(f"  - {item['file']}: {item['analysis']['issue_count']} minor issue(s)")
        if len(results['suspicious']) > 10:
            print(f"  ... and {len(results['suspicious']) - 10} more")
        print()

def save_report(results: Dict, output_file: str = 'docs/PROBLEMATIC_CONVERSATIONS_REPORT.json'):
    """Save detailed report to JSON"""
    # Convert defaultdict to regular dict for JSON serialization
    report = {
        'summary': {
            'total': results['total_conversations'],
            'clean': len(results['clean']),
            'suspicious': len(results['suspicious']),
            'problematic': len(results['problematic']),
        },
        'problematic': results['problematic'],
        'by_issue_type': dict(results['by_issue_type']),
    }
    
    output_path = Path(output_file)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    with open(output_path, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"📄 Detailed report saved to: {output_file}")

def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Detect problematic conversations')
    parser.add_argument('--directory', '-d', default='public/output',
                       help='Directory to scan (default: public/output)')
    parser.add_argument('--output', '-o', default='docs/PROBLEMATIC_CONVERSATIONS_REPORT.json',
                       help='Output file for detailed report')
    parser.add_argument('--verbose', '-v', action='store_true',
                       help='Show detailed issue information')
    
    args = parser.parse_args()
    
    # Scan directory
    results = scan_directory(args.directory)
    
    # Print report
    print_report(results)
    
    # Save detailed report
    save_report(results, args.output)
    
    # Exit code
    if results['problematic']:
        print(f"\n⚠️  Found {len(results['problematic'])} problematic conversations!")
        return 1
    else:
        print("\n✅ No problematic conversations found.")
        return 0

if __name__ == '__main__':
    exit(main())

