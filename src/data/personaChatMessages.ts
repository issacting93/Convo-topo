import type { Message } from './messages';
import { getConversationsByCategory, type ConversationCategory, CONVERSATION_CATEGORIES, type PersonaChatConversation as CategorizedConversation } from '../utils/categorizeConversations';

// Import the processed messages from the fetched dataset
import personaChatData from './personaChatMessages.json';

export interface PersonaChatMessage extends Message {
  conversationId?: number;
  messageIndex?: number;
}

export interface PersonaChatConversation {
  personality: string[];
  messages: PersonaChatMessage[];
  fullHistory: string[];
  candidates: string[];
}

// Extract messages from the fetched data
// The JSON only has conversations, so we need to flatten them into messages
export const PERSONA_CHAT_CONVERSATIONS: PersonaChatConversation[] = (personaChatData.conversations || []) as PersonaChatConversation[];

export const PERSONA_CHAT_MESSAGES: PersonaChatMessage[] = PERSONA_CHAT_CONVERSATIONS.flatMap((conv, convId) =>
  conv.messages.map((msg, msgIdx) => ({
    ...msg,
    conversationId: convId,
    messageIndex: msgIdx
  }))
);

// Get a specific conversation's messages
export function getConversationMessages(conversationId: number): PersonaChatMessage[] {
  return PERSONA_CHAT_MESSAGES.filter(msg => msg.conversationId === conversationId);
}

// Get messages formatted for the terrain visualization (without metadata)
export function getFormattedMessages(count: number = 12): Message[] {
  return PERSONA_CHAT_MESSAGES.slice(0, count).map(({ role, content, communicationFunction, conversationStructure }) => ({
    role,
    content,
    communicationFunction,
    conversationStructure
  }));
}

// Get messages from a specific category
// Cache results to prevent unnecessary recalculations and flickering
const messageCache = new Map<string, Message[]>();

export function getMessagesByCategory(categoryId: string | null, count: number = 12): Message[] {
  const cacheKey = `${categoryId || 'all'}-${count}`;
  
  // Return cached result if available
  if (messageCache.has(cacheKey)) {
    return messageCache.get(cacheKey)!;
  }

  let result: Message[];
  
  if (!categoryId) {
    result = getFormattedMessages(count);
  } else {
    const categoryConversations = getConversationsByCategory(PERSONA_CHAT_CONVERSATIONS as CategorizedConversation[], categoryId);
    
    // Flatten all messages from conversations in this category
    const categoryMessages: PersonaChatMessage[] = [];
    categoryConversations.forEach(conv => {
      conv.messages.forEach(msg => {
        categoryMessages.push(msg);
      });
    });

    // Take up to count messages
    result = categoryMessages.slice(0, count).map(({ role, content, communicationFunction, conversationStructure }) => ({
      role,
      content,
      communicationFunction,
      conversationStructure
    }));
  }
  
  // Cache the result
  messageCache.set(cacheKey, result);
  return result;
}

// Get all available categories with their message counts
// Use a stable reference to avoid re-renders
let cachedCategoryOptions: Array<{category: ConversationCategory; messageCount: number}> | null = null;

export function getCategoryOptions(): Array<{category: ConversationCategory; messageCount: number}> {
  // Cache the result to prevent unnecessary recalculations
  if (cachedCategoryOptions === null) {
    cachedCategoryOptions = CONVERSATION_CATEGORIES.map(cat => {
      const conversations = getConversationsByCategory(PERSONA_CHAT_CONVERSATIONS as CategorizedConversation[], cat.id);
      const messageCount = conversations.reduce((sum, conv) => sum + conv.messages.length, 0);
      return { category: cat, messageCount };
    }).filter(opt => opt.messageCount > 0).sort((a, b) => b.messageCount - a.messageCount);
  }
  return cachedCategoryOptions;
}

