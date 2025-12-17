import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface Message {
  role: 'user' | 'assistant';
  content: string;
  communicationFunction: number;
  conversationStructure: number;
}

interface Conversation {
  personality: string[];
  messages: Message[];
  fullHistory: string[];
  candidates: string[];
  metadata?: RoleMetadata;
}

interface RoleMetadata {
  // Interaction dynamics
  interactionPattern: 'collaborative' | 'advisory' | 'storytelling' | 'question-answer' | 'casual-chat' | 'debate';
  powerDynamics: 'human-led' | 'ai-led' | 'balanced' | 'alternating';

  // Communication style
  emotionalTone: 'supportive' | 'neutral' | 'playful' | 'serious' | 'empathetic' | 'professional';
  engagementStyle: 'questioning' | 'affirming' | 'challenging' | 'exploring' | 'reactive';

  // Content characteristics
  knowledgeExchange: 'personal-sharing' | 'skill-sharing' | 'opinion-exchange' | 'factual-info' | 'experience-sharing';
  conversationPurpose: 'relationship-building' | 'information-seeking' | 'entertainment' | 'problem-solving' | 'self-expression';

  // Depth metrics
  topicDepth: 'surface' | 'moderate' | 'deep';
  turnTaking: 'balanced' | 'user-dominant' | 'assistant-dominant';

  // Role characteristics
  humanRole: 'seeker' | 'learner' | 'director' | 'collaborator' | 'sharer' | 'challenger';
  aiRole: 'expert' | 'advisor' | 'facilitator' | 'reflector' | 'peer' | 'affiliative';
}

function analyzeInteractionPattern(messages: Message[]): RoleMetadata['interactionPattern'] {
  const questionCount = messages.filter(m => m.content.includes('?')).length;
  const avgCF = messages.reduce((sum, m) => sum + m.communicationFunction, 0) / messages.length;
  const avgCS = messages.reduce((sum, m) => sum + m.conversationStructure, 0) / messages.length;

  if (questionCount >= messages.length * 0.6) return 'question-answer';
  if (avgCF > 0.5 && avgCS > 0.6) return 'storytelling';
  if (avgCF < 0.35 && avgCS < 0.5) return 'advisory';
  if (avgCF > 0.45 && avgCS < 0.5) return 'debate';
  if (avgCS > 0.65) return 'collaborative';
  return 'casual-chat';
}

function analyzePowerDynamics(messages: Message[]): RoleMetadata['powerDynamics'] {
  const userMessages = messages.filter(m => m.role === 'user');
  const aiMessages = messages.filter(m => m.role === 'assistant');

  const userAvgLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length;
  const aiAvgLength = aiMessages.reduce((sum, m) => sum + m.content.length, 0) / aiMessages.length;

  const userQuestions = userMessages.filter(m => m.content.includes('?')).length;
  const aiQuestions = aiMessages.filter(m => m.content.includes('?')).length;

  const ratio = userAvgLength / aiAvgLength;

  if (userQuestions > aiQuestions * 2) return 'human-led';
  if (aiQuestions > userQuestions * 2) return 'ai-led';
  if (ratio > 1.3 || ratio < 0.7) return 'alternating';
  return 'balanced';
}

function analyzeEmotionalTone(messages: Message[]): RoleMetadata['emotionalTone'] {
  const content = messages.map(m => m.content.toLowerCase()).join(' ');

  const supportiveWords = /(good|great|wonderful|help|support|care|love|hope|wish|nice)/g;
  const playfulWords = /(lol|haha|fun|cool|awesome|neat|wow)/g;
  const seriousWords = /(important|serious|concern|worry|problem|issue|difficult)/g;
  const empatheticWords = /(understand|feel|sorry|empathize|relate|know how)/g;
  const professionalWords = /(work|job|career|business|professional|company)/g;

  const supportiveCount = (content.match(supportiveWords) || []).length;
  const playfulCount = (content.match(playfulWords) || []).length;
  const seriousCount = (content.match(seriousWords) || []).length;
  const empatheticCount = (content.match(empatheticWords) || []).length;
  const professionalCount = (content.match(professionalWords) || []).length;

  const scores = {
    supportive: supportiveCount,
    playful: playfulCount,
    serious: seriousCount,
    empathetic: empatheticCount,
    professional: professionalCount,
    neutral: 0
  };

  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return 'neutral';

  return Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as RoleMetadata['emotionalTone'] || 'neutral';
}

function analyzeEngagementStyle(messages: Message[]): RoleMetadata['engagementStyle'] {
  const questionCount = messages.filter(m => m.content.includes('?')).length;
  const questionRatio = questionCount / messages.length;

  const content = messages.map(m => m.content.toLowerCase()).join(' ');
  const affirmingWords = /(yes|yeah|right|exactly|agree|sure|definitely|absolutely)/g;
  const challengingWords = /(but|however|although|actually|disagree|wrong|no)/g;
  const exploringWords = /(maybe|perhaps|could|might|wonder|think|consider|interesting)/g;

  const affirmingCount = (content.match(affirmingWords) || []).length;
  const challengingCount = (content.match(challengingWords) || []).length;
  const exploringCount = (content.match(exploringWords) || []).length;

  if (questionRatio > 0.4) return 'questioning';
  if (challengingCount > affirmingCount && challengingCount > exploringCount) return 'challenging';
  if (exploringCount > affirmingCount && exploringCount > challengingCount) return 'exploring';
  if (affirmingCount > 3) return 'affirming';
  return 'reactive';
}

function analyzeKnowledgeExchange(messages: Message[]): RoleMetadata['knowledgeExchange'] {
  const content = messages.map(m => m.content.toLowerCase()).join(' ');

  const personalWords = /(i|me|my|myself|mine)/g;
  const skillWords = /(how to|learn|teach|show|practice|skill|technique)/g;
  const opinionWords = /(think|believe|opinion|feel|view|perspective)/g;
  const factualWords = /(is|are|was|were|fact|data|number|percent)/g;

  const personalCount = (content.match(personalWords) || []).length;
  const skillCount = (content.match(skillWords) || []).length;
  const opinionCount = (content.match(opinionWords) || []).length;
  const factualCount = (content.match(factualWords) || []).length;

  const scores = {
    'personal-sharing': personalCount,
    'skill-sharing': skillCount,
    'opinion-exchange': opinionCount,
    'factual-info': factualCount,
    'experience-sharing': personalCount * 0.8 + skillCount * 0.5
  };

  const maxScore = Math.max(...Object.values(scores));
  return Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as RoleMetadata['knowledgeExchange'] || 'personal-sharing';
}

function analyzeConversationPurpose(messages: Message[], pattern: RoleMetadata['interactionPattern']): RoleMetadata['conversationPurpose'] {
  const content = messages.map(m => m.content.toLowerCase()).join(' ');

  const relationshipWords = /(friend|like|love|enjoy|share|together|connect)/g;
  const infoSeekingWords = /(what|how|why|when|where|who|tell me|explain)/g;
  const entertainmentWords = /(fun|play|game|joke|laugh|story|interesting)/g;
  const problemSolvingWords = /(help|solve|fix|issue|problem|solution|advice)/g;

  const relationshipCount = (content.match(relationshipWords) || []).length;
  const infoSeekingCount = (content.match(infoSeekingWords) || []).length;
  const entertainmentCount = (content.match(entertainmentWords) || []).length;
  const problemSolvingCount = (content.match(problemSolvingWords) || []).length;

  if (pattern === 'storytelling') return 'entertainment';
  if (pattern === 'question-answer') return 'information-seeking';
  if (pattern === 'advisory') return 'problem-solving';

  const scores = {
    'relationship-building': relationshipCount,
    'information-seeking': infoSeekingCount,
    'entertainment': entertainmentCount,
    'problem-solving': problemSolvingCount,
    'self-expression': relationshipCount * 0.7
  };

  const maxScore = Math.max(...Object.values(scores));
  if (maxScore === 0) return 'self-expression';

  return Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as RoleMetadata['conversationPurpose'] || 'self-expression';
}

function analyzeTopicDepth(messages: Message[]): RoleMetadata['topicDepth'] {
  if (messages.length <= 2) return 'surface';
  if (messages.length >= 6) return 'deep';

  const avgLength = messages.reduce((sum, m) => sum + m.content.length, 0) / messages.length;
  const avgCS = messages.reduce((sum, m) => sum + m.conversationStructure, 0) / messages.length;

  if (avgLength > 60 && avgCS > 0.6) return 'deep';
  if (avgLength < 40 && avgCS < 0.5) return 'surface';
  return 'moderate';
}

function analyzeTurnTaking(messages: Message[]): RoleMetadata['turnTaking'] {
  const userMessages = messages.filter(m => m.role === 'user');
  const aiMessages = messages.filter(m => m.role === 'assistant');

  const userAvgLength = userMessages.reduce((sum, m) => sum + m.content.length, 0) / userMessages.length;
  const aiAvgLength = aiMessages.reduce((sum, m) => sum + m.content.length, 0) / aiMessages.length;

  const ratio = userAvgLength / aiAvgLength;

  if (ratio > 1.4) return 'user-dominant';
  if (ratio < 0.7) return 'assistant-dominant';
  return 'balanced';
}

function analyzeHumanRole(messages: Message[], purpose: RoleMetadata['conversationPurpose']): RoleMetadata['humanRole'] {
  const userMessages = messages.filter(m => m.role === 'user');
  const questionCount = userMessages.filter(m => m.content.includes('?')).length;
  const questionRatio = questionCount / userMessages.length;

  const firstMessage = messages[0];
  const userInitiates = firstMessage?.role === 'user';

  if (purpose === 'information-seeking') return 'seeker';
  if (purpose === 'self-expression' || purpose === 'relationship-building') return 'sharer';
  if (questionRatio > 0.5) return 'learner';
  if (userInitiates && questionRatio < 0.3) return 'initiator';
  if (!userInitiates) return 'responder';
  return 'collaborator';
}

function analyzeAIRole(messages: Message[], purpose: RoleMetadata['conversationPurpose'], humanRole: RoleMetadata['humanRole']): RoleMetadata['aiRole'] {
  const aiMessages = messages.filter(m => m.role === 'assistant');
  const questionCount = aiMessages.filter(m => m.content.includes('?')).length;
  const questionRatio = questionCount / aiMessages.length;

  if (purpose === 'problem-solving') return 'advisor';
  if (humanRole === 'sharer' && questionRatio > 0.3) return 'listener';
  if (humanRole === 'seeker') return 'expert';
  if (questionRatio > 0.4) return 'facilitator';
  if (purpose === 'relationship-building') return 'companion';
  return 'peer';
}

function addMetadataToConversation(conv: Conversation): Conversation {
  const interactionPattern = analyzeInteractionPattern(conv.messages);
  const powerDynamics = analyzePowerDynamics(conv.messages);
  const emotionalTone = analyzeEmotionalTone(conv.messages);
  const engagementStyle = analyzeEngagementStyle(conv.messages);
  const knowledgeExchange = analyzeKnowledgeExchange(conv.messages);
  const conversationPurpose = analyzeConversationPurpose(conv.messages, interactionPattern);
  const topicDepth = analyzeTopicDepth(conv.messages);
  const turnTaking = analyzeTurnTaking(conv.messages);
  const humanRole = analyzeHumanRole(conv.messages, conversationPurpose);
  const aiRole = analyzeAIRole(conv.messages, conversationPurpose, humanRole);

  return {
    ...conv,
    metadata: {
      interactionPattern,
      powerDynamics,
      emotionalTone,
      engagementStyle,
      knowledgeExchange,
      conversationPurpose,
      topicDepth,
      turnTaking,
      humanRole,
      aiRole
    }
  };
}

// Main execution
const dataPath = path.join(__dirname, '../src/data/personaChatMessages.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

console.log(`Processing ${data.conversations.length} conversations...`);

const updatedConversations = data.conversations.map((conv: Conversation, idx: number) => {
  if ((idx + 1) % 20 === 0) {
    console.log(`Processed ${idx + 1}/${data.conversations.length} conversations`);
  }
  return addMetadataToConversation(conv);
});

const updatedData = {
  ...data,
  conversations: updatedConversations
};

fs.writeFileSync(dataPath, JSON.stringify(updatedData, null, 2));
console.log('✓ Metadata added successfully!');

// Print sample statistics
const metadataStats = {
  interactionPatterns: {} as Record<string, number>,
  emotionalTones: {} as Record<string, number>,
  humanRoles: {} as Record<string, number>,
  aiRoles: {} as Record<string, number>
};

updatedConversations.forEach((conv: Conversation) => {
  const m = conv.metadata!;
  metadataStats.interactionPatterns[m.interactionPattern] = (metadataStats.interactionPatterns[m.interactionPattern] || 0) + 1;
  metadataStats.emotionalTones[m.emotionalTone] = (metadataStats.emotionalTones[m.emotionalTone] || 0) + 1;
  metadataStats.humanRoles[m.humanRole] = (metadataStats.humanRoles[m.humanRole] || 0) + 1;
  metadataStats.aiRoles[m.aiRole] = (metadataStats.aiRoles[m.aiRole] || 0) + 1;
});

console.log('\n📊 Metadata Distribution:');
console.log('\nInteraction Patterns:', metadataStats.interactionPatterns);
console.log('\nEmotional Tones:', metadataStats.emotionalTones);
console.log('\nHuman Roles:', metadataStats.humanRoles);
console.log('\nAI Roles:', metadataStats.aiRoles);
