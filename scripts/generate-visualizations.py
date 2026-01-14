#!/usr/bin/env python3
"""
Generate visualizations for the new taxonomy analysis
"""

import json
import matplotlib.pyplot as plt
import matplotlib
import numpy as np
from pathlib import Path
from collections import Counter

# Use non-interactive backend
matplotlib.use('Agg')

REPORTS_DIR = Path("reports")
VIZ_DIR = REPORTS_DIR / "visualizations"
VIZ_DIR.mkdir(parents=True, exist_ok=True)

# Load the most recent analysis
analysis_files = list(REPORTS_DIR.glob("new-taxonomy-comprehensive-*.json"))
if not analysis_files:
    print("❌ No analysis file found")
    exit(1)

latest_file = max(analysis_files, key=lambda p: p.stat().st_mtime)
print(f"📊 Loading analysis from: {latest_file.name}")

with open(latest_file, 'r') as f:
    data = json.load(f)

# Set style
plt.style.use('seaborn-v0_8-darkgrid')
colors = plt.cm.Set3(np.linspace(0, 1, 12))

print("\n🎨 Generating visualizations...")

# 1. Human Role Distribution
print("   1. Human role distribution...")
fig, ax = plt.subplots(figsize=(10, 6))
human_roles = data['role_distributions']['human_roles']['dominant']
roles = list(human_roles.keys())
counts = list(human_roles.values())

ax.barh(roles, counts, color=colors[:len(roles)])
ax.set_xlabel('Number of Conversations')
ax.set_title('Human Role Distribution (n=671)', fontsize=14, fontweight='bold')
ax.grid(axis='x', alpha=0.3)

for i, (role, count) in enumerate(zip(roles, counts)):
    pct = count / data['metadata']['total_conversations'] * 100
    ax.text(count, i, f' {count} ({pct:.1f}%)', va='center')

plt.tight_layout()
plt.savefig(VIZ_DIR / 'human_role_distribution.png', dpi=300, bbox_inches='tight')
plt.close()

# 2. AI Role Distribution
print("   2. AI role distribution...")
fig, ax = plt.subplots(figsize=(10, 6))
ai_roles = data['role_distributions']['ai_roles']['dominant']
roles = list(ai_roles.keys())
counts = list(ai_roles.values())

ax.barh(roles, counts, color=colors[:len(roles)])
ax.set_xlabel('Number of Conversations')
ax.set_title('AI Role Distribution (n=671)', fontsize=14, fontweight='bold')
ax.grid(axis='x', alpha=0.3)

for i, (role, count) in enumerate(zip(roles, counts)):
    pct = count / data['metadata']['total_conversations'] * 100
    ax.text(count, i, f' {count} ({pct:.1f}%)', va='center')

plt.tight_layout()
plt.savefig(VIZ_DIR / 'ai_role_distribution.png', dpi=300, bbox_inches='tight')
plt.close()

# 3. Top Role Pairs
print("   3. Top role pairs...")
fig, ax = plt.subplots(figsize=(12, 8))
role_pairs = data['role_distributions']['role_pairs']['counts']
top_pairs = list(role_pairs.items())[:15]
pairs = [p[0] for p in top_pairs]
counts = [p[1] for p in top_pairs]

ax.barh(pairs, counts, color=colors[:len(pairs)])
ax.set_xlabel('Number of Conversations')
ax.set_title('Top 15 Role Pairs (n=671)', fontsize=14, fontweight='bold')
ax.grid(axis='x', alpha=0.3)

for i, (pair, count) in enumerate(zip(pairs, counts)):
    pct = count / data['metadata']['total_conversations'] * 100
    ax.text(count, i, f' {count} ({pct:.1f}%)', va='center')

plt.tight_layout()
plt.savefig(VIZ_DIR / 'top_role_pairs.png', dpi=300, bbox_inches='tight')
plt.close()

# 4. Source Distribution (Pie Chart)
print("   4. Source distribution...")
fig, ax = plt.subplots(figsize=(10, 8))
sources = data['by_source']
labels = list(sources.keys())
sizes = [sources[s]['count'] for s in labels]

ax.pie(sizes, labels=labels, autopct='%1.1f%%', startangle=90, colors=colors[:len(labels)])
ax.set_title('Conversations by Data Source (n=671)', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.savefig(VIZ_DIR / 'source_distribution.png', dpi=300, bbox_inches='tight')
plt.close()

# 5. PAD Distributions
print("   5. PAD distributions...")
fig, axes = plt.subplots(1, 3, figsize=(15, 5))
pad_data = data['pad_distributions']['overall']

for ax, (dim, stats) in zip(axes, pad_data.items()):
    if not stats:
        continue

    # Create histogram
    ax.axvline(stats['mean'], color='red', linestyle='--', linewidth=2, label=f"Mean: {stats['mean']:.2f}")
    ax.axvline(stats['median'], color='blue', linestyle='--', linewidth=2, label=f"Median: {stats['median']:.2f}")

    # Add text with statistics
    text = f"μ = {stats['mean']:.2f}\nσ = {stats['std']:.2f}\nMedian = {stats['median']:.2f}"
    ax.text(0.95, 0.95, text, transform=ax.transAxes,
            verticalalignment='top', horizontalalignment='right',
            bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))

    ax.set_xlabel('Score')
    ax.set_ylabel('Frequency')
    ax.set_title(f'{dim.capitalize()} Distribution', fontweight='bold')
    ax.legend()
    ax.grid(alpha=0.3)
    ax.set_xlim(0, 1)

plt.suptitle('PAD (Pleasure-Arousal-Dominance) Score Distributions', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.savefig(VIZ_DIR / 'pad_distributions.png', dpi=300, bbox_inches='tight')
plt.close()

# 6. Dimension Distributions (Major Dimensions)
print("   6. Major dimensions...")
fig, axes = plt.subplots(2, 2, figsize=(16, 12))
axes = axes.flatten()

major_dims = ['interactionPattern', 'powerDynamics', 'emotionalTone', 'conversationPurpose']

for ax, dim_name in zip(axes, major_dims):
    dim_data = data['dimensions'][dim_name]
    categories = dim_data['categories']

    if categories:
        cats = list(categories.keys())
        counts = list(categories.values())

        ax.barh(cats, counts, color=colors[:len(cats)])
        ax.set_xlabel('Count')
        ax.set_title(dim_name, fontweight='bold')
        ax.grid(axis='x', alpha=0.3)

        for i, (cat, count) in enumerate(zip(cats, counts)):
            pct = dim_data['categories_pct'][cat]
            ax.text(count, i, f' {count} ({pct:.1f}%)', va='center', fontsize=9)

plt.suptitle('Major Classification Dimensions', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.savefig(VIZ_DIR / 'major_dimensions.png', dpi=300, bbox_inches='tight')
plt.close()

# 7. Instrumental vs Expressive
print("   7. Instrumental vs expressive...")
fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(14, 6))

ie_data = data['key_insights']['instrumental_vs_expressive']

# Human
human_data = [
    ie_data['instrumental_human']['count'],
    ie_data['expressive_human']['count']
]
human_labels = ['Instrumental', 'Expressive']
ax1.pie(human_data, labels=human_labels, autopct='%1.1f%%', startangle=90, colors=colors[:2])
ax1.set_title('Human Roles:\nInstrumental vs Expressive', fontsize=12, fontweight='bold')

# AI
ai_data = [
    ie_data['instrumental_ai']['count'],
    ie_data['expressive_ai']['count']
]
ai_labels = ['Instrumental', 'Expressive']
ax2.pie(ai_data, labels=ai_labels, autopct='%1.1f%%', startangle=90, colors=colors[:2])
ax2.set_title('AI Roles:\nInstrumental vs Expressive', fontsize=12, fontweight='bold')

plt.suptitle('Instrumental vs Expressive Role Distribution', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.savefig(VIZ_DIR / 'instrumental_vs_expressive.png', dpi=300, bbox_inches='tight')
plt.close()

# 8. Message Length Comparison
print("   8. Message length comparison...")
fig, ax = plt.subplots(figsize=(10, 6))

msg_stats = data['message_statistics']
categories = ['Overall', 'User', 'Assistant']
values = [
    msg_stats.get('message_mean', 0),
    msg_stats.get('user_message_mean', 0),
    msg_stats.get('assistant_message_mean', 0)
]

ax.bar(categories, values, color=colors[:3])
ax.set_ylabel('Average Message Length (characters)')
ax.set_title('Average Message Length by Role', fontsize=14, fontweight='bold')
ax.grid(axis='y', alpha=0.3)

for i, (cat, val) in enumerate(zip(categories, values)):
    ax.text(i, val, f'{val:.0f}', ha='center', va='bottom', fontweight='bold')

plt.tight_layout()
plt.savefig(VIZ_DIR / 'message_length_comparison.png', dpi=300, bbox_inches='tight')
plt.close()

# 9. Source-Specific Role Distributions
print("   9. Source-specific patterns...")
fig, axes = plt.subplots(1, 3, figsize=(18, 6))

sources = ['chatbot_arena', 'wildchat', 'oasst']
for ax, source in zip(axes, sources):
    if source not in data['by_source']:
        continue

    source_data = data['by_source'][source]
    human_roles = source_data['human_roles']

    if human_roles:
        roles = list(human_roles.keys())
        counts = list(human_roles.values())

        ax.barh(roles, counts, color=colors[:len(roles)])
        ax.set_xlabel('Count')
        ax.set_title(f'{source}\n(n={source_data["count"]})', fontweight='bold')
        ax.grid(axis='x', alpha=0.3)

plt.suptitle('Human Role Distribution by Data Source', fontsize=14, fontweight='bold')
plt.tight_layout()
plt.savefig(VIZ_DIR / 'source_specific_roles.png', dpi=300, bbox_inches='tight')
plt.close()

print(f"\n✅ Generated {9} visualizations in {VIZ_DIR}")
print("\nGenerated files:")
for viz_file in sorted(VIZ_DIR.glob("*.png")):
    print(f"   • {viz_file.name}")
