// Analyze conversation characteristics to estimate tension and delegation
function analyzeMessage(content, role, historyLength) {
  // Tension: 0 = functional (factual, task-oriented), 1 = social (emotional, relational)
  // Heuristics:
  // - Questions, commands, factual statements = lower tension (functional)
  // - Emotional language, personal sharing, social bonding = higher tension (social)
  
  const lowerContent = content.toLowerCase();
  const functionalIndicators = ['what', 'how', 'when', 'where', 'why', 'can you', 'do you', 'tell me', 'explain', 'help', 'need', 'want to'];
  const socialIndicators = ['love', 'like', 'enjoy', 'feel', 'happy', 'excited', 'wonderful', 'nice', 'great', 'awesome', 'sorry', 'hope', 'wish'];
  
  let functionalCount = functionalIndicators.filter(ind => lowerContent.includes(ind)).length;
  let socialCount = socialIndicators.filter(ind => lowerContent.includes(ind)).length;
  
  // Base tension on indicators and message length (shorter = more functional typically)
  let tension = 0.3; // Default to slightly functional
  if (socialCount > functionalCount) {
    tension = 0.4 + (socialCount * 0.1);
  } else if (functionalCount > socialCount) {
    tension = 0.2 + (functionalCount * 0.05);
  }
  tension = Math.min(0.9, Math.max(0.1, tension));
  
  // Delegation: 0 = emergent (spontaneous, open-ended), 1 = prescribed (directive, structured)
  // Heuristics:
  // - Questions, open-ended responses = lower delegation (emergent)
  // - Statements, answers, commands = higher delegation (prescribed)
  
  const isQuestion = content.trim().endsWith('?');
  const isCommand = lowerContent.startsWith('do') || lowerContent.startsWith('tell') || lowerContent.startsWith('help');
  const isStatement = !isQuestion && content.length > 20;
  
  let delegation = 0.5; // Default to middle
  if (isQuestion) {
    delegation = 0.3 + (historyLength * 0.05); // Questions are more emergent, but less so in longer conversations
  } else if (isCommand) {
    delegation = 0.7; // Commands are prescribed
  } else if (isStatement) {
    delegation = 0.5 + (historyLength * 0.03); // Statements become more prescribed in longer conversations
  }
  delegation = Math.min(0.9, Math.max(0.1, delegation));
  
  return { tension, delegation };
}

async function fetchAndProcessConversations() {
  try {
    console.log('Loading persona-chat dataset...');
    const { loadDataset } = await import('datasets/node');
    const dataset = await loadDataset('AlekseyKorshuk/persona-chat', {
      split: 'train',
      streaming: false,
    });
    
    console.log('Processing conversations...');
    const processedConversations = [];
    let count = 0;
    const maxConversations = 10; // Fetch 10 conversations
    
    for await (const example of dataset) {
      if (count >= maxConversations) break;
      
      try {
        const personality = example['personality sequence'] || [];
        const utterances = example['utterances list'] || [];
        
        // Process each conversation turn
        for (const utterance of utterances) {
          const history = utterance.history || [];
          const candidates = utterance.candidates || [];
          
          // Create messages from history (alternating user/assistant)
          const conversationMessages = [];
          
          // First message from history is typically the initial greeting
          history.forEach((msg, idx) => {
            const role = idx % 2 === 0 ? 'user' : 'assistant';
            const analysis = analyzeMessage(msg, role, history.length);
            conversationMessages.push({
              role,
              content: msg,
              tension: analysis.tension,
              delegation: analysis.delegation
            });
          });
          
          // Add first candidate as assistant response
          if (candidates.length > 0) {
            const candidate = candidates[0];
            const analysis = analyzeMessage(candidate, 'assistant', history.length + 1);
            conversationMessages.push({
              role: 'assistant',
              content: candidate,
              tension: analysis.tension,
              delegation: analysis.delegation
            });
          }
          
          if (conversationMessages.length > 0) {
            processedConversations.push({
              personality,
              messages: conversationMessages,
              fullHistory: history,
              candidates: candidates.slice(0, 3) // Keep first 3 candidates
            });
          }
        }
        
        count++;
      } catch (err) {
        console.error(`Error processing conversation ${count}:`, err.message);
      }
    }
    
    console.log(`Processed ${processedConversations.length} conversation segments from ${count} examples`);
    
    // Flatten messages from all conversations
    const allMessages = [];
    processedConversations.forEach((conv, convIdx) => {
      conv.messages.forEach((msg, msgIdx) => {
        allMessages.push({
          ...msg,
          conversationId: convIdx,
          messageIndex: msgIdx
        });
      });
    });
    
    return {
      conversations: processedConversations,
      messages: allMessages
    };
    
  } catch (error) {
    console.error('Error fetching dataset:', error);
    throw error;
  }
}

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith('fetchConversations.js')) {
  const fs = await import('fs');
  fetchAndProcessConversations()
    .then(result => {
      console.log('\n=== Summary ===');
      console.log(`Total conversations: ${result.conversations.length}`);
      console.log(`Total messages: ${result.messages.length}`);
      console.log('\n=== First Conversation ===');
      if (result.conversations[0]) {
        console.log('Personality:', result.conversations[0].personality);
        console.log('Messages:');
        result.conversations[0].messages.forEach((msg, idx) => {
          console.log(`  [${msg.role}] ${msg.content.substring(0, 60)}...`);
          console.log(`    tension: ${msg.tension.toFixed(2)}, delegation: ${msg.delegation.toFixed(2)}`);
        });
      }
      
      // Write to file
      const outputPath = './src/data/personaChatMessages.json';
      fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
      console.log(`\n✅ Saved to ${outputPath}`);
    })
    .catch(err => {
      console.error('Failed:', err);
      process.exit(1);
    });
}

export { fetchAndProcessConversations, analyzeMessage };

