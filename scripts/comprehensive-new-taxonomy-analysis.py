#!/usr/bin/env python3
"""
Comprehensive Data Science Analysis: New Taxonomy (671 Conversations)

Analyzes conversations classified with GPT-5.2 / 2.0-social-role-theory taxonomy.

Analysis includes:
1. Role distributions and patterns
2. Dimensional analysis (all 10 dimensions)
3. Source-specific patterns
4. PAD (Pleasure-Arousal-Dominance) distributions
5. Message and conversation statistics
6. Role pair analysis
7. Key insights and findings
"""

import json
import statistics
import numpy as np
from pathlib import Path
from collections import defaultdict, Counter
from typing import Dict, List
from datetime import datetime

OUTPUT_DIRS = [
    Path("public/output"),
    Path("public/output-wildchat")
]
REPORTS_DIR = Path("reports")

def load_new_taxonomy_conversations() -> List[Dict]:
    """Load conversations classified with GPT-5.2 / 2.0-social-role-theory."""
    conversations = []

    for output_dir in OUTPUT_DIRS:
        if not output_dir.exists():
            continue

        json_files = [f for f in output_dir.glob("*.json") if f.name != "manifest.json"]

        print(f"📂 Scanning {output_dir}...")

        for file_path in json_files:
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    data = json.load(f)

                classification = data.get('classification', {})
                if not classification:
                    continue

                metadata = classification.get('metadata', {}) or data.get('classificationMetadata', {})

                if metadata:
                    model = metadata.get('model', '').strip()
                    prompt_version = metadata.get('promptVersion', '').strip()

                    if model == 'gpt-5.2' and prompt_version == '2.0-social-role-theory':
                        data['_source_file'] = file_path.name
                        data['_conversation_id'] = file_path.stem
                        conversations.append(data)

            except Exception as e:
                pass

    return conversations

def get_source_category(filename: str) -> str:
    """Determine source category from filename."""
    if filename.startswith('chatbot_arena_'):
        return 'chatbot_arena'
    elif filename.startswith('wildchat_'):
        return 'wildchat'
    elif filename.startswith('oasst-'):
        return 'oasst'
    elif filename.startswith('cornell-'):
        return 'cornell'
    elif filename.startswith('kaggle-'):
        return 'kaggle'
    return 'other'

def analyze_role_distributions(conversations: List[Dict]) -> Dict:
    """Comprehensive role distribution analysis."""
    # Human roles
    human_roles_all = defaultdict(float)  # Sum of probabilities
    human_dominant = Counter()  # Most dominant role per conversation

    # AI roles
    ai_roles_all = defaultdict(float)
    ai_dominant = Counter()

    # Role pairs
    role_pairs = Counter()

    # Role evidence
    role_examples = defaultdict(list)

    for conv in conversations:
        cls = conv.get('classification', {})
        conv_id = conv.get('_conversation_id', '')

        # Human roles
        h_role = cls.get('humanRole', {})
        h_dist = h_role.get('distribution', {})

        for role, prob in h_dist.items():
            human_roles_all[role] += prob

        if h_dist:
            h_max_role = max(h_dist.items(), key=lambda x: x[1])[0]
            h_max_prob = h_dist[h_max_role]
            human_dominant[h_max_role] += 1

            # Collect examples
            if len(role_examples[h_max_role]) < 5:
                role_examples[h_max_role].append({
                    'conversation_id': conv_id,
                    'probability': h_max_prob,
                    'evidence': h_role.get('evidence', [])[:2]
                })
        else:
            h_max_role = None

        # AI roles
        a_role = cls.get('aiRole', {})
        a_dist = a_role.get('distribution', {})

        for role, prob in a_dist.items():
            ai_roles_all[role] += prob

        if a_dist:
            a_max_role = max(a_dist.items(), key=lambda x: x[1])[0]
            a_max_prob = a_dist[a_max_role]
            ai_dominant[a_max_role] += 1

            # Collect examples
            ai_role_key = f"ai_{a_max_role}"
            if len(role_examples[ai_role_key]) < 5:
                role_examples[ai_role_key].append({
                    'conversation_id': conv_id,
                    'probability': a_max_prob,
                    'evidence': a_role.get('evidence', [])[:2]
                })
        else:
            a_max_role = None

        # Role pairs
        if h_max_role and a_max_role:
            role_pairs[f"{h_max_role}→{a_max_role}"] += 1

    total_convs = len(conversations)

    return {
        'total_conversations': total_convs,
        'human_roles': {
            'totals': dict(human_roles_all),
            'dominant': dict(human_dominant.most_common()),
            'dominant_pct': {k: (v/total_convs*100) for k, v in human_dominant.items()},
            'examples': {k: v for k, v in role_examples.items() if not k.startswith('ai_')}
        },
        'ai_roles': {
            'totals': dict(ai_roles_all),
            'dominant': dict(ai_dominant.most_common()),
            'dominant_pct': {k: (v/total_convs*100) for k, v in ai_dominant.items()},
            'examples': {k.replace('ai_', ''): v for k, v in role_examples.items() if k.startswith('ai_')}
        },
        'role_pairs': {
            'counts': dict(role_pairs.most_common(50)),
            'percentages': {k: (v/total_convs*100) for k, v in role_pairs.items()}
        }
    }

def analyze_dimensions(conversations: List[Dict]) -> Dict:
    """Analyze all 10 classification dimensions."""
    dimensions = [
        'interactionPattern',
        'powerDynamics',
        'emotionalTone',
        'engagementStyle',
        'knowledgeExchange',
        'conversationPurpose',
        'topicDepth',
        'turnTaking'
    ]

    results = {}

    for dim in dimensions:
        categories = Counter()
        confidences = []
        alternatives = Counter()

        for conv in conversations:
            cls = conv.get('classification', {})
            dim_data = cls.get(dim, {})

            category = dim_data.get('category')
            confidence = dim_data.get('confidence')
            alternative = dim_data.get('alternative')

            if category:
                categories[category] += 1
            if confidence is not None:
                confidences.append(confidence)
            if alternative:
                alternatives[alternative] += 1

        total = sum(categories.values())

        results[dim] = {
            'categories': dict(categories.most_common()),
            'categories_pct': {k: (v/total*100) if total > 0 else 0 for k, v in categories.items()},
            'alternatives': dict(alternatives.most_common()),
            'confidence_stats': {
                'mean': float(statistics.mean(confidences)) if confidences else 0.0,
                'median': float(statistics.median(confidences)) if confidences else 0.0,
                'std': float(statistics.stdev(confidences)) if len(confidences) > 1 else 0.0,
                'min': float(min(confidences)) if confidences else 0.0,
                'max': float(max(confidences)) if confidences else 0.0
            }
        }

    return results

def analyze_by_source(conversations: List[Dict]) -> Dict:
    """Analyze patterns by data source."""
    sources = defaultdict(list)

    for conv in conversations:
        filename = conv.get('_source_file', '')
        source = get_source_category(filename)
        sources[source].append(conv)

    results = {}

    for source, convs in sources.items():
        # Role distributions
        human_roles = Counter()
        ai_roles = Counter()
        role_pairs = Counter()

        for conv in convs:
            cls = conv.get('classification', {})

            h_role = cls.get('humanRole', {}).get('distribution', {})
            a_role = cls.get('aiRole', {}).get('distribution', {})

            h_max = max(h_role.items(), key=lambda x: x[1])[0] if h_role else None
            a_max = max(a_role.items(), key=lambda x: x[1])[0] if a_role else None

            if h_max:
                human_roles[h_max] += 1
            if a_max:
                ai_roles[a_max] += 1
            if h_max and a_max:
                role_pairs[f"{h_max}→{a_max}"] += 1

        # Message statistics
        msg_lengths = []
        user_msg_lengths = []
        assistant_msg_lengths = []
        conv_lengths = []

        for conv in convs:
            messages = conv.get('messages', [])
            conv_lengths.append(len(messages))

            for msg in messages:
                content = msg.get('content', '')
                role = msg.get('role', '')

                if content:
                    length = len(content)
                    msg_lengths.append(length)

                    if role == 'user':
                        user_msg_lengths.append(length)
                    elif role == 'assistant':
                        assistant_msg_lengths.append(length)

        results[source] = {
            'count': len(convs),
            'percentage': (len(convs) / len(conversations) * 100),
            'human_roles': dict(human_roles.most_common()),
            'ai_roles': dict(ai_roles.most_common()),
            'top_role_pairs': dict(role_pairs.most_common(10)),
            'message_stats': {
                'avg_message_length': float(statistics.mean(msg_lengths)) if msg_lengths else 0.0,
                'median_message_length': float(statistics.median(msg_lengths)) if msg_lengths else 0.0,
                'avg_user_message_length': float(statistics.mean(user_msg_lengths)) if user_msg_lengths else 0.0,
                'avg_assistant_message_length': float(statistics.mean(assistant_msg_lengths)) if assistant_msg_lengths else 0.0,
            },
            'conversation_stats': {
                'avg_length': float(statistics.mean(conv_lengths)) if conv_lengths else 0.0,
                'median_length': float(statistics.median(conv_lengths)) if conv_lengths else 0.0,
                'min_length': int(min(conv_lengths)) if conv_lengths else 0,
                'max_length': int(max(conv_lengths)) if conv_lengths else 0
            }
        }

    return results

def analyze_pad_distributions(conversations: List[Dict]) -> Dict:
    """Analyze PAD (Pleasure-Arousal-Dominance) score distributions."""
    all_pad = {'pleasure': [], 'arousal': [], 'dominance': []}
    pad_by_role = {
        'user': {'pleasure': [], 'arousal': [], 'dominance': []},
        'assistant': {'pleasure': [], 'arousal': [], 'dominance': []}
    }

    for conv in conversations:
        messages = conv.get('messages', [])
        for msg in messages:
            pad = msg.get('pad', {})
            role = msg.get('role', '')

            if pad:
                for dim in ['pleasure', 'arousal', 'dominance']:
                    if dim in pad and pad[dim] is not None:
                        all_pad[dim].append(pad[dim])
                        if role in ['user', 'assistant']:
                            pad_by_role[role][dim].append(pad[dim])

    def compute_stats(values):
        if not values:
            return {}
        return {
            'count': len(values),
            'mean': float(statistics.mean(values)),
            'median': float(statistics.median(values)),
            'std': float(statistics.stdev(values)) if len(values) > 1 else 0.0,
            'min': float(min(values)),
            'max': float(max(values)),
            'q25': float(np.percentile(values, 25)),
            'q50': float(np.percentile(values, 50)),
            'q75': float(np.percentile(values, 75)),
            'q90': float(np.percentile(values, 90)),
            'q95': float(np.percentile(values, 95))
        }

    results = {
        'overall': {dim: compute_stats(values) for dim, values in all_pad.items()},
        'by_role': {
            role: {dim: compute_stats(values) for dim, values in dims.items()}
            for role, dims in pad_by_role.items()
        }
    }

    return results

def analyze_message_statistics(conversations: List[Dict]) -> Dict:
    """Comprehensive message and conversation statistics."""
    msg_lengths = []
    conv_lengths = []
    user_msg_lengths = []
    assistant_msg_lengths = []

    # Turn-taking patterns
    turn_ratios = []

    for conv in conversations:
        messages = conv.get('messages', [])
        conv_lengths.append(len(messages))

        user_lengths = []
        assistant_lengths = []

        for msg in messages:
            content = msg.get('content', '')
            role = msg.get('role', '')

            if content:
                length = len(content)
                msg_lengths.append(length)

                if role == 'user':
                    user_msg_lengths.append(length)
                    user_lengths.append(length)
                elif role == 'assistant':
                    assistant_msg_lengths.append(length)
                    assistant_lengths.append(length)

        # Calculate turn ratio for this conversation
        if user_lengths and assistant_lengths:
            avg_user = statistics.mean(user_lengths)
            avg_assistant = statistics.mean(assistant_lengths)
            if avg_assistant > 0:
                turn_ratios.append(avg_user / avg_assistant)

    def compute_stats(values, name):
        if not values:
            return {}
        return {
            f'{name}_count': len(values),
            f'{name}_mean': float(statistics.mean(values)),
            f'{name}_median': float(statistics.median(values)),
            f'{name}_std': float(statistics.stdev(values)) if len(values) > 1 else 0.0,
            f'{name}_min': float(min(values)),
            f'{name}_max': float(max(values)),
            f'{name}_q25': float(np.percentile(values, 25)),
            f'{name}_q75': float(np.percentile(values, 75))
        }

    return {
        **compute_stats(msg_lengths, 'message'),
        **compute_stats(user_msg_lengths, 'user_message'),
        **compute_stats(assistant_msg_lengths, 'assistant_message'),
        **compute_stats(conv_lengths, 'conversation'),
        **compute_stats(turn_ratios, 'turn_ratio'),
        'avg_user_to_assistant_ratio': float(statistics.mean(turn_ratios)) if turn_ratios else 0.0
    }

def calculate_key_insights(conversations: List[Dict]) -> Dict:
    """Calculate key insights and patterns."""
    # Initialize counters
    seeker_facilitator = 0
    seeker_expert = 0
    provider_expert = 0
    director_advisor = 0
    social_expressor_count = 0

    # Taxonomy-specific patterns
    instrumental_human = 0  # information-seeker, provider, director, collaborator
    expressive_human = 0  # social-expressor, relational-peer
    instrumental_ai = 0  # expert-system, advisor, learning-facilitator, co-constructor
    expressive_ai = 0  # social-facilitator, relational-peer

    for conv in conversations:
        cls = conv.get('classification', {})

        h_role = cls.get('humanRole', {}).get('distribution', {})
        a_role = cls.get('aiRole', {}).get('distribution', {})

        h_max = max(h_role.items(), key=lambda x: x[1])[0] if h_role else None
        a_max = max(a_role.items(), key=lambda x: x[1])[0] if a_role else None

        # Count specific patterns
        if h_max == 'information-seeker':
            if a_max in ['facilitator', 'learning-facilitator']:
                seeker_facilitator += 1
            elif a_max in ['expert-system', 'expert']:
                seeker_expert += 1

        if h_max == 'provider' and a_max in ['expert-system', 'expert']:
            provider_expert += 1

        if h_max == 'director' and a_max in ['advisor']:
            director_advisor += 1

        if h_max == 'social-expressor':
            social_expressor_count += 1

        # Instrumental vs Expressive
        if h_max in ['information-seeker', 'provider', 'director', 'collaborator']:
            instrumental_human += 1
        elif h_max in ['social-expressor', 'relational-peer']:
            expressive_human += 1

        if a_max in ['expert-system', 'advisor', 'learning-facilitator', 'co-constructor', 'expert']:
            instrumental_ai += 1
        elif a_max in ['social-facilitator', 'relational-peer']:
            expressive_ai += 1

    total = len(conversations)

    def pct(count):
        return (count / total * 100) if total > 0 else 0.0

    return {
        'role_patterns': {
            'seeker_with_facilitator': {'count': seeker_facilitator, 'percentage': pct(seeker_facilitator)},
            'seeker_with_expert': {'count': seeker_expert, 'percentage': pct(seeker_expert)},
            'provider_with_expert': {'count': provider_expert, 'percentage': pct(provider_expert)},
            'director_with_advisor': {'count': director_advisor, 'percentage': pct(director_advisor)},
            'social_expressors': {'count': social_expressor_count, 'percentage': pct(social_expressor_count)}
        },
        'instrumental_vs_expressive': {
            'instrumental_human': {'count': instrumental_human, 'percentage': pct(instrumental_human)},
            'expressive_human': {'count': expressive_human, 'percentage': pct(expressive_human)},
            'instrumental_ai': {'count': instrumental_ai, 'percentage': pct(instrumental_ai)},
            'expressive_ai': {'count': expressive_ai, 'percentage': pct(expressive_ai)},
            'instrumental_ratio': (instrumental_human / total) if total > 0 else 0.0,
            'expressive_ratio': (expressive_human / total) if total > 0 else 0.0
        }
    }

def main():
    print("="*80)
    print("🔍 COMPREHENSIVE DATA SCIENCE ANALYSIS")
    print("   New Taxonomy: GPT-5.2 / 2.0-social-role-theory")
    print("="*80)
    print()

    # Load conversations
    print("📂 Loading conversations...")
    conversations = load_new_taxonomy_conversations()
    print(f"✅ Loaded {len(conversations)} conversations with new taxonomy")
    print()

    if not conversations:
        print("❌ No conversations found with new taxonomy")
        return

    # Initialize results
    results = {
        'metadata': {
            'analysis_date': datetime.now().isoformat(),
            'total_conversations': len(conversations),
            'taxonomy': '2.0-social-role-theory',
            'model': 'gpt-5.2'
        }
    }

    # 1. Role Distributions
    print("📊 1. Analyzing role distributions...")
    try:
        results['role_distributions'] = analyze_role_distributions(conversations)
        rd = results['role_distributions']
        print(f"   ✅ Human roles: {len(rd['human_roles']['dominant'])} unique")
        print(f"   ✅ AI roles: {len(rd['ai_roles']['dominant'])} unique")
        print(f"   ✅ Role pairs: {len(rd['role_pairs']['counts'])} unique combinations")
    except Exception as e:
        print(f"   ⚠️  Error: {e}")
        import traceback
        traceback.print_exc()

    # 2. Dimension Analysis
    print("📊 2. Analyzing all classification dimensions...")
    try:
        results['dimensions'] = analyze_dimensions(conversations)
        print(f"   ✅ Analyzed 8 dimensions")
    except Exception as e:
        print(f"   ⚠️  Error: {e}")

    # 3. Source-Specific Analysis
    print("📊 3. Analyzing by data source...")
    try:
        results['by_source'] = analyze_by_source(conversations)
        print(f"   ✅ Analyzed {len(results['by_source'])} sources")
        for source, data in results['by_source'].items():
            print(f"      • {source}: {data['count']} ({data['percentage']:.1f}%)")
    except Exception as e:
        print(f"   ⚠️  Error: {e}")

    # 4. PAD Distributions
    print("📊 4. Analyzing PAD distributions...")
    try:
        results['pad_distributions'] = analyze_pad_distributions(conversations)
        pad = results['pad_distributions']['overall']
        total_pad = sum(d.get('count', 0) for d in pad.values())
        print(f"   ✅ Analyzed {total_pad} PAD scores")
    except Exception as e:
        print(f"   ⚠️  Error: {e}")

    # 5. Message Statistics
    print("📊 5. Analyzing message and conversation statistics...")
    try:
        results['message_statistics'] = analyze_message_statistics(conversations)
        ms = results['message_statistics']
        print(f"   ✅ Analyzed {ms.get('message_count', 0)} messages")
        print(f"   ✅ Avg conversation length: {ms.get('conversation_mean', 0):.1f} turns")
    except Exception as e:
        print(f"   ⚠️  Error: {e}")

    # 6. Key Insights
    print("📊 6. Calculating key insights...")
    try:
        results['key_insights'] = calculate_key_insights(conversations)
        print(f"   ✅ Calculated pattern insights")
    except Exception as e:
        print(f"   ⚠️  Error: {e}")

    # Save results
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    output_file = REPORTS_DIR / f"new-taxonomy-comprehensive-{timestamp}.json"
    REPORTS_DIR.mkdir(parents=True, exist_ok=True)

    with open(output_file, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, default=str)

    print()
    print("="*80)
    print(f"✅ Analysis saved to: {output_file}")
    print("="*80)

    # Print detailed summary
    print()
    print("📊 SUMMARY REPORT")
    print("="*80)
    print(f"\nDataset: {results['metadata']['total_conversations']} conversations")
    print(f"Taxonomy: {results['metadata']['taxonomy']}")
    print(f"Model: {results['metadata']['model']}")

    if 'by_source' in results:
        print(f"\n📁 BY SOURCE:")
        for source, data in sorted(results['by_source'].items(), key=lambda x: x[1]['count'], reverse=True):
            print(f"   • {source}: {data['count']} ({data['percentage']:.1f}%)")

    if 'role_distributions' in results:
        rd = results['role_distributions']
        print(f"\n👤 TOP HUMAN ROLES:")
        for role, count in sorted(rd['human_roles']['dominant'].items(), key=lambda x: x[1], reverse=True)[:5]:
            pct = rd['human_roles']['dominant_pct'][role]
            print(f"   • {role}: {count} ({pct:.1f}%)")

        print(f"\n🤖 TOP AI ROLES:")
        for role, count in sorted(rd['ai_roles']['dominant'].items(), key=lambda x: x[1], reverse=True)[:5]:
            pct = rd['ai_roles']['dominant_pct'][role]
            print(f"   • {role}: {count} ({pct:.1f}%)")

        print(f"\n🔗 TOP ROLE PAIRS:")
        for pair, count in list(rd['role_pairs']['counts'].items())[:10]:
            pct = rd['role_pairs']['percentages'][pair]
            print(f"   • {pair}: {count} ({pct:.1f}%)")

    if 'key_insights' in results:
        ki = results['key_insights']
        print(f"\n💡 KEY INSIGHTS:")
        rp = ki['role_patterns']
        print(f"   • Seeker + Facilitator: {rp['seeker_with_facilitator']['count']} ({rp['seeker_with_facilitator']['percentage']:.1f}%)")
        print(f"   • Seeker + Expert: {rp['seeker_with_expert']['count']} ({rp['seeker_with_expert']['percentage']:.1f}%)")
        print(f"   • Provider + Expert: {rp['provider_with_expert']['count']} ({rp['provider_with_expert']['percentage']:.1f}%)")

        ie = ki['instrumental_vs_expressive']
        print(f"\n   Instrumental vs Expressive:")
        print(f"   • Human: {ie['instrumental_human']['percentage']:.1f}% instrumental, {ie['expressive_human']['percentage']:.1f}% expressive")
        print(f"   • AI: {ie['instrumental_ai']['percentage']:.1f}% instrumental, {ie['expressive_ai']['percentage']:.1f}% expressive")

    if 'pad_distributions' in results and 'overall' in results['pad_distributions']:
        pad = results['pad_distributions']['overall']
        print(f"\n😊 PAD SCORES (Pleasure-Arousal-Dominance):")
        for dim, stats in pad.items():
            if stats:
                print(f"   • {dim.capitalize()}: μ={stats['mean']:.2f}, σ={stats['std']:.2f}, median={stats['median']:.2f}")

    if 'message_statistics' in results:
        ms = results['message_statistics']
        print(f"\n📝 MESSAGE STATISTICS:")
        print(f"   • Avg message length: {ms.get('message_mean', 0):.0f} chars")
        print(f"   • Avg user message: {ms.get('user_message_mean', 0):.0f} chars")
        print(f"   • Avg assistant message: {ms.get('assistant_message_mean', 0):.0f} chars")
        print(f"   • Avg conversation length: {ms.get('conversation_mean', 0):.1f} turns")
        print(f"   • Turn ratio (user/assistant): {ms.get('avg_user_to_assistant_ratio', 0):.2f}")

    print()
    print("="*80)

if __name__ == "__main__":
    main()
