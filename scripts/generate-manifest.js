#!/usr/bin/env node
/**
 * Generate manifest.json for public/output/ directory
 * 
 * This script scans the public/output/ directory and creates a manifest
 * file listing all available conversations.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'output');
const MANIFEST_FILE = path.join(OUTPUT_DIR, 'manifest.json');

function generateManifest() {
  console.log('📋 Generating manifest for public/output/...\n');

  const manifest = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    generatedBy: 'generate-manifest.js',
    totalConversations: 0,
    conversations: {
      conv: [],
      sample: [],
      emo: []
    }
  };

  try {
    // Check if output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      console.log('⚠️  Output directory does not exist:', OUTPUT_DIR);
      return;
    }

    // Read all JSON files in output directory
    const files = fs.readdirSync(OUTPUT_DIR).filter(file => 
      file.endsWith('.json') && file !== 'manifest.json'
    );

    console.log(`Found ${files.length} JSON files\n`);

    // Categorize files
    files.forEach(file => {
      const filePath = path.join(OUTPUT_DIR, file);
      const stats = fs.statSync(filePath);
      
      if (file.startsWith('conv-')) {
        manifest.conversations.conv.push({
          file: file,
          id: file.replace('.json', ''),
          size: stats.size,
          modified: stats.mtime.toISOString()
        });
      } else if (file.startsWith('sample-')) {
        manifest.conversations.sample.push({
          file: file,
          id: file.replace('.json', ''),
          size: stats.size,
          modified: stats.mtime.toISOString()
        });
      } else if (file.startsWith('emo-')) {
        manifest.conversations.emo.push({
          file: file,
          id: file.replace('.json', ''),
          size: stats.size,
          modified: stats.mtime.toISOString()
        });
      }
    });

    // Calculate totals
    manifest.totalConversations = 
      manifest.conversations.conv.length +
      manifest.conversations.sample.length +
      manifest.conversations.emo.length;

    // Sort by ID for consistency
    manifest.conversations.conv.sort((a, b) => {
      const aNum = parseInt(a.id.replace('conv-', ''));
      const bNum = parseInt(b.id.replace('conv-', ''));
      return aNum - bNum;
    });
    
    manifest.conversations.sample.sort((a, b) => a.id.localeCompare(b.id));
    manifest.conversations.emo.sort((a, b) => a.id.localeCompare(b.id));

    // Write manifest file
    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));

    console.log('✅ Manifest generated successfully!\n');
    console.log(`   Total conversations: ${manifest.totalConversations}`);
    console.log(`   - conv-*.json: ${manifest.conversations.conv.length}`);
    console.log(`   - sample-*.json: ${manifest.conversations.sample.length}`);
    console.log(`   - emo-*.json: ${manifest.conversations.emo.length}`);
    console.log(`\n   Manifest saved to: ${MANIFEST_FILE}\n`);

  } catch (error) {
    console.error('❌ Error generating manifest:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generateManifest();
}

export { generateManifest };

