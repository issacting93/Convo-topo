
import json
import os
import glob

# 1. Load Manifest
try:
    with open('public/output/manifest.json', 'r') as f:
        manifest = json.load(f)
        
    manifest_files = set()
    for source, convs in manifest.get('conversations', {}).items():
        for c in convs:
            manifest_files.add(c.get('file'))
            
    print(f"Total files in Manifest: {len(manifest_files)}")
    
except Exception as e:
    print(f"Error loading manifest: {e}")
    manifest_files = set()

# 2. Load Disk Output Files
disk_files = glob.glob('public/output/*.json')
# strip path
disk_filenames = set(os.path.basename(f) for f in disk_files if 'manifest.json' not in f)

print(f"Total files on Disk (excluding manifest): {len(disk_filenames)}")

# 3. Compare
missing_in_manifest = disk_filenames - manifest_files
missing_on_disk = manifest_files - disk_filenames

print(f"\nFiles on Disk but NOT in Manifest ({len(missing_in_manifest)}):")
for f in list(missing_in_manifest)[:10]:
    print(f"  {f}")
    
print(f"\nFiles in Manifest but NOT on Disk ({len(missing_on_disk)}):")
for f in list(missing_on_disk)[:10]:
    print(f"  {f}")
