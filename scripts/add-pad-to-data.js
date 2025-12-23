#!/usr/bin/env node
/**
 * Script to add PAD (Pleasure-Arousal-Dominance) values to existing classified conversation files
 * 
 * This script:
 * 1. Reads all JSON files in public/output/
 * 2. Calculates PAD values for each message using the same logic as calculateMessagePAD()
 * 3. Adds PAD values to each message in the messages array
 * 4. Writes the updated files back
 * 
 * Usage:
 *   node scripts/add-pad-to-data.js
 *   node scripts/add-pad-to-data.js --dry-run  # Preview changes without writing
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../public/output');

/**
 * Calculate PAD scores for a message (same logic as calculateMessagePAD in conversationToTerrain.ts)
 */
function calculateMessagePAD(message, classification, messageIndex, totalMessages) {
  const convTone = classification?.emotionalTone?.category || 'neutral';
  const convEngagement = classification?.engagementStyle?.category || 'reactive';

  // Calculate base Pleasure (P) from conversation tone
  let basePleasure =
    (convTone === 'playful' || convTone === 'supportive' || convTone === 'empathetic') ? 0.8 :
    (convTone === 'serious') ? 0.3 :
    (convTone === 'neutral') ? 0.5 : 0.5;

  // Calculate base Arousal (A) from conversation engagement  
  let baseArousal =
    (convEngagement === 'questioning') ? 0.7 :
    (convEngagement === 'reactive') ? 0.3 :
    (convEngagement === 'affirming') ? 0.45 :
    (convEngagement === 'exploring') ? 0.6 : 0.5;

  // Message-level adjustments based on content analysis
  const content = message.content.toLowerCase();

  // Detect frustration markers (low pleasure, high arousal)
  const frustrationPatterns = [
    /\b(wrong|incorrect|error|mistake|failed|broken)\b/i,
    /\bno[,.]?\s+(that's|this is|it is)/i,
    /\bnot\s+(quite|right|correct|working|working properly)/i,
    /\b(doesn't|does not|can't|cannot|won't|will not)\s+(work|seem|appear|make sense)/i,
    /\b(issue|problem|bug)\b/i,
    /\b(actually|however|but)\s+(that|this|it)/i,
  ];
  const hasFrustration = frustrationPatterns.some(pattern => pattern.test(content));

  // Detect satisfaction markers (high pleasure)
  const satisfactionPatterns = [
    /\b(perfect|exactly|brilliant|excellent|amazing|awesome|fantastic)\b/i,
    /\b(thanks|thank you)\b/i,
    /\b(that|it)\s+works\b/i,
    /\byes[!.]?\s+(that's|exactly|perfect|correct|right)/i,
    /\bworks?\s+perfectly\b/i,
    /\bexactly\s+(what|what i|what we)/i,
    /\bthat's\s+it\b/i,
    /\blove\s+(it|this|that)\b/i,
  ];
  const hasSatisfaction = satisfactionPatterns.some(pattern => pattern.test(content));

  // Detect urgency/agitation (high arousal)
  const urgencyPatterns = [
    /\b(urgent|asap|as soon as possible)\b/i,
    /\b(quickly|immediately|right now)\b/i,
    /\bhelp[!.]?\s+(me|us|please)/i,
    /\bplease[!.]?\s+(help|urgent)/i,
    /\b(very|extremely|really)\s+(urgent|important|critical)/i,
    /\b(hurry|rush|fast)\b/i,
  ];
  const hasUrgency = urgencyPatterns.some(pattern => pattern.test(content));

  // Adjust PAD based on message content
  if (hasFrustration) {
    basePleasure = Math.max(0.1, basePleasure - 0.25);
    baseArousal = Math.min(1.0, baseArousal + 0.25);
  }

  if (hasSatisfaction) {
    basePleasure = Math.min(1.0, basePleasure + 0.25);
    baseArousal = Math.max(0.1, baseArousal - 0.15);
  }

  if (hasUrgency && !hasFrustration) {
    baseArousal = Math.min(1.0, baseArousal + 0.2);
  }

  // Calculate Dominance (D) from message structure
  const isQuestion = content.includes('?');
  const isCommand = /^(please|can you|could you|would you|do |make |write |create |implement |add |fix |change )/i.test(content);
  const baseDominance = isQuestion ? 0.3 : (isCommand ? 0.7 : 0.5);

  // Emotional intensity: High Arousal + Low Pleasure = Peaks (frustration)
  // Low Arousal + High Pleasure = Valleys (affiliation)
  const emotionalIntensity = (1 - basePleasure) * 0.6 + baseArousal * 0.4;

  return {
    pleasure: Math.max(0, Math.min(1, basePleasure)),
    arousal: Math.max(0, Math.min(1, baseArousal)),
    dominance: Math.max(0, Math.min(1, baseDominance)),
    emotionalIntensity: Math.max(0, Math.min(1, emotionalIntensity))
  };
}

/**
 * Process a single conversation file
 */
function processFile(filePath, dryRun = false, force = false) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);

    // Skip if already has PAD values or no classification
    if (!data.classification || !data.messages || data.messages.length === 0) {
      return { skipped: true, reason: 'No classification or messages' };
    }

    // Check if PAD already exists (skip unless force mode)
    if (!force && data.messages[0] && data.messages[0].pad) {
      return { skipped: true, reason: 'Already has PAD values (use --force to recalculate)' };
    }

    // Add PAD to each message
    const updatedMessages = data.messages.map((msg, index) => {
      const pad = calculateMessagePAD(
        msg,
        data.classification,
        index,
        data.messages.length
      );
      return {
        ...msg,
        pad
      };
    });

    const updatedData = {
      ...data,
      messages: updatedMessages
    };

    if (!dryRun) {
      fs.writeFileSync(filePath, JSON.stringify(updatedData, null, 2) + '\n', 'utf8');
    }

    return { 
      processed: true, 
      messageCount: updatedMessages.length,
      samplePAD: updatedMessages[0].pad 
    };
  } catch (error) {
    return { error: error.message };
  }
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const force = args.includes('--force');

  console.log('🔍 Adding PAD values to conversation files...\n');
  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No files will be modified\n');
  }
  if (force) {
    console.log('🔄 FORCE MODE - Will recalculate PAD even if already present\n');
  }

  // Get all JSON files in output directory
  const files = fs.readdirSync(OUTPUT_DIR)
    .filter(f => f.endsWith('.json') && f !== 'manifest.json' && !f.endsWith('-error.json'))
    .map(f => path.join(OUTPUT_DIR, f));

  console.log(`Found ${files.length} files to process\n`);

  let processed = 0;
  let skipped = 0;
  let errors = 0;

  for (const filePath of files) {
    const filename = path.basename(filePath);
    const result = processFile(filePath, dryRun, force);

    if (result.error) {
      console.log(`❌ ${filename}: ${result.error}`);
      errors++;
    } else if (result.skipped) {
      console.log(`⏭️  ${filename}: ${result.reason}`);
      skipped++;
    } else {
      console.log(`✅ ${filename}: Added PAD to ${result.messageCount} messages`);
      if (result.samplePAD) {
        console.log(`   Sample: P=${(result.samplePAD.pleasure * 100).toFixed(0)}%, A=${(result.samplePAD.arousal * 100).toFixed(0)}%, I=${(result.samplePAD.emotionalIntensity * 100).toFixed(0)}%`);
      }
      processed++;
    }
  }

  console.log(`\n📊 Summary:`);
  console.log(`   ✅ Processed: ${processed}`);
  console.log(`   ⏭️  Skipped: ${skipped}`);
  console.log(`   ❌ Errors: ${errors}`);

  if (dryRun) {
    console.log(`\n💡 Run without --dry-run to apply changes`);
  } else {
    console.log(`\n✅ Done! PAD values added to ${processed} files`);
  }
}

main();

