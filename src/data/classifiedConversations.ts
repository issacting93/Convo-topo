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
  // Disable cache in development to always get fresh data
  if (cachedConversations && import.meta.env.PROD) {
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
  
  // Load emo-*.json files (empathetic dialogues)
  // Try known emotions and indices
  const emotions = [
    'afraid', 'angry', 'annoyed', 'ashamed', 'confident', 'embarrassed',
    'excited', 'faithful', 'grateful', 'guilty', 'jealous', 'joyful',
    'lonely', 'nostalgic', 'prepared', 'proud', 'sad', 'sentimental',
    'surprised', 'terrified'
  ];
  
  for (const emotion of emotions) {
    let emoIndex = 1;
    let hasMoreEmo = true;
    
    // Try up to 10 conversations per emotion
    while (hasMoreEmo && emoIndex <= 10) {
      try {
        const response = await fetch(`/output/emo-${emotion}-${emoIndex}.json`);
        if (response.ok) {
          const data = await response.json();
          conversations.push(data);
          emoIndex++;
        } else if (response.status === 404) {
          // No more files for this emotion
          hasMoreEmo = false;
        } else {
          hasMoreEmo = false;
        }
      } catch (error) {
        // File doesn't exist or other error
        hasMoreEmo = false;
      }
    }
  }
  
  // Load cornell-*.json files (Cornell Movie Dialogs)
  let cornellIndex = 0;
  let hasMoreCornell = true;
  while (hasMoreCornell && cornellIndex < 100) {
    try {
      const response = await fetch(`/output/cornell-${cornellIndex}.json`);
      if (response.ok) {
        const data = await response.json();
        conversations.push(data);
        cornellIndex++;
      } else if (response.status === 404) {
        hasMoreCornell = false;
      } else {
        hasMoreCornell = false;
      }
    } catch (error) {
      hasMoreCornell = false;
    }
  }
  
  // Load kaggle-emo-*.json files (Kaggle Empathetic Dialogues)
  // Exclude error files (kaggle-emo-*-error.json)
  let kaggleIndex = 0;
  let hasMoreKaggle = true;
  while (hasMoreKaggle && kaggleIndex < 100) {
    try {
      // Skip error files
      const response = await fetch(`/output/kaggle-emo-${kaggleIndex}.json`);
      if (response.ok) {
        const data = await response.json();
        // Double-check it's not an error file by checking content
        if (!data.id?.endsWith('-error')) {
          conversations.push(data);
        }
        kaggleIndex++;
      } else if (response.status === 404) {
        hasMoreKaggle = false;
      } else {
        hasMoreKaggle = false;
      }
    } catch (error) {
      hasMoreKaggle = false;
    }
  }
  
  // Return all conversations (even those with abstain or no classification)
  // Conversations without classification will use default terrain parameters
  if (import.meta.env.DEV) {
    console.log(`Loaded ${conversations.length} total conversations`);
    console.log(`  - With classification: ${conversations.filter(c => c.classification).length}`);
    console.log(`  - Without classification: ${conversations.filter(c => !c.classification).length}`);
  }
  cachedConversations = conversations;
  return conversations;
}

/**
 * Get a specific conversation by ID
 */
export async function getConversationById(id: string): Promise<ClassifiedConversation | null> {
  const conversations = await loadClassifiedConversations();
  return conversations.find(c => c.id === id) || null;
}

