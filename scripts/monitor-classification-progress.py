#!/usr/bin/env python3
"""
Monitor Classification Progress

Quick script to check how many conversations have been classified with the new taxonomy.
"""

import json
from pathlib import Path
from collections import Counter

def detect_taxonomy(cls):
    """Detect which taxonomy version is used"""
    if not cls:
        return 'no_classification', None

    # Check for metadata version string
    metadata = cls.get('classificationMetadata', {})
    version = metadata.get('version', '')

    if 'reduced-roles' in version:
        return 'new_taxonomy', version

    # Check role structure
    human_role = cls.get('humanRole', {})
    ai_role = cls.get('aiRole', {})

    if not human_role or not ai_role:
        return 'no_classification', None

    human_dist = human_role.get('distribution', {})
    ai_dist = ai_role.get('distribution', {})

    if not human_dist or not ai_dist:
        return 'no_classification', None

    # Check for new taxonomy roles (3 roles each)
    new_human_roles = {'information-seeker', 'social-expressor', 'co-constructor'}
    new_ai_roles = {'facilitator', 'expert-system', 'relational-peer'}

    if set(human_dist.keys()) == new_human_roles and set(ai_dist.keys()) == new_ai_roles:
        return 'new_taxonomy', version or 'reduced-roles (no version)'

    # Check for old taxonomy roles
    old_human_roles = {'seeker', 'learner', 'director', 'collaborator', 'sharer', 'challenger'}
    old_ai_roles = {'expert', 'advisor', 'facilitator', 'reflector', 'peer', 'affiliative'}

    if any(role in human_dist for role in old_human_roles):
        return 'old_taxonomy', version or 'v1.0/v1.1/v1.2 (old)'

    return 'unknown', version or 'unknown'

output_dir = Path('public/output')
json_files = [f for f in output_dir.glob("*.json") if f.name != "manifest.json"]

new_taxonomy = 0
old_taxonomy = 0
no_classification = 0
errors = 0
version_counts = Counter()
error_files = []

for json_file in json_files:
    try:
        with open(json_file) as f:
            conv = json.load(f)

        cls = conv.get('classification', {})
        taxonomy_type, version = detect_taxonomy(cls)

        if taxonomy_type == 'new_taxonomy':
            new_taxonomy += 1
            version_counts[version] += 1
        elif taxonomy_type == 'old_taxonomy':
            old_taxonomy += 1
            version_counts[version] += 1
        elif taxonomy_type == 'no_classification':
            no_classification += 1
        else:
            old_taxonomy += 1
            version_counts['unknown'] += 1
    except Exception as e:
        errors += 1
        error_files.append((json_file.name, str(e)))

total = len(json_files)
progress = (new_taxonomy / total) * 100 if total > 0 else 0
remaining = old_taxonomy + no_classification

print(f"📊 Classification Progress")
print(f"{'=' * 70}")
print(f"✅ New taxonomy (reduced 6 roles): {new_taxonomy}/{total} ({progress:.1f}%)")
print(f"⏳ Old taxonomy (19 roles):        {old_taxonomy}/{total} ({old_taxonomy/total*100:.1f}%)")
print(f"⚪ No classification:               {no_classification}/{total}")
if errors > 0:
    print(f"❌ Errors:                           {errors}/{total}")
print(f"{'=' * 70}")

if version_counts:
    print(f"\n📋 Version Breakdown:")
    for version, count in sorted(version_counts.items(), key=lambda x: x[1], reverse=True):
        pct = count / total * 100
        print(f"   {version}: {count} ({pct:.1f}%)")

print(f"\n📈 Remaining to classify: {remaining} conversations")
if remaining > 0:
    print(f"⏱️  Estimated time: ~{remaining * 3 / 60:.1f} minutes at 3s/conversation")
    print(f"                   ~{remaining * 3 / 3600:.1f} hours")

    # Show what needs to be done
    print(f"\n🎯 Next Steps:")
    if old_taxonomy > 0:
        print(f"   - Reclassify {old_taxonomy} conversations from old → new taxonomy")
    if no_classification > 0:
        print(f"   - Classify {no_classification} unclassified conversations")
else:
    print(f"\n🎉 All conversations classified with new taxonomy!")

if errors > 0:
    print(f"\n⚠️  Errors encountered:")
    for filename, error in error_files[:5]:
        print(f"   - {filename}: {error}")
    if len(error_files) > 5:
        print(f"   ... and {len(error_files) - 5} more")

# Show target metrics
print(f"\n🎯 Target Metrics (from POST_CLASSIFICATION_CHECKLIST.md):")
print(f"   - Human role ambiguity: <30% (was 58.9% with old taxonomy)")
print(f"   - AI role ambiguity:    <15% (was 25.7% with old taxonomy)")
print(f"   - Run 'python3 scripts/analyze-reduced-role-classifications.py' after completion")

