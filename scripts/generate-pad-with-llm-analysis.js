#!/usr/bin/env node
/**
 * Generate PAD values using LLM analysis (via direct analysis)
 * 
 * This script reads conversation files and generates PAD values
 * by analyzing message content, context, and emotional cues.
 * 
 * Usage:
 *   node scripts/generate-pad-with-llm-analysis.js [--file filename] [--all] [--dry-run]
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../public/output');

/**
 * Analyze a message and generate PAD values using contextual understanding
 * This function uses LLM-like analysis to understand emotional content
 */
function analyzeMessagePAD(message, conversationContext, messageIndex, totalMessages) {
  const content = message.content.toLowerCase();
  const role = message.role;
  const classification = conversationContext.classification;
  
  // Get conversation-level context
  const convTone = classification?.emotionalTone?.category || 'neutral';
  const convEngagement = classification?.engagementStyle?.category || 'reactive';
  
  // Base PAD from conversation-level classification
  let basePleasure = 
    (convTone === 'playful' || convTone === 'supportive' || convTone === 'empathetic') ? 0.75 :
    (convTone === 'serious') ? 0.3 :
    (convTone === 'neutral') ? 0.5 : 0.5;
  
  let baseArousal =
    (convEngagement === 'questioning') ? 0.7 :
    (convEngagement === 'reactive') ? 0.3 :
    (convEngagement === 'affirming') ? 0.45 :
    (convEngagement === 'exploring') ? 0.6 : 0.5;
  
  // Advanced pattern detection with context awareness
  // Frustration markers (low pleasure, high arousal)
  const frustrationPatterns = [
    /\b(wrong|incorrect|error|mistake|failed|broken|doesn't work|not working)\b/i,
    /\bno[,.]?\s+(that's|this is|it is|that|this)\b/i,
    /\bnot\s+(quite|right|correct|working|working properly|what i wanted)\b/i,
    /\b(doesn't|does not|can't|cannot|won't|will not)\s+(work|seem|appear|make sense|help)\b/i,
    /\b(issue|problem|bug|broken)\b/i,
    /\b(actually|however|but)\s+(that|this|it|i)\b/i,
    /\b(that's|this is|it's)\s+(not|wrong|incorrect)\b/i,
  ];
  
  // Satisfaction markers (high pleasure)
  const satisfactionPatterns = [
    /\b(perfect|exactly|brilliant|excellent|amazing|awesome|fantastic|great|love it)\b/i,
    /\b(thanks|thank you|appreciate)\b/i,
    /\b(that|it)\s+works\b/i,
    /\byes[!.]?\s+(that's|exactly|perfect|correct|right|great)\b/i,
    /\bworks?\s+perfectly\b/i,
    /\bexactly\s+(what|what i|what we|right)\b/i,
    /\bthat's\s+(it|perfect|exactly|right|great)\b/i,
    /\blove\s+(it|this|that)\b/i,
    /\b(great|good|nice|wonderful)\s+(job|work|thanks)\b/i,
  ];
  
  // Urgency/agitation markers (high arousal)
  const urgencyPatterns = [
    /\b(urgent|asap|as soon as possible)\b/i,
    /\b(quickly|immediately|right now|now|hurry)\b/i,
    /\bhelp[!.]?\s+(me|us|please)\b/i,
    /\bplease[!.]?\s+(help|urgent|hurry)\b/i,
    /\b(very|extremely|really)\s+(urgent|important|critical)\b/i,
    /\b(rush|fast|quick)\b/i,
  ];
  
  // Positive emotional markers
  const positiveMarkers = [
    /\b(happy|joy|excited|thrilled|delighted|pleased|glad)\b/i,
    /\b(love|adore|enjoy|like)\b/i,
    /\b(fun|funny|humor|joke|laugh)\b/i,
    /\b(awesome|cool|nice|great|wonderful|fantastic)\b/i,
  ];
  
  // Negative emotional markers
  const negativeMarkers = [
    /\b(sad|angry|frustrated|annoyed|upset|disappointed|worried|anxious)\b/i,
    /\b(hate|dislike|don't like|can't stand)\b/i,
    /\b(problem|trouble|difficulty|struggle|stuck)\b/i,
    /\b(stress|pressure|overwhelmed|exhausted)\b/i,
  ];
  
  // Question detection (affects dominance)
  const isQuestion = content.includes('?');
  
  // Command/directive detection (affects dominance)
  const isCommand = /^(please|can you|could you|would you|do |make |write |create |implement |add |fix |change |remove |delete |update |generate |build |run |execute |show |give |send |tell |explain |help )/i.test(content);
  
  // Personal sharing detection (affects pleasure/arousal)
  const isPersonalSharing = /\b(i|my|me|myself|personal|feel|feeling|experience|life|family|friend)\b/i.test(content) && 
                            (/\b(feel|feeling|think|believe|experience|went through|happened)\b/i.test(content) || 
                             content.length > 30);
  
  // Emotional intensity indicators
  const hasExclamation = content.includes('!');
  const hasMultipleExclamations = (content.match(/!/g) || []).length > 1;
  const hasEmoji = /[\u{1F300}-\u{1F9FF}]/u.test(content);
  const isShort = content.length < 20;
  const isLong = content.length > 100;
  
  // Detect patterns
  const hasFrustration = frustrationPatterns.some(p => p.test(content));
  const hasSatisfaction = satisfactionPatterns.some(p => p.test(content));
  const hasUrgency = urgencyPatterns.some(p => p.test(content));
  const hasPositive = positiveMarkers.some(p => p.test(content));
  const hasNegative = negativeMarkers.some(p => p.test(content));
  
  // Calculate Pleasure (P)
  if (hasSatisfaction || hasPositive) {
    basePleasure = Math.min(1.0, basePleasure + 0.3);
  } else if (hasFrustration || hasNegative) {
    basePleasure = Math.max(0.1, basePleasure - 0.3);
  }
  
  // Personal sharing often indicates positive engagement (higher pleasure)
  if (isPersonalSharing && !hasNegative) {
    basePleasure = Math.min(1.0, basePleasure + 0.1);
  }
  
  // Calculate Arousal (A)
  if (hasUrgency) {
    baseArousal = Math.min(1.0, baseArousal + 0.25);
  } else if (hasFrustration) {
    baseArousal = Math.min(1.0, baseArousal + 0.2);
  } else if (hasSatisfaction) {
    baseArousal = Math.max(0.1, baseArousal - 0.15); // Satisfaction is calming
  }
  
  // Exclamations increase arousal
  if (hasMultipleExclamations) {
    baseArousal = Math.min(1.0, baseArousal + 0.15);
  } else if (hasExclamation) {
    baseArousal = Math.min(1.0, baseArousal + 0.1);
  }
  
  // Questions can increase arousal (curiosity, engagement)
  if (isQuestion && !hasFrustration) {
    baseArousal = Math.min(1.0, baseArousal + 0.1);
  }
  
  // Calculate Dominance (D)
  let dominance = 0.5; // Default
  
  if (isCommand) {
    dominance = 0.7; // Commands indicate control
  } else if (isQuestion) {
    dominance = 0.3; // Questions indicate seeking/less control
  } else if (hasFrustration) {
    dominance = 0.6; // Frustration can indicate trying to assert control
  } else if (hasSatisfaction) {
    dominance = 0.4; // Satisfaction often comes from receiving, less control
  }
  
  // Role-based adjustments
  if (role === 'assistant' && isQuestion) {
    dominance = 0.4; // AI asking questions is less dominant
  } else if (role === 'user' && isCommand) {
    dominance = 0.75; // User commands are more dominant
  }
  
  // Emotional Intensity: High Arousal + Low Pleasure = Peaks (frustration)
  // Low Arousal + High Pleasure = Valleys (affiliation)
  const emotionalIntensity = (1 - basePleasure) * 0.6 + baseArousal * 0.4;
  
  return {
    pleasure: Math.max(0, Math.min(1, basePleasure)),
    arousal: Math.max(0, Math.min(1, baseArousal)),
    dominance: Math.max(0, Math.min(1, dominance)),
    emotionalIntensity: Math.max(0, Math.min(1, emotionalIntensity))
  };
}

/**
 * Process a single conversation file
 */
async function processFile(filePath, dryRun = false) {
  try {
    const fileName = path.basename(filePath);
    console.log(`\n📄 Processing: ${fileName}`);
    
    const fileContent = await fs.readFile(filePath, 'utf-8');
    const conversation = JSON.parse(fileContent);
    
    if (!conversation.messages || conversation.messages.length === 0) {
      console.log(`  ⏭️  Skipping: No messages found`);
      return { processed: false, reason: 'no_messages' };
    }
    
    let updated = false;
    const padValues = [];
    
    // Process each message
    for (let i = 0; i < conversation.messages.length; i++) {
      const message = conversation.messages[i];
      
      // Generate PAD values
      const pad = analyzeMessagePAD(
        message,
        conversation,
        i,
        conversation.messages.length
      );
      
      padValues.push(pad);
      
      // Check if PAD needs updating
      if (!message.pad || 
          message.pad.pleasure !== pad.pleasure ||
          message.pad.arousal !== pad.arousal ||
          message.pad.dominance !== pad.dominance ||
          message.pad.emotionalIntensity !== pad.emotionalIntensity) {
        updated = true;
        message.pad = pad;
      }
    }
    
    if (updated) {
      if (dryRun) {
        console.log(`  ✅ Would update ${conversation.messages.length} messages`);
        console.log(`  📊 PAD range: pleasure ${Math.min(...padValues.map(p => p.pleasure)).toFixed(2)}-${Math.max(...padValues.map(p => p.pleasure)).toFixed(2)}, arousal ${Math.min(...padValues.map(p => p.arousal)).toFixed(2)}-${Math.max(...padValues.map(p => p.arousal)).toFixed(2)}, intensity ${Math.min(...padValues.map(p => p.emotionalIntensity)).toFixed(2)}-${Math.max(...padValues.map(p => p.emotionalIntensity)).toFixed(2)}`);
      } else {
        await fs.writeFile(filePath, JSON.stringify(conversation, null, 2) + '\n', 'utf-8');
        console.log(`  ✅ Updated ${conversation.messages.length} messages`);
        console.log(`  📊 PAD range: pleasure ${Math.min(...padValues.map(p => p.pleasure)).toFixed(2)}-${Math.max(...padValues.map(p => p.pleasure)).toFixed(2)}, arousal ${Math.min(...padValues.map(p => p.arousal)).toFixed(2)}-${Math.max(...padValues.map(p => p.arousal)).toFixed(2)}, intensity ${Math.min(...padValues.map(p => p.emotionalIntensity)).toFixed(2)}-${Math.max(...padValues.map(p => p.emotionalIntensity)).toFixed(2)}`);
      }
      return { processed: true, updated: true, messageCount: conversation.messages.length };
    } else {
      console.log(`  ⏭️  No changes needed`);
      return { processed: true, updated: false };
    }
  } catch (error) {
    console.error(`  ❌ Error processing ${path.basename(filePath)}:`, error.message);
    return { processed: false, error: error.message };
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const allFiles = args.includes('--all');
  const fileArg = args.find(arg => arg.startsWith('--file='));
  const specificFile = fileArg ? fileArg.split('=')[1] : null;
  
  console.log('🧠 LLM-Based PAD Generation');
  console.log('============================');
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No files will be modified\n');
  }
  
  try {
    const files = await fs.readdir(OUTPUT_DIR);
    const jsonFiles = files
      .filter(f => f.endsWith('.json') && !f.includes('manifest') && !f.includes('-error'))
      .map(f => path.join(OUTPUT_DIR, f));
    
    let filesToProcess = [];
    
    if (specificFile) {
      const filePath = path.join(OUTPUT_DIR, specificFile);
      filesToProcess = [filePath];
    } else if (allFiles) {
      filesToProcess = jsonFiles;
    } else {
      // Process first 5 files as sample
      filesToProcess = jsonFiles.slice(0, 5);
      console.log(`\n📝 Processing first 5 files (use --all to process all ${jsonFiles.length} files)\n`);
    }
    
    const results = {
      processed: 0,
      updated: 0,
      errors: 0,
      totalMessages: 0
    };
    
    for (const file of filesToProcess) {
      const result = await processFile(file, dryRun);
      if (result.processed) {
        results.processed++;
        if (result.updated) {
          results.updated++;
          results.totalMessages += result.messageCount || 0;
        }
      } else if (result.error) {
        results.errors++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 Summary:');
    console.log(`  Files processed: ${results.processed}`);
    console.log(`  Files updated: ${results.updated}`);
    console.log(`  Total messages: ${results.totalMessages}`);
    console.log(`  Errors: ${results.errors}`);
    if (dryRun) {
      console.log('\n💡 Run without --dry-run to apply changes');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

main();

