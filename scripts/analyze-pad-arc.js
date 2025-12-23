#!/usr/bin/env node

/**
 * Analyze PAD Emotional Arc
 * 
 * Visualizes how PAD scores change across a conversation,
 * showing the emotional trajectory and key transition points.
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.join(__dirname, '../public/output');

function analyzePadArc(data) {
  const messages = data.messages || [];
  const analysis = {
    id: data.id,
    totalMessages: messages.length,
    turns: [],
    arc: {
      pleasure: { min: 1, max: 0, avg: 0, trajectory: [] },
      arousal: { min: 1, max: 0, avg: 0, trajectory: [] },
      dominance: { min: 1, max: 0, avg: 0, trajectory: [] },
      emotionalIntensity: { min: 1, max: 0, avg: 0, trajectory: [] }
    },
    transitions: [],
    peaks: {
      emotionalIntensity: []
    },
    valleys: {
      emotionalIntensity: []
    }
  };

  messages.forEach((msg, idx) => {
    if (!msg.pad) return;

    const { pleasure, arousal, dominance, emotionalIntensity } = msg.pad;
    
    // Track trajectory
    analysis.arc.pleasure.trajectory.push(pleasure);
    analysis.arc.arousal.trajectory.push(arousal);
    analysis.arc.dominance.trajectory.push(dominance);
    analysis.arc.emotionalIntensity.trajectory.push(emotionalIntensity);

    // Update min/max
    analysis.arc.pleasure.min = Math.min(analysis.arc.pleasure.min, pleasure);
    analysis.arc.pleasure.max = Math.max(analysis.arc.pleasure.max, pleasure);
    analysis.arc.arousal.min = Math.min(analysis.arc.arousal.min, arousal);
    analysis.arc.arousal.max = Math.max(analysis.arc.arousal.max, arousal);
    analysis.arc.dominance.min = Math.min(analysis.arc.dominance.min, dominance);
    analysis.arc.dominance.max = Math.max(analysis.arc.dominance.max, dominance);
    analysis.arc.emotionalIntensity.min = Math.min(analysis.arc.emotionalIntensity.min, emotionalIntensity);
    analysis.arc.emotionalIntensity.max = Math.max(analysis.arc.emotionalIntensity.max, emotionalIntensity);

    // Calculate averages
    analysis.arc.pleasure.avg += pleasure;
    analysis.arc.arousal.avg += arousal;
    analysis.arc.dominance.avg += dominance;
    analysis.arc.emotionalIntensity.avg += emotionalIntensity;

    // Track turn
    const turn = {
      index: idx,
      role: msg.role,
      contentPreview: msg.content.substring(0, 60) + (msg.content.length > 60 ? '...' : ''),
      pad: { pleasure, arousal, dominance, emotionalIntensity }
    };
    analysis.turns.push(turn);

    // Detect transitions (significant changes)
    if (idx > 0) {
      const prev = messages[idx - 1].pad;
      if (!prev) return;

      const pleasureDelta = Math.abs(pleasure - prev.pleasure);
      const arousalDelta = Math.abs(arousal - prev.arousal);
      const dominanceDelta = Math.abs(dominance - prev.dominance);
      const intensityDelta = emotionalIntensity - prev.emotionalIntensity;

      // Significant transition threshold: > 0.15 change
      if (pleasureDelta > 0.15 || arousalDelta > 0.15 || dominanceDelta > 0.15) {
        analysis.transitions.push({
          fromTurn: idx - 1,
          toTurn: idx,
          type: msg.role === 'user' ? 'user_shift' : 'ai_response',
          changes: {
            pleasure: { from: prev.pleasure, to: pleasure, delta: pleasure - prev.pleasure },
            arousal: { from: prev.arousal, to: arousal, delta: arousal - prev.arousal },
            dominance: { from: prev.dominance, to: dominance, delta: dominance - prev.dominance },
            emotionalIntensity: { from: prev.emotionalIntensity || 0, to: emotionalIntensity, delta: intensityDelta }
          },
          userMessage: msg.role === 'user' ? turn.contentPreview : messages[idx - 1].content.substring(0, 60) + '...',
          aiMessage: msg.role === 'assistant' ? turn.contentPreview : null
        });
      }

      // Detect peaks/valleys in emotional intensity
      if (idx > 1 && idx < messages.length - 1) {
        const next = messages[idx + 1].pad;
        if (next) {
          const prevIntensity = prev.emotionalIntensity || 0;
          const currIntensity = emotionalIntensity;
          const nextIntensity = next.emotionalIntensity || 0;

          // Peak: higher than both neighbors
          if (currIntensity > prevIntensity && currIntensity > nextIntensity && currIntensity > 0.5) {
            analysis.peaks.emotionalIntensity.push({
              turn: idx,
              intensity: currIntensity,
              message: turn.contentPreview
            });
          }

          // Valley: lower than both neighbors
          if (currIntensity < prevIntensity && currIntensity < nextIntensity && currIntensity < 0.4) {
            analysis.valleys.emotionalIntensity.push({
              turn: idx,
              intensity: currIntensity,
              message: turn.contentPreview
            });
          }
        }
      }
    }
  });

  // Calculate averages
  const count = analysis.turns.length;
  analysis.arc.pleasure.avg /= count;
  analysis.arc.arousal.avg /= count;
  analysis.arc.dominance.avg /= count;
  analysis.arc.emotionalIntensity.avg /= count;

  return analysis;
}

function formatArcReport(analysis) {
  const lines = [];

  lines.push('═'.repeat(80));
  lines.push(`EMOTIONAL ARC ANALYSIS: ${analysis.id}`);
  lines.push('═'.repeat(80));
  lines.push('');

  // Summary statistics
  lines.push('📊 OVERALL STATISTICS');
  lines.push('─'.repeat(80));
  lines.push(`Total Messages: ${analysis.totalMessages}`);
  lines.push('');
  lines.push('PAD Score Ranges:');
  lines.push(`  Pleasure:        ${analysis.arc.pleasure.min.toFixed(2)} - ${analysis.arc.pleasure.max.toFixed(2)} (avg: ${analysis.arc.pleasure.avg.toFixed(2)})`);
  lines.push(`  Arousal:         ${analysis.arc.arousal.min.toFixed(2)} - ${analysis.arc.arousal.max.toFixed(2)} (avg: ${analysis.arc.arousal.avg.toFixed(2)})`);
  lines.push(`  Dominance:       ${analysis.arc.dominance.min.toFixed(2)} - ${analysis.arc.dominance.max.toFixed(2)} (avg: ${analysis.arc.dominance.avg.toFixed(2)})`);
  lines.push(`  Emotional Intensity: ${analysis.arc.emotionalIntensity.min.toFixed(2)} - ${analysis.arc.emotionalIntensity.max.toFixed(2)} (avg: ${analysis.arc.emotionalIntensity.avg.toFixed(2)})`);
  lines.push('');

  // Key transitions
  if (analysis.transitions.length > 0) {
    lines.push('🔄 SIGNIFICANT EMOTIONAL TRANSITIONS');
    lines.push('─'.repeat(80));
    analysis.transitions.forEach((trans, idx) => {
      lines.push(`\nTransition ${idx + 1}: Turn ${trans.fromTurn} → Turn ${trans.toTurn} (${trans.type})`);
      if (trans.userMessage) {
        lines.push(`  User: "${trans.userMessage}"`);
      }
      if (trans.aiMessage) {
        lines.push(`  AI: "${trans.aiMessage}"`);
      }
      lines.push('  Changes:');
      if (Math.abs(trans.changes.pleasure.delta) > 0.1) {
        lines.push(`    Pleasure: ${trans.changes.pleasure.from.toFixed(2)} → ${trans.changes.pleasure.to.toFixed(2)} (${trans.changes.pleasure.delta > 0 ? '+' : ''}${trans.changes.pleasure.delta.toFixed(2)})`);
      }
      if (Math.abs(trans.changes.arousal.delta) > 0.1) {
        lines.push(`    Arousal: ${trans.changes.arousal.from.toFixed(2)} → ${trans.changes.arousal.to.toFixed(2)} (${trans.changes.arousal.delta > 0 ? '+' : ''}${trans.changes.arousal.delta.toFixed(2)})`);
      }
      if (Math.abs(trans.changes.dominance.delta) > 0.1) {
        lines.push(`    Dominance: ${trans.changes.dominance.from.toFixed(2)} → ${trans.changes.dominance.to.toFixed(2)} (${trans.changes.dominance.delta > 0 ? '+' : ''}${trans.changes.dominance.delta.toFixed(2)})`);
      }
      lines.push(`    Emotional Intensity: ${trans.changes.emotionalIntensity.from.toFixed(2)} → ${trans.changes.emotionalIntensity.to.toFixed(2)} (${trans.changes.emotionalIntensity.delta > 0 ? '+' : ''}${trans.changes.emotionalIntensity.delta.toFixed(2)})`);
    });
    lines.push('');
  }

  // Peaks and valleys
  if (analysis.peaks.emotionalIntensity.length > 0) {
    lines.push('⛰️  EMOTIONAL INTENSITY PEAKS');
    lines.push('─'.repeat(80));
    analysis.peaks.emotionalIntensity.forEach((peak, idx) => {
      lines.push(`  Peak ${idx + 1}: Turn ${peak.turn} (Intensity: ${peak.intensity.toFixed(2)})`);
      lines.push(`    "${peak.message}"`);
    });
    lines.push('');
  }

  if (analysis.valleys.emotionalIntensity.length > 0) {
    lines.push('🌊 EMOTIONAL INTENSITY VALLEYS');
    lines.push('─'.repeat(80));
    analysis.valleys.emotionalIntensity.forEach((valley, idx) => {
      lines.push(`  Valley ${idx + 1}: Turn ${valley.turn} (Intensity: ${valley.intensity.toFixed(2)})`);
      lines.push(`    "${valley.message}"`);
    });
    lines.push('');
  }

  // Turn-by-turn breakdown
  lines.push('📝 TURN-BY-TURN PAD SCORES');
  lines.push('─'.repeat(80));
  analysis.turns.forEach((turn, idx) => {
    const { pleasure, arousal, dominance, emotionalIntensity } = turn.pad;
    lines.push(`\nTurn ${idx}: ${turn.role.toUpperCase()}`);
    lines.push(`  "${turn.contentPreview}"`);
    lines.push(`  P: ${pleasure.toFixed(2)}  A: ${arousal.toFixed(2)}  D: ${dominance.toFixed(2)}  |  Intensity: ${emotionalIntensity.toFixed(2)}`);
    
    // Annotate significant states
    const annotations = [];
    if (pleasure < 0.4) annotations.push('⬇️ Low Pleasure (Distress)');
    if (pleasure > 0.7) annotations.push('⬆️ High Pleasure (Positive)');
    if (arousal > 0.6) annotations.push('🔥 High Arousal (Alert/Anxious)');
    if (arousal < 0.3) annotations.push('😌 Low Arousal (Calm)');
    if (dominance < 0.4) annotations.push('👤 Low Dominance (Vulnerable)');
    if (dominance > 0.6) annotations.push('👑 High Dominance (In Control)');
    if (emotionalIntensity > 0.55) annotations.push('⚡ High Intensity');
    if (emotionalIntensity < 0.3) annotations.push('🌊 Low Intensity');
    
    if (annotations.length > 0) {
      lines.push(`  ${annotations.join('  ')}`);
    }
  });
  lines.push('');
  lines.push('═'.repeat(80));

  return lines.join('\n');
}

async function main() {
  const args = process.argv.slice(2);
  const fileName = args[0];

  if (!fileName) {
    console.error('Usage: node analyze-pad-arc.js <filename>');
    console.error('Example: node analyze-pad-arc.js chatbot_arena_03.json');
    process.exit(1);
  }

  const filePath = path.join(OUTPUT_DIR, fileName);

  try {
    const content = await fs.readFile(filePath, 'utf-8');
    const data = JSON.parse(content);

    const analysis = analyzePadArc(data);
    const report = formatArcReport(analysis);

    console.log(report);
  } catch (error) {
    console.error(`Error analyzing ${fileName}:`, error.message);
    process.exit(1);
  }
}

main();

