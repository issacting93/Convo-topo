#!/usr/bin/env node
/**
 * Debug Visualization Data Pipeline
 *
 * This script checks:
 * 1. What conversations are loaded
 * 2. What roles are assigned
 * 3. What coordinates are calculated
 * 4. Whether data matches expectations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// Load Conversations
// ============================================================================

function loadConversations() {
  const outputDir = path.join(__dirname, '../public/output');
  const wildchatDir = path.join(__dirname, '../public/output-wildchat');

  const conversations = [];

  // Load from both directories
  [outputDir, wildchatDir].forEach(dir => {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

    files.forEach(file => {
      try {
        const content = fs.readFileSync(path.join(dir, file), 'utf-8');
        const conv = JSON.parse(content);
        conversations.push(conv);
      } catch (e) {
        console.warn(`⚠️  Failed to load ${file}: ${e.message}`);
      }
    });
  });

  return conversations;
}

// ============================================================================
// Get Conversation Source
// ============================================================================

function getConversationSource(conv) {
  const id = conv.id || '';
  if (id.startsWith('wildchat_')) return 'new';
  if (id.startsWith('chatbot_arena_') || id.startsWith('oasst-')) return 'old';
  return 'old'; // default
}

// ============================================================================
// Get Dominant Role
// ============================================================================

function getDominantRole(distribution) {
  if (!distribution) return null;

  const entries = Object.entries(distribution);
  if (entries.length === 0) return null;

  const [role, value] = entries.reduce((max, [r, v]) =>
    v > max[1] ? [r, v] : max,
    entries[0]
  );

  return { role, value };
}

// ============================================================================
// Calculate Coordinates (Simplified - matches coordinates.ts logic)
// ============================================================================

function getCommunicationFunction(conv) {
  const c = conv.classification;
  if (!c) return 0.5;

  // Role-based positioning (if available)
  if (c.humanRole?.distribution) {
    const dist = c.humanRole.distribution;
    const roleBasedX =
      (dist['director'] || dist['challenger'] || 0) * 0.1 +
      (dist['information-seeker'] || dist['seeker'] || 0) * 0.2 +
      (dist['provider'] || dist['learner'] || 0) * 0.3 +
      (dist['collaborator'] || dist['co-constructor'] || 0) * 0.4 +
      (dist['social-expressor'] || dist['sharer'] || 0) * 0.95 +
      (dist['relational-peer'] || 0) * 0.85;

    const maxValue = Math.max(...Object.values(dist));
    if (maxValue > 0.3) return Math.max(0, Math.min(1, roleBasedX));
  }

  // Purpose-based
  const purpose = c.conversationPurpose?.category;
  if (purpose === 'entertainment' || purpose === 'relationship-building' || purpose === 'self-expression') {
    return 0.7 + (c.conversationPurpose?.confidence || 0.5) * 0.2;
  }
  if (purpose === 'information-seeking' || purpose === 'problem-solving') {
    return 0.1 + (c.conversationPurpose?.confidence || 0.5) * 0.2;
  }

  return 0.5;
}

function getConversationStructure(conv) {
  const c = conv.classification;
  if (!c) return 0.5;

  // Pattern-based
  const pattern = c.interactionPattern?.category;
  const confidence = c.interactionPattern?.confidence || 0.5;
  const strength = 0.3 * confidence;

  if (pattern === 'question-answer' || pattern === 'advisory') {
    return 0.5 + 0.2 + strength;
  }
  if (pattern === 'collaborative' || pattern === 'casual-chat' || pattern === 'storytelling') {
    return 0.5 - 0.2 - strength;
  }

  // Role-based (authority)
  if (c.aiRole?.distribution) {
    const aiRole = c.aiRole.distribution;
    const isExpert = (aiRole['expert-system'] || aiRole['expert'] || 0) + (aiRole['advisor'] || 0);
    const isFacilitator = (aiRole['learning-facilitator'] || aiRole['facilitator'] || 0) +
                          (aiRole['social-facilitator'] || aiRole['reflector'] || 0);
    const isPeer = (aiRole['relational-peer'] || aiRole['peer'] || 0) + (aiRole['co-constructor'] || 0);

    if (isExpert > isFacilitator && isExpert > isPeer) return 0.2;
    if (isFacilitator > isExpert && isFacilitator > isPeer) return 0.8;
    if (isPeer > isExpert && isPeer > isFacilitator) return 0.5;
  }

  return 0.5;
}

// ============================================================================
// Analysis Functions
// ============================================================================

function analyzeRoleDistribution(conversations) {
  const humanRoles = {};
  const aiRoles = {};

  conversations.forEach(conv => {
    const humanDist = conv.classification?.humanRole?.distribution;
    const aiDist = conv.classification?.aiRole?.distribution;

    if (humanDist) {
      const dominant = getDominantRole(humanDist);
      if (dominant) {
        humanRoles[dominant.role] = (humanRoles[dominant.role] || 0) + 1;
      }
    }

    if (aiDist) {
      const dominant = getDominantRole(aiDist);
      if (dominant) {
        aiRoles[dominant.role] = (aiRoles[dominant.role] || 0) + 1;
      }
    }
  });

  return { humanRoles, aiRoles };
}

function analyzeRolePositioning(conversations) {
  const positions = {};

  conversations.forEach(conv => {
    const humanDist = conv.classification?.humanRole?.distribution;
    const aiDist = conv.classification?.aiRole?.distribution;

    const x = getCommunicationFunction(conv);
    const y = getConversationStructure(conv);

    // Human role
    if (humanDist) {
      const dominant = getDominantRole(humanDist);
      if (dominant) {
        const key = `human:${dominant.role}`;
        if (!positions[key]) positions[key] = [];
        positions[key].push({ x, y, id: conv.id });
      }
    }

    // AI role
    if (aiDist) {
      const dominant = getDominantRole(aiDist);
      if (dominant) {
        const key = `ai:${dominant.role}`;
        if (!positions[key]) positions[key] = [];
        positions[key].push({ x, y, id: conv.id });
      }
    }
  });

  // Calculate averages
  const averages = {};
  Object.entries(positions).forEach(([key, coords]) => {
    const avgX = coords.reduce((sum, c) => sum + c.x, 0) / coords.length;
    const avgY = coords.reduce((sum, c) => sum + c.y, 0) / coords.length;
    averages[key] = { avgX, avgY, count: coords.length, samples: coords.slice(0, 3) };
  });

  return averages;
}

function analyzeSampleConversations(conversations, count = 5) {
  return conversations.slice(0, count).map(conv => {
    const humanDist = conv.classification?.humanRole?.distribution;
    const aiDist = conv.classification?.aiRole?.distribution;

    return {
      id: conv.id,
      source: getConversationSource(conv),
      humanRole: humanDist ? getDominantRole(humanDist) : null,
      aiRole: aiDist ? getDominantRole(aiDist) : null,
      x: getCommunicationFunction(conv),
      y: getConversationStructure(conv),
      pattern: conv.classification?.interactionPattern?.category,
      purpose: conv.classification?.conversationPurpose?.category,
      messageCount: conv.messages?.length || 0,
    };
  });
}

// ============================================================================
// Main Debug Report
// ============================================================================

console.log('🔍 VISUALIZATION DATA PIPELINE DEBUG REPORT\n');
console.log('='.repeat(80));

// Load conversations
console.log('\n📂 LOADING CONVERSATIONS...\n');
const conversations = loadConversations();
console.log(`✓ Loaded ${conversations.length} conversations`);

const oldCount = conversations.filter(c => getConversationSource(c) === 'old').length;
const newCount = conversations.filter(c => getConversationSource(c) === 'new').length;
console.log(`  - Old (Arena/OASST): ${oldCount}`);
console.log(`  - New (WildChat): ${newCount}`);

// Check classification data
console.log('\n📊 CLASSIFICATION DATA CHECK...\n');
const withClassification = conversations.filter(c => c.classification).length;
const withHumanRole = conversations.filter(c => c.classification?.humanRole?.distribution).length;
const withAiRole = conversations.filter(c => c.classification?.aiRole?.distribution).length;

console.log(`✓ Conversations with classification: ${withClassification} (${(withClassification/conversations.length*100).toFixed(1)}%)`);
console.log(`✓ Conversations with human role: ${withHumanRole} (${(withHumanRole/conversations.length*100).toFixed(1)}%)`);
console.log(`✓ Conversations with AI role: ${withAiRole} (${(withAiRole/conversations.length*100).toFixed(1)}%)`);

// Role distribution
console.log('\n👥 ROLE DISTRIBUTION...\n');
const { humanRoles, aiRoles } = analyzeRoleDistribution(conversations);

console.log('Human Roles:');
Object.entries(humanRoles)
  .sort((a, b) => b[1] - a[1])
  .forEach(([role, count]) => {
    const pct = (count / withHumanRole * 100).toFixed(1);
    console.log(`  ${role.padEnd(25)} ${count.toString().padStart(4)} (${pct}%)`);
  });

console.log('\nAI Roles:');
Object.entries(aiRoles)
  .sort((a, b) => b[1] - a[1])
  .forEach(([role, count]) => {
    const pct = (count / withAiRole * 100).toFixed(1);
    console.log(`  ${role.padEnd(25)} ${count.toString().padStart(4)} (${pct}%)`);
  });

// Role positioning
console.log('\n📍 ROLE POSITIONING (Average X, Y)...\n');
const positions = analyzeRolePositioning(conversations);

console.log('Role                      Count    Avg X    Avg Y   Quadrant');
console.log('-'.repeat(70));
Object.entries(positions)
  .sort((a, b) => a[0].localeCompare(b[0]))
  .forEach(([key, data]) => {
    const quadrant =
      data.avgX < 0.5 && data.avgY < 0.5 ? 'Functional-Aligned' :
      data.avgX < 0.5 && data.avgY >= 0.5 ? 'Functional-Divergent' :
      data.avgX >= 0.5 && data.avgY < 0.5 ? 'Social-Aligned' :
      'Social-Divergent';

    console.log(
      `${key.padEnd(25)} ${data.count.toString().padStart(5)}    ` +
      `${data.avgX.toFixed(3)}    ${data.avgY.toFixed(3)}   ${quadrant}`
    );
  });

// Sample conversations
console.log('\n📄 SAMPLE CONVERSATIONS (first 5)...\n');
const samples = analyzeSampleConversations(conversations, 5);

samples.forEach((sample, i) => {
  console.log(`${i + 1}. ${sample.id}`);
  console.log(`   Source: ${sample.source}`);
  console.log(`   Human Role: ${sample.humanRole?.role} (${(sample.humanRole?.value || 0).toFixed(2)})`);
  console.log(`   AI Role: ${sample.aiRole?.role} (${(sample.aiRole?.value || 0).toFixed(2)})`);
  console.log(`   Position: (${sample.x.toFixed(3)}, ${sample.y.toFixed(3)})`);
  console.log(`   Pattern: ${sample.pattern}`);
  console.log(`   Purpose: ${sample.purpose}`);
  console.log(`   Messages: ${sample.messageCount}`);
  console.log('');
});

// Validation checks
console.log('\n✅ VALIDATION CHECKS...\n');

// Check 1: Do we have the expected roles?
const expectedHumanRoles = ['information-seeker', 'co-constructor', 'social-expressor'];
const expectedAiRoles = ['expert-system', 'facilitator', 'relational-peer'];
const hasReducedTaxonomy = expectedHumanRoles.every(r => humanRoles[r]) &&
                           expectedAiRoles.every(r => aiRoles[r]);

if (hasReducedTaxonomy) {
  console.log('✓ Reduced taxonomy (3+3) roles found');
} else {
  console.log('⚠️  Using different role taxonomy');
  console.log(`   Human roles found: ${Object.keys(humanRoles).join(', ')}`);
  console.log(`   AI roles found: ${Object.keys(aiRoles).join(', ')}`);
}

// Check 2: Spatial clustering sanity
console.log('\nSpatial Clustering Sanity Checks:');

const humanInfo = positions['human:information-seeker'];
const humanSocial = positions['human:social-expressor'];

if (humanInfo && humanSocial) {
  const infoIsFunctional = humanInfo.avgX < 0.5;
  const socialIsSocial = humanSocial.avgX > 0.5;

  if (infoIsFunctional && socialIsSocial) {
    console.log('✓ Information-Seeker left (Functional), Social-Expressor right (Social)');
  } else {
    console.log('⚠️  Unexpected positioning:');
    console.log(`   Information-Seeker X: ${humanInfo.avgX.toFixed(3)} (expected < 0.5)`);
    console.log(`   Social-Expressor X: ${humanSocial.avgX.toFixed(3)} (expected > 0.5)`);
  }
} else {
  console.log('⚠️  Cannot check - missing expected roles');
}

// Check 3: Old vs New differences
console.log('\nOld vs New Data Distribution:');
const oldConvs = conversations.filter(c => getConversationSource(c) === 'old');
const newConvs = conversations.filter(c => getConversationSource(c) === 'new');

const oldRoles = analyzeRoleDistribution(oldConvs);
const newRoles = analyzeRoleDistribution(newConvs);

console.log('Human role differences (New - Old):');
const allHumanRoles = [...new Set([...Object.keys(oldRoles.humanRoles), ...Object.keys(newRoles.humanRoles)])];
allHumanRoles.forEach(role => {
  const oldPct = (oldRoles.humanRoles[role] || 0) / oldCount * 100;
  const newPct = (newRoles.humanRoles[role] || 0) / newCount * 100;
  const diff = newPct - oldPct;
  const arrow = diff > 0 ? '↑' : diff < 0 ? '↓' : '→';
  console.log(`  ${role.padEnd(25)} ${arrow} ${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`);
});

console.log('\n' + '='.repeat(80));
console.log('\n✅ DEBUG REPORT COMPLETE\n');
