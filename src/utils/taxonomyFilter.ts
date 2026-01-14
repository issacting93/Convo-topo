/**
 * Utility functions for filtering conversations by taxonomy version
 */

import { Conversation } from '../schemas/conversationSchema';

/**
 * Check if a conversation uses the new taxonomy (GPT-5.2 + 2.0-social-role-theory)
 */
export function usesNewTaxonomy(conversation: Conversation): boolean {
  if (!conversation.classification) {
    return false;
  }

  // Check classificationMetadata (top-level)
  const metadata = conversation.classificationMetadata;
  if (metadata) {
    const model = (metadata.model || '').toLowerCase().trim();
    const promptVersion = (metadata.promptVersion || '').trim();

    const isGpt52 = model === 'gpt-5.2' || model === 'gpt5.2';
    const isNewPrompt = promptVersion === '2.0-social-role-theory';

    if (isGpt52 && isNewPrompt) {
      return true;
    }
  }

  // Check nested metadata (classification.metadata)
  const nestedMetadata = conversation.classification?.metadata;
  if (nestedMetadata && typeof nestedMetadata === 'object') {
    const meta = nestedMetadata as any;
    const model = (meta.model || '').toLowerCase().trim();
    const promptVersion = (meta.promptVersion || '').trim();

    const isGpt52 = model === 'gpt-5.2' || model === 'gpt5.2';
    const isNewPrompt = promptVersion === '2.0-social-role-theory';

    if (isGpt52 && isNewPrompt) {
      return true;
    }
  }

  return false;
}

/**
 * Filter conversations to only include those using the new taxonomy
 */
export function filterNewTaxonomy(conversations: Conversation[]): Conversation[] {
  return conversations.filter(usesNewTaxonomy);
}

