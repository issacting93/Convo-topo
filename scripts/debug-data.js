// Debug script to verify data loading
import { readFileSync } from 'fs';
const personaChatData = JSON.parse(
  readFileSync(new URL('../src/data/personaChatMessages.json', import.meta.url), 'utf-8')
);

console.log('=== DATA DEBUG REPORT ===\n');

// Check conversations
console.log('Conversations in JSON:', personaChatData.conversations ? personaChatData.conversations.length : 0);
console.log('Has messages property:', 'messages' in personaChatData);

if (personaChatData.conversations && personaChatData.conversations.length > 0) {
  const firstConv = personaChatData.conversations[0];
  console.log('\nFirst conversation structure:');
  console.log('  - personality:', firstConv.personality ? firstConv.personality.length : 0, 'items');
  console.log('  - messages:', firstConv.messages ? firstConv.messages.length : 0, 'messages');
  console.log('  - fullHistory:', firstConv.fullHistory ? firstConv.fullHistory.length : 0, 'items');
  console.log('  - candidates:', firstConv.candidates ? firstConv.candidates.length : 0, 'items');

  if (firstConv.messages && firstConv.messages.length > 0) {
    const firstMsg = firstConv.messages[0];
    console.log('\nFirst message structure:');
    console.log('  - role:', firstMsg.role);
    console.log('  - content:', firstMsg.content ? firstMsg.content.substring(0, 50) + '...' : 'N/A');
    console.log('  - communicationFunction:', firstMsg.communicationFunction);
    console.log('  - conversationStructure:', firstMsg.conversationStructure);
  }
}

// Calculate total messages
const totalMessages = personaChatData.conversations
  ? personaChatData.conversations.reduce((sum, conv) => sum + (conv.messages?.length || 0), 0)
  : 0;

console.log('\nTotal messages across all conversations:', totalMessages);

// Check for missing fields
const firstConv = personaChatData.conversations?.[0];
const firstMsg = firstConv?.messages?.[0];

console.log('\n=== VALIDATION ===');
console.log('✓ Has conversations:', !!personaChatData.conversations);
console.log('✓ First conv has messages:', !!firstConv?.messages);
console.log('✓ First msg has role:', !!firstMsg?.role);
console.log('✓ First msg has content:', !!firstMsg?.content);
console.log('✓ First msg has communicationFunction:', typeof firstMsg?.communicationFunction === 'number');
console.log('✓ First msg has conversationStructure:', typeof firstMsg?.conversationStructure === 'number');

console.log('\n=== END DEBUG REPORT ===');
