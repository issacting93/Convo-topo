const fs = require('fs');
const path = require('path');

const outputDir = './public/output';
const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.json'));

console.log('='.repeat(80));
console.log('COMPREHENSIVE DATA VERIFICATION');
console.log('='.repeat(80));
console.log(`\nTotal JSON files found: ${files.length}`);

// Track everything
const stats = {
  totalFiles: files.length,
  filesWithClassification: 0,
  filesWithRoles: 0,
  filesWithMessages: 0,
  humanRoles: {},
  aiRoles: {},
  rolePairs: {},
  humanRolesHighConf: {},
  aiRolesHighConf: {},
  rolePairsHighConf: {},
  filesHighConfidence: 0,
  messageCount: 0,
  conversationsWithClusters: 0,
  trajectoryVariance: []
};

files.forEach(file => {
  const data = JSON.parse(fs.readFileSync(path.join(outputDir, file), 'utf8'));

  // Count messages
  if (data.messages && data.messages.length > 0) {
    stats.filesWithMessages++;
    stats.messageCount += data.messages.length;
  }

  // Check classification
  if (data.classification) {
    stats.filesWithClassification++;

    const hr = data.classification.humanRole;
    const ar = data.classification.aiRole;

    if (hr && ar && hr.distribution && ar.distribution) {
      // Get dominant roles
      let topHuman = null, topHumanVal = 0;
      Object.entries(hr.distribution).forEach(([role, val]) => {
        if (val > topHumanVal) { topHuman = role; topHumanVal = val; }
      });

      let topAi = null, topAiVal = 0;
      Object.entries(ar.distribution).forEach(([role, val]) => {
        if (val > topAiVal) { topAi = role; topAiVal = val; }
      });

      if (topHuman && topAi) {
        stats.filesWithRoles++;

        // Full dataset counting
        stats.humanRoles[topHuman] = (stats.humanRoles[topHuman] || 0) + 1;
        stats.aiRoles[topAi] = (stats.aiRoles[topAi] || 0) + 1;

        const pairKey = `${topHuman}->${topAi}`;
        stats.rolePairs[pairKey] = (stats.rolePairs[pairKey] || 0) + 1;

        // High confidence subset (>0.3)
        if (topHumanVal > 0.3 && topAiVal > 0.3) {
          stats.filesHighConfidence++;
          stats.humanRolesHighConf[topHuman] = (stats.humanRolesHighConf[topHuman] || 0) + 1;
          stats.aiRolesHighConf[topAi] = (stats.aiRolesHighConf[topAi] || 0) + 1;
          stats.rolePairsHighConf[pairKey] = (stats.rolePairsHighConf[pairKey] || 0) + 1;
        }
      }
    }
  }

  // Check for cluster assignments
  if (data.cluster) {
    stats.conversationsWithClusters++;
  }
});

console.log('\n' + '='.repeat(80));
console.log('DATASET OVERVIEW');
console.log('='.repeat(80));
console.log(`Files with classification: ${stats.filesWithClassification}`);
console.log(`Files with identifiable roles: ${stats.filesWithRoles}`);
console.log(`Files with high confidence (>0.3): ${stats.filesHighConfidence}`);
console.log(`Files with messages: ${stats.filesWithMessages}`);
console.log(`Total messages: ${stats.messageCount}`);
console.log(`Average messages per conversation: ${(stats.messageCount / stats.filesWithMessages).toFixed(1)}`);
console.log(`Files with cluster assignments: ${stats.conversationsWithClusters}`);

console.log('\n' + '='.repeat(80));
console.log('FULL DATASET - HUMAN ROLES (n=' + stats.filesWithRoles + ')');
console.log('='.repeat(80));

const sortedHumanRoles = Object.entries(stats.humanRoles)
  .sort((a, b) => b[1] - a[1]);

sortedHumanRoles.forEach(([role, count]) => {
  const pct = (count / stats.filesWithRoles * 100).toFixed(1);
  console.log(`${role.padEnd(25)} ${count.toString().padStart(4)} (${pct.toString().padStart(5)}%)`);
});

// Calculate instrumental vs expressive
const instrumental = (stats.humanRoles['provider'] || 0) +
                    (stats.humanRoles['director'] || 0) +
                    (stats.humanRoles['information-seeker'] || 0) +
                    (stats.humanRoles['collaborator'] || 0);
const expressive = (stats.humanRoles['social-expressor'] || 0) +
                  (stats.humanRoles['relational-peer'] || 0);

console.log('\n' + '-'.repeat(80));
console.log(`INSTRUMENTAL (Provider/Director/Seeker/Collab): ${instrumental} (${(instrumental/stats.filesWithRoles*100).toFixed(1)}%)`);
console.log(`EXPRESSIVE (Social-Expressor/Relational-Peer): ${expressive} (${(expressive/stats.filesWithRoles*100).toFixed(1)}%)`);

console.log('\n' + '='.repeat(80));
console.log('FULL DATASET - AI ROLES (n=' + stats.filesWithRoles + ')');
console.log('='.repeat(80));

const sortedAiRoles = Object.entries(stats.aiRoles)
  .sort((a, b) => b[1] - a[1]);

sortedAiRoles.forEach(([role, count]) => {
  const pct = (count / stats.filesWithRoles * 100).toFixed(1);
  console.log(`${role.padEnd(25)} ${count.toString().padStart(4)} (${pct.toString().padStart(5)}%)`);
});

// Calculate expert/advisor vs facilitative
const expertAdvisor = (stats.aiRoles['expert-system'] || 0) +
                     (stats.aiRoles['advisor'] || 0);
const facilitative = (stats.aiRoles['learning-facilitator'] || 0) +
                    (stats.aiRoles['social-facilitator'] || 0) +
                    (stats.aiRoles['relational-peer'] || 0);

console.log('\n' + '-'.repeat(80));
console.log(`EXPERT/ADVISOR: ${expertAdvisor} (${(expertAdvisor/stats.filesWithRoles*100).toFixed(1)}%)`);
console.log(`FACILITATIVE (Learning/Social/Peer): ${facilitative} (${(facilitative/stats.filesWithRoles*100).toFixed(1)}%)`);

console.log('\n' + '='.repeat(80));
console.log('TOP 10 ROLE PAIRINGS (n=' + stats.filesWithRoles + ')');
console.log('='.repeat(80));

Object.entries(stats.rolePairs)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([pair, count]) => {
    const pct = (count / stats.filesWithRoles * 100).toFixed(1);
    console.log(`${pair.padEnd(50)} ${count.toString().padStart(4)} (${pct.toString().padStart(5)}%)`);
  });

console.log('\n' + '='.repeat(80));
console.log('HIGH CONFIDENCE SUBSET (n=' + stats.filesHighConfidence + ', confidence >0.3)');
console.log('='.repeat(80));

console.log('\nHuman Roles:');
Object.entries(stats.humanRolesHighConf)
  .sort((a, b) => b[1] - a[1])
  .forEach(([role, count]) => {
    const pct = (count / stats.filesHighConfidence * 100).toFixed(1);
    console.log(`${role.padEnd(25)} ${count.toString().padStart(4)} (${pct.toString().padStart(5)}%)`);
  });

console.log('\nAI Roles:');
Object.entries(stats.aiRolesHighConf)
  .sort((a, b) => b[1] - a[1])
  .forEach(([role, count]) => {
    const pct = (count / stats.filesHighConfidence * 100).toFixed(1);
    console.log(`${role.padEnd(25)} ${count.toString().padStart(4)} (${pct.toString().padStart(5)}%)`);
  });

console.log('\nTop 10 Pairings:');
Object.entries(stats.rolePairsHighConf)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .forEach(([pair, count]) => {
    const pct = (count / stats.filesHighConfidence * 100).toFixed(1);
    console.log(`${pair.padEnd(50)} ${count.toString().padStart(4)} (${pct.toString().padStart(5)}%)`);
  });

console.log('\n' + '='.repeat(80));
console.log('VERIFICATION SUMMARY');
console.log('='.repeat(80));
console.log('\nCLAIMS TO VERIFY:');
console.log(`✓ Total conversations: ${stats.filesWithRoles} (should be ~562 in reports)`);
console.log(`✓ Human instrumental: ${(instrumental/stats.filesWithRoles*100).toFixed(1)}% (claimed: 97%)`);
console.log(`✓ Human expressive: ${(expressive/stats.filesWithRoles*100).toFixed(1)}% (claimed: 3%)`);
console.log(`✓ AI Expert-System: ${((stats.aiRoles['expert-system']||0)/stats.filesWithRoles*100).toFixed(1)}% (claimed: 65%)`);
console.log(`✓ Provider role: ${((stats.humanRoles['provider']||0)/stats.filesWithRoles*100).toFixed(1)}% (claimed: 44.5%)`);
console.log(`✓ Director role: ${((stats.humanRoles['director']||0)/stats.filesWithRoles*100).toFixed(1)}% (claimed: 27.9%)`);
console.log(`✓ Information-Seeker: ${((stats.humanRoles['information-seeker']||0)/stats.filesWithRoles*100).toFixed(1)}% (claimed: 24.6%)`);

const topPair = Object.entries(stats.rolePairs).sort((a,b) => b[1]-a[1])[0];
console.log(`✓ Top pairing: ${topPair[0]} at ${(topPair[1]/stats.filesWithRoles*100).toFixed(1)}% (claimed: 33.1%)`);

console.log('\n' + '='.repeat(80));
