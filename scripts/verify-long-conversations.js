#!/usr/bin/env node
/**
 * Verify that long conversations are properly set up and accessible
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'output');

console.log('🔍 Verifying long conversations setup...\n');

// 1. Check manifest
const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
if (!fs.existsSync(manifestPath)) {
  console.log('❌ Manifest file not found!');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
console.log('✅ Manifest found');
console.log(`   Total conversations: ${manifest.totalConversations}`);
console.log(`   combined-long: ${manifest.conversations['combined-long']?.length || 0}`);
console.log(`   oasst: ${manifest.conversations['oasst']?.length || 0}\n`);

// 2. Check files exist
const longFiles = [
  ...(manifest.conversations['combined-long'] || []).map(c => c.file),
  ...(manifest.conversations['oasst'] || []).map(c => c.file)
];

console.log(`📁 Checking ${longFiles.length} long conversation files:\n`);

let allGood = true;
const results = [];

for (const file of longFiles) {
  const filePath = path.join(OUTPUT_DIR, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ ${file}: File not found`);
    allGood = false;
    continue;
  }
  
  try {
    const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const msgCount = content.messages?.length || 0;
    const hasClass = !!content.classification;
    const hasPAD = !!content.messages?.[0]?.pad;
    
    results.push({
      file,
      msgCount,
      hasClass,
      hasPAD,
      status: msgCount >= 20 && hasClass && hasPAD ? '✅' : '⚠️'
    });
    
    if (msgCount < 20) {
      console.log(`⚠️  ${file}: Only ${msgCount} messages (expected 20+)`);
      allGood = false;
    } else if (!hasClass) {
      console.log(`⚠️  ${file}: ${msgCount} messages, but missing classification`);
      allGood = false;
    } else if (!hasPAD) {
      console.log(`⚠️  ${file}: ${msgCount} messages, but missing PAD values`);
      allGood = false;
    } else {
      console.log(`✅ ${file}: ${msgCount} messages, classified, has PAD`);
    }
  } catch (error) {
    console.log(`❌ ${file}: Error reading file - ${error.message}`);
    allGood = false;
  }
}

console.log('\n📊 Summary:');
const maxMessages = Math.max(...results.map(r => r.msgCount));
const minMessages = Math.min(...results.map(r => r.msgCount));
const avgMessages = results.reduce((sum, r) => sum + r.msgCount, 0) / results.length;

console.log(`   Files checked: ${results.length}`);
console.log(`   Message range: ${minMessages} - ${maxMessages}`);
console.log(`   Average: ${avgMessages.toFixed(1)} messages`);
console.log(`   With classification: ${results.filter(r => r.hasClass).length}/${results.length}`);
console.log(`   With PAD: ${results.filter(r => r.hasPAD).length}/${results.length}`);

console.log('\n💡 Next steps:');
if (allGood) {
  console.log('   ✅ All long conversations are ready!');
  console.log('   → Clear browser cache (Cmd+Shift+R / Ctrl+Shift+R)');
  console.log('   → Restart dev server if needed: npm run dev');
  console.log('   → Check browser console for loading messages');
} else {
  console.log('   ⚠️  Some issues found - review above');
}

