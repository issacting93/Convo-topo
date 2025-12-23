#!/usr/bin/env node
/**
 * Analyze the relationship between conversation paths and role distributions
 * 
 * This script examines:
 * 1. How role distributions determine the target position (X, Y)
 * 2. How paths drift toward these targets
 * 3. Patterns in path trajectories based on role combinations
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../public/output');

// Role-to-position mappings (from conversationToTerrain.ts)
const HUMAN_ROLE_X_MAP = {
  director: 0.2,
  challenger: 0.3,
  seeker: 0.4,
  learner: 0.5,
  collaborator: 0.7,
  sharer: 0.8
};

const AI_ROLE_Y_MAP = {
  advisor: 0.2,
  expert: 0.3,
  affiliative: 0.5,
  reflector: 0.6,
  facilitator: 0.7,
  peer: 0.8
};

function calculateRoleBasedPosition(conversation) {
  const c = conversation.classification;
  if (!c) return null;

  let x = null;
  let y = null;

  // Calculate X from human role distribution
  if (c.humanRole?.distribution) {
    const humanRole = c.humanRole.distribution;
    const roleBasedX = 
      (humanRole.director || 0) * 0.2 +
      (humanRole.challenger || 0) * 0.3 +
      (humanRole.sharer || 0) * 0.8 +
      (humanRole.collaborator || 0) * 0.7 +
      (humanRole.seeker || 0) * 0.4 +
      (humanRole.learner || 0) * 0.5;
    
    const maxRoleValue = Math.max(...Object.values(humanRole));
    if (maxRoleValue > 0.3) {
      x = Math.max(0, Math.min(1, roleBasedX));
    }
  }

  // Calculate Y from AI role distribution
  if (c.aiRole?.distribution) {
    const aiRole = c.aiRole.distribution;
    const roleBasedY =
      (aiRole.expert || 0) * 0.3 +
      (aiRole.advisor || 0) * 0.2 +
      (aiRole.facilitator || 0) * 0.7 +
      (aiRole.peer || 0) * 0.8 +
      (aiRole.reflector || 0) * 0.6 +
      (aiRole.affiliative || 0) * 0.5;
    
    const maxRoleValue = Math.max(...Object.values(aiRole));
    if (maxRoleValue > 0.3) {
      y = Math.max(0, Math.min(1, roleBasedY));
    }
  }

  return { x, y };
}

function getDominantRoles(conversation) {
  const c = conversation.classification;
  if (!c) return { human: null, ai: null };

  let humanRole = null;
  let aiRole = null;

  if (c.humanRole?.distribution) {
    const entries = Object.entries(c.humanRole.distribution);
    if (entries.length > 0) {
      const [role, value] = entries.reduce((max, [r, v]) => v > max[1] ? [r, v] : max, entries[0]);
      if (value > 0.3) {
        humanRole = { role, value };
      }
    }
  }

  if (c.aiRole?.distribution) {
    const entries = Object.entries(c.aiRole.distribution);
    if (entries.length > 0) {
      const [role, value] = entries.reduce((max, [r, v]) => v > max[1] ? [r, v] : max, entries[0]);
      if (value > 0.3) {
        aiRole = { role, value };
      }
    }
  }

  return { human: humanRole, ai: aiRole };
}

function analyzePathTrajectory(conversation) {
  // Path starts at center (0.5, 0.5) and drifts toward target
  const startX = 0.5;
  const startY = 0.5;
  
  const position = calculateRoleBasedPosition(conversation);
  if (!position || position.x === null || position.y === null) {
    return null;
  }

  const targetX = position.x;
  const targetY = position.y;

  // Calculate drift direction and magnitude
  const driftX = targetX - startX;
  const driftY = targetY - startY;
  const driftMagnitude = Math.sqrt(driftX * driftX + driftY * driftY);
  const driftAngle = Math.atan2(driftY, driftX) * (180 / Math.PI);

  // Determine quadrant
  let quadrant = null;
  if (targetX < 0.5 && targetY < 0.5) quadrant = 'SW'; // Functional + Structured
  else if (targetX < 0.5 && targetY >= 0.5) quadrant = 'NW'; // Functional + Emergent
  else if (targetX >= 0.5 && targetY < 0.5) quadrant = 'SE'; // Social + Structured
  else quadrant = 'NE'; // Social + Emergent

  return {
    start: { x: startX, y: startY },
    target: { x: targetX, y: targetY },
    drift: { x: driftX, y: driftY, magnitude: driftMagnitude, angle: driftAngle },
    quadrant
  };
}

async function analyzeAllConversations() {
  const files = await fs.readdir(OUTPUT_DIR);
  const jsonFiles = files.filter(f => f.endsWith('.json') && f !== 'manifest.json');

  const results = [];

  for (const file of jsonFiles) {
    try {
      const filePath = path.join(OUTPUT_DIR, file);
      const content = await fs.readFile(filePath, 'utf-8');
      const conversation = JSON.parse(content);

      const position = calculateRoleBasedPosition(conversation);
      const roles = getDominantRoles(conversation);
      const trajectory = analyzePathTrajectory(conversation);

      if (position && trajectory) {
        results.push({
          id: conversation.id,
          file,
          position,
          roles,
          trajectory,
          messageCount: conversation.messages?.length || 0
        });
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }

  return results;
}

function generateReport(results) {
  console.log('\n📊 PATH-ROLE RELATIONSHIP ANALYSIS\n');
  console.log(`Total conversations analyzed: ${results.length}\n`);

  // 1. Role-to-Position Mapping
  console.log('1️⃣  ROLE-TO-POSITION MAPPING\n');
  
  const roleCombinations = {};
  results.forEach(r => {
    if (r.roles.human && r.roles.ai) {
      const key = `${r.roles.human.role} + ${r.roles.ai.role}`;
      if (!roleCombinations[key]) {
        roleCombinations[key] = {
          count: 0,
          positions: [],
          quadrants: {}
        };
      }
      roleCombinations[key].count++;
      roleCombinations[key].positions.push(r.position);
      roleCombinations[key].quadrants[r.trajectory.quadrant] = 
        (roleCombinations[key].quadrants[r.trajectory.quadrant] || 0) + 1;
    }
  });

  Object.entries(roleCombinations)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10)
    .forEach(([combo, data]) => {
      const avgX = data.positions.reduce((sum, p) => sum + p.x, 0) / data.positions.length;
      const avgY = data.positions.reduce((sum, p) => sum + p.y, 0) / data.positions.length;
      console.log(`  ${combo}:`);
      console.log(`    Count: ${data.count}`);
      console.log(`    Avg Position: (${avgX.toFixed(2)}, ${avgY.toFixed(2)})`);
      console.log(`    Quadrants: ${JSON.stringify(data.quadrants)}`);
      console.log('');
    });

  // 2. Quadrant Distribution
  console.log('2️⃣  PATH TRAJECTORY QUADRANTS\n');
  const quadrantCounts = {};
  results.forEach(r => {
    quadrantCounts[r.trajectory.quadrant] = (quadrantCounts[r.trajectory.quadrant] || 0) + 1;
  });

  Object.entries(quadrantCounts)
    .sort(([, a], [, b]) => b - a)
    .forEach(([quadrant, count]) => {
      const percentage = ((count / results.length) * 100).toFixed(1);
      let label = '';
      if (quadrant === 'SW') label = 'Functional + Structured';
      else if (quadrant === 'NW') label = 'Functional + Emergent';
      else if (quadrant === 'SE') label = 'Social + Structured';
      else if (quadrant === 'NE') label = 'Social + Emergent';
      console.log(`  ${quadrant} (${label}): ${count} (${percentage}%)`);
    });

  // 3. Drift Patterns
  console.log('\n3️⃣  DRIFT PATTERNS\n');
  const driftMagnitudes = results.map(r => r.trajectory.drift.magnitude);
  const avgDrift = driftMagnitudes.reduce((a, b) => a + b, 0) / driftMagnitudes.length;
  const maxDrift = Math.max(...driftMagnitudes);
  const minDrift = Math.min(...driftMagnitudes);
  
  console.log(`  Average drift magnitude: ${avgDrift.toFixed(3)}`);
  console.log(`  Min drift: ${minDrift.toFixed(3)}`);
  console.log(`  Max drift: ${maxDrift.toFixed(3)}`);

  // 4. Role Influence on Path Direction
  console.log('\n4️⃣  ROLE INFLUENCE ON PATH DIRECTION\n');
  console.log('Human Roles → X-axis (Functional ↔ Social):');
  Object.entries(HUMAN_ROLE_X_MAP)
    .sort(([, a], [, b]) => a - b)
    .forEach(([role, x]) => {
      const label = x < 0.5 ? 'Functional' : 'Social';
      console.log(`  ${role.padEnd(12)} → ${x.toFixed(2)} (${label})`);
    });

  console.log('\nAI Roles → Y-axis (Structured ↔ Emergent):');
  Object.entries(AI_ROLE_Y_MAP)
    .sort(([, a], [, b]) => a - b)
    .forEach(([role, y]) => {
      const label = y < 0.5 ? 'Structured' : 'Emergent';
      console.log(`  ${role.padEnd(12)} → ${y.toFixed(2)} (${label})`);
    });

  // 5. Key Findings
  console.log('\n5️⃣  KEY FINDINGS\n');
  console.log('  ✓ Roles directly determine target position (X, Y)');
  console.log('  ✓ Paths start at center (0.5, 0.5) and drift toward role-based targets');
  console.log('  ✓ Human roles control X-axis: Director/Challenger → Functional, Sharer/Collaborator → Social');
  console.log('  ✓ AI roles control Y-axis: Expert/Advisor → Structured, Peer/Facilitator → Emergent');
  console.log('  ✓ Different role combinations create distinct path trajectories');
  console.log('  ✓ Path progression shows how conversation "moves" through role space\n');

  // 6. Example trajectories
  console.log('6️⃣  EXAMPLE TRAJECTORIES\n');
  results.slice(0, 5).forEach(r => {
    console.log(`  ${r.id}:`);
    if (r.roles.human && r.roles.ai) {
      console.log(`    Roles: ${r.roles.human.role} (${(r.roles.human.value * 100).toFixed(0)}%) + ${r.roles.ai.role} (${(r.roles.ai.value * 100).toFixed(0)}%)`);
    }
    console.log(`    Target: (${r.position.x.toFixed(2)}, ${r.position.y.toFixed(2)})`);
    console.log(`    Drift: ${r.trajectory.drift.magnitude.toFixed(3)} at ${r.trajectory.drift.angle.toFixed(1)}°`);
    console.log(`    Quadrant: ${r.trajectory.quadrant}`);
    console.log('');
  });
}

async function main() {
  try {
    console.log('🔍 Analyzing path-role relationships...\n');
    const results = await analyzeAllConversations();
    
    if (results.length === 0) {
      console.log('❌ No conversations with role data found.');
      return;
    }

    generateReport(results);

    // Save detailed results to JSON
    const outputPath = path.join(__dirname, '../reports/path-role-analysis.json');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(results, null, 2));
    console.log(`\n✅ Detailed results saved to: ${outputPath}`);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

