#!/usr/bin/env tsx
/**
 * Migration Script: Reduce roles from 6 to 4
 * 
 * Combines Option 1 (reduce roles) + Option 2 (improve spacing)
 * 
 * Human Roles: 6 → 4
 * - Merge: seeker + learner → seeker
 * - Remove: director (merge into collaborator)
 * - Keep: collaborator, sharer, challenger
 * 
 * AI Roles: 6 → 4
 * - Merge: expert + advisor → expert
 * - Remove: affiliative (redistribute proportionally)
 * - Keep: facilitator, reflector, peer
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../public/output');
const BACKUP_DIR = path.join(__dirname, '../public/output-backup');

interface OldHumanRoleDistribution {
  seeker?: number;
  learner?: number;
  director?: number;
  collaborator?: number;
  sharer?: number;
  challenger?: number;
}

interface OldAIRoleDistribution {
  expert?: number;
  advisor?: number;
  facilitator?: number;
  reflector?: number;
  peer?: number;
  affiliative?: number;
}

interface NewHumanRoleDistribution {
  seeker: number;
  collaborator: number;
  sharer: number;
  challenger: number;
}

interface NewAIRoleDistribution {
  expert: number;
  facilitator: number;
  reflector: number;
  peer: number;
}

/**
 * Migrate human role distribution from 6 roles to 4
 */
function migrateHumanRoles(oldDist: OldHumanRoleDistribution): NewHumanRoleDistribution {
  const newDist: NewHumanRoleDistribution = {
    seeker: 0,
    collaborator: 0,
    sharer: 0,
    challenger: 0
  };

  // Merge seeker + learner → seeker
  newDist.seeker = (oldDist.seeker || 0) + (oldDist.learner || 0);

  // Merge director → collaborator
  newDist.collaborator = (oldDist.collaborator || 0) + (oldDist.director || 0);

  // Keep as-is
  newDist.sharer = oldDist.sharer || 0;
  newDist.challenger = oldDist.challenger || 0;

  // Normalize to sum to 1.0
  const sum = Object.values(newDist).reduce((a, b) => a + b, 0);
  if (sum > 0) {
    Object.keys(newDist).forEach(role => {
      newDist[role as keyof NewHumanRoleDistribution] /= sum;
    });
  } else {
    // If sum is 0, set uniform distribution
    Object.keys(newDist).forEach(role => {
      newDist[role as keyof NewHumanRoleDistribution] = 0.25;
    });
  }

  return newDist;
}

/**
 * Migrate AI role distribution from 6 roles to 4
 */
function migrateAIRoles(oldDist: OldAIRoleDistribution): NewAIRoleDistribution {
  const newDist: NewAIRoleDistribution = {
    expert: 0,
    facilitator: 0,
    reflector: 0,
    peer: 0
  };

  // Merge expert + advisor → expert
  newDist.expert = (oldDist.expert || 0) + (oldDist.advisor || 0);

  // Keep as-is (affiliative will be redistributed)
  newDist.facilitator = oldDist.facilitator || 0;
  newDist.reflector = oldDist.reflector || 0;
  newDist.peer = oldDist.peer || 0;

  // Redistribute affiliative proportionally to remaining roles
  const affiliativeValue = oldDist.affiliative || 0;
  if (affiliativeValue > 0) {
    const remainingSum = newDist.expert + newDist.facilitator + newDist.reflector + newDist.peer;
    if (remainingSum > 0) {
      newDist.expert += (newDist.expert / remainingSum) * affiliativeValue;
      newDist.facilitator += (newDist.facilitator / remainingSum) * affiliativeValue;
      newDist.reflector += (newDist.reflector / remainingSum) * affiliativeValue;
      newDist.peer += (newDist.peer / remainingSum) * affiliativeValue;
    } else {
      // If all zero, distribute evenly
      newDist.expert += affiliativeValue / 4;
      newDist.facilitator += affiliativeValue / 4;
      newDist.reflector += affiliativeValue / 4;
      newDist.peer += affiliativeValue / 4;
    }
  }

  // Normalize to sum to 1.0
  const sum = Object.values(newDist).reduce((a, b) => a + b, 0);
  if (sum > 0) {
    Object.keys(newDist).forEach(role => {
      newDist[role as keyof NewAIRoleDistribution] /= sum;
    });
  } else {
    // If sum is 0, set uniform distribution
    Object.keys(newDist).forEach(role => {
      newDist[role as keyof NewAIRoleDistribution] = 0.25;
    });
  }

  return newDist;
}

/**
 * Migrate a single conversation file
 */
async function migrateConversation(filePath: string): Promise<boolean> {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    if (!data.classification) {
      return false; // Skip if no classification
    }

    let changed = false;

    // Migrate human role
    if (data.classification.humanRole?.distribution) {
      const oldDist = data.classification.humanRole.distribution;
      const newDist = migrateHumanRoles(oldDist);
      data.classification.humanRole.distribution = newDist;
      changed = true;
    }

    // Migrate AI role
    if (data.classification.aiRole?.distribution) {
      const oldDist = data.classification.aiRole.distribution;
      const newDist = migrateAIRoles(oldDist);
      data.classification.aiRole.distribution = newDist;
      changed = true;
    }

    if (changed) {
      await fs.writeFile(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
    }

    return changed;
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
    return false;
  }
}

/**
 * Main migration function
 */
async function main() {
  console.log('Starting role migration: 6 roles → 4 roles');
  console.log(`Source directory: ${OUTPUT_DIR}`);
  console.log();

  // Check if output directory exists
  try {
    await fs.access(OUTPUT_DIR);
  } catch {
    console.error(`Error: Output directory not found: ${OUTPUT_DIR}`);
    process.exit(1);
  }

  // Create backup
  console.log('Creating backup...');
  try {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    const files = await fs.readdir(OUTPUT_DIR);
    for (const file of files) {
      if (file.endsWith('.json')) {
        const src = path.join(OUTPUT_DIR, file);
        const dest = path.join(BACKUP_DIR, file);
        await fs.copyFile(src, dest);
      }
    }
    console.log(`Backup created in: ${BACKUP_DIR}`);
    console.log();
  } catch (error) {
    console.error('Error creating backup:', error);
    process.exit(1);
  }

  // Migrate files
  console.log('Migrating conversations...');
  const files = await fs.readdir(OUTPUT_DIR);
  const jsonFiles = files.filter(f => f.endsWith('.json'));

  let migrated = 0;
  let skipped = 0;
  let errors = 0;

  for (const file of jsonFiles) {
    const filePath = path.join(OUTPUT_DIR, file);
    const changed = await migrateConversation(filePath);
    if (changed) {
      migrated++;
    } else {
      skipped++;
    }
  }

  console.log();
  console.log('Migration complete!');
  console.log(`  Migrated: ${migrated} files`);
  console.log(`  Skipped: ${skipped} files (no classification data)`);
  console.log(`  Errors: ${errors} files`);
  console.log();
  console.log(`Backup location: ${BACKUP_DIR}`);
  console.log('You can restore from backup if needed.');
}

// Run migration
main().catch(console.error);

