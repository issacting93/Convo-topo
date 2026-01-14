#!/usr/bin/env node
/**
 * Fix incomplete PAD data in conversation files
 *
 * Issue: Some files have PAD data in shorthand format {p, a, d}
 * but missing full format {pleasure, arousal, dominance, emotionalIntensity}
 *
 * This script:
 * 1. Finds files with incomplete PAD data
 * 2. Converts shorthand to full format
 * 3. Calculates emotionalIntensity
 * 4. Saves the fixed files
 */

const fs = require('fs');
const path = require('path');

const outputDir = './public/output';

/**
 * Calculate emotional intensity from PAD values
 * Formula from src/utils/conversationToTerrain.ts
 */
function calculateEmotionalIntensity(pleasure, arousal, dominance) {
  // Method 1: (1 - pleasure) * 0.6 + arousal * 0.4
  // This is the formula used in the codebase
  return (1 - pleasure) * 0.6 + arousal * 0.4;
}

/**
 * Fix PAD data for a single file
 */
function fixPADData(filePath) {
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  let fixed = false;

  data.messages.forEach(message => {
    // Check if PAD exists but is incomplete
    if (message.pad) {
      const hasShorthand = message.pad.p !== undefined;
      const hasFullFormat = message.pad.pleasure !== undefined;
      const hasEmotionalIntensity = message.pad.emotionalIntensity !== undefined;

      if (hasShorthand && !hasFullFormat) {
        // Convert shorthand to full format
        message.pad.pleasure = message.pad.p;
        message.pad.arousal = message.pad.a;
        message.pad.dominance = message.pad.d;
        fixed = true;
      }

      if (!hasEmotionalIntensity && message.pad.pleasure !== undefined) {
        // Calculate and add emotionalIntensity
        message.pad.emotionalIntensity = calculateEmotionalIntensity(
          message.pad.pleasure,
          message.pad.arousal,
          message.pad.dominance
        );
        fixed = true;
      }
    }
  });

  if (fixed) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  }

  return false;
}

// Main execution
console.log('Scanning for files with incomplete PAD data...\n');

const files = fs.readdirSync(outputDir)
  .filter(f => f.endsWith('.json') && f !== 'manifest.json');

let fixedCount = 0;
let errorCount = 0;
const fixedFiles = [];
const errorFiles = [];

files.forEach(file => {
  const filePath = path.join(outputDir, file);

  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    // Check if any messages have incomplete PAD
    const hasIncompletePAD = data.messages.some(m => {
      if (!m.pad) return false;
      const hasShorthand = m.pad.p !== undefined;
      const hasFullFormat = m.pad.pleasure !== undefined;
      const hasEmotionalIntensity = m.pad.emotionalIntensity !== undefined;
      return hasShorthand || (!hasFullFormat || !hasEmotionalIntensity);
    });

    if (hasIncompletePAD) {
      const wasFixed = fixPADData(filePath);
      if (wasFixed) {
        fixedCount++;
        fixedFiles.push(file);
      }
    }

  } catch (e) {
    errorCount++;
    errorFiles.push(file);
    console.error('Error processing', file, ':', e.message);
  }
});

console.log('=== FIX RESULTS ===');
console.log('Total files scanned:', files.length);
console.log('Files fixed:', fixedCount);
console.log('Errors:', errorCount);

if (fixedCount > 0) {
  console.log('\n=== SAMPLE FIXED FILES (first 10) ===');
  fixedFiles.slice(0, 10).forEach(f => console.log('  ✓', f));

  if (fixedCount > 10) {
    console.log('  ... and', fixedCount - 10, 'more');
  }
}

if (errorCount > 0) {
  console.log('\n=== ERROR FILES ===');
  errorFiles.forEach(f => console.log('  ✗', f));
}

console.log('\n=== VERIFICATION ===');
console.log('Run: node check_data_integrity.cjs');
console.log('Expected: Valid conversations should increase from 441 to ~543');
