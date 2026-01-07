import React from 'react';
import type { ClassifiedConversation } from '../../utils/conversationToTerrain';
import { getColorForRole } from '../../utils/constants';
import { getDominantHumanRole, getDominantAiRole } from '../../utils/conversationToTerrain';

interface RolePatternsPanelProps {
    conversation: ClassifiedConversation;
    theme: any;
}

export const RolePatternsPanel: React.FC<RolePatternsPanelProps> = ({
    conversation,
    theme
}) => {
    return (
        <div style={{
            marginTop: 8,
            padding: '6px 10px',
            background: theme.foregroundRgba(0.1),
            border: `1px solid ${theme.foregroundRgba(0.3)}`,
            fontSize: '12px',
            marginBottom: 8
        }}>
            <div style={{ marginBottom: 4, fontWeight: 'bold', fontSize: '10px', opacity: 0.6, letterSpacing: '1px' }}>ROLE PATTERNS</div>
            {(() => {
                const humanRole = getDominantHumanRole(conversation);
                const aiRole = getDominantAiRole(conversation);

                return (
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                        {humanRole && (
                            <div>
                                <span style={{ opacity: 0.6 }}>You: </span>
                                <span style={{
                                    color: getColorForRole(humanRole.role),
                                    fontWeight: 'bold'
                                }}>
                                    {humanRole.role} ({Math.round(humanRole.value * 100)}%)
                                </span>
                            </div>
                        )}
                        {aiRole && (
                            <div>
                                <span style={{ opacity: 0.6 }}>AI: </span>
                                <span style={{
                                    color: getColorForRole(aiRole.role),
                                    fontWeight: 'bold'
                                }}>
                                    {aiRole.role} ({Math.round(aiRole.value * 100)}%)
                                </span>
                            </div>
                        )}
                    </div>
                );
            })()}
        </div>
    );
};
