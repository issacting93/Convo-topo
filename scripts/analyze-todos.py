#!/usr/bin/env python3
"""
Analyze and address remaining todos:
1. Fix corrupted WildChat JSON files
2. Test if visualizations show 6+6 roles (not 3+3)
3. Verify coordinate calculations for sample conversations
4. Analyze Y-axis skew (why everything Divergent?)
"""

import json
import sys
from pathlib import Path
from collections import defaultdict, Counter
from typing import Dict, List, Optional, Tuple

# Project root
PROJECT_ROOT = Path(__file__).parent.parent
OUTPUT_DIR = PROJECT_ROOT / "public" / "output"
WILDCHAT_DIR = PROJECT_ROOT / "public" / "output-wildchat"

def analyze_corrupted_files():
    """Identify corrupted WildChat JSON files"""
    print("=" * 80)
    print("1. ANALYZING CORRUPTED WILDCHAT JSON FILES")
    print("=" * 80)
    
    corrupted = []
    total = 0
    
    if not WILDCHAT_DIR.exists():
        print(f"⚠️  WildChat directory not found: {WILDCHAT_DIR}")
        return corrupted
    
    for file_path in sorted(WILDCHAT_DIR.glob("*.json")):
        total += 1
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
                json.loads(content)
        except json.JSONDecodeError as e:
            corrupted.append({
                'file': file_path.name,
                'error': str(e),
                'line': getattr(e, 'lineno', 'unknown'),
                'col': getattr(e, 'colno', 'unknown')
            })
        except Exception as e:
            corrupted.append({
                'file': file_path.name,
                'error': str(e),
                'line': 'unknown',
                'col': 'unknown'
            })
    
    print(f"📊 Total files checked: {total}")
    print(f"❌ Corrupted files: {len(corrupted)}")
    print(f"✅ Valid files: {total - len(corrupted)}")
    
    if corrupted:
        print("\n🔍 Corrupted files (first 10):")
        for i, item in enumerate(corrupted[:10], 1):
            print(f"  {i}. {item['file']}")
            print(f"     Error: {item['error'][:100]}")
        
        # Save full list
        report_path = PROJECT_ROOT / "classifier" / "corrupted-files-report.json"
        with open(report_path, 'w') as f:
            json.dump(corrupted, f, indent=2)
        print(f"\n💾 Full report saved to: {report_path}")
    
    return corrupted

def analyze_role_distribution():
    """Check if visualizations show 6+6 roles"""
    print("\n" + "=" * 80)
    print("2. ANALYZING ROLE DISTRIBUTION (6+6 roles)")
    print("=" * 80)
    
    # Expected roles from Social Role Theory taxonomy
    expected_human_roles = {
        'information-seeker', 'provider', 'director', 'collaborator', 
        'social-expressor', 'relational-peer'
    }
    expected_ai_roles = {
        'expert-system', 'learning-facilitator', 'advisor', 'co-constructor',
        'social-facilitator', 'relational-peer'
    }
    
    # Old role names (for backward compatibility)
    old_human_roles = {'seeker', 'challenger', 'sharer', 'learner', 'peer', 'affiliative'}
    old_ai_roles = {'expert', 'facilitator', 'reflector', 'peer', 'affiliative'}
    
    human_roles_found = set()
    ai_roles_found = set()
    old_human_found = set()
    old_ai_found = set()
    
    total_conversations = 0
    conversations_with_roles = 0
    
    if not OUTPUT_DIR.exists():
        print(f"⚠️  Output directory not found: {OUTPUT_DIR}")
        return
    
    for file_path in sorted(OUTPUT_DIR.glob("*.json")):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            total_conversations += 1
            
            if not data.get('classification'):
                continue
            
            conversations_with_roles += 1
            classification = data['classification']
            
            # Check human roles
            if classification.get('humanRole') and classification['humanRole'].get('distribution'):
                for role in classification['humanRole']['distribution'].keys():
                    if role in expected_human_roles:
                        human_roles_found.add(role)
                    elif role in old_human_roles:
                        old_human_found.add(role)
            
            # Check AI roles
            if classification.get('aiRole') and classification['aiRole'].get('distribution'):
                for role in classification['aiRole']['distribution'].keys():
                    if role in expected_ai_roles:
                        ai_roles_found.add(role)
                    elif role in old_ai_roles:
                        old_ai_found.add(role)
        
        except Exception as e:
            continue
    
    print(f"📊 Total conversations: {total_conversations}")
    print(f"📊 Conversations with roles: {conversations_with_roles}")
    print()
    print("✅ NEW ROLES FOUND:")
    print(f"  Human roles (expected 6): {len(human_roles_found)}")
    for role in sorted(human_roles_found):
        print(f"    • {role}")
    print(f"  AI roles (expected 6): {len(ai_roles_found)}")
    for role in sorted(ai_roles_found):
        print(f"    • {role}")
    print()
    print("⚠️  OLD ROLES STILL PRESENT:")
    if old_human_found:
        print(f"  Human: {sorted(old_human_found)}")
    if old_ai_found:
        print(f"  AI: {sorted(old_ai_found)}")
    print()
    
    missing_human = expected_human_roles - human_roles_found
    missing_ai = expected_ai_roles - ai_roles_found
    
    if missing_human:
        print(f"❌ Missing human roles: {sorted(missing_human)}")
    if missing_ai:
        print(f"❌ Missing AI roles: {sorted(missing_ai)}")
    
    if not missing_human and not missing_ai:
        print("✅ All 6+6 roles are present in the data!")

def analyze_y_axis_skew():
    """Analyze why everything appears Divergent on Y-axis"""
    print("\n" + "=" * 80)
    print("4. ANALYZING Y-AXIS SKEW (Why everything Divergent?)")
    print("=" * 80)
    
    y_values = []
    patterns = Counter()
    alignment_scores = []
    role_based_y = []
    
    if not OUTPUT_DIR.exists():
        print(f"⚠️  Output directory not found: {OUTPUT_DIR}")
        return
    
    for file_path in sorted(OUTPUT_DIR.glob("*.json")):
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if not data.get('classification') or not data.get('messages'):
                continue
            
            classification = data['classification']
            messages = data['messages']
            
            # Get pattern
            pattern = classification.get('interactionPattern', {}).get('category', 'unknown')
            patterns[pattern] += 1
            
            # Simulate Y calculation (simplified)
            # Based on getConversationStructure logic
            pattern_y = None
            if pattern in ['question-answer', 'advisory']:
                pattern_y = 0.8  # Divergent
            elif pattern in ['collaborative', 'casual-chat', 'storytelling']:
                pattern_y = 0.2  # Aligned
            
            if pattern_y:
                role_based_y.append(pattern_y)
            
            # Count messages for alignment estimation
            if len(messages) > 0:
                # Simple heuristic: more messages = potentially more aligned
                # This is a simplification - real calculation uses linguistic features
                alignment_estimate = min(0.5 + (len(messages) / 100) * 0.3, 0.95)
                alignment_scores.append(alignment_estimate)
        
        except Exception as e:
            continue
    
    print(f"📊 Conversations analyzed: {len(alignment_scores)}")
    print()
    print("📈 PATTERN DISTRIBUTION:")
    for pattern, count in patterns.most_common():
        percentage = (count / sum(patterns.values())) * 100
        print(f"  {pattern}: {count} ({percentage:.1f}%)")
    print()
    
    if alignment_scores:
        avg_alignment = sum(alignment_scores) / len(alignment_scores)
        print(f"📊 Average alignment score (estimated): {avg_alignment:.3f}")
        print(f"   (0.0 = Aligned, 1.0 = Divergent)")
        print()
    
    if role_based_y:
        avg_y = sum(role_based_y) / len(role_based_y)
        print(f"📊 Average Y position (pattern-based): {avg_y:.3f}")
        print(f"   (0.0-0.3 = Aligned, 0.7-1.0 = Divergent)")
        print()
        
        divergent_count = sum(1 for y in role_based_y if y > 0.6)
        aligned_count = sum(1 for y in role_based_y if y < 0.4)
        balanced_count = len(role_based_y) - divergent_count - aligned_count
        
        print(f"📊 Y-AXIS DISTRIBUTION:")
        print(f"  Aligned (0.0-0.4): {aligned_count} ({aligned_count/len(role_based_y)*100:.1f}%)")
        print(f"  Balanced (0.4-0.6): {balanced_count} ({balanced_count/len(role_based_y)*100:.1f}%)")
        print(f"  Divergent (0.6-1.0): {divergent_count} ({divergent_count/len(role_based_y)*100:.1f}%)")
        print()
        
        if divergent_count > aligned_count * 2:
            print("⚠️  WARNING: Significant skew toward Divergent!")
            print("   Possible causes:")
            print("   1. Most conversations are question-answer or advisory patterns")
            print("   2. Linguistic alignment calculation may be biased")
            print("   3. Pattern-to-Y mapping may need recalibration")

def verify_coordinate_calculations():
    """Verify coordinate calculations for sample conversations"""
    print("\n" + "=" * 80)
    print("3. VERIFYING COORDINATE CALCULATIONS")
    print("=" * 80)
    
    samples = []
    
    if not OUTPUT_DIR.exists():
        print(f"⚠️  Output directory not found: {OUTPUT_DIR}")
        return
    
    # Get a few sample conversations
    for file_path in sorted(OUTPUT_DIR.glob("*.json"))[:10]:
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            if not data.get('classification') or not data.get('messages'):
                continue
            
            classification = data['classification']
            messages = data['messages']
            
            # Extract key features
            pattern = classification.get('interactionPattern', {}).get('category', 'unknown')
            human_role = classification.get('humanRole', {}).get('distribution', {})
            ai_role = classification.get('aiRole', {}).get('distribution', {})
            
            # Estimate coordinates (simplified)
            # X-axis: Functional (0) ↔ Social (1)
            # Based on pattern and roles
            if pattern in ['question-answer', 'advisory']:
                x_estimate = 0.3  # More functional
            elif pattern in ['casual-chat', 'storytelling']:
                x_estimate = 0.7  # More social
            else:
                x_estimate = 0.5
            
            # Y-axis: Aligned (0) ↔ Divergent (1)
            if pattern in ['question-answer', 'advisory']:
                y_estimate = 0.8  # Divergent
            elif pattern in ['collaborative', 'casual-chat']:
                y_estimate = 0.2  # Aligned
            else:
                y_estimate = 0.5
            
            samples.append({
                'id': data.get('id', file_path.stem),
                'pattern': pattern,
                'message_count': len(messages),
                'x_estimate': x_estimate,
                'y_estimate': y_estimate,
                'human_role': max(human_role.items(), key=lambda x: x[1])[0] if human_role else None,
                'ai_role': max(ai_role.items(), key=lambda x: x[1])[0] if ai_role else None,
            })
        
        except Exception as e:
            continue
    
    print(f"📊 Sample conversations analyzed: {len(samples)}")
    print()
    print("📋 SAMPLE COORDINATES:")
    for i, sample in enumerate(samples[:5], 1):
        print(f"\n  {i}. {sample['id']}")
        print(f"     Pattern: {sample['pattern']}")
        print(f"     Messages: {sample['message_count']}")
        print(f"     Human Role: {sample['human_role']}")
        print(f"     AI Role: {sample['ai_role']}")
        print(f"     X (Functional↔Social): {sample['x_estimate']:.2f}")
        print(f"     Y (Aligned↔Divergent): {sample['y_estimate']:.2f}")
    
    # Check for coordinate range issues
    x_values = [s['x_estimate'] for s in samples]
    y_values = [s['y_estimate'] for s in samples]
    
    print()
    print("📊 COORDINATE STATISTICS:")
    print(f"  X-axis range: {min(x_values):.2f} - {max(x_values):.2f}")
    print(f"  Y-axis range: {min(y_values):.2f} - {max(y_values):.2f}")
    print(f"  X-axis mean: {sum(x_values)/len(x_values):.2f}")
    print(f"  Y-axis mean: {sum(y_values)/len(y_values):.2f}")

def main():
    """Run all analyses"""
    print("\n" + "=" * 80)
    print("TODO ANALYSIS AND VERIFICATION")
    print("=" * 80)
    print()
    
    # 1. Analyze corrupted files
    corrupted = analyze_corrupted_files()
    
    # 2. Analyze role distribution
    analyze_role_distribution()
    
    # 3. Verify coordinate calculations
    verify_coordinate_calculations()
    
    # 4. Analyze Y-axis skew
    analyze_y_axis_skew()
    
    print("\n" + "=" * 80)
    print("✅ ANALYSIS COMPLETE")
    print("=" * 80)
    print()
    print("📋 SUMMARY:")
    print(f"  • Corrupted files: {len(corrupted)}")
    print("  • Role distribution: Check output above")
    print("  • Coordinate calculations: Check sample output above")
    print("  • Y-axis skew: Check analysis above")
    print()

if __name__ == "__main__":
    main()

