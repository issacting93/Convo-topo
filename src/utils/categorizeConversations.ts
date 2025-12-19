export interface RoleMetadata {
  // Interaction dynamics
  interactionPattern: 'collaborative' | 'advisory' | 'storytelling' | 'question-answer' | 'casual-chat' | 'debate';
  powerDynamics: 'human-led' | 'ai-led' | 'balanced' | 'alternating';

  // Communication style
  emotionalTone: 'supportive' | 'neutral' | 'playful' | 'serious' | 'empathetic' | 'professional';
  engagementStyle: 'questioning' | 'affirming' | 'challenging' | 'exploring' | 'reactive';

  // Content characteristics
  knowledgeExchange: 'personal-sharing' | 'skill-sharing' | 'opinion-exchange' | 'factual-info' | 'experience-sharing';
  conversationPurpose: 'relationship-building' | 'information-seeking' | 'entertainment' | 'problem-solving' | 'self-expression';

  // Turn taking
  turnTaking: 'balanced' | 'user-dominant' | 'assistant-dominant';

  // Role characteristics
  humanRole: 'seeker' | 'learner' | 'director' | 'collaborator' | 'sharer' | 'challenger';
  aiRole: 'expert' | 'advisor' | 'facilitator' | 'reflector' | 'peer' | 'affiliative';
}

export interface PersonaChatConversation {
  personality: string[];
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    communicationFunction: number;
    conversationStructure: number;
    conversationId?: number;
    messageIndex?: number;
  }>;
  fullHistory: string[];
  candidates: string[];
  metadata?: RoleMetadata;
}

export interface ConversationCategory {
  id: string;
  name: string;
  description: string;
  color: string;
  criteria: (conv: PersonaChatConversation) => boolean;
}

function getConversationStats(conv: PersonaChatConversation) {
  const messages = conv.messages || [];
  if (messages.length === 0) {
    return {
      avgCommunicationFunction: 0.5,
      avgConversationStructure: 0.5,
      messageCount: 0,
      hasQuestions: false,
      hasEmotions: false
    };
  }

  const avgCF = messages.reduce((sum, m) => sum + m.communicationFunction, 0) / messages.length;
  const avgCS = messages.reduce((sum, m) => sum + m.conversationStructure, 0) / messages.length;
  
  const hasQuestions = messages.some(m => m.content.trim().endsWith('?'));
  const hasEmotions = messages.some(m => {
    const lower = m.content.toLowerCase();
    return /(love|like|enjoy|feel|happy|excited|wonderful|nice|great|awesome|sorry|hope|wish)/.test(lower);
  });

  return {
    avgCommunicationFunction: avgCF,
    avgConversationStructure: avgCS,
    messageCount: messages.length,
    hasQuestions,
    hasEmotions
  };
}
export const CONVERSATION_CATEGORIES: ConversationCategory[] = [
  {
    id: 'instrumental-structured',
    name: 'Functional & Structured',
    description: 'Task-oriented, directive conversations',
    color: '#44ff66', // Green
    criteria: (conv) => {
      const stats = getConversationStats(conv);
      return stats.avgCommunicationFunction < 0.4 && stats.avgConversationStructure < 0.5;
    }
  },
  {
    id: 'expressive-emergent',
    name: 'Social & Emergent',
    description: 'Relational, exploratory conversations',
    color: '#ffaa00', // Orange
    criteria: (conv) => {
      const stats = getConversationStats(conv);
      return stats.avgCommunicationFunction > 0.45 && stats.avgConversationStructure > 0.6;
    }
  },
  {
    id: 'instrumental-emergent',
    name: 'Functional & Emergent',
    description: 'Task-focused but exploratory',
    color: '#7ad4e8', // Cyan
    criteria: (conv) => {
      const stats = getConversationStats(conv);
      return stats.avgCommunicationFunction < 0.4 && stats.avgConversationStructure > 0.6;
    }
  },
  {
    id: 'expressive-structured',
    name: 'Social & Structured',
    description: 'Relational but directive',
    color: '#ff8844', // Orange-red
    criteria: (conv) => {
      const stats = getConversationStats(conv);
      return stats.avgCommunicationFunction > 0.45 && stats.avgConversationStructure < 0.5;
    }
  },
  {
    id: 'question-heavy',
    name: 'Question-Heavy',
    description: 'Conversations with many questions',
    color: '#aa88ff', // Purple
    criteria: (conv) => {
      const stats = getConversationStats(conv);
      return stats.hasQuestions && (conv.messages?.filter(m => m.content.trim().endsWith('?')).length || 0) >= 2;
    }
  },
  {
    id: 'emotional',
    name: 'Emotional',
    description: 'High emotional content',
    color: '#ff6688', // Pink
    criteria: (conv) => {
      const stats = getConversationStats(conv);
      return stats.hasEmotions && stats.avgCommunicationFunction > 0.4;
    }
  },
  {
    id: 'long-form',
    name: 'Long-Form',
    description: 'Extended conversations (4+ messages)',
    color: '#88ffaa', // Light green
    criteria: (conv) => {
      const stats = getConversationStats(conv);
      return stats.messageCount >= 4;
    }
  },
  {
    id: 'short-form',
    name: 'Short-Form',
    description: 'Brief exchanges (2 messages)',
    color: '#aaccff', // Light blue
    criteria: (conv) => {
      const stats = getConversationStats(conv);
      return stats.messageCount === 2;
    }
  }
];
export function getConversationsByCategory(
  conversations: PersonaChatConversation[],
  categoryId: string
): PersonaChatConversation[] {
  const category = CONVERSATION_CATEGORIES.find(cat => cat.id === categoryId);
  return category ? conversations.filter(conv => category.criteria(conv)) : [];
}

