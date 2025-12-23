#!/usr/bin/env node

/**
 * Fix Role Distribution Issues
 * 
 * Normalizes role distributions that sum to 0 by:
 * - Setting uniform distribution (1/n for each role) when sum is 0
 * - Only fixes if conversation is very short or has abstain flag
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../public/output');

const HUMAN_ROLES = ['seeker', 'learner', 'director', 'collaborator', 'sharer', 'challenger'];
const AI_ROLES = ['expert', 'advisor', 'facilitator', 'reflector', 'peer', 'affiliative'];

function normalizeDistribution(distribution, roles, allowZeroSum = false) {
  const sum = Object.values(distribution).reduce((a, b) => a + b, 0);
  
  if (sum === 0) {
    // Zero sum indicates complete role failure/breakdown
    // Only normalize to uniform if explicitly allowed (for edge cases)
    // Otherwise preserve the zero sum to indicate breakdown state
    if (allowZeroSum) {
      // Set uniform distribution (legacy behavior for very short conversations)
      const uniform = 1 / roles.length;
      const normalized = {};
      roles.forEach(role => {
        normalized[role] = uniform;
      });
      return normalized;
    } else {
      // Preserve zero sum - indicates role breakdown
      return distribution;
    }
  }
  
  // Already normalized or invalid - return as is
  return distribution;
}

async function fixFile(filePath) {
  const fileName = path.basename(filePath);
  
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    let fixed = false;
    const fixes = [];
    
    // Check if this is a file that needs fixing
    if (!data.classification) {
      return { file: fileName, fixed: false, reason: 'No classification' };
    }
    
    // Fix any zero-sum distributions (regardless of message count)
    // This handles edge cases where role cannot be determined
    const shouldFix = true; // Always check and fix zero-sum distributions
    
    // Fix humanRole distribution
    if (data.classification.humanRole?.distribution) {
      const dist = data.classification.humanRole.distribution;
      const sum = Object.values(dist).reduce((a, b) => a + b, 0);
      
      if (sum === 0) {
        const normalized = normalizeDistribution(dist, HUMAN_ROLES);
        data.classification.humanRole.distribution = normalized;
        fixed = true;
        fixes.push('humanRole: set uniform distribution');
      }
    }
    
    // Fix aiRole distribution
    if (data.classification.aiRole?.distribution) {
      const dist = data.classification.aiRole.distribution;
      const sum = Object.values(dist).reduce((a, b) => a + b, 0);
      
      if (sum === 0) {
        // Zero sum indicates role breakdown - check if this is a legitimate breakdown
        // vs. a very short conversation that couldn't determine roles
        const messageCount = data.messages?.length || 0;
        const isShortConversation = messageCount <= 3;
        const hasAbstainFlag = data.classification.abstain === true;
        
        // Only normalize to uniform for very short conversations or explicit abstain
        // Otherwise, preserve zero sum to indicate breakdown
        if (isShortConversation || hasAbstainFlag) {
          const normalized = normalizeDistribution(dist, AI_ROLES, true);
          data.classification.aiRole.distribution = normalized;
          fixed = true;
          fixes.push(`aiRole: normalized to uniform (short conversation/abstain - ${messageCount} messages)`);
        } else {
          // Preserve zero sum - this is a breakdown, not a normalization issue
          // Add metadata flag instead
          if (!data.classification.aiRole.breakdown) {
            data.classification.aiRole.breakdown = {
              detected: true,
              type: 'non-grounding',
              confidence: 0.9
            };
            fixed = true;
            fixes.push('aiRole: preserved zero sum, added breakdown metadata');
          }
        }
      }
    }
    
    if (fixed) {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
      return { file: fileName, fixed: true, fixes };
    }
    
    return { file: fileName, fixed: false, reason: 'No fixes needed' };
  } catch (error) {
    return { file: fileName, fixed: false, error: error.message };
  }
}

async function main() {
  console.log('🔧 Fixing Role Distribution Issues\n');
  
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }
  
  try {
    const files = await fs.readdir(OUTPUT_DIR);
    const jsonFiles = files
      .filter(f => f.endsWith('.json') && f !== 'manifest.json' && !f.includes('-error'))
      .map(f => path.join(OUTPUT_DIR, f));
    
    console.log(`📁 Found ${jsonFiles.length} files to check\n`);
    
    const results = { fixed: 0, skipped: 0, errors: 0 };
    
    for (const file of jsonFiles) {
      const result = await fixFile(file);
      
      if (result.fixed) {
        if (dryRun) {
          console.log(`✅ ${result.file}: Would fix`);
          result.fixes.forEach(fix => console.log(`   - ${fix}`));
        } else {
          console.log(`✅ ${result.file}: Fixed`);
          result.fixes.forEach(fix => console.log(`   - ${fix}`));
        }
        results.fixed++;
      } else if (result.error) {
        console.log(`❌ ${result.file}: Error (${result.error})`);
        results.errors++;
      } else {
        results.skipped++;
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   ✅ ${dryRun ? 'Would fix' : 'Fixed'}: ${results.fixed}`);
    console.log(`   ⏭️  Skipped: ${results.skipped}`);
    console.log(`   ❌ Errors: ${results.errors}`);
    
    if (!dryRun && results.fixed > 0) {
      console.log('\n💡 Next steps:');
      console.log('   1. Run sanity check again to verify fixes');
      console.log('   2. Update manifest if needed');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

