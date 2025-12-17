// This file will be populated with the classified conversation data
// For now, we'll create a loader that can fetch from the output directory

import { ClassifiedConversation } from '../utils/conversationToTerrain';

// In development, we can import JSON files directly
// In production, these would be loaded from a server or bundled

let cachedConversations: ClassifiedConversation[] | null = null;

// Clear cache function for development
export function clearConversationCache() {
  cachedConversations = null;
}

/**
 * Load classified conversations from the output directory
 * This works in development with Vite's public folder
 */
export async function loadClassifiedConversations(): Promise<ClassifiedConversation[]> {
  if (cachedConversations) {
    return cachedConversations;
  }
  
  const conversations: ClassifiedConversation[] = [];
  let index = 0;
  let hasMore = true;
  
  // Try to load conversations sequentially (conv-0.json, conv-1.json, etc.)
  while (hasMore && index < 100) { // Safety limit
    try {
      // In Vite, files in public/ are served from root
      const response = await fetch(`/output/conv-${index}.json`);
      
      if (response.ok) {
        const data = await response.json();
        conversations.push(data);
        index++;
      } else if (response.status === 404) {
        // No more files
        hasMore = false;
      } else {
        // Other error, stop trying
        hasMore = false;
      }
    } catch (error) {
      // Network error or file doesn't exist
      hasMore = false;
    }
  }
  
  // Also load sample conversations (try known sample IDs)
  const sampleConversations = [
    'sample-very-shallow',
    'sample-shallow-moderate',
    'sample-question-answer',
    'sample-medium-depth',
    'sample-deep-discussion',
    'sample-deep-technical',
    'sample-very-deep',
    // Legacy samples (may not exist)
    'sample-collaborative',
    'sample-storytelling',
    'sample-advisory',
    'sample-emotional-support',
    'sample-technical-deep',
    'sample-playful-casual',
    'sample-debate',
    'sample-information-seeking'
  ];
  
  for (const sampleId of sampleConversations) {
    try {
      const response = await fetch(`/output/${sampleId}.json`);
      if (response.ok) {
        const data = await response.json();
        conversations.push(data);
      }
    } catch (error) {
      // Sample file doesn't exist, skip silently
    }
  }
  
  // Filter out abstained conversations (low confidence classifications)
  const validConversations = conversations.filter(c => !c.classification?.abstain);

  cachedConversations = validConversations;
  return validConversations;
}

/**
 * Get a specific conversation by ID
 */
export async function getConversationById(id: string): Promise<ClassifiedConversation | null> {
  const conversations = await loadClassifiedConversations();
  return conversations.find(c => c.id === id) || null;
}

