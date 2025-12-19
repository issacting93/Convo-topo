#!/usr/bin/env python3
"""
Split combined classified output into individual conv-*.json files.

Usage:
    python3 split-classified-output.py classified-output.json [--start-index N] [--output-dir DIR] [--sync-public]
"""

import json
import sys
import shutil
from pathlib import Path
from typing import List, Dict, Any


def find_next_index(output_dir: Path, prefix: str = "conv-") -> int:
    """Find the next available index for conv-*.json files."""
    last_index = -1
    for i in range(1000):  # Reasonable upper limit
        if (output_dir / f"{prefix}{i}.json").exists():
            last_index = i
        else:
            break
    return last_index + 1


def split_classified_output(
    input_file: Path,
    output_dir: Path = Path("output"),
    start_index: int = None,
    sync_public: bool = False,
    prefix: str = "conv-"
) -> None:
    """Split combined classified output into individual files."""
    
    # Load combined output
    print(f"Loading {input_file}...")
    with open(input_file) as f:
        results = json.load(f)
    
    if not isinstance(results, list):
        print(f"❌ Error: Expected a list of conversations, got {type(results)}")
        sys.exit(1)
    
    print(f"Found {len(results)} conversations")
    
    # Determine starting index
    if start_index is None:
        start_index = find_next_index(output_dir, prefix)
    
    print(f"Starting from index {start_index}")
    
    # Create output directory if needed
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Save individual files
    saved_count = 0
    for i, result in enumerate(results):
        index = start_index + i
        output_path = output_dir / f"{prefix}{index}.json"
        
        # Ensure ID is set correctly
        original_id = result.get('id', f'{prefix}{index}')
        result['id'] = f'{prefix}{index}'
        
        with open(output_path, 'w') as f:
            json.dump(result, f, indent=2)
        
        saved_count += 1
        if saved_count <= 5 or saved_count == len(results):
            print(f"✅ Saved {original_id} -> {output_path.name}")
        elif saved_count == 6:
            print(f"   ... (saving {len(results) - 5} more files)")
    
    print(f"\n✅ Saved {saved_count} conversations to {output_dir}/")
    
    # Sync to public/output if requested
    if sync_public:
        public_dir = Path("public/output")
        public_dir.mkdir(parents=True, exist_ok=True)
        
        copied = 0
        for i in range(start_index, start_index + len(results)):
            src = output_dir / f"{prefix}{i}.json"
            dst = public_dir / f"{prefix}{i}.json"
            if src.exists():
                shutil.copy2(src, dst)
                copied += 1
        
        print(f"✅ Copied {copied} files to {public_dir}/")


def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)
    
    input_file = Path(sys.argv[1])
    if not input_file.exists():
        print(f"❌ Error: {input_file} not found")
        sys.exit(1)
    
    # Parse options
    output_dir = Path("output")
    start_index = None
    sync_public = False
    
    i = 2
    while i < len(sys.argv):
        arg = sys.argv[i]
        if arg == "--output-dir" and i + 1 < len(sys.argv):
            output_dir = Path(sys.argv[i + 1])
            i += 2
        elif arg == "--start-index" and i + 1 < len(sys.argv):
            start_index = int(sys.argv[i + 1])
            i += 2
        elif arg == "--sync-public":
            sync_public = True
            i += 1
        else:
            print(f"❌ Unknown option: {arg}")
            sys.exit(1)
    
    split_classified_output(
        input_file=input_file,
        output_dir=output_dir,
        start_index=start_index,
        sync_public=sync_public
    )


if __name__ == "__main__":
    main()

