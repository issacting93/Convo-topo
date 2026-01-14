const fs = require('fs');
const path = require('path');

const outputDir = './public/output';
const files = fs.readdirSync(outputDir).filter(f => f.endsWith('.json') && f !== 'manifest.json');

console.log('Total JSON files:', files.length);

let stats = {
  valid: 0,
  noClassification: 0,
  incompletePAD: 0,
  noMessages: 0,
  oldTaxonomy: 0,
  newTaxonomy: 0,
  invalidRoleSum: 0,
  parseError: 0
};

const issueFiles = {
  incompletePAD: [],
  noClassification: [],
  oldTaxonomy: []
};

files.forEach(file => {
  try {
    const data = JSON.parse(fs.readFileSync(path.join(outputDir, file), 'utf8'));

    // Check messages
    if (!data.messages || data.messages.length === 0) {
      stats.noMessages++;
      return;
    }

    // Check classification
    if (!data.classification) {
      stats.noClassification++;
      issueFiles.noClassification.push(file);
      return;
    }

    // Check PAD coverage
    const messagesWithPAD = data.messages.filter(m => m.pad && m.pad.emotionalIntensity !== undefined).length;
    if (messagesWithPAD < data.messages.length) {
      stats.incompletePAD++;
      issueFiles.incompletePAD.push(file);
      return;
    }

    // Check taxonomy
    const humanRole = data.classification.humanRole;
    const aiRole = data.classification.aiRole;

    if (!humanRole || !aiRole || !humanRole.distribution || !aiRole.distribution) {
      stats.oldTaxonomy++;
      issueFiles.oldTaxonomy.push(file);
      return;
    }

    // Check if it's new taxonomy
    const humanRoles = Object.keys(humanRole.distribution);
    const hasNewTaxonomyRoles = humanRoles.some(r =>
      ['information-seeker', 'provider', 'social-expressor', 'relational-peer'].includes(r)
    );

    if (hasNewTaxonomyRoles) {
      stats.newTaxonomy++;
    } else {
      stats.oldTaxonomy++;
      issueFiles.oldTaxonomy.push(file);
      return;
    }

    // Check role distribution sums
    const humanSum = Object.values(humanRole.distribution).reduce((a, b) => a + b, 0);
    const aiSum = Object.values(aiRole.distribution).reduce((a, b) => a + b, 0);

    if (Math.abs(humanSum - 1.0) > 0.1 || Math.abs(aiSum - 1.0) > 0.1) {
      stats.invalidRoleSum++;
      return;
    }

    stats.valid++;

  } catch (e) {
    stats.parseError++;
  }
});

console.log('\n=== VALIDATION RESULTS ===');
console.log('Valid conversations (pass all checks):', stats.valid);
console.log('\n=== ISSUES BREAKDOWN ===');
console.log('- No classification:', stats.noClassification);
console.log('- Incomplete PAD coverage:', stats.incompletePAD);
console.log('- No messages:', stats.noMessages);
console.log('- Old taxonomy (needs update):', stats.oldTaxonomy);
console.log('- Invalid role sum:', stats.invalidRoleSum);
console.log('- Parse errors:', stats.parseError);
console.log('\nTotal with issues:', files.length - stats.valid);

console.log('\n=== COMPARISON TO DOCUMENTED 345 ===');
console.log('Documented validated corpus: 345');
console.log('Actual valid conversations: ' + stats.valid);
console.log('Difference: ' + Math.abs(345 - stats.valid));

if (stats.valid > 345) {
  console.log('\nNote: More conversations are valid now (' + stats.valid + ') than documented validated corpus (345).');
  console.log('The 345 likely represents an earlier snapshot when cluster analysis was performed.');
}

console.log('\n=== SAMPLE ISSUES (first 5 of each type) ===');
if (issueFiles.incompletePAD.length > 0) {
  console.log('\nIncomplete PAD (first 5):');
  issueFiles.incompletePAD.slice(0, 5).forEach(f => console.log('  -', f));
}
if (issueFiles.noClassification.length > 0) {
  console.log('\nNo classification (first 5):');
  issueFiles.noClassification.slice(0, 5).forEach(f => console.log('  -', f));
}
if (issueFiles.oldTaxonomy.length > 0) {
  console.log('\nOld taxonomy (first 5):');
  issueFiles.oldTaxonomy.slice(0, 5).forEach(f => console.log('  -', f));
}
