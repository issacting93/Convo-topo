#!/usr/bin/env node
/**
 * Deep dive analysis of path, conversation, and PAD relationships
 * 
 * Analyzes:
 * 1. Role distributions → X/Y positions
 * 2. PAD patterns → Z-height patterns
 * 3. Temporal evolution of paths
 * 4. Correlations between roles and PAD
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'output');

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

function analyzePADPattern(conversation) {
  const messages = conversation.messages || [];
  const padScores = messages.filter(m => m.pad).map(m => ({
    intensity: m.pad.emotionalIntensity,
    pleasure: m.pad.pleasure,
    arousal: m.pad.arousal,
    dominance: m.pad.dominance
  }));

  if (padScores.length === 0) return null;

  const intensities = padScores.map(p => p.intensity);
  const pleasures = padScores.map(p => p.pleasure);
  const arousals = padScores.map(p => p.arousal);

  // Find peaks and valleys
  const peaks = [];
  const valleys = [];
  
  for (let i = 1; i < intensities.length - 1; i++) {
    if (intensities[i] > intensities[i-1] && intensities[i] > intensities[i+1] && intensities[i] > 0.6) {
      peaks.push({ index: i, intensity: intensities[i] });
    }
    if (intensities[i] < intensities[i-1] && intensities[i] < intensities[i+1] && intensities[i] < 0.4) {
      valleys.push({ index: i, intensity: intensities[i] });
    }
  }

  // Analyze trajectory
  const startIntensity = intensities[0];
  const endIntensity = intensities[intensities.length - 1];
  const trajectory = endIntensity > startIntensity ? 'increasing' : 
                     endIntensity < startIntensity ? 'decreasing' : 'stable';

  return {
    count: padScores.length,
    min: Math.min(...intensities),
    max: Math.max(...intensities),
    avg: intensities.reduce((a, b) => a + b, 0) / intensities.length,
    avgPleasure: pleasures.reduce((a, b) => a + b, 0) / pleasures.length,
    avgArousal: arousals.reduce((a, b) => a + b, 0) / arousals.length,
    peaks: peaks.length,
    valleys: valleys.length,
    trajectory,
    startIntensity,
    endIntensity,
    intensityChange: endIntensity - startIntensity
  };
}

function simulatePathTrajectory(conversation, position) {
  if (!position || position.x === null || position.y === null) return null;

  const messages = conversation.messages || [];
  const startX = 0.5;
  const startY = 0.5;
  const targetX = position.x;
  const targetY = position.y;

  // Simulate path drift (simplified)
  const pathPoints = [];
  let currentX = startX;
  let currentY = startY;

  for (let i = 0; i < Math.min(messages.length, 30); i++) {
    const progress = i / Math.max(messages.length - 1, 1);
    
    // Drift toward target
    const driftX = (targetX - startX) * 1.2 * (0.10 + progress * 0.30);
    const driftY = (targetY - startY) * 1.2 * (0.10 + progress * 0.30);
    
    currentX += driftX;
    currentY += driftY;
    
    // Get PAD for this message
    const pad = messages[i]?.pad;
    const z = pad?.emotionalIntensity || 0.5;

    pathPoints.push({ x: currentX, y: currentY, z, index: i });
  }

  return pathPoints;
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
      const padAnalysis = analyzePADPattern(conversation);
      const pathTrajectory = simulatePathTrajectory(conversation, position);

      if (position && padAnalysis && pathTrajectory) {
        results.push({
          id: conversation.id,
          file,
          messageCount: conversation.messages?.length || 0,
          position,
          padAnalysis,
          pathTrajectory,
          humanRole: Object.entries(conversation.classification?.humanRole?.distribution || {})
            .sort((a, b) => b[1] - a[1])[0],
          aiRole: Object.entries(conversation.classification?.aiRole?.distribution || {})
            .sort((a, b) => b[1] - a[1])[0]
        });
      }
    } catch (error) {
      console.error(`Error processing ${file}:`, error.message);
    }
  }

  return results;
}

async function generateDeepDiveReport(results) {
  console.log('\n🔬 DEEP DIVE: PATH, CONVERSATION, AND PAD RELATIONSHIPS\n');
  console.log(`Analyzed ${results.length} conversations\n`);

  // 1. Role-Position Relationship Analysis
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('1️⃣  ROLE → POSITION RELATIONSHIP\n');

  const roleCombinations = {};
  results.forEach(r => {
    if (r.humanRole && r.aiRole) {
      const key = `${r.humanRole[0]} + ${r.aiRole[0]}`;
      if (!roleCombinations[key]) {
        roleCombinations[key] = {
          count: 0,
          positions: [],
          avgX: 0,
          avgY: 0
        };
      }
      roleCombinations[key].count++;
      roleCombinations[key].positions.push(r.position);
    }
  });

  Object.entries(roleCombinations)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 10)
    .forEach(([combo, data]) => {
      const avgX = data.positions.reduce((sum, p) => sum + p.x, 0) / data.positions.length;
      const avgY = data.positions.reduce((sum, p) => sum + p.y, 0) / data.positions.length;
      console.log(`  ${combo}:`);
      console.log(`    Frequency: ${data.count} conversations`);
      console.log(`    Avg Position: (${avgX.toFixed(3)}, ${avgY.toFixed(3)})`);
      console.log(`    X-axis: ${avgX < 0.5 ? 'Functional' : 'Social'} (${(avgX * 100).toFixed(0)}%)`);
      console.log(`    Y-axis: ${avgY < 0.5 ? 'Structured' : 'Emergent'} (${(avgY * 100).toFixed(0)}%)`);
      console.log('');
    });

  // 2. PAD Pattern Analysis
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('2️⃣  PAD → Z-HEIGHT RELATIONSHIP\n');

  const allIntensities = results.flatMap(r => 
    r.padAnalysis ? [r.padAnalysis.min, r.padAnalysis.max, r.padAnalysis.avg] : []
  );
  
  const globalMin = Math.min(...allIntensities);
  const globalMax = Math.max(...allIntensities);
  const globalAvg = allIntensities.reduce((a, b) => a + b, 0) / allIntensities.length;

  console.log(`  Global PAD Intensity Statistics:`);
  console.log(`    Min: ${(globalMin * 100).toFixed(1)}% (valley/affiliation)`);
  console.log(`    Max: ${(globalMax * 100).toFixed(1)}% (peak/frustration)`);
  console.log(`    Average: ${(globalAvg * 100).toFixed(1)}%`);
  console.log('');

  // Peak/Valley analysis
  const conversationsWithPeaks = results.filter(r => r.padAnalysis && r.padAnalysis.peaks > 0);
  const conversationsWithValleys = results.filter(r => r.padAnalysis && r.padAnalysis.valleys > 0);

  console.log(`  Peak/Valley Patterns:`);
  console.log(`    Conversations with peaks (frustration): ${conversationsWithPeaks.length}`);
  console.log(`    Conversations with valleys (affiliation): ${conversationsWithValleys.length}`);
  console.log(`    Average peaks per conversation: ${(conversationsWithPeaks.reduce((sum, r) => sum + r.padAnalysis.peaks, 0) / Math.max(conversationsWithPeaks.length, 1)).toFixed(1)}`);
  console.log(`    Average valleys per conversation: ${(conversationsWithValleys.reduce((sum, r) => sum + r.padAnalysis.valleys, 0) / Math.max(conversationsWithValleys.length, 1)).toFixed(1)}`);
  console.log('');

  // Trajectory analysis
  const increasing = results.filter(r => r.padAnalysis && r.padAnalysis.trajectory === 'increasing');
  const decreasing = results.filter(r => r.padAnalysis && r.padAnalysis.trajectory === 'decreasing');
  const stable = results.filter(r => r.padAnalysis && r.padAnalysis.trajectory === 'stable');

  console.log(`  PAD Trajectories:`);
  console.log(`    Increasing (growing frustration): ${increasing.length} (${(increasing.length/results.length*100).toFixed(1)}%)`);
  console.log(`    Decreasing (improving mood): ${decreasing.length} (${(decreasing.length/results.length*100).toFixed(1)}%)`);
  console.log(`    Stable: ${stable.length} (${(stable.length/results.length*100).toFixed(1)}%)`);
  console.log('');

  // 3. Role-PAD Correlations
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('3️⃣  ROLE-PAD CORRELATIONS\n');

  // Analyze if certain roles correlate with specific PAD patterns
  const rolePadStats = {};
  results.forEach(r => {
    if (r.humanRole && r.aiRole && r.padAnalysis) {
      const key = `${r.humanRole[0]} + ${r.aiRole[0]}`;
      if (!rolePadStats[key]) {
        rolePadStats[key] = {
          count: 0,
          avgIntensity: [],
          peaks: 0,
          valleys: 0
        };
      }
      rolePadStats[key].count++;
      rolePadStats[key].avgIntensity.push(r.padAnalysis.avg);
      rolePadStats[key].peaks += r.padAnalysis.peaks;
      rolePadStats[key].valleys += r.padAnalysis.valleys;
    }
  });

  Object.entries(rolePadStats)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 8)
    .forEach(([combo, data]) => {
      const avgInt = data.avgIntensity.reduce((a, b) => a + b, 0) / data.avgIntensity.length;
      console.log(`  ${combo} (${data.count} conversations):`);
      console.log(`    Avg PAD Intensity: ${(avgInt * 100).toFixed(1)}%`);
      console.log(`    ${avgInt > 0.5 ? '→ Tends toward peaks (frustration)' : '→ Tends toward valleys (affiliation)'}`);
      console.log(`    Total peaks: ${data.peaks}, Total valleys: ${data.valleys}`);
      console.log('');
    });

  // 4. Path Trajectory Analysis
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('4️⃣  PATH TRAJECTORY PATTERNS\n');

  // Analyze path distances
  const pathDistances = results.map(r => {
    if (!r.pathTrajectory || r.pathTrajectory.length < 2) return null;
    const start = r.pathTrajectory[0];
    const end = r.pathTrajectory[r.pathTrajectory.length - 1];
    const distance = Math.sqrt(
      Math.pow(end.x - start.x, 2) + 
      Math.pow(end.y - start.y, 2)
    );
    return { id: r.id, distance, msgCount: r.messageCount };
  }).filter(d => d !== null);

  pathDistances.sort((a, b) => b.distance - a.distance);

  console.log(`  Longest Path Drifts (role-based movement):`);
  pathDistances.slice(0, 5).forEach((p, i) => {
    console.log(`    ${i+1}. ${p.id}: ${(p.distance * 100).toFixed(1)}% drift (${p.msgCount} messages)`);
  });
  console.log('');

  // 5. Combined Analysis: Role Position vs PAD Intensity
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('5️⃣  POSITION × PAD INTENSITY CORRELATION\n');

  // Group by quadrant and analyze PAD
  const quadrants = {
    'SW (Functional + Structured)': [],
    'SE (Social + Structured)': [],
    'NW (Functional + Emergent)': [],
    'NE (Social + Emergent)': []
  };

  results.forEach(r => {
    if (r.position && r.padAnalysis) {
      const x = r.position.x;
      const y = r.position.y;
      let quadrant;
      
      if (x < 0.5 && y < 0.5) quadrant = 'SW (Functional + Structured)';
      else if (x >= 0.5 && y < 0.5) quadrant = 'SE (Social + Structured)';
      else if (x < 0.5 && y >= 0.5) quadrant = 'NW (Functional + Emergent)';
      else quadrant = 'NE (Social + Emergent)';
      
      quadrants[quadrant].push(r.padAnalysis.avg);
    }
  });

  Object.entries(quadrants).forEach(([quadrant, intensities]) => {
    if (intensities.length > 0) {
      const avg = intensities.reduce((a, b) => a + b, 0) / intensities.length;
      console.log(`  ${quadrant}:`);
      console.log(`    Conversations: ${intensities.length}`);
      console.log(`    Avg PAD Intensity: ${(avg * 100).toFixed(1)}%`);
      console.log(`    ${avg > 0.5 ? '→ Higher emotional intensity (more peaks)' : '→ Lower emotional intensity (more valleys)'}`);
      console.log('');
    }
  });

  // 6. Temporal Evolution
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('6️⃣  TEMPORAL EVOLUTION PATTERNS\n');

  const longConversations = results.filter(r => r.messageCount >= 20);
  console.log(`  Analyzing ${longConversations.length} long conversations (20+ messages):\n`);

  if (longConversations.length > 0) {
    const avgStartInt = longConversations.reduce((sum, r) => sum + r.padAnalysis.startIntensity, 0) / longConversations.length;
    const avgEndInt = longConversations.reduce((sum, r) => sum + r.padAnalysis.endIntensity, 0) / longConversations.length;
    const avgChange = longConversations.reduce((sum, r) => sum + r.padAnalysis.intensityChange, 0) / longConversations.length;

    console.log(`    Start Intensity (avg): ${(avgStartInt * 100).toFixed(1)}%`);
    console.log(`    End Intensity (avg): ${(avgEndInt * 100).toFixed(1)}%`);
    console.log(`    Average Change: ${(avgChange * 100).toFixed(1)}%`);
    console.log(`    ${avgChange > 0 ? '→ Conversations tend to end with higher intensity (more frustration)' : '→ Conversations tend to end with lower intensity (more affiliation)'}`);
    console.log('');
  }

  // 7. Key Findings
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('7️⃣  KEY FINDINGS\n');

  console.log('  ✓ Roles systematically determine 2D path position (X, Y)');
  console.log('  ✓ PAD emotional intensity directly controls Z-height (vertical elevation)');
  console.log('  ✓ Path = 3D trajectory through (role space X, role space Y, emotional Z)');
  console.log('  ✓ Each message creates a path point with role-based position + PAD height');
  console.log('  ✓ Longer conversations show more detailed trajectory patterns');
  console.log('  ✓ Path visualization reveals temporal evolution of roles + emotions\n');

  // Save detailed results
  const outputPath = path.join(__dirname, '..', 'reports', 'path-pad-deep-dive-analysis.json');
  try {
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, JSON.stringify(results, null, 2));
    console.log(`✅ Detailed analysis saved to: ${outputPath}`);
  } catch (err) {
    console.log(`⚠️  Could not save analysis file: ${err.message}`);
  }
}

async function main() {
  try {
    const results = await analyzeAllConversations();
    await generateDeepDiveReport(results);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

