import { useState, useMemo } from 'react';
import type { TerrainParams } from '../utils/terrain';
import { generate2DPathPoints } from '../utils/terrain';
import { getCommunicationFunction, getConversationStructure, type ClassifiedConversation, getDominantHumanRole, getDominantAiRole } from '../utils/conversationToTerrain';
import { getPadChangeColorHex } from '../utils/padPathColors';
import { Navigation } from './Navigation';
// Removed unused import: getClassificationStats
import {
  extractEpistemicFlags,
  getEpistemicStatusColor
} from '../utils/epistemicMetadata';
import {
  extractFailureFlags,
  getFailureStatusColor
} from '../utils/failureModeMetadata';

// Removed unused theme helpers and THEME object

interface TerrainPreview {
  id: number;
  name: string;
  seed: number;
  description: string;
  heightParams?: Partial<TerrainParams>;
  xyz?: { x: number; y: number; z: number };
  pathPoints2D?: Array<{ x: number; y: number; role: 'user' | 'assistant' }>;
}

interface CompactCardProps {
  terrain: TerrainPreview;
  conversation?: ClassifiedConversation;
  onSelect: (terrain: TerrainPreview) => void;
}

function CompactCard({ terrain, conversation, onSelect }: CompactCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const minimapPoints = useMemo(() => {
    if (terrain.pathPoints2D && terrain.pathPoints2D.length > 0) {
      return terrain.pathPoints2D;
    }
    if (!conversation || !conversation.messages || conversation.messages.length === 0) {
      return [];
    }
    const commFunc = getCommunicationFunction(conversation);
    const convStruct = getConversationStructure(conversation);
    const preparedMessages = conversation.messages.map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
      communicationFunction: commFunc,
      conversationStructure: convStruct
    }));
    return generate2DPathPoints(preparedMessages);
  }, [terrain.pathPoints2D, conversation]);

  // Removed unused classificationStats

  const epistemicFlags = useMemo(() =>
    conversation ? extractEpistemicFlags(conversation) : null,
    [conversation]
  );

  const failureFlags = useMemo(() =>
    conversation ? extractFailureFlags(conversation) : null,
    [conversation]
  );

  const dominantHumanRole = conversation ? getDominantHumanRole(conversation) : null;
  const dominantAiRole = conversation ? getDominantAiRole(conversation) : null;
  const messageCount = conversation?.messages?.length ?? 0;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#ffffff',
        border: isHovered ? '2px solid rgba(123, 104, 238, 0.5)' : '1px solid rgba(0, 0, 0, 0.1)',
        borderRadius: 8,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 4px 12px rgba(0, 0, 0, 0.15)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
        fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
        overflow: 'hidden'
      }}
      role="button"
      tabIndex={0}
      onClick={() => onSelect(terrain)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(terrain);
        }
      }}
    >
      {/* Compact Header */}
      <div style={{
        padding: '6px 10px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 6,
        background: isHovered ? 'rgba(123, 104, 238, 0.05)' : 'transparent',
        transition: 'background 0.2s ease'
      }}>
        <span style={{
          fontSize: '11px',
          fontWeight: 600,
          color: '#1a1a1a',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          flex: 1
        }}>
          {terrain.name}
        </span>
        {failureFlags?.hasBreakdown && (
          <span style={{
            fontSize: '9px',
            padding: '1px 4px',
            borderRadius: 3,
            backgroundColor: getFailureStatusColor(failureFlags) + '40',
            border: `1px solid ${getFailureStatusColor(failureFlags)}`,
            color: getFailureStatusColor(failureFlags),
            fontWeight: 'bold',
            whiteSpace: 'nowrap'
          }}>
            🔴
          </span>
        )}
        {epistemicFlags && (epistemicFlags.hasHallucination || epistemicFlags.hasError) && !failureFlags?.hasBreakdown && (
          <span style={{
            fontSize: '9px',
            padding: '1px 4px',
            borderRadius: 3,
            backgroundColor: getEpistemicStatusColor(epistemicFlags) + '40',
            border: `1px solid ${getEpistemicStatusColor(epistemicFlags)}`,
            color: getEpistemicStatusColor(epistemicFlags),
            fontWeight: 'bold',
            whiteSpace: 'nowrap'
          }}>
            ⚠
          </span>
        )}
      </div>

      {/* Compact Minimap */}
      <div style={{
        width: '100%',
        height: 140,
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        background: '#f8f8f8'
      }}>
        {terrain.xyz ? (
          <svg
            width="100%"
            height="100%"
            style={{ display: 'block' }}
            viewBox="0 0 256 256"
            preserveAspectRatio="xMidYMid meet"
          >
            {/* Grid lines */}
            <line x1="0" y1="128" x2="256" y2="128" stroke="rgba(0, 0, 0, 0.2)" strokeWidth="0.5" strokeDasharray="2,2" />
            <line x1="128" y1="0" x2="128" y2="256" stroke="rgba(0, 0, 0, 0.2)" strokeWidth="0.5" strokeDasharray="2,2" />

            {/* Path line */}
            {minimapPoints.length > 1 && (
              <>
                {minimapPoints.map((p: { x: number; y: number; role: 'user' | 'assistant' }, idx: number) => {
                  if (idx === 0) return null;
                  const prevPoint = minimapPoints[idx - 1];
                  const x1 = 20 + prevPoint.x * (256 - 40);
                  const y1 = 20 + prevPoint.y * (256 - 40);
                  const x2 = 20 + p.x * (256 - 40);
                  const y2 = 20 + p.y * (256 - 40);

                  let padChange = 0;
                  if (conversation && conversation.messages && conversation.messages.length > idx) {
                    const prevMsg = conversation.messages[idx - 1];
                    const currMsg = conversation.messages[idx];
                    if (prevMsg?.pad?.emotionalIntensity !== undefined && currMsg?.pad?.emotionalIntensity !== undefined) {
                      padChange = (currMsg.pad.emotionalIntensity - prevMsg.pad.emotionalIntensity) * 2;
                      padChange = Math.max(-1, Math.min(1, padChange));
                    }
                  }

                  const color = getPadChangeColorHex(padChange);
                  return (
                    <line
                      key={`line-${idx}`}
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={color}
                      strokeWidth="1.5"
                      opacity={0.7}
                    />
                  );
                })}
                {minimapPoints.map((p: { x: number; y: number; role: 'user' | 'assistant' }, idx: number) => {
                  const x = 20 + p.x * (256 - 40);
                  const y = 20 + p.y * (256 - 40);
                  return (
                    <circle
                      key={`point-${idx}`}
                      cx={x}
                      cy={y}
                      r={idx === 0 ? 3 : 2}
                      fill={p.role === 'user' ? '#4ade80' : '#7b68ee'}
                      stroke="#ffffff"
                      strokeWidth="0.5"
                      opacity={idx === minimapPoints.length - 1 ? 1 : 0.6}
                    />
                  );
                })}
              </>
            )}
          </svg>
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#999',
            fontSize: '11px'
          }}>
            No terrain data
          </div>
        )}
      </div>

      {/* Compact Info */}
      <div style={{
        padding: '8px 10px',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        flex: 1,
        fontSize: '10px',
        color: '#666'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Messages:</span>
          <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{messageCount}</span>
        </div>
        {dominantHumanRole && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Human:</span>
            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{dominantHumanRole.role}</span>
          </div>
        )}
        {dominantAiRole && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>AI:</span>
            <span style={{ fontWeight: 600, color: '#1a1a1a' }}>{dominantAiRole.role}</span>
          </div>
        )}
        {terrain.xyz && (
          <div style={{
            marginTop: 4,
            paddingTop: 4,
            borderTop: '1px solid rgba(0, 0, 0, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 8,
            fontSize: '9px'
          }}>
            <span>X: <strong>{terrain.xyz.x.toFixed(2)}</strong></span>
            <span>Y: <strong>{terrain.xyz.y.toFixed(2)}</strong></span>
            <span>Z: <strong>{terrain.xyz.z.toFixed(2)}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
}

interface CompactGridViewProps {
  terrains: TerrainPreview[];
  conversations: ClassifiedConversation[];
  onSelectTerrain: (terrain: TerrainPreview) => void;
}

export function CompactGridView({ terrains, conversations, onSelectTerrain }: CompactGridViewProps) {
  // Removed unused windowSize state

  const [selectedHumanRole, setSelectedHumanRole] = useState<string>('all');
  const [selectedAiRole, setSelectedAiRole] = useState<string>('all');
  const [selectedMessageCount, setSelectedMessageCount] = useState<string>('all');

  const ITEMS_TO_SHOW = 20; // Fixed: show exactly 20 conversations

  // Removed unused resize effect

  // Filter conversations
  const filteredData = useMemo(() => {
    return terrains.map((terrain, idx) => ({ terrain, conversation: conversations[idx] }))
      .filter(({ conversation }) => {
        if (!conversation) return false;

        if (selectedHumanRole !== 'all') {
          const dominantHumanRole = getDominantHumanRole(conversation);
          if (!dominantHumanRole || dominantHumanRole.role !== selectedHumanRole) {
            return false;
          }
        }

        if (selectedAiRole !== 'all') {
          const dominantAiRole = getDominantAiRole(conversation);
          if (!dominantAiRole || dominantAiRole.role !== selectedAiRole) {
            return false;
          }
        }

        if (selectedMessageCount !== 'all') {
          const messageCount = conversation.messages?.length ?? 0;
          if (selectedMessageCount === 'short' && messageCount >= 10) return false;
          if (selectedMessageCount === 'medium' && (messageCount < 10 || messageCount > 20)) return false;
          if (selectedMessageCount === 'long' && messageCount <= 20) return false;
        }

        return true;
      });
  }, [terrains, conversations, selectedHumanRole, selectedAiRole, selectedMessageCount]);

  // Take first 20
  const displayData = filteredData.slice(0, ITEMS_TO_SHOW);

  // Calculate grid layout: 4 columns, 5 rows
  const COLUMNS = 4;
  const ROWS = 5;
  const CARD_HEIGHT = 220;
  const GAP = 16;

  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#f5f5f5',
      overflow: 'hidden'
    }}>
      {/* Header with Navigation */}
      <div style={{
        padding: '16px 24px',
        borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        gap: 12
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 style={{
            margin: 0,
            fontSize: '20px',
            fontWeight: 600,
            color: '#1a1a1a',
            fontFamily: 'monospace'
          }}>
            Compact View — 20 Conversations
          </h1>
          <div style={{ fontSize: '12px', color: '#666' }}>
            Showing {displayData.length} of {filteredData.length} conversations
          </div>
        </div>
        <Navigation />
        
        {/* Filters */}
        <div style={{
          display: 'flex',
          gap: 12,
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <select
            value={selectedHumanRole}
            onChange={(e) => setSelectedHumanRole(e.target.value)}
            style={{
              padding: '6px 12px',
              border: '1px solid rgba(0, 0, 0, 0.2)',
              borderRadius: 4,
              fontSize: '12px',
              background: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Human Roles</option>
            <option value="seeker">Seeker</option>
            <option value="learner">Learner</option>
            <option value="director">Director</option>
            <option value="collaborator">Collaborator</option>
            <option value="sharer">Sharer</option>
            <option value="challenger">Challenger</option>
          </select>

          <select
            value={selectedAiRole}
            onChange={(e) => setSelectedAiRole(e.target.value)}
            style={{
              padding: '6px 12px',
              border: '1px solid rgba(0, 0, 0, 0.2)',
              borderRadius: 4,
              fontSize: '12px',
              background: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <option value="all">All AI Roles</option>
            <option value="expert">Expert</option>
            <option value="advisor">Advisor</option>
            <option value="facilitator">Facilitator</option>
            <option value="reflector">Reflector</option>
            <option value="peer">Peer</option>
            <option value="affiliative">Affiliative</option>
          </select>

          <select
            value={selectedMessageCount}
            onChange={(e) => setSelectedMessageCount(e.target.value)}
            style={{
              padding: '6px 12px',
              border: '1px solid rgba(0, 0, 0, 0.2)',
              borderRadius: 4,
              fontSize: '12px',
              background: '#ffffff',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Lengths</option>
            <option value="short">Short (&lt;10)</option>
            <option value="medium">Medium (10-20)</option>
            <option value="long">Long (&gt;20)</option>
          </select>
        </div>
      </div>

      {/* Grid Container */}
      <div style={{
        flex: 1,
        padding: GAP,
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${COLUMNS}, 1fr)`,
          gridTemplateRows: `repeat(${ROWS}, ${CARD_HEIGHT}px)`,
          gap: GAP,
          maxWidth: COLUMNS * 280 + (COLUMNS - 1) * GAP,
          width: '100%'
        }}>
          {displayData.map(({ terrain, conversation }) => (
            <div key={terrain.id} style={{ width: '100%', height: '100%' }}>
              <CompactCard
                terrain={terrain}
                conversation={conversation}
                onSelect={onSelectTerrain}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

