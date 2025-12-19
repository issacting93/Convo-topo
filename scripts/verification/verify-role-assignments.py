#!/usr/bin/env python3
"""
Verify that role assignments are correct (human vs AI)
Check if conversations have the roles properly assigned
"""

import json
from pathlib import Path

def check_role_assignment(data):
    """Check if roles are correctly assigned in a conversation"""

    messages = data.get('messages', [])
    c = data.get('classification', {})

    if not c:
        return None

    # Get role classifications
    human_role = c.get('humanRole', {})
    ai_role = c.get('aiRole', {})

    # Check message roles
    user_messages = [m for m in messages if m.get('role') == 'user']
    assistant_messages = [m for m in messages if m.get('role') == 'assistant']

    issues = []

    # Check if we have both roles
    if not user_messages:
        issues.append("No 'user' messages found")
    if not assistant_messages:
        issues.append("No 'assistant' messages found")

    # Analyze content to detect potential role swap
    # Look for AI-like behavior in "user" messages
    ai_indicators = ['as an ai', 'i cannot', "i don't have", 'i am an', 'i\'m an ai']
    human_indicators = ['i feel', 'my mom', 'my dad', 'my sister', 'my brother', 'i used to', 'i remember']

    for msg in user_messages[:3]:  # Check first 3 user messages
        content_lower = msg.get('content', '').lower()
        for indicator in ai_indicators:
            if indicator in content_lower:
                issues.append(f"User message contains AI indicator: '{indicator}'")
                break

    for msg in assistant_messages[:3]:  # Check first 3 assistant messages
        content_lower = msg.get('content', '').lower()
        # Check if assistant is acting TOO human (might be swapped)
        personal_count = sum(1 for ind in human_indicators if ind in content_lower)
        if personal_count >= 2:
            issues.append(f"Assistant message seems very personal/human")

    # Check if humanRole is analyzing user messages correctly
    if human_role.get('distribution'):
        dominant_human = max(human_role['distribution'].items(), key=lambda x: x[1])
        # Sharer should have user messages with personal content
        if dominant_human[0] == 'sharer' and dominant_human[1] > 0.5:
            # Check if user messages actually have personal content
            personal_content = any(any(ind in m.get('content', '').lower() for ind in human_indicators)
                                 for m in user_messages[:3])
            if not personal_content:
                issues.append(f"Classified as 'sharer' but user messages lack personal content")

    # Check if aiRole makes sense
    if ai_role.get('distribution'):
        dominant_ai = max(ai_role['distribution'].items(), key=lambda x: x[1])
        # Expert/advisor should have assistant messages with explanatory content
        if dominant_ai[0] in ['expert', 'advisor'] and dominant_ai[1] > 0.5:
            explanatory = any(len(m.get('content', '')) > 100 for m in assistant_messages[:3])
            if not explanatory:
                issues.append(f"Classified as '{dominant_ai[0]}' but assistant messages are very short")

    return {
        'user_count': len(user_messages),
        'assistant_count': len(assistant_messages),
        'human_role': human_role.get('distribution', {}),
        'ai_role': ai_role.get('distribution', {}),
        'issues': issues,
        'first_user_msg': user_messages[0].get('content', '')[:100] if user_messages else '',
        'first_assistant_msg': assistant_messages[0].get('content', '')[:100] if assistant_messages else ''
    }

def main():
    output_dir = Path('public/output')

    print("=" * 80)
    print("ROLE ASSIGNMENT VERIFICATION")
    print("=" * 80)
    print()

    # Check specific files
    test_files = [
        'emo-afraid-1.json',  # Should have user=sharer, assistant=reflector
        'emo-angry-1.json',
        'sample-deep-discussion.json',  # Should have user=seeker, assistant=expert
        'conv-0.json',  # The one with issues
        'conv-1.json',
        'conv-5.json'
    ]

    suspicious = []

    for filename in test_files:
        filepath = output_dir / filename
        if not filepath.exists():
            print(f"❌ {filename}: FILE NOT FOUND")
            continue

        with open(filepath, 'r') as f:
            data = json.load(f)

        result = check_role_assignment(data)

        if result is None:
            print(f"⚠️  {filename}: No classification")
            continue

        print(f"\n{'='*80}")
        print(f"📄 {filename}")
        print(f"{'='*80}")
        print(f"Messages: {result['user_count']} user, {result['assistant_count']} assistant")
        print(f"\nFirst user message (human):")
        print(f"  \"{result['first_user_msg']}...\"")
        print(f"\nFirst assistant message (AI):")
        print(f"  \"{result['first_assistant_msg']}...\"")

        # Show roles
        if result['human_role']:
            dominant_human = max(result['human_role'].items(), key=lambda x: x[1])
            print(f"\nHuman role: {dominant_human[0]} ({dominant_human[1]:.2f})")

        if result['ai_role']:
            dominant_ai = max(result['ai_role'].items(), key=lambda x: x[1])
            print(f"AI role: {dominant_ai[0]} ({dominant_ai[1]:.2f})")

        # Show issues
        if result['issues']:
            print(f"\n⚠️  ISSUES DETECTED:")
            for issue in result['issues']:
                print(f"  - {issue}")
            suspicious.append(filename)
        else:
            print(f"\n✅ Role assignment looks correct")

    # Summary
    print(f"\n\n{'='*80}")
    print("SUMMARY")
    print(f"{'='*80}")
    print(f"Files checked: {len(test_files)}")
    print(f"Suspicious files: {len(suspicious)}")
    if suspicious:
        print(f"\nFiles to review manually:")
        for f in suspicious:
            print(f"  - {f}")
    else:
        print("\n✅ All checked files have correct role assignments!")

if __name__ == '__main__':
    main()
