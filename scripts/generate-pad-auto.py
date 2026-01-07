#!/usr/bin/env python3
"""
Auto-confirm version of PAD regeneration script
Bypasses user confirmation for automated workflows
"""

import sys
from pathlib import Path

# Import the main script
sys.path.insert(0, str(Path(__file__).parent))
from regenerate_pad_for_low_diversity import main as regenerate_main

# Monkey-patch input to auto-confirm
original_input = __builtins__['input']
def auto_yes_input(prompt):
    if "Continue?" in prompt or "yes/no" in prompt.lower():
        print("   Auto-confirming: yes")
        return "yes"
    return original_input(prompt)

__builtins__['input'] = auto_yes_input

if __name__ == '__main__':
    regenerate_main()

