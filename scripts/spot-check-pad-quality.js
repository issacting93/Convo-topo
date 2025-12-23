#!/usr/bin/env node
/**
 * Spot-check PAD data quality
 * Checks if PAD values match expected patterns for positive/negative words and questions
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../public/output');

async function spotCheckPAD() {
  console.log('🔍 PAD Quality Spot-Check Report\n');
  console.log('='.repeat(70));
  
  const allFiles = await fs.readdir(OUTPUT_DIR);
  const files = allFiles.filter(f => 
    f.endsWith('.json') && 
    f !== 'manifest.json' && 
    !f.includes('-error')
  );
  
  const results = {
    positiveMessages: [],
    negativeMessages: [],
    questions: []
  };
  
  // Positive patterns
  const positivePatterns = [
    /\b(thanks|thank you|perfect|exactly|great|excellent|awesome|fantastic|love it|brilliant)\b/i
  ];
  
  // Negative patterns
  const negativePatterns = [
    /\b(wrong|error|mistake|failed|broken|doesn't work|not working|incorrect|issue|problem)\b/i
  ];
  
  for (const file of files.slice(0, 30)) { // Check first 30 files
    const filePath = path.join(OUTPUT_DIR, file);
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const data = JSON.parse(content);
      
      const messages = data.messages || [];
      
      for (const msg of messages) {
        const text = msg.content || '';
        const pad = msg.pad || {};
        
        // Check positive markers
        if (positivePatterns.some(pattern => pattern.test(text))) {
          results.positiveMessages.push({
            file: file,
            content: text.substring(0, 70),
            pleasure: pad.pleasure,
            arousal: pad.arousal,
            intensity: pad.emotionalIntensity
          });
        }
        
        // Check negative markers
        if (negativePatterns.some(pattern => pattern.test(text))) {
          results.negativeMessages.push({
            file: file,
            content: text.substring(0, 70),
            pleasure: pad.pleasure,
            arousal: pad.arousal,
            intensity: pad.emotionalIntensity
          });
        }
        
        // Check questions
        if (text.includes('?')) {
          results.questions.push({
            file: file,
            content: text.substring(0, 70),
            dominance: pad.dominance,
            pleasure: pad.pleasure
          });
        }
      }
    } catch (error) {
      // Skip invalid files
    }
  }
  
  // Report positive messages
  console.log(`\n✅ POSITIVE MESSAGES (thanks/perfect/great): ${results.positiveMessages.length} found\n`);
  console.log('-'.repeat(70));
  let positiveCorrect = 0;
  for (const msg of results.positiveMessages.slice(0, 10)) {
    const pleasure = msg.pleasure;
    const isCorrect = pleasure !== undefined && pleasure >= 0.7;
    if (isCorrect) positiveCorrect++;
    const status = isCorrect ? '✅' : '⚠️';
    console.log(`${status} [${msg.file}]`);
    console.log(`   pleasure=${pleasure?.toFixed(2) || 'N/A'}, arousal=${msg.arousal?.toFixed(2) || 'N/A'}, intensity=${msg.intensity?.toFixed(2) || 'N/A'}`);
    console.log(`   "${msg.content}..."`);
    console.log('');
  }
  if (results.positiveMessages.length > 10) {
    console.log(`   ... and ${results.positiveMessages.length - 10} more`);
  }
  console.log(`\n✅ Correct: ${positiveCorrect}/${Math.min(10, results.positiveMessages.length)} (expect pleasure ≥ 0.7)`);
  
  // Report negative messages
  console.log(`\n❌ NEGATIVE MESSAGES (wrong/error/failed): ${results.negativeMessages.length} found\n`);
  console.log('-'.repeat(70));
  let negativeCorrect = 0;
  for (const msg of results.negativeMessages.slice(0, 10)) {
    const pleasure = msg.pleasure;
    const arousal = msg.arousal;
    const isCorrect = pleasure !== undefined && arousal !== undefined && 
                      pleasure < 0.6 && arousal > 0.5;
    if (isCorrect) negativeCorrect++;
    const status = isCorrect ? '✅' : '⚠️';
    console.log(`${status} [${msg.file}]`);
    console.log(`   pleasure=${pleasure?.toFixed(2) || 'N/A'}, arousal=${arousal?.toFixed(2) || 'N/A'}, intensity=${msg.intensity?.toFixed(2) || 'N/A'}`);
    console.log(`   "${msg.content}..."`);
    console.log('');
  }
  if (results.negativeMessages.length > 10) {
    console.log(`   ... and ${results.negativeMessages.length - 10} more`);
  }
  console.log(`\n✅ Correct: ${negativeCorrect}/${Math.min(10, results.negativeMessages.length)} (expect pleasure < 0.6, arousal > 0.5)`);
  
  // Report questions
  console.log(`\n❓ QUESTIONS: ${results.questions.length} found\n`);
  console.log('-'.repeat(70));
  let questionCorrect = 0;
  for (const msg of results.questions.slice(0, 15)) {
    const dominance = msg.dominance;
    const isCorrect = dominance !== undefined && dominance <= 0.4;
    if (isCorrect) questionCorrect++;
    const status = isCorrect ? '✅' : '⚠️';
    console.log(`${status} [${msg.file}] dominance=${dominance?.toFixed(2) || 'N/A'} | "${msg.content}..."`);
  }
  if (results.questions.length > 15) {
    console.log(`   ... and ${results.questions.length - 15} more`);
  }
  console.log(`\n✅ Correct: ${questionCorrect}/${Math.min(15, results.questions.length)} (expect dominance ≤ 0.4)`);
  
  console.log('\n' + '='.repeat(70));
  console.log('\n📊 Summary:');
  console.log(`   Positive messages: ${positiveCorrect}/${Math.min(10, results.positiveMessages.length)} correct`);
  console.log(`   Negative messages: ${negativeCorrect}/${Math.min(10, results.negativeMessages.length)} correct`);
  console.log(`   Questions: ${questionCorrect}/${Math.min(15, results.questions.length)} correct`);
  
  const totalChecked = Math.min(10, results.positiveMessages.length) + 
                       Math.min(10, results.negativeMessages.length) + 
                       Math.min(15, results.questions.length);
  const totalCorrect = positiveCorrect + negativeCorrect + questionCorrect;
  const accuracy = totalChecked > 0 ? (totalCorrect / totalChecked * 100).toFixed(1) : 0;
  console.log(`\n   Overall accuracy: ${totalCorrect}/${totalChecked} (${accuracy}%)`);
}

spotCheckPAD().catch(console.error);

