import fs from 'fs';

// Migrate personaChatMessages.json from old field names to new ones
const inputPath = './src/data/personaChatMessages.json';
const outputPath = './src/data/personaChatMessages.json';

console.log('Migrating data from tension/delegation to communicationFunction/conversationStructure...');

try {
  const data = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
  
  let migratedCount = 0;
  
  // Migrate conversations
  if (data.conversations) {
    data.conversations.forEach(conv => {
      if (conv.messages) {
        conv.messages.forEach(msg => {
          if ('tension' in msg) {
            msg.communicationFunction = msg.tension;
            delete msg.tension;
            migratedCount++;
          }
          if ('delegation' in msg) {
            msg.conversationStructure = msg.delegation;
            delete msg.delegation;
            migratedCount++;
          }
        });
      }
    });
  }
  
  // Migrate messages array
  if (data.messages) {
    data.messages.forEach(msg => {
      if ('tension' in msg) {
        msg.communicationFunction = msg.tension;
        delete msg.tension;
        migratedCount++;
      }
      if ('delegation' in msg) {
        msg.conversationStructure = msg.delegation;
        delete msg.delegation;
        migratedCount++;
      }
    });
  }
  
  // Write migrated data
  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
  
  console.log(`✅ Migration complete! Updated ${migratedCount} message objects.`);
  console.log(`   - Renamed 'tension' → 'communicationFunction'`);
  console.log(`   - Renamed 'delegation' → 'conversationStructure'`);
  
} catch (error) {
  console.error('❌ Migration failed:', error.message);
  process.exit(1);
}

