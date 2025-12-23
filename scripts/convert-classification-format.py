#!/usr/bin/env python3
"""
Convert classification format from snake_case/value format to camelCase/category format

This script converts existing classifications to the format expected by the app:
- snake_case → camelCase (interaction_pattern → interactionPattern)
- value → category
- human_role_distribution → humanRole with distribution structure
- ai_role_distribution → aiRole with distribution structure

Usage:
    python3 scripts/convert-classification-format.py --chatbot-arena
    python3 scripts/convert-classification-format.py --all
    python3 scripts/convert-classification-format.py --file chatbot_arena_01.json --dry-run
"""

import json
import argparse
from pathlib import Path
from typing import Dict

OUTPUT_DIR = Path(__file__).parent.parent / "public" / "output"


def normalize_dist(dist: dict) -> dict:
    """Normalize distribution to sum to 1.0"""
    total = sum(dist.values())
    if total <= 0:
        return dist
    return {k: round(v / total, 3) for k, v in dist.items()}


def convert_classification_format(raw_classification: Dict) -> Dict:
    """
    Convert classification from snake_case/value format to camelCase/category format.
    This matches the format expected by the TypeScript app.
    """
    converted = {}
    
    # Mapping from snake_case to camelCase
    field_mapping = {
        'interaction_pattern': 'interactionPattern',
        'power_dynamics': 'powerDynamics',
        'emotional_tone': 'emotionalTone',
        'engagement_style': 'engagementStyle',
        'knowledge_exchange': 'knowledgeExchange',
        'conversation_purpose': 'conversationPurpose',
        'topic_depth': 'topicDepth',
        'turn_taking': 'turnTaking',
        'human_role_distribution': 'humanRole',
        'ai_role_distribution': 'aiRole'
    }
    
    for old_key, new_key in field_mapping.items():
        # Check both snake_case and camelCase
        source_key = old_key if old_key in raw_classification else new_key
        if source_key not in raw_classification:
            continue
        
        value = raw_classification[source_key]
        
        # Handle role distributions specially
        if old_key in ['human_role_distribution', 'ai_role_distribution']:
            # Convert flat distribution to nested structure
            if isinstance(value, dict):
                # Check if already in correct format (has 'distribution' key)
                if 'distribution' in value:
                    converted[new_key] = value.copy()
                else:
                    # It's a flat distribution, convert to nested
                    distribution = {}
                    confidence = 0.5
                    evidence = []
                    rationale = ""
                    
                    # Extract distribution values (filter out metadata)
                    for k, v in value.items():
                        if k in ['seeker', 'learner', 'director', 'collaborator', 'sharer', 'challenger']:
                            distribution[k] = float(v)
                        elif k in ['expert', 'advisor', 'facilitator', 'reflector', 'peer', 'affiliative']:
                            distribution[k] = float(v)
                        elif k == 'confidence':
                            confidence = float(v)
                        elif k == 'evidence':
                            evidence = value[k] if isinstance(value[k], list) else []
                            if isinstance(evidence, str):
                                evidence = [evidence]
                        elif k == 'rationale':
                            rationale = str(value[k])
                    
                    # Normalize distribution
                    distribution = normalize_dist(distribution)
                    
                    converted[new_key] = {
                        'distribution': distribution,
                        'confidence': confidence,
                        'evidence': evidence,
                        'rationale': rationale,
                        'alternative': None
                    }
        else:
            # Handle regular dimensions
            if isinstance(value, dict):
                converted_dim = value.copy()
                
                # Convert 'value' to 'category' if needed
                if 'value' in converted_dim and 'category' not in converted_dim:
                    converted_dim['category'] = converted_dim.pop('value')
                
                # Ensure required fields exist
                if 'category' not in converted_dim:
                    continue
                if 'confidence' not in converted_dim:
                    converted_dim['confidence'] = 0.5
                
                # Convert evidence from string to array if needed
                if 'evidence' in converted_dim:
                    if isinstance(converted_dim['evidence'], str):
                        converted_dim['evidence'] = [converted_dim['evidence']]
                    elif not isinstance(converted_dim['evidence'], list):
                        converted_dim['evidence'] = []
                else:
                    converted_dim['evidence'] = []
                
                if 'rationale' not in converted_dim:
                    converted_dim['rationale'] = ""
                if 'alternative' not in converted_dim:
                    converted_dim['alternative'] = None
                
                converted[new_key] = converted_dim
    
    # Copy abstain if present
    if 'abstain' in raw_classification:
        converted['abstain'] = raw_classification['abstain']
    
    return converted


def process_file(file_path: Path, dry_run: bool = False) -> Dict:
    """Convert classification format in a single file"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        conv_id = data.get('id', file_path.stem)
        existing_classification = data.get('classification', {})
        
        if not existing_classification:
            return {
                'file': file_path.name,
                'status': 'skipped',
                'reason': 'No classification found'
            }
        
        # Check if already in correct format
        is_correct_format = True
        if isinstance(existing_classification, dict):
            # Check for camelCase keys and 'category' fields
            has_camel_case = any(key in ['interactionPattern', 'emotionalTone', 'humanRole'] 
                               for key in existing_classification.keys())
            has_category = any(isinstance(v, dict) and 'category' in v 
                             for v in existing_classification.values())
            
            if not (has_camel_case and has_category):
                is_correct_format = False
        
        if is_correct_format:
            return {
                'file': file_path.name,
                'status': 'skipped',
                'reason': 'Already in correct format'
            }
        
        # Convert format
        converted = convert_classification_format(existing_classification)
        data['classification'] = converted
        
        if not dry_run:
            with open(file_path, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
                f.write('\n')
        
        return {
            'file': file_path.name,
            'status': 'success',
            'dry_run': dry_run
        }
        
    except Exception as e:
        return {
            'file': file_path.name,
            'status': 'error',
            'reason': str(e)
        }


def main():
    parser = argparse.ArgumentParser(
        description='Convert classification format to app-compatible format'
    )
    parser.add_argument(
        '--file',
        type=str,
        help='Process a single file'
    )
    parser.add_argument(
        '--all',
        action='store_true',
        help='Process all JSON files in public/output/'
    )
    parser.add_argument(
        '--chatbot-arena',
        action='store_true',
        help='Process only chatbot_arena_*.json files'
    )
    parser.add_argument(
        '--dry-run',
        action='store_true',
        help='Preview changes without writing files'
    )
    
    args = parser.parse_args()
    
    if not args.file and not args.all and not args.chatbot_arena:
        parser.print_help()
        print("\n❌ Error: Must specify --file, --all, or --chatbot-arena")
        return 1
    
    # Get files to process
    files_to_process = []
    
    if args.file:
        file_path = OUTPUT_DIR / args.file
        if not file_path.exists():
            print(f"❌ Error: File not found: {file_path}")
            return 1
        files_to_process = [file_path]
    elif args.chatbot_arena:
        files_to_process = sorted(OUTPUT_DIR.glob("chatbot_arena_*.json"))
    elif args.all:
        files_to_process = sorted(OUTPUT_DIR.glob("*.json"))
        files_to_process = [f for f in files_to_process if f.name != "manifest.json"]
    
    if not files_to_process:
        print(f"❌ No files found in {OUTPUT_DIR}")
        return 1
    
    print(f"🔄 Converting Classification Format\n")
    if args.dry_run:
        print("🔍 DRY RUN MODE - No files will be modified\n")
    print(f"📁 Processing {len(files_to_process)} file(s)...\n")
    
    results = {'success': 0, 'skipped': 0, 'error': 0}
    
    for file_path in files_to_process:
        result = process_file(file_path, args.dry_run)
        
        if result['status'] == 'success':
            print(f"✅ {result['file']}: Converted format")
            results['success'] += 1
        elif result['status'] == 'skipped':
            print(f"⏭️  {result['file']}: {result['reason']}")
            results['skipped'] += 1
        else:
            print(f"❌ {result['file']}: {result['reason']}")
            results['error'] += 1
    
    print(f"\n📊 Summary:")
    print(f"   ✅ Converted: {results['success']}")
    print(f"   ⏭️  Skipped: {results['skipped']}")
    print(f"   ❌ Errors: {results['error']}")
    
    if not args.dry_run and results['success'] > 0:
        print(f"\n💡 Format converted! Classifications should now work in the app.")


if __name__ == "__main__":
    exit(main() or 0)

