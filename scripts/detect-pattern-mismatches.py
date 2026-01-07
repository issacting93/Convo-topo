#!/usr/bin/env python3
"""
Detect Pattern classification mismatches in conversations.

Identifies conversations where Pattern is classified as "storytelling" 
but the conversation structure suggests it should be "question-answer" or "advisory".
"""

import json
import sys
from pathlib import Path
from typing import Dict, List, Tuple

def analyze_conversation_structure(conv: Dict) -> Dict:
    """Analyze conversation structure to predict correct pattern."""
    messages = conv.get('messages', [])
    if not messages:
        return {'pattern': 'unknown', 'confidence': 0, 'reason': 'no messages'}
    
    user_messages = [m for m in messages if m.get('role', '').lower() in ['user', 'human']]
    ai_messages = [m for m in messages if m.get('role', '').lower() in ['assistant', 'ai', 'system']]
    
    # Count questions
    user_questions = sum(1 for m in user_messages if '?' in m.get('content', ''))
    ai_questions = sum(1 for m in ai_messages if '?' in m.get('content', ''))
    
    # Calculate question density
    question_density = user_questions / len(user_messages) if user_messages else 0
    
    # Check for advisory language
    advisory_keywords = ['should', 'recommend', 'advise', 'suggest', 'better', 'try', 'consider']
    advisory_count = sum(1 for m in ai_messages 
                        if any(kw in m.get('content', '').lower() for kw in advisory_keywords))
    
    # Check for directive language (commands)
    directive_keywords = ['write', 'create', 'make', 'do', 'generate', 'build']
    directive_count = sum(1 for m in user_messages 
                         if any(kw in m.get('content', '').lower() for kw in directive_keywords))
    
    # Analyze structure
    pattern = 'question-answer'
    confidence = 0.7
    reasons = []
    
    # High question density → question-answer
    if question_density >= 0.6:
        pattern = 'question-answer'
        confidence = 0.9
        reasons.append(f'high question density ({question_density:.1%})')
    
    # Advisory keywords in AI responses → advisory
    elif advisory_count >= 2:
        pattern = 'advisory'
        confidence = 0.8
        reasons.append(f'advisory language ({advisory_count} instances)')
    
    # Directive keywords in user messages → collaborative or advisory
    elif directive_count >= 2:
        pattern = 'advisory'
        confidence = 0.7
        reasons.append(f'directive language ({directive_count} instances)')
    
    # Check for extended narrative (storytelling indicators)
    avg_ai_length = sum(len(m.get('content', '')) for m in ai_messages) / len(ai_messages) if ai_messages else 0
    temporal_markers = sum(1 for m in messages 
                          if any(marker in m.get('content', '').lower() 
                                for marker in ['then', 'next', 'after', 'before', 'finally', 'eventually']))
    
    # If very long AI responses + temporal markers → storytelling
    if avg_ai_length > 500 and temporal_markers >= 3 and question_density < 0.3:
        pattern = 'storytelling'
        confidence = 0.8
        reasons.append('extended narrative with temporal markers')
    
    return {
        'pattern': pattern,
        'confidence': confidence,
        'reason': '; '.join(reasons) if reasons else 'default',
        'question_density': question_density,
        'user_questions': user_questions,
        'advisory_count': advisory_count,
        'directive_count': directive_count
    }

def detect_mismatches(output_dir: Path) -> List[Tuple[str, Dict, Dict]]:
    """Detect Pattern classification mismatches."""
    mismatches = []
    
    for conv_file in output_dir.glob('*.json'):
        if conv_file.name == 'manifest.json' or conv_file.name.endswith('-error.json'):
            continue
        
        try:
            with open(conv_file) as f:
                conv = json.load(f)
            
            classification = conv.get('classification', {})
            current_pattern = classification.get('interactionPattern', {}).get('category')
            
            if not current_pattern:
                continue
            
            # Analyze structure
            structure = analyze_conversation_structure(conv)
            predicted_pattern = structure['pattern']
            
            # Check for mismatch
            if current_pattern == 'storytelling' and predicted_pattern in ['question-answer', 'advisory']:
                mismatches.append((str(conv_file), {
                    'current': current_pattern,
                    'predicted': predicted_pattern,
                    'confidence': classification.get('interactionPattern', {}).get('confidence', 0),
                    'predicted_confidence': structure['confidence'],
                    'reason': structure['reason'],
                    'stats': {
                        'question_density': structure['question_density'],
                        'user_questions': structure['user_questions'],
                        'advisory_count': structure['advisory_count']
                    }
                }, conv))
            
        except Exception as e:
            print(f"Error processing {conv_file}: {e}", file=sys.stderr)
            continue
    
    return mismatches

def main():
    output_dir = Path('public/output')
    
    print("Scanning conversations for Pattern mismatches...")
    print()
    
    mismatches = detect_mismatches(output_dir)
    
    print(f"Found {len(mismatches)} potential mismatches:")
    print()
    
    for filepath, info, conv in mismatches[:10]:  # Show first 10
        filename = Path(filepath).name
        print(f"📄 {filename}")
        print(f"   Current: {info['current']} ({info['confidence']*100:.0f}%)")
        print(f"   Predicted: {info['predicted']} ({info['predicted_confidence']*100:.0f}%)")
        print(f"   Reason: {info['reason']}")
        print(f"   Stats: {info['stats']}")
        print()
    
    if len(mismatches) > 10:
        print(f"   ... and {len(mismatches) - 10} more")
        print()
    
    # Save report
    report = {
        'total_mismatches': len(mismatches),
        'mismatches': [
            {
                'file': Path(fp).name,
                'current_pattern': info['current'],
                'predicted_pattern': info['predicted'],
                'current_confidence': info['confidence'],
                'predicted_confidence': info['predicted_confidence'],
                'reason': info['reason'],
                'stats': info['stats']
            }
            for fp, info, _ in mismatches
        ]
    }
    
    report_file = Path('docs/PATTERN_MISMATCHES_REPORT.json')
    with open(report_file, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"Full report saved to: {report_file}")
    print()
    print(f"To fix: python3 scripts/fix-pattern-classifications.py")

if __name__ == '__main__':
    main()


