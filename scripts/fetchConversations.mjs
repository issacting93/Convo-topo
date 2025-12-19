import fs from 'fs';

// Analyze conversation characteristics to estimate communication function and conversation structure
function analyzeMessage(content, role, historyLength) {
  // Communication Function: 0 = functional/referential (task-oriented), 1 = social/phatic (relational)
  // Heuristics:
  // - Questions, commands, factual statements = lower communicationFunction (instrumental)
  // - Emotional language, personal sharing, social bonding = higher communicationFunction (expressive)
  
  const lowerContent = content.toLowerCase();
  const instrumentalIndicators = ['what', 'how', 'when', 'where', 'why', 'can you', 'do you', 'tell me', 'explain', 'help', 'need', 'want to'];
  const expressiveIndicators = ['love', 'like', 'enjoy', 'feel', 'happy', 'excited', 'wonderful', 'nice', 'great', 'awesome', 'sorry', 'hope', 'wish'];
  
  let instrumentalCount = instrumentalIndicators.filter(ind => lowerContent.includes(ind)).length;
  let expressiveCount = expressiveIndicators.filter(ind => lowerContent.includes(ind)).length;
  
  // Base communication function on indicators and message length (shorter = more instrumental typically)
  let communicationFunction = 0.3; // Default to slightly instrumental
  if (expressiveCount > instrumentalCount) {
    communicationFunction = 0.4 + (expressiveCount * 0.1);
  } else if (instrumentalCount > expressiveCount) {
    communicationFunction = 0.2 + (instrumentalCount * 0.05);
  }
  communicationFunction = Math.min(0.9, Math.max(0.1, communicationFunction));
  
  // Conversation Structure: 0 = structured/prescribed (directive, rule-governed), 1 = emergent/exploratory (spontaneous, open-ended)
  // Heuristics:
  // - Questions, open-ended responses = higher conversationStructure (emergent)
  // - Statements, answers, commands = lower conversationStructure (structured)
  
  const isQuestion = content.trim().endsWith('?');
  const isCommand = lowerContent.startsWith('do') || lowerContent.startsWith('tell') || lowerContent.startsWith('help');
  const isStatement = !isQuestion && content.length > 20;
  
  let conversationStructure = 0.5; // Default to middle
  if (isQuestion) {
    conversationStructure = 0.7 - (historyLength * 0.05); // Questions are more emergent, but less so in longer conversations
  } else if (isCommand) {
    conversationStructure = 0.3; // Commands are structured
  } else if (isStatement) {
    conversationStructure = 0.5 - (historyLength * 0.03); // Statements become more structured in longer conversations
  }
  conversationStructure = Math.min(0.9, Math.max(0.1, conversationStructure));
  
  return { communicationFunction, conversationStructure };
}

async function fetchAndProcessConversations() {
  try {
    console.log('Fetching persona-chat dataset from Hugging Face API...');
    
    // Fetch data from Hugging Face API
    const response = await fetch('https://datasets-server.huggingface.co/rows?dataset=AlekseyKorshuk%2Fpersona-chat&config=default&split=train&offset=0&length=50');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const rows = data.rows || [];
    
    console.log(`Fetched ${rows.length} examples from API`);
    console.log('Processing conversations...');
    
    const processedConversations = [];
    const maxConversations = Math.min(20, rows.length);
    
    for (let i = 0; i < maxConversations; i++) {
      const row = rows[i];
      const example = row.row || row;
      try {
        const personality = example.personality || [];
        const utterances = example.utterances || [];
        
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
              communicationFunction: analysis.communicationFunction,
              conversationStructure: analysis.conversationStructure
            });
          });
          
          // Add first candidate as assistant response
          if (candidates.length > 0) {
            const candidate = candidates[0];
            const analysis = analyzeMessage(candidate, 'assistant', history.length + 1);
            conversationMessages.push({
              role: 'assistant',
              content: candidate,
              communicationFunction: analysis.communicationFunction,
              conversationStructure: analysis.conversationStructure
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
        
        if (i % 5 === 0 && i > 0) {
          console.log(`Processed ${i} examples...`);
        }
      } catch (err) {
        console.error(`Error processing conversation ${i}:`, err.message);
      }
    }
    
    console.log(`Processed ${processedConversations.length} conversation segments from ${maxConversations} examples`);
    
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

// Run the script
fetchAndProcessConversations()
  .then(result => {
    console.log('\n=== Summary ===');
    console.log(`Total conversations: ${result.conversations.length}`);
    console.log(`Total messages: ${result.messages.length}`);
    console.log('\n=== First Conversation ===');
    if (result.conversations[0]) {
      console.log('Personality:', result.conversations[0].personality.join(', '));
      console.log('Messages:');
      result.conversations[0].messages.slice(0, 5).forEach((msg, idx) => {
        const preview = msg.content.length > 60 ? msg.content.substring(0, 60) + '...' : msg.content;
        console.log(`  [${msg.role}] ${preview}`);
        console.log(`    tension: ${msg.tension.toFixed(2)}, delegation: ${msg.delegation.toFixed(2)}`);
      });
    }
    
    // Write to file
    const outputPath = './src/data/personaChatMessages.json';
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
    console.log(`\n✅ Saved to ${outputPath}`);
    console.log(`\nYou can now import these messages in your app!`);
  })
  .catch(err => {
    console.error('Failed:', err);
    process.exit(1);
  });

