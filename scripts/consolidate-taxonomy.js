#!/usr/bin/env node
/**
 * Consolidate Taxonomy - Map Old Role Names to New
 *
 * Problem: Debug revealed mixed taxonomy - both old and new role names appearing
 * Solution: Apply consistent mapping from old → new roles
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Role Mapping (from conversationToTerrain.ts)
// ============================================================================

const HUMAN_ROLE_MAP = {
  // Old → New
  'challenger': 'director',
  'seeker': 'information-seeker',
  'learner': 'provider',
  'sharer': 'social-expressor',
  'co-constructor': 'collaborator',
  // Already new (pass through)
  'information-seeker': 'information-seeker',
  'provider': 'provider',
  'director': 'director',
  'collaborator': 'collaborator',
  'social-expressor': 'social-expressor',
  'relational-peer': 'relational-peer',
};

const AI_ROLE_MAP = {
  // Old → New
  'expert': 'expert-system',
  'facilitator': 'learning-facilitator',  // Default to learning (was conflated)
  'reflector': 'social-facilitator',
  'peer': 'relational-peer',
  'affiliative': 'social-facilitator',
  // Already new (pass through)
  'expert-system': 'expert-system',
  'learning-facilitator': 'learning-facilitator',
  'advisor': 'advisor',
  'co-constructor': 'co-constructor',
  'social-facilitator': 'social-facilitator',
  'relational-peer': 'relational-peer',
};

// ============================================================================
// Reduced Taxonomy (3+3 - Current Active)
// ============================================================================

const REDUCED_HUMAN_ROLES = ['information-seeker', 'co-constructor', 'social-expressor'];
const REDUCED_AI_ROLES = ['expert-system', 'facilitator', 'relational-peer'];

// Map full taxonomy (6+6) to reduced (3+3)
const HUMAN_TO_REDUCED = {
  'information-seeker': 'information-seeker',
  'provider': 'information-seeker',  // Both seek information
  'director': 'information-seeker',  // Task-oriented, instrumental
  'collaborator': 'co-constructor',
  'social-expressor': 'social-expressor',
  'relational-peer': 'social-expressor',  // Both expressive
};

const AI_TO_REDUCED = {
  'expert-system': 'expert-system',
  'advisor': 'expert-system',  // Both high authority, instrumental
  'learning-facilitator': 'facilitator',
  'social-facilitator': 'facilitator',  // Both facilitators (can distinguish later)
  'co-constructor': 'facilitator',  // Supportive, low authority
  'relational-peer': 'relational-peer',
};

// ============================================================================
// Load and Analyze
// ============================================================================

function loadConversations() {
  const outputDir = path.join(__dirname, '../public/output');
  const wildchatDir = path.join(__dirname, '../public/output-wildchat');
  const conversations = [];

  [outputDir, wildchatDir].forEach(dir => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

    files.forEach(file => {
      try {
        const content = fs.readFileSync(path.join(dir, file), 'utf-8');
        const conv = JSON.parse(content);
        conversations.push({ conv, file, dir });
      } catch (e) {
        // Skip corrupted files
      }
    });
  });

  return conversations;
}

function analyzeRoleNames(conversations) {
  const humanRoles = new Set();
  const aiRoles = new Set();
  const unmappedHuman = new Set();
  const unmappedAi = new Set();

  conversations.forEach(({ conv }) => {
    const humanDist = conv.classification?.humanRole?.distribution;
    const aiDist = conv.classification?.aiRole?.distribution;

    if (humanDist) {
      Object.keys(humanDist).forEach(role => {
        humanRoles.add(role);
        if (!HUMAN_ROLE_MAP[role]) unmappedHuman.add(role);
      });
    }

    if (aiDist) {
      Object.keys(aiDist).forEach(role => {
        aiRoles.add(role);
        if (!AI_ROLE_MAP[role]) unmappedAi.add(role);
      });
    }
  });

  return { humanRoles, aiRoles, unmappedHuman, unmappedAi };
}

function applyMapping(distribution, roleMap) {
  if (!distribution) return null;

  const mapped = {};

  Object.entries(distribution).forEach(([role, value]) => {
    const newRole = roleMap[role] || role;  // Map or keep original
    mapped[newRole] = (mapped[newRole] || 0) + value;  // Accumulate if duplicate
  });

  return mapped;
}

function applyReducedMapping(distribution, toReducedMap) {
  if (!distribution) return null;

  const reduced = {};

  Object.entries(distribution).forEach(([role, value]) => {
    const reducedRole = toReducedMap[role];
    if (reducedRole) {
      reduced[reducedRole] = (reduced[reducedRole] || 0) + value;
    } else {
      console.warn(`⚠️  Unmapped role: ${role}`);
    }
  });

  // Normalize to sum to 1.0
  const total = Object.values(reduced).reduce((sum, v) => sum + v, 0);
  if (total > 0) {
    Object.keys(reduced).forEach(role => {
      reduced[role] /= total;
    });
  }

  return reduced;
}

// ============================================================================
// Main
// ============================================================================

console.log('🔄 TAXONOMY CONSOLIDATION\n');
console.log('='.repeat(80));

const conversations = loadConversations();
console.log(`\n✓ Loaded ${conversations.length} valid conversations\n`);

// Analyze current state
console.log('📊 CURRENT ROLE NAMES:\n');
const { humanRoles, aiRoles, unmappedHuman, unmappedAi } = analyzeRoleNames(conversations);

console.log('Human roles found:');
[...humanRoles].sort().forEach(role => {
  const mapped = HUMAN_ROLE_MAP[role];
  const status = mapped ? (mapped === role ? '✓' : '→') : '⚠️';
  console.log(`  ${status} ${role.padEnd(30)} ${mapped ? `→ ${mapped}` : '(UNMAPPED!)'}`);
});

console.log('\nAI roles found:');
[...aiRoles].sort().forEach(role => {
  const mapped = AI_ROLE_MAP[role];
  const status = mapped ? (mapped === role ? '✓' : '→') : '⚠️';
  console.log(`  ${status} ${role.padEnd(30)} ${mapped ? `→ ${mapped}` : '(UNMAPPED!)'}`);
});

if (unmappedHuman.size > 0 || unmappedAi.size > 0) {
  console.log('\n⚠️  UNMAPPED ROLES FOUND:');
  if (unmappedHuman.size > 0) {
    console.log(`   Human: ${[...unmappedHuman].join(', ')}`);
  }
  if (unmappedAi.size > 0) {
    console.log(`   AI: ${[...unmappedAi].join(', ')}`);
  }
  console.log('   These will be kept as-is (add to mapping if needed)');
}

// Show what would change
console.log('\n📈 CONSOLIDATION PREVIEW (First 5 conversations):\n');

conversations.slice(0, 5).forEach(({ conv }, i) => {
  const oldHuman = conv.classification?.humanRole?.distribution;
  const oldAi = conv.classification?.aiRole?.distribution;

  if (!oldHuman && !oldAi) return;

  console.log(`${i + 1}. ${conv.id}`);

  if (oldHuman) {
    const newHuman = applyMapping(oldHuman, HUMAN_ROLE_MAP);
    const reducedHuman = applyReducedMapping(newHuman, HUMAN_TO_REDUCED);

    console.log('   Human:');
    console.log(`     Old:     ${JSON.stringify(oldHuman)}`);
    console.log(`     Mapped:  ${JSON.stringify(newHuman)}`);
    console.log(`     Reduced: ${JSON.stringify(reducedHuman)}`);
  }

  if (oldAi) {
    const newAi = applyMapping(oldAi, AI_ROLE_MAP);
    const reducedAi = applyReducedMapping(newAi, AI_TO_REDUCED);

    console.log('   AI:');
    console.log(`     Old:     ${JSON.stringify(oldAi)}`);
    console.log(`     Mapped:  ${JSON.stringify(newAi)}`);
    console.log(`     Reduced: ${JSON.stringify(reducedAi)}`);
  }
  console.log('');
});

// Statistics
console.log('='.repeat(80));
console.log('\n📊 CONSOLIDATION STATISTICS:\n');

let changedHuman = 0;
let changedAi = 0;
let totalHuman = 0;
let totalAi = 0;

conversations.forEach(({ conv }) => {
  const oldHuman = conv.classification?.humanRole?.distribution;
  const oldAi = conv.classification?.aiRole?.distribution;

  if (oldHuman) {
    totalHuman++;
    const oldKeys = Object.keys(oldHuman).sort().join(',');
    const newKeys = Object.keys(applyMapping(oldHuman, HUMAN_ROLE_MAP)).sort().join(',');
    if (oldKeys !== newKeys) changedHuman++;
  }

  if (oldAi) {
    totalAi++;
    const oldKeys = Object.keys(oldAi).sort().join(',');
    const newKeys = Object.keys(applyMapping(oldAi, AI_ROLE_MAP)).sort().join(',');
    if (oldKeys !== newKeys) changedAi++;
  }
});

console.log(`Human roles:  ${changedHuman}/${totalHuman} will change (${(changedHuman/totalHuman*100).toFixed(1)}%)`);
console.log(`AI roles:     ${changedAi}/${totalAi} will change (${(changedAi/totalAi*100).toFixed(1)}%)`);

console.log('\n❓ WHAT TO DO:\n');
console.log('Option 1: Apply Full Mapping (6+6 taxonomy)');
console.log('  - Maps old names → new names');
console.log('  - Keeps all 12 roles');
console.log('  - Better theoretical distinction');
console.log('');
console.log('Option 2: Apply Reduced Mapping (3+3 taxonomy)');
console.log('  - Maps old names → new names → reduced set');
console.log('  - Only 6 roles total');
console.log('  - Better for statistical power');
console.log('  - Already validated empirically');
console.log('');
console.log('Option 3: Keep As-Is (mixed taxonomy)');
console.log('  - No changes');
console.log('  - 12 points on scatter plot');
console.log('  - Confusing mixture of old/new');
console.log('');
console.log('Recommendation: Option 2 (Reduced Taxonomy)');
console.log('  - Class imbalance makes 6+6 impractical');
console.log('  - 3+3 has been empirically validated');
console.log('  - Matches documentation');

console.log('\n' + '='.repeat(80));
console.log('\n✅ ANALYSIS COMPLETE\n');
console.log('To apply mapping, run: node scripts/apply-taxonomy-mapping.js [full|reduced]');
