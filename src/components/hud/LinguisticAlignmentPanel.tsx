import React from 'react';
import type { ClassifiedConversation } from '../../utils/conversationToTerrain';
import { extractLinguisticFeatures } from '../../utils/linguisticMarkers';

interface LinguisticAlignmentPanelProps {
    conversation: ClassifiedConversation;
    theme: any; // Using any for now to match strict usage in HUDOverlay, ideally strict type
}

export const LinguisticAlignmentPanel: React.FC<LinguisticAlignmentPanelProps> = ({
    conversation,
    theme
}) => {
    const { humanFeatures, aiFeatures, similarity, humanMessages, aiMessages } = React.useMemo(() => {
        if (!conversation.messages) return { humanFeatures: null, aiFeatures: null, similarity: 0.5, humanMessages: [], aiMessages: [] };

        // Separate human and AI messages
        // CRITICAL: 'user' or 'human' = HUMAN, 'assistant' or 'ai' or 'system' = AI
        const humanMessages = conversation.messages.filter(m => {
            const role = (m.role || '').toLowerCase();
            return role === 'user' || role === 'human';
        });
        const aiMessages = conversation.messages.filter(m => {
            const role = (m.role || '').toLowerCase();
            return role === 'assistant' || role === 'ai' || role === 'system';
        });

        if (humanMessages.length === 0 || aiMessages.length === 0) {
            return { humanFeatures: null, aiFeatures: null, similarity: 0.5, humanMessages: [], aiMessages: [] };
        }

        // Extract features for each
        const humanFeatures = extractLinguisticFeatures(humanMessages);
        const aiFeatures = extractLinguisticFeatures(aiMessages);

        // Calculate cosine similarity
        const humanValues = [humanFeatures.formality, humanFeatures.politeness, humanFeatures.certainty, humanFeatures.structure, humanFeatures.questionAsking, humanFeatures.inclusiveLanguage, humanFeatures.register];
        const aiValues = [aiFeatures.formality, aiFeatures.politeness, aiFeatures.certainty, aiFeatures.structure, aiFeatures.questionAsking, aiFeatures.inclusiveLanguage, aiFeatures.register];

        let dotProduct = 0;
        let humanMagnitude = 0;
        let aiMagnitude = 0;

        for (let i = 0; i < humanValues.length; i++) {
            dotProduct += humanValues[i] * aiValues[i];
            humanMagnitude += humanValues[i] * humanValues[i];
            aiMagnitude += aiValues[i] * aiValues[i];
        }

        humanMagnitude = Math.sqrt(humanMagnitude);
        aiMagnitude = Math.sqrt(aiMagnitude);

        const similarity = (humanMagnitude === 0 || aiMagnitude === 0) ? 0.5 : dotProduct / (humanMagnitude * aiMagnitude);

        return { humanFeatures, aiFeatures, similarity, humanMessages, aiMessages };
    }, [conversation]);

    if (!humanFeatures || !aiFeatures) return null;

    const alignmentScore = 1 - similarity; // 0 = aligned, 1 = divergent
    const alignmentLabel = alignmentScore < 0.4 ? 'ALIGNED' : alignmentScore > 0.6 ? 'DIVERGENT' : 'NEUTRAL';
    const alignmentColor = alignmentScore < 0.4 ? theme.accent2 : alignmentScore > 0.6 ? theme.accent5 : theme.accent;

    // Get message counts for display
    const humanMsgCount = humanMessages?.length || 0;
    const aiMsgCount = aiMessages?.length || 0;

    const features: Array<{ label: string; humanValue: number; aiValue: number }> = [
        { label: 'Formality', humanValue: humanFeatures.formality, aiValue: aiFeatures.formality },
        { label: 'Politeness', humanValue: humanFeatures.politeness, aiValue: aiFeatures.politeness },
        { label: 'Certainty', humanValue: humanFeatures.certainty, aiValue: aiFeatures.certainty },
        { label: 'Structure', humanValue: humanFeatures.structure, aiValue: aiFeatures.structure },
        { label: 'Questions', humanValue: humanFeatures.questionAsking, aiValue: aiFeatures.questionAsking },
        { label: 'Inclusive', humanValue: humanFeatures.inclusiveLanguage, aiValue: aiFeatures.inclusiveLanguage },
        { label: 'Register', humanValue: humanFeatures.register, aiValue: aiFeatures.register },
    ];

    return (
        <div style={{ marginTop: 12, marginBottom: 4 }}>
            {/* Header with alignment score */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
                padding: '6px 8px',
                background: `${alignmentColor}15`,
                borderRadius: 4,
                border: `1px solid ${alignmentColor}30`
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <span style={{ fontSize: '10px', letterSpacing: '1px', opacity: 0.7 }}>LINGUISTIC ALIGNMENT</span>
                    <span style={{ fontSize: '8px', opacity: 0.5 }}>
                        Human: {humanMsgCount} msgs | AI: {aiMsgCount} msgs
                    </span>
                </div>
                <span style={{
                    fontSize: '11px',
                    fontWeight: 'bold',
                    color: alignmentColor,
                    letterSpacing: '0.5px'
                }}>
                    {alignmentLabel} ({Math.round((1 - alignmentScore) * 100)}%)
                </span>
            </div>

            {/* Feature comparison bars */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {features.map((feature, idx) => {
                    const diff = Math.abs(feature.humanValue - feature.aiValue);
                    const matchColor = diff < 0.2 ? theme.accent2 : diff > 0.5 ? theme.accent5 : theme.foregroundMuted;

                    return (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Feature label */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '9px',
                                opacity: 0.6,
                                letterSpacing: '0.5px'
                            }}>
                                <span>{feature.label}</span>
                                <span style={{ color: matchColor, fontWeight: 'bold' }}>
                                    Δ{Math.round(diff * 100)}%
                                </span>
                            </div>

                            {/* Comparative bars */}
                            <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                                {/* Human bar (left side) */}
                                <div style={{
                                    flex: 1,
                                    height: 16,
                                    background: theme.cardRgba(0.3),
                                    borderRadius: 2,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        right: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: `${feature.humanValue * 100}%`,
                                        background: '#7b68ee',
                                        opacity: 0.8,
                                        transition: 'width 0.3s ease'
                                    }} />
                                    <span style={{
                                        position: 'absolute',
                                        right: 4,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        fontSize: '8px',
                                        fontWeight: 'bold',
                                        color: feature.humanValue > 0.3 ? '#ffffff' : theme.foreground,
                                        opacity: 0.9,
                                        pointerEvents: 'none'
                                    }}>
                                        {Math.round(feature.humanValue * 100)}%
                                    </span>
                                </div>

                                {/* AI bar (right side) */}
                                <div style={{
                                    flex: 1,
                                    height: 16,
                                    background: theme.cardRgba(0.3),
                                    borderRadius: 2,
                                    position: 'relative',
                                    overflow: 'hidden'
                                }}>
                                    <div style={{
                                        position: 'absolute',
                                        left: 0,
                                        top: 0,
                                        bottom: 0,
                                        width: `${feature.aiValue * 100}%`,
                                        background: '#f97316',
                                        opacity: 0.8,
                                        transition: 'width 0.3s ease'
                                    }} />
                                    <span style={{
                                        position: 'absolute',
                                        left: 4,
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        fontSize: '8px',
                                        fontWeight: 'bold',
                                        color: feature.aiValue > 0.3 ? '#ffffff' : theme.foreground,
                                        opacity: 0.9,
                                        pointerEvents: 'none'
                                    }}>
                                        {Math.round(feature.aiValue * 100)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 12,
                marginTop: 8,
                fontSize: '9px',
                opacity: 0.6
            }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 8, height: 8, background: '#7b68ee', borderRadius: 1 }} />
                    HUMAN
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 8, height: 8, background: '#f97316', borderRadius: 1 }} />
                    AI
                </span>
            </div>
        </div>
    );
};
