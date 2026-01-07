#!/usr/bin/env node
/**
 * Debug script to verify role assignment in conversations
 * Checks if roles are correctly identified as human vs AI
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function checkConversation(filePath) {
  const conv = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const msgs = conv.messages || [];

  console.log(`\n=== ${path.basename(filePath)} ===`);
  console.log(`Total messages: ${msgs.length}`);

  // Identify roles
  const humanMsgs = msgs.filter(m => {
    const role = (m.role || '').toLowerCase();
    return role === 'user' || role === 'human';
  });
  const aiMsgs = msgs.filter(m => {
    const role = (m.role || '').toLowerCase();
    return role === 'assistant' || role === 'ai' || role === 'system';
  });

  console.log(`Human messages: ${humanMsgs.length}`);
  console.log(`AI messages: ${aiMsgs.length}`);

  // Check first few messages for role content
  console.log('\nFirst 6 messages:');
  msgs.slice(0, 6).forEach((m, i) => {
    const role = (m.role || '').toLowerCase();
    const isHuman = role === 'user' || role === 'human';
    const isAI = role === 'assistant' || role === 'ai' || role === 'system';
    const roleLabel = isHuman ? 'HUMAN' : isAI ? 'AI' : 'UNKNOWN';
    
    const content = m.content || '';
    const preview = content.substring(0, 70).replace(/\n/g, ' ');
    
    console.log(`  ${i + 1}. [${roleLabel.padEnd(6)}] [${m.role.padEnd(9)}] ${preview}...`);
  });

  // Check for potential role swaps (AI indicators in "user" messages)
  const aiIndicators = ['as an ai', 'i cannot', "i don't have", 'i am an ai', "i'm an ai", 'language model'];
  const humanIndicators = ['i feel', 'my mom', 'my dad', 'my sister', 'my brother', 'i used to', 'i remember'];

  console.log('\nPotential role issues:');
  humanMsgs.slice(0, 3).forEach((m, i) => {
    const content = (m.content || '').toLowerCase();
    const hasAiIndicator = aiIndicators.some(ind => content.includes(ind));
    if (hasAiIndicator) {
      console.log(`  ⚠️  Human message ${i + 1} contains AI indicator: "${m.content.substring(0, 60)}..."`);
    }
  });

  aiMsgs.slice(0, 3).forEach((m, i) => {
    const content = (m.content || '').toLowerCase();
    const hasHumanIndicator = humanIndicators.filter(ind => content.includes(ind)).length >= 2;
    if (hasHumanIndicator) {
      console.log(`  ⚠️  AI message ${i + 1} contains multiple human indicators: "${m.content.substring(0, 60)}..."`);
    }
  });

  // Calculate linguistic features for each group (simplified)
  const humanContent = humanMsgs.map(m => (m.content || '').toLowerCase()).join(' ');
  const aiContent = aiMsgs.map(m => (m.content || '').toLowerCase()).join(' ');

  const humanQuestions = (humanContent.match(/\?/g) || []).length;
  const aiQuestions = (aiContent.match(/\?/g) || []).length;
  const humanFormal = ['therefore', 'furthermore', 'however', 'consequently'].filter(w => humanContent.includes(w)).length;
  const aiFormal = ['therefore', 'furthermore', 'however', 'consequently'].filter(w => aiContent.includes(w)).length;

  console.log('\nLinguistic markers (simple):');
  console.log(`  Human: ${humanQuestions} questions, ${humanFormal} formal markers`);
  console.log(`  AI: ${aiQuestions} questions, ${aiFormal} formal markers`);

  return {
    humanCount: humanMsgs.length,
    aiCount: aiMsgs.length,
    totalMessages: msgs.length
  };
}

// Check the specific conversation
const filePath = process.argv[2] || 'public/output/chatbot_arena_0218.json';
if (fs.existsSync(filePath)) {
  checkConversation(filePath);
} else {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

