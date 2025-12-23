// This file will be populated with the classified conversation data
// For now, we'll create a loader that can fetch from the output directory

import { ClassifiedConversation } from '../utils/conversationToTerrain';

// In development, we can import JSON files directly
// In production, these would be loaded from a server or bundled

let cachedConversations: ClassifiedConversation[] | null = null;

// Manifest interface
interface ManifestConversation {
  file: string;
  id: string;
  size: number;
  modified: string;
}

interface Manifest {
  version: string;
  lastUpdated: string;
  generatedBy: string;
  totalConversations: number;
  conversations: {
    conv: ManifestConversation[];
    sample: ManifestConversation[];
    emo: ManifestConversation[];
    cornell: ManifestConversation[];
    'kaggle-emo': ManifestConversation[];
    'chatbot-arena': ManifestConversation[];
    'combined-long'?: ManifestConversation[];
    'oasst'?: ManifestConversation[];
  };
}

// Clear cache function for development
export function clearConversationCache() {
  cachedConversations = null;
}

/**
 * Load manifest file to get list of available conversations
 */
async function loadManifest(): Promise<Manifest | null> {
  try {
    const response = await fetch('/output/manifest.json');
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn('⚠️  Manifest file not found, falling back to sequential loading');
    }
  }
  return null;
}

/**
 * Check if a conversation contains non-English content
 */
function isEnglishConversation(conversation: ClassifiedConversation): boolean {
  const messages = conversation.messages || [];
  
  // Check first few messages for non-English patterns
  const sampleMessages = messages.slice(0, 5);
  
  for (const msg of sampleMessages) {
    const content = msg.content || '';
    
    // Skip very short messages (just "ok", "yes", etc.)
    if (content.trim().length < 3) continue;
    
    // Check for Spanish patterns
    if (/[ñáéíóúü¿¡]|hola|español|entender|gracias|por favor|puedes|quiero|dime|cosas bonitas/i.test(content)) {
      return false;
    }
    
    // Check for French patterns
    if (/[çàâäéèêëïîôùûüÿ]|bonjour|merci|français|comprendre|salut|ça va/i.test(content)) {
      return false;
    }
    
    // Check for German patterns
    if (/[äöüß]|guten tag|danke|verstehen|deutsch|ist ein|rechtwink/i.test(content)) {
      return false;
    }
    
    // Check for Chinese/Japanese/Korean characters
    if (/[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]/.test(content)) {
      return false;
    }
    
    // Check for Arabic characters
    if (/[\u0600-\u06ff]/.test(content)) {
      return false;
    }
  }
  
  return true;
}

/**
 * Load a single conversation file by filename
 */
async function loadConversationFile(filename: string): Promise<ClassifiedConversation | null> {
  try {
    const response = await fetch(`/output/${filename}`);
    if (response.ok) {
      const conversation = await response.json();
      // Filter out non-English conversations
      if (!isEnglishConversation(conversation)) {
        if (import.meta.env.DEV) {
          console.log(`🌐 Skipping non-English conversation: ${filename}`);
        }
        return null;
      }
      return conversation;
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.warn(`⚠️  Failed to load ${filename}:`, error);
    }
  }
  return null;
}

/**
 * Load classified conversations using manifest file (faster and more efficient)
 */
async function loadWithManifest(manifest: Manifest): Promise<ClassifiedConversation[]> {
  // Collect all conversation file names from ALL sources in manifest
  const allFiles: string[] = [];

  // Load from all available conversation sources
  for (const conversations of Object.values(manifest.conversations)) {
    allFiles.push(...conversations.map(c => c.file));
  }

  // Load all files in parallel for better performance
  const loadPromises = allFiles.map(file => loadConversationFile(file));
  const results = await Promise.all(loadPromises);

  // Filter out null results (failed loads + non-English conversations)
  const conversations = results.filter((conv): conv is ClassifiedConversation => conv !== null);
  const filteredCount = allFiles.length - conversations.length;

  if (import.meta.env.DEV) {
    console.log(`📋 Loaded ${conversations.length}/${allFiles.length} conversations from manifest`);
    if (filteredCount > 0) {
      console.log(`  - Filtered out ${filteredCount} non-English conversation(s)`);
    }
    console.log(`  - With classification: ${conversations.filter(c => c.classification).length}`);
    console.log(`  - Without classification: ${conversations.filter(c => !c.classification).length}`);
  }

  return conversations;
}

/**
 * Fallback: Load conversations sequentially (old method)
 * Used when manifest is not available
 */
async function loadSequentially(): Promise<ClassifiedConversation[]> {
  const conversations: ClassifiedConversation[] = [];
  
  // Only load chatbot_arena files (old data hidden)
  let index = 1;
  let hasMore = true;
  
  while (hasMore && index <= 100) { // Safety limit
    const fileName = `chatbot_arena_${String(index).padStart(2, '0')}.json`;
    const conv = await loadConversationFile(fileName);
    if (conv) {
      conversations.push(conv);
      index++;
    } else {
      hasMore = false;
    }
  }
  
  // OLD DATA HIDDEN - Only loading chatbot_arena files
  // (commented out: conv-*, sample-*, emo-*, cornell-*, kaggle-emo-*)
  
  if (import.meta.env.DEV) {
    console.log(`📋 Loaded ${conversations.length} conversations (sequential fallback, English only)`);
    console.log(`  - With classification: ${conversations.filter(c => c.classification).length}`);
    console.log(`  - Without classification: ${conversations.filter(c => !c.classification).length}`);
  }

  return conversations;
}

/**
 * Load classified conversations from the output directory
 * Uses manifest file for faster loading, falls back to sequential loading if manifest unavailable
 */
export async function loadClassifiedConversations(): Promise<ClassifiedConversation[]> {
  // Disable cache in development to always get fresh data
  if (cachedConversations && import.meta.env.PROD) {
    return cachedConversations;
  }

  // Try to load manifest first (faster and more efficient)
  const manifest = await loadManifest();
  
  if (manifest) {
    // Use manifest-based loading (parallel, faster)
    const conversations = await loadWithManifest(manifest);
    cachedConversations = conversations;
    return conversations;
  } else {
    // Fallback to sequential loading (slower, but works without manifest)
    const conversations = await loadSequentially();
    cachedConversations = conversations;
    return conversations;
  }
}

/**
 * Get a specific conversation by ID
 */
export async function getConversationById(id: string): Promise<ClassifiedConversation | null> {
  const conversations = await loadClassifiedConversations();
  return conversations.find(c => c.id === id) || null;
}

