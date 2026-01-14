#!/usr/bin/env node
/**
 * Calculate and save PAD values for all conversations
 *
 * This script:
 * 1. Reads all conversation JSON files
 * 2. Calculates PAD (Pleasure-Arousal-Dominance) values for each message
 * 3. Saves the updated conversations back to the JSON files
 */

const fs = require('fs');
const path = require('path');

// PAD calculation markers (from src/utils/pad.ts)
const MARKERS = {
  frustration: [
    /\b(frustrat|annoying|irritat|damn|ugh|argh)\w*/i,
    /\b(not work|doesn't work|won't work|can't get|unable to)\b/i,
    /\?\?\?+/,
    /!!+/,
  ],
  satisfaction: [
    /\b(thank|great|perfect|excellent|amazing|awesome|love it)\w*/i,
    /\b(work|solve|fix)ed\b/i,
    /👍|😊|🎉|✨/,
  ],
  urgency: [
    /\b(urgent|asap|immediately|quickly|hurry|rush)\w*/i,
    /\b(need.{1,20}now|right now)\b/i,
    /!!+/,
  ],
  apology: [
    /\b(sorry|apologi|my bad|excuse me)\w*/i,
    /\b(I understand|I see)\b/i,
  ],
};

/**
 * Calculate PAD scores for a message
 */
function calculatePAD(text, context = {}) {
  const tone = context.tone || 'neutral';
  const engagement = context.engagement || 'reactive';

  let p = 0.5; // Pleasure
  let a = 0.5; // Arousal
  let d = 0.5; // Dominance

  // Baseline P (Tone)
  if (['playful', 'supportive', 'empathetic'].includes(tone)) p = 0.8;
  else if (tone === 'serious') p = 0.3;

  // Baseline A (Engagement)
  if (engagement === 'questioning' || engagement === 'challenging') a = 0.7;
  else if (engagement === 'reactive') a = 0.3;
  else if (engagement === 'exploring') a = 0.6;

  // Text Analysis
  const clean = text.toLowerCase();

  const hasFrustration = MARKERS.frustration.some(m => m.test(clean));
  const hasSatisfaction = MARKERS.satisfaction.some(m => m.test(clean));
  const hasUrgency = MARKERS.urgency.some(m => m.test(clean));
  const hasApology = MARKERS.apology.some(m => m.test(clean));

  // Apply Modifiers
  if (hasFrustration) {
    p = Math.max(0.1, p - 0.25);
    a = Math.min(1.0, a + 0.25);
  }

  if (hasSatisfaction) {
    p = Math.min(1.0, p + 0.25);
    a = Math.max(0.2, a - 0.1);
  }

  if (hasUrgency) {
    a = Math.min(1.0, a + 0.3);
  }

  if (hasApology) {
    p = Math.max(0.2, p - 0.1);
    d = Math.max(0.2, d - 0.2);
  }

  // Role-based dominance
  if (context.role === 'user') {
    d = 0.6; // Users generally higher dominance (asking/directing)
  } else if (context.role === 'assistant') {
    d = 0.4; // AI generally lower dominance (responding/serving)
  }

  // Calculate emotional intensity
  const emotionalIntensity = Math.sqrt(
    Math.pow(p - 0.5, 2) + Math.pow(a - 0.5, 2) + Math.pow(d - 0.5, 2)
  ) / Math.sqrt(0.75); // Normalize to 0-1

  return {
    pleasure: Math.max(0, Math.min(1, p)),
    arousal: Math.max(0, Math.min(1, a)),
    dominance: Math.max(0, Math.min(1, d)),
    emotionalIntensity: Math.max(0, Math.min(1, emotionalIntensity)),
  };
}

/**
 * Process a single conversation file
 */
function processConversation(filePath) {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (!data.messages || !Array.isArray(data.messages)) {
      return { success: false, reason: 'no messages' };
    }

    // Check if already has PAD values
    const hasPAD = data.messages.some(m => m.pad);
    if (hasPAD) {
      return { success: false, reason: 'already has PAD' };
    }

    // Get context from classification
    const tone = data.classification?.emotionalTone?.category || 'neutral';
    const engagement = data.classification?.engagementStyle?.category || 'reactive';

    // Calculate PAD for each message
    let updated = false;
    data.messages = data.messages.map(msg => {
      const pad = calculatePAD(msg.content, {
        tone,
        engagement,
        role: msg.role,
      });

      updated = true;
      return {
        ...msg,
        pad,
      };
    });

    if (updated) {
      // Save back to file
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      return { success: true, messageCount: data.messages.length };
    }

    return { success: false, reason: 'no updates needed' };
  } catch (error) {
    return { success: false, reason: error.message };
  }
}

/**
 * Main execution
 */
function main() {
  const outputDir = path.join(__dirname, '../public/output');
  const wildchatDir = path.join(__dirname, '../public/output-wildchat');

  console.log('🔧 Calculating PAD values for all conversations...\n');

  let totalProcessed = 0;
  let totalUpdated = 0;
  let totalMessages = 0;
  let errors = 0;

  // Process both directories
  const dirs = [
    { path: outputDir, name: 'Chatbot Arena / OASST' },
    { path: wildchatDir, name: 'WildChat' },
  ];

  for (const dir of dirs) {
    if (!fs.existsSync(dir.path)) {
      console.log(`⚠️  Directory not found: ${dir.path}`);
      continue;
    }

    console.log(`📁 Processing ${dir.name} (${dir.path})`);

    const files = fs.readdirSync(dir.path)
      .filter(f => f.endsWith('.json') && f !== 'manifest.json')
      .sort();

    console.log(`   Found ${files.length} files`);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const filePath = path.join(dir.path, file);

      totalProcessed++;
      const result = processConversation(filePath);

      if (result.success) {
        totalUpdated++;
        totalMessages += result.messageCount;
      } else if (result.reason !== 'already has PAD') {
        errors++;
      }

      // Progress indicator
      if ((i + 1) % 100 === 0) {
        console.log(`   Progress: ${i + 1}/${files.length} files (${totalUpdated} updated)`);
      }
    }

    console.log(`   ✅ Completed ${dir.name}\n`);
  }

  console.log('📊 Summary:');
  console.log(`   Total files processed: ${totalProcessed}`);
  console.log(`   Files updated: ${totalUpdated}`);
  console.log(`   Total messages with PAD: ${totalMessages}`);
  console.log(`   Errors: ${errors}`);
  console.log('\n✨ PAD calculation complete!\n');
}

main();
