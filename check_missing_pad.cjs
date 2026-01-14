const fs = require('fs');
const path = require('path');

// Check one of the incomplete PAD files to see what's missing
const testFiles = [
  './public/output/wildchat_001e1a4dd4c924f778c40054e19b0be6.json',
  './public/output/chatbot_arena_11.json'
];

testFiles.forEach(file => {
  if (!fs.existsSync(file)) {
    console.log('File not found:', file);
    return;
  }

  const data = JSON.parse(fs.readFileSync(file, 'utf8'));

  console.log('\n===================');
  console.log('File:', path.basename(file));
  console.log('Total messages:', data.messages.length);
  console.log('\nChecking PAD coverage:');

  let missingCount = 0;
  let hasPartialPAD = 0;

  data.messages.forEach((m, i) => {
    const hasPAD = m.pad && m.pad.emotionalIntensity !== undefined;

    if (!hasPAD) {
      missingCount++;
      console.log('Message', i, '(' + m.role + '):', '✗ MISSING PAD');

      if (m.pad) {
        hasPartialPAD++;
        console.log('  - PAD object exists but incomplete:', JSON.stringify(m.pad));
      } else {
        console.log('  - No PAD object at all');
      }

      // Show first few words of content
      const preview = m.content ? m.content.substring(0, 60) + '...' : '(no content)';
      console.log('  - Content preview:', preview);
    }
  });

  console.log('\nSummary:');
  console.log('- Messages with PAD:', data.messages.length - missingCount);
  console.log('- Messages missing PAD:', missingCount);
  console.log('- Has partial PAD object:', hasPartialPAD);
});
