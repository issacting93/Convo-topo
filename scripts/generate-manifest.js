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
        emo: [],
        cornell: [],
        'kaggle-emo': [],
        'chatbot-arena': [],
        'combined-long': [],
        'oasst': [],
        'wildchat': []
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
      } else if (file.startsWith('emo-') && !file.includes('kaggle')) {
        manifest.conversations.emo.push({
          file: file,
          id: file.replace('.json', ''),
          size: stats.size,
          modified: stats.mtime.toISOString()
        });
      } else if (file.startsWith('cornell-')) {
        manifest.conversations.cornell.push({
          file: file,
          id: file.replace('.json', ''),
          size: stats.size,
          modified: stats.mtime.toISOString()
        });
      } else if (file.startsWith('kaggle-emo-') && !file.includes('-error')) {
        manifest.conversations['kaggle-emo'].push({
          file: file,
          id: file.replace('.json', ''),
          size: stats.size,
          modified: stats.mtime.toISOString()
        });
      } else if (file.startsWith('chatbot_arena_')) {
        manifest.conversations['chatbot-arena'].push({
          file: file,
          id: file.replace('.json', ''),
          size: stats.size,
          modified: stats.mtime.toISOString()
        });
      } else if (file.startsWith('combined-long-')) {
        manifest.conversations['combined-long'].push({
          file: file,
          id: file.replace('.json', ''),
          size: stats.size,
          modified: stats.mtime.toISOString()
        });
      } else if (file.startsWith('oasst-')) {
        manifest.conversations['oasst'].push({
          file: file,
          id: file.replace('.json', ''),
          size: stats.size,
          modified: stats.mtime.toISOString()
        });
      } else if (file.startsWith('wildchat_')) {
        // WildChat files use wildchat_ prefix
        if (!manifest.conversations['wildchat']) {
          manifest.conversations['wildchat'] = [];
        }
        manifest.conversations['wildchat'].push({
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
      manifest.conversations.emo.length +
      manifest.conversations.cornell.length +
      manifest.conversations['kaggle-emo'].length +
      manifest.conversations['chatbot-arena'].length +
      manifest.conversations['combined-long'].length +
      manifest.conversations['oasst'].length +
      (manifest.conversations['wildchat'] ? manifest.conversations['wildchat'].length : 0);

    // Sort by ID for consistency
    manifest.conversations.conv.sort((a, b) => {
      const aNum = parseInt(a.id.replace('conv-', ''));
      const bNum = parseInt(b.id.replace('conv-', ''));
      return aNum - bNum;
    });
    
    manifest.conversations.sample.sort((a, b) => a.id.localeCompare(b.id));
    manifest.conversations.emo.sort((a, b) => a.id.localeCompare(b.id));
    
    manifest.conversations.cornell.sort((a, b) => {
      const aNum = parseInt(a.id.replace('cornell-', ''));
      const bNum = parseInt(b.id.replace('cornell-', ''));
      return aNum - bNum;
    });
    
    manifest.conversations['kaggle-emo'].sort((a, b) => {
      const aNum = parseInt(a.id.replace('kaggle-emo-', ''));
      const bNum = parseInt(b.id.replace('kaggle-emo-', ''));
      return aNum - bNum;
    });
    
    manifest.conversations['chatbot-arena'].sort((a, b) => {
      const aNum = parseInt(a.id.replace('chatbot_arena_', ''));
      const bNum = parseInt(b.id.replace('chatbot_arena_', ''));
      return aNum - bNum;
    });

    // Write manifest file
    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2));

    console.log('✅ Manifest generated successfully!\n');
    console.log(`   Total conversations: ${manifest.totalConversations}`);
    console.log(`   - conv-*.json: ${manifest.conversations.conv.length}`);
    console.log(`   - sample-*.json: ${manifest.conversations.sample.length}`);
    console.log(`   - emo-*.json: ${manifest.conversations.emo.length}`);
    console.log(`   - cornell-*.json: ${manifest.conversations.cornell.length}`);
    console.log(`   - kaggle-emo-*.json: ${manifest.conversations['kaggle-emo'].length}`);
    console.log(`   - chatbot_arena_*.json: ${manifest.conversations['chatbot-arena'].length}`);
    console.log(`   - combined-long-*.json: ${manifest.conversations['combined-long'].length}`);
    console.log(`   - oasst-*.json: ${manifest.conversations['oasst'].length}`);
    if (manifest.conversations['wildchat']) {
      console.log(`   - wildchat_*.json: ${manifest.conversations['wildchat'].length}`);
    }
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

