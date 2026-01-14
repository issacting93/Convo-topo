#!/usr/bin/env python3
"""
Prepare files for re-classification by extracting messages from existing output

This script creates clean conversation files (messages only) from existing
classified files so they can be re-classified with the new taxonomy.
"""

import json
import sys
import tempfile
from pathlib import Path

def prepare_file(input_file: Path) -> Path:
    """Extract messages from a classified file and create a clean temp file"""
    with open(input_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Extract only what we need for classification
    clean_data = {
        'id': data.get('id'),
        'source': data.get('source'),
        'messages': data.get('messages', []),
        'metadata': data.get('metadata', {})
    }
    
    # Create temporary file
    temp_file = tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False)
    json.dump(clean_data, temp_file, indent=2)
    temp_file.close()
    
    return Path(temp_file.name)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python prepare-for-reclassification.py INPUT.json")
        sys.exit(1)
    
    input_file = Path(sys.argv[1])
    temp_file = prepare_file(input_file)
    print(temp_file)

