#!/usr/bin/env node

/**
 * Dataset Sanity Check Script
 * 
 * Checks all classified conversation files for:
 * - Valid JSON structure
 * - Required fields (id, messages, classification)
 * - PAD values in messages
 * - Classification dimensions
 * - Valid PAD value ranges
 * - Role distribution normalization
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../public/output');

// Expected classification dimensions (from ClassifiedConversation interface)
const EXPECTED_DIMENSIONS = [
  'interactionPattern',
  'powerDynamics', 
  'emotionalTone',
  'engagementStyle',
  'knowledgeExchange',
  'conversationPurpose',
  'turnTaking',
  'humanRole',
  'aiRole'
];

// Valid categories for each dimension (from taxonomy)
const VALID_CATEGORIES = {
  interactionPattern: ['question-answer', 'storytelling', 'advisory', 'debate', 'collaborative', 'casual-chat'],
  emotionalTone: ['neutral', 'positive', 'negative', 'mixed', 'playful', 'serious'],
  engagementStyle: ['reactive', 'proactive', 'reciprocal', 'asymmetric'],
  // Add more as needed - these are just examples
};

async function checkFile(filePath) {
  const fileName = path.basename(filePath);
  const issues = [];
  const warnings = [];

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    // Check required top-level fields
    if (!data.id) issues.push('Missing id field');
    if (!data.messages) issues.push('Missing messages array');
    if (!data.classification) issues.push('Missing classification object');

    // Check messages
    if (data.messages) {
      if (!Array.isArray(data.messages)) {
        issues.push('messages is not an array');
      } else if (data.messages.length === 0) {
        issues.push('messages array is empty');
      } else {
        // Check message structure
        data.messages.forEach((msg, idx) => {
          if (!msg.role) issues.push(`Message ${idx}: missing role`);
          if (!msg.content && msg.content !== '') warnings.push(`Message ${idx}: empty content`);
          
          // Check PAD values
          if (msg.pad) {
            const { pleasure, arousal, dominance, emotionalIntensity } = msg.pad;
            if (pleasure === undefined || pleasure < 0 || pleasure > 1) {
              issues.push(`Message ${idx}: invalid pleasure value (${pleasure})`);
            }
            if (arousal === undefined || arousal < 0 || arousal > 1) {
              issues.push(`Message ${idx}: invalid arousal value (${arousal})`);
            }
            if (dominance === undefined || dominance < 0 || dominance > 1) {
              issues.push(`Message ${idx}: invalid dominance value (${dominance})`);
            }
            if (emotionalIntensity === undefined || emotionalIntensity < 0 || emotionalIntensity > 1) {
              issues.push(`Message ${idx}: invalid emotionalIntensity value (${emotionalIntensity})`);
            }
            
            // Verify emotionalIntensity formula: (1 - pleasure) * 0.6 + arousal * 0.4
            const expectedIntensity = ((1 - pleasure) * 0.6) + (arousal * 0.4);
            const diff = Math.abs(emotionalIntensity - expectedIntensity);
            if (diff > 0.01) {
              warnings.push(`Message ${idx}: emotionalIntensity (${emotionalIntensity.toFixed(3)}) doesn't match formula (expected ${expectedIntensity.toFixed(3)}, diff: ${diff.toFixed(3)})`);
            }
          } else {
            warnings.push(`Message ${idx}: missing PAD values`);
          }
        });

        // Check PAD coverage
        const messagesWithPAD = data.messages.filter(m => m.pad).length;
        if (messagesWithPAD < data.messages.length) {
          warnings.push(`${data.messages.length - messagesWithPAD} messages missing PAD values`);
        }
      }
    }

    // Check classification structure
    if (data.classification) {
      // Check for expected dimensions
      EXPECTED_DIMENSIONS.forEach(dim => {
        if (!data.classification[dim]) {
          warnings.push(`Missing classification dimension: ${dim}`);
        }
      });

      // Check role distributions
      if (data.classification.humanRole) {
        const dist = data.classification.humanRole.distribution;
        if (!dist) {
          issues.push('humanRole missing distribution object');
        } else {
          const sum = Object.values(dist).reduce((a, b) => a + b, 0);
          if (Math.abs(sum - 1.0) > 0.01) {
            issues.push(`humanRole distribution doesn't sum to 1.0 (sum: ${sum.toFixed(3)})`);
          }
        }
      }

      if (data.classification.aiRole) {
        const dist = data.classification.aiRole.distribution;
        if (!dist) {
          issues.push('aiRole missing distribution object');
        } else {
          const sum = Object.values(dist).reduce((a, b) => a + b, 0);
          if (Math.abs(sum - 1.0) > 0.01) {
            issues.push(`aiRole distribution doesn't sum to 1.0 (sum: ${sum.toFixed(3)})`);
          }
        }
      }

      // Check confidence scores
      Object.entries(data.classification).forEach(([key, value]) => {
        if (value && typeof value === 'object' && 'confidence' in value) {
          const conf = value.confidence;
          if (conf < 0 || conf > 1) {
            issues.push(`${key}: invalid confidence value (${conf})`);
          }
        }
      });
    }

    return {
      file: fileName,
      valid: issues.length === 0,
      issues,
      warnings,
      stats: {
        messageCount: data.messages?.length || 0,
        messagesWithPAD: data.messages?.filter(m => m.pad).length || 0,
        hasClassification: !!data.classification,
        classificationDimensions: data.classification ? Object.keys(data.classification).length : 0
      }
    };
  } catch (error) {
    return {
      file: fileName,
      valid: false,
      issues: [`Parse error: ${error.message}`],
      warnings: [],
      stats: null
    };
  }
}

async function main() {
  console.log('📊 Dataset Sanity Check\n');
  console.log('Checking files in:', OUTPUT_DIR, '\n');

  try {
    const files = await fs.readdir(OUTPUT_DIR);
    const jsonFiles = files
      .filter(f => f.endsWith('.json') && f !== 'manifest.json')
      .map(f => path.join(OUTPUT_DIR, f));

    console.log(`Found ${jsonFiles.length} conversation files\n`);

    const results = await Promise.all(jsonFiles.map(checkFile));

    // Summary statistics
    const valid = results.filter(r => r.valid).length;
    const invalid = results.filter(r => !r.valid).length;
    const totalMessages = results.reduce((sum, r) => sum + (r.stats?.messageCount || 0), 0);
    const messagesWithPAD = results.reduce((sum, r) => sum + (r.stats?.messagesWithPAD || 0), 0);
    const filesWithClassification = results.filter(r => r.stats?.hasClassification).length;

    console.log('═══════════════════════════════════════════════════════════');
    console.log('SUMMARY');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Total files: ${results.length}`);
    console.log(`✅ Valid files: ${valid}`);
    console.log(`❌ Invalid files: ${invalid}`);
    console.log(`📝 Total messages: ${totalMessages}`);
    console.log(`📊 Messages with PAD: ${messagesWithPAD} (${((messagesWithPAD / totalMessages) * 100).toFixed(1)}%)`);
    console.log(`🏷️  Files with classification: ${filesWithClassification} (${((filesWithClassification / results.length) * 100).toFixed(1)}%)\n`);

    // Show files with issues
    const filesWithIssues = results.filter(r => r.issues.length > 0);
    if (filesWithIssues.length > 0) {
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`FILES WITH ISSUES (${filesWithIssues.length})`);
      console.log('═══════════════════════════════════════════════════════════\n');
      filesWithIssues.forEach(result => {
        console.log(`❌ ${result.file}:`);
        result.issues.forEach(issue => console.log(`   - ${issue}`));
        if (result.warnings.length > 0) {
          result.warnings.slice(0, 3).forEach(warning => console.log(`   ⚠️  ${warning}`));
          if (result.warnings.length > 3) {
            console.log(`   ... and ${result.warnings.length - 3} more warnings`);
          }
        }
        console.log('');
      });
    }

    // Show files with only warnings
    const filesWithOnlyWarnings = results.filter(r => r.issues.length === 0 && r.warnings.length > 0);
    if (filesWithOnlyWarnings.length > 0) {
      console.log('═══════════════════════════════════════════════════════════');
      console.log(`FILES WITH WARNINGS ONLY (${filesWithOnlyWarnings.length})`);
      console.log('═══════════════════════════════════════════════════════════\n');
      filesWithOnlyWarnings.slice(0, 10).forEach(result => {
        console.log(`⚠️  ${result.file}:`);
        result.warnings.slice(0, 2).forEach(warning => console.log(`   - ${warning}`));
        if (result.warnings.length > 2) {
          console.log(`   ... and ${result.warnings.length - 2} more warnings`);
        }
        console.log('');
      });
      if (filesWithOnlyWarnings.length > 10) {
        console.log(`... and ${filesWithOnlyWarnings.length - 10} more files with warnings\n`);
      }
    }

    // Detailed statistics
    console.log('═══════════════════════════════════════════════════════════');
    console.log('DETAILED STATISTICS');
    console.log('═══════════════════════════════════════════════════════════\n');

    const messageCounts = results.map(r => r.stats?.messageCount || 0);
    const avgMessages = messageCounts.reduce((a, b) => a + b, 0) / messageCounts.length;
    const minMessages = Math.min(...messageCounts);
    const maxMessages = Math.max(...messageCounts);

    console.log(`Message count per file:`);
    console.log(`   Average: ${avgMessages.toFixed(1)}`);
    console.log(`   Range: ${minMessages} - ${maxMessages}`);

    // Classification dimension coverage
    const dimensionCounts = {};
    results.forEach(r => {
      if (r.stats?.classificationDimensions) {
        const count = r.stats.classificationDimensions;
        dimensionCounts[count] = (dimensionCounts[count] || 0) + 1;
      }
    });
    console.log(`\nClassification dimensions per file:`);
    Object.entries(dimensionCounts)
      .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      .forEach(([count, numFiles]) => {
        console.log(`   ${count} dimensions: ${numFiles} files`);
      });

    console.log('\n✅ Sanity check complete!\n');

    if (invalid > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

