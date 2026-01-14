#!/usr/bin/env node
/**
 * Fix incorrectly nested classification in reclassified files
 *
 * The reclassification script saved the entire conversation object
 * as the classification, creating double nesting. This script fixes it.
 */

const fs = require('fs');
const path = require('path');

const files = [
  'public/output/chatbot_arena_22832.json',
  'public/output/cornell-0.json',
  'public/output/cornell-1.json',
  'public/output/cornell-3.json',
  'public/output/cornell-4.json',
  'public/output/cornell-5.json',
  'public/output/cornell-6.json',
  'public/output/cornell-7.json',
  'public/output/cornell-8.json',
  'public/output/cornell-9.json',
  'public/output/kaggle-emo-0.json',
  'public/output/kaggle-emo-1.json',
  'public/output/kaggle-emo-3.json',
  'public/output/kaggle-emo-4.json',
  'public/output/kaggle-emo-5.json',
  'public/output/kaggle-emo-6.json',
  'public/output/kaggle-emo-7.json',
  'public/output/kaggle-emo-8.json',
  'public/output/kaggle-emo-9.json',
];

console.log('Fixing nested classification in 19 files...\n');

let fixed = 0;
let skipped = 0;
let errors = 0;

files.forEach(file => {
  try {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));

    // Check if classification is incorrectly nested
    if (data.classification &&
        data.classification.classification &&
        data.classification.id === data.id) {

      // Extract the actual classification from the nested structure
      const actualClassification = data.classification.classification;

      // Fix the structure
      data.classification = actualClassification;

      // Save
      fs.writeFileSync(file, JSON.stringify(data, null, 2));

      console.log(`✓ Fixed: ${path.basename(file)}`);
      fixed++;
    } else if (data.classification && data.classification.humanRole) {
      console.log(`⊘ Already correct: ${path.basename(file)}`);
      skipped++;
    } else {
      console.log(`? Unknown structure: ${path.basename(file)}`);
      skipped++;
    }

  } catch (e) {
    console.log(`✗ Error: ${path.basename(file)} - ${e.message}`);
    errors++;
  }
});

console.log(`\n=== SUMMARY ===`);
console.log(`Fixed: ${fixed}`);
console.log(`Skipped: ${skipped}`);
console.log(`Errors: ${errors}`);

if (fixed > 0) {
  console.log(`\n✓ Run: node check_data_integrity.cjs`);
  console.log(`  Expected: Valid conversations should increase to ~562`);
}
