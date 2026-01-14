// This file will be populated with the classified conversation data
import { Conversation, ConversationSchema } from '../schemas/conversationSchema';
import { filterNewTaxonomy } from '../utils/taxonomyFilter';

// In development, we can import JSON files directly
// In production, these would be loaded from a server or bundled

let cachedConversations: Conversation[] | null = null;

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
function isEnglishConversation(conversation: Conversation): boolean {
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
 * USES ZOD SCHEMA VALIDATION
 */
async function loadConversationFile(filename: string): Promise<Conversation | null> {
  try {
    const response = await fetch(`/output/${filename}`);
    if (!response.ok) {
      // File doesn't exist (404) - silently skip
      return null;
    }

    // Check if response is actually JSON (not HTML error page)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      // Got HTML or other non-JSON response - silently skip
      return null;
    }

    const text = await response.text();

    // Quick check: if it starts with <, it's probably HTML
    if (text.trim().startsWith('<')) {
      return null;
    }

    let rawData;
    try {
      rawData = JSON.parse(text);
    } catch (parseError) {
      // Not valid JSON - silently skip
      return null;
    }

    // Validate schema with Zod
    const result = ConversationSchema.safeParse(rawData);

    if (!result.success) {
      if (import.meta.env.DEV) {
        console.error(`❌ Schema validation failed for ${filename}:`);
        // Show specific errors in detail
        if ((result.error as any).errors && (result.error as any).errors.length > 0) {
          (result.error as any).errors.slice(0, 5).forEach((err: any, i: number) => {
            const path = err.path.length > 0 ? err.path.join('.') : 'root';
            console.error(`  [${i + 1}] ${path}: ${err.message}`);
            if (err.code === 'invalid_type') {
              console.error(`      Expected: ${err.expected}, Got: ${err.received}`);
            }
          });
          if ((result.error as any).errors.length > 5) {
            console.error(`  ... and ${(result.error as any).errors.length - 5} more errors`);
          }
        } else {
          console.error('  Error:', result.error);
        }
      }
      return null;
    }

    const conversation = result.data;

    // Filter out non-English conversations
    if (!isEnglishConversation(conversation)) {
      if (import.meta.env.DEV) {
        console.log(`🌐 Skipping non-English conversation: ${filename}`);
      }
      return null;
    }
    return conversation;
  } catch (error) {
    // Network errors or other issues - silently skip in production
    // Only log in dev if it's not a 404-like error
    if (import.meta.env.DEV && !(error instanceof TypeError && error.message.includes('fetch'))) {
      console.warn(`⚠️  Failed to load ${filename}:`, error);
    }
  }
  return null;
}

/**
 * Load classified conversations using manifest file (faster and more efficient)
 */
async function loadWithManifest(manifest: Manifest): Promise<Conversation[]> {
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
  let conversations = results.filter((conv): conv is Conversation => conv !== null);
  const filteredCount = allFiles.length - conversations.length;

  // Filter to only new taxonomy (GPT-5.2 + 2.0-social-role-theory)
  const beforeTaxonomyFilter = conversations.length;
  conversations = filterNewTaxonomy(conversations);
  const taxonomyFilteredCount = beforeTaxonomyFilter - conversations.length;

  if (import.meta.env.DEV) {
    console.log(`📋 Loaded ${conversations.length}/${allFiles.length} conversations from manifest`);
    if (filteredCount > 0) {
      console.log(`  - Filtered out ${filteredCount} non-English/invalid conversation(s)`);
    }
    if (taxonomyFilteredCount > 0) {
      console.log(`  - Filtered out ${taxonomyFilteredCount} old taxonomy conversation(s)`);
      console.log(`  - Using only GPT-5.2 + 2.0-social-role-theory taxonomy`);
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
async function loadSequentially(): Promise<Conversation[]> {
  let conversations: Conversation[] = [];

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

  // Filter to only new taxonomy (GPT-5.2 + 2.0-social-role-theory)
  const beforeTaxonomyFilter = conversations.length;
  conversations = filterNewTaxonomy(conversations);
  const taxonomyFilteredCount = beforeTaxonomyFilter - conversations.length;

  if (import.meta.env.DEV) {
    console.log(`📋 Loaded ${conversations.length} conversations (sequential fallback, English only)`);
    if (taxonomyFilteredCount > 0) {
      console.log(`  - Filtered out ${taxonomyFilteredCount} old taxonomy conversation(s)`);
      console.log(`  - Using only GPT-5.2 + 2.0-social-role-theory taxonomy`);
    }
  }

  return conversations;
}

/**
 * Load classified conversations from the output directory
 * Uses manifest file for faster loading, falls back to sequential loading if manifest unavailable
 */
export async function loadClassifiedConversations(): Promise<Conversation[]> {
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
export async function getConversationById(id: string): Promise<Conversation | null> {
  const conversations = await loadClassifiedConversations();
  return conversations.find(c => c.id === id) || null;
}

