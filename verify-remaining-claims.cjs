const fs = require('fs');
const path = require('path');

const outputDir = './public/output';
const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.json'));

console.log('='.repeat(80));
console.log('VERIFYING REMAINING ABSTRACT CLAIMS');
console.log('='.repeat(80));

// Track different types of conversation completeness
const stats = {
  totalFiles: files.length,
  withMessages: 0,
  withClassification: 0,
  withRoles: 0,
  withTrajectory: 0,
  withCluster: 0,
  withFullAnalysis: 0,
  clusterValues: new Set(),
  trajectoryLengths: [],
  messageCounts: []
};

files.forEach(file => {
  const data = JSON.parse(fs.readFileSync(path.join(outputDir, file), 'utf8'));

  // Check what data exists
  if (data.messages && data.messages.length > 0) {
    stats.withMessages++;
    stats.messageCounts.push(data.messages.length);
  }

  if (data.classification) {
    stats.withClassification++;

    const hr = data.classification?.humanRole;
    const ar = data.classification?.aiRole;

    if (hr && ar && hr.distribution && ar.distribution) {
      stats.withRoles++;
    }
  }

  // Check for trajectory data
  if (data.trajectory || data.trajectoryPoints || data.coordinates) {
    stats.withTrajectory++;
    if (data.trajectory && Array.isArray(data.trajectory)) {
      stats.trajectoryLengths.push(data.trajectory.length);
    }
  }

  // Check for cluster assignments
  if (data.cluster !== undefined && data.cluster !== null) {
    stats.withCluster++;
    stats.clusterValues.add(data.cluster);
  }

  // Check if this conversation has "full analysis" (classification + trajectory + cluster)
  if (data.classification && (data.trajectory || data.coordinates) && data.cluster !== undefined) {
    stats.withFullAnalysis++;
  }
});

console.log('\n' + '='.repeat(80));
console.log('CONVERSATION DATA COMPLETENESS');
console.log('='.repeat(80));
console.log(`Total JSON files:              ${stats.totalFiles}`);
console.log(`With messages:                 ${stats.withMessages}`);
console.log(`With classification data:      ${stats.withClassification}`);
console.log(`With identifiable roles:       ${stats.withRoles}`);
console.log(`With trajectory data:          ${stats.withTrajectory}`);
console.log(`With cluster assignments:      ${stats.withCluster}`);
console.log(`With full analysis (all 3):    ${stats.withFullAnalysis}`);

console.log('\n' + '='.repeat(80));
console.log('ABSTRACT CLAIM VERIFICATION');
console.log('='.repeat(80));

// Claim 1: "494 analyzed conversations"
console.log('\nCLAIM 1: "494 analyzed conversations"');
console.log(`  Files with classification: ${stats.withClassification}`);
console.log(`  Files with trajectory:     ${stats.withTrajectory}`);
console.log(`  Files with full analysis:  ${stats.withFullAnalysis}`);
console.log(`  → Likely refers to: ${stats.withClassification} (or possibly ${stats.withTrajectory} if trajectory-based)`);
if (stats.withClassification === 494 || stats.withTrajectory === 494 || stats.withFullAnalysis === 494) {
  console.log('  ✓ VERIFIED (matches one metric)');
} else {
  console.log(`  ⚠ MISMATCH: Abstract says 494, but we have ${stats.withClassification} classified`);
}

// Claim 2: "7 relational positioning patterns"
console.log('\nCLAIM 2: "7 relational positioning patterns" (clusters)');
console.log(`  Unique cluster values: ${stats.clusterValues.size}`);
console.log(`  Cluster values: ${Array.from(stats.clusterValues).sort().join(', ') || 'NONE'}`);
console.log(`  Conversations with clusters: ${stats.withCluster}`);
if (stats.clusterValues.size === 7) {
  console.log('  ✓ VERIFIED');
} else if (stats.clusterValues.size === 0) {
  console.log('  ✗ NO CLUSTER DATA FOUND - clustering may not be in conversation JSON files');
  console.log('  → Check for separate cluster analysis files or database');
} else {
  console.log(`  ⚠ MISMATCH: Abstract says 7 clusters, found ${stats.clusterValues.size}`);
}

// Claim 3: Trajectory variance
console.log('\nCLAIM 3: "82x variance" in trajectory shape for identical role pairings');
console.log(`  Conversations with trajectory data: ${stats.withTrajectory}`);
if (stats.trajectoryLengths.length > 0) {
  const avgLength = stats.trajectoryLengths.reduce((a,b) => a+b, 0) / stats.trajectoryLengths.length;
  const maxLength = Math.max(...stats.trajectoryLengths);
  const minLength = Math.min(...stats.trajectoryLengths);
  console.log(`  Average trajectory length: ${avgLength.toFixed(1)} points`);
  console.log(`  Min/Max trajectory length: ${minLength} / ${maxLength}`);
  console.log('  → Cannot verify "82x variance" without pair-wise trajectory comparison');
  console.log('  → This metric likely comes from separate statistical analysis');
} else {
  console.log('  ✗ NO TRAJECTORY DATA in conversation files');
}

// Claim 4: "82.7% trajectory features drive cluster separation"
console.log('\nCLAIM 4: "82.7% trajectory features drive cluster separation"');
console.log('  → This is a statistical claim from dimensionality reduction (e.g., PCA, t-SNE)');
console.log('  → Not stored in individual conversation files');
console.log('  → Check for cluster_analysis.json or similar analysis output files');

// Look for analysis files
console.log('\n' + '='.repeat(80));
console.log('SEARCHING FOR ANALYSIS OUTPUT FILES');
console.log('='.repeat(80));

const possibleFiles = [
  './cluster_analysis.json',
  './clustering_results.json',
  './trajectory_analysis.json',
  './public/cluster_results.json',
  './analysis/clustering.json',
  './reports/cluster_analysis.json'
];

let foundAnalysisFile = false;
possibleFiles.forEach(filepath => {
  if (fs.existsSync(filepath)) {
    console.log(`✓ Found: ${filepath}`);
    foundAnalysisFile = true;
    try {
      const analysisData = JSON.parse(fs.readFileSync(filepath, 'utf8'));
      console.log(`  Keys: ${Object.keys(analysisData).join(', ')}`);
    } catch (e) {
      console.log(`  (Could not parse JSON)`);
    }
  }
});

if (!foundAnalysisFile) {
  console.log('✗ No cluster analysis files found in expected locations');
  console.log('→ The "7 patterns" and "82.7%" claims may be from manual analysis or separate pipeline');
}

console.log('\n' + '='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
console.log('\n✓ VERIFIED CLAIMS:');
console.log('  • Role network data (97% instrumental, 3% expressive, 65% Expert-System)');
console.log('  • Top pairings (Provider→Expert-System 33.1%)');
console.log('  • Total conversations with roles: 562');

console.log('\n⚠ NEEDS INVESTIGATION:');
console.log('  • "494 analyzed conversations" vs 562 with roles - which metric?');
console.log('  • "7 relational positioning patterns" - no cluster data in conversation files');
console.log('  • "82.7% trajectory features" - not in conversation files, likely from PCA/analysis');
console.log('  • "82x variance" - requires pair-wise trajectory comparison');

console.log('\n✗ POTENTIAL ISSUES:');
if (stats.withCluster === 0) {
  console.log('  • Zero conversations have cluster assignments in current data');
  console.log('  • The clustering claims may be from a different analysis version');
}

console.log('\n' + '='.repeat(80));
