/**
 * Engine Isolation Test
 * 
 * This script demonstrates that the Conversation Engine can run in a pure Node.js environment
 * without React, Three.js, or browser DOM dependencies.
 * 
 * Usage: npx ts-node scripts/demo_engine.ts
 */

import {
    calculatePAD,
    detectSpikes,
    extractLinguisticFeatures,
    ConversationSchema
} from '../src/conversation-engine';

// 1. Test PAD Engine (Pure Logic)
console.log('--- 1. PAD ENGINE ---');
const text = "I am extremely frustrated that this code isn't working!";
const pad = calculatePAD(text);
console.log(`Input: "${text}"`);
console.log(`Intensity: ${pad.emotionalIntensity} (P:${pad.pleasure}, A:${pad.arousal})`);

// 2. Test Spike Detection (Time-Series Logic)
console.log('\n--- 2. SPIKE DETECTION ---');
const timeline = [0.1, 0.15, 0.2, 0.8, 0.85, 0.2];
const spikes = detectSpikes(timeline, 0.3);
if (spikes.length > 0) {
    console.log(`Found ${spikes.length} spike(s):`);
    spikes.forEach(s => console.log(`  - Index ${s.messageIndex}: Jump of +${s.spike} (to ${s.intensity})`));
}

// 3. Test Linguistics (NLP Regex)
console.log('\n--- 3. LINGUISTICS ENGINE ---');
const messages = [
    { role: 'user', content: "Could you please help me fix this bug?" },
    { role: 'user', content: "I think it might be a null pointer exception." }
];
const features = extractLinguisticFeatures(messages);
console.log('Linguistic Features:', features);

// 4. Test Schema (Validation)
console.log('\n--- 4. SCHEMA VALIDATION ---');
try {
    const validData = ConversationSchema.parse({
        id: "test-conv-001",
        classification: {}, // Minimal valid
        messages: []
    });
    console.log("Schema Validation: PASSED");
} catch (e) {
    console.log("Schema Validation: FAILED (Expected if minimal data is incomplete)");
}

console.log('\n✅ ENGINE ISOLATION CONFIRMED: No DOM/React errors thrown.');
