import React from 'react';

export interface FilterState {
  pattern: string; // 'all' | specific pattern
  tone: string; // 'all' | specific tone
  intensityRange: [number, number]; // [min, max]
  messageCountRange: [number, number]; // [min, max]
  source?: string; // 'all' | 'chatbot_arena' | 'wildchat' | 'oasst'
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availablePatterns: string[];
  availableTones: string[];
  intensityRange: [number, number]; // Full range available
  messageCountRange: [number, number]; // Full range available
  style?: React.CSSProperties;
}

const THEME = {
  foreground: '#151515',
  foregroundMuted: '#666666',
  accent: '#7b68ee',
  border: 'rgba(0, 0, 0, 0.1)',
  card: '#ffffff',
  cardRgba: (alpha: number) => `rgba(255, 255, 255, ${alpha})`,
  borderRgba: (alpha: number) => `rgba(0, 0, 0, ${alpha})`,
  accentRgba: (alpha: number) => `rgba(123, 104, 238, ${alpha})`,
};

export function FilterPanel({
  filters,
  onFiltersChange,
  availablePatterns,
  availableTones,
  intensityRange,
  messageCountRange,
  style
}: FilterPanelProps) {
  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  // Check if filters are at default/empty state
  const hasActiveFilters = 
    filters.pattern !== 'all' ||
    filters.tone !== 'all' ||
    filters.intensityRange[0] !== 0 ||
    filters.intensityRange[1] !== 1 ||
    filters.messageCountRange[0] !== messageCountRange[0] ||
    filters.messageCountRange[1] !== messageCountRange[1] ||
    (filters.source && filters.source !== 'all');

  const resetFilters = () => {
    onFiltersChange({
      pattern: 'all',
      tone: 'all',
      intensityRange: [0, 1], // Reset to full range 0-1
      messageCountRange: messageCountRange, // Keep using provided full range
      source: 'all'
    });
  };

  return (
    <div style={{
      background: THEME.card,
      border: `1px solid ${THEME.border}`,
      borderRadius: 8,
      padding: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
      ...style
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: 600,
          color: THEME.foreground
        }}>
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            style={{
              padding: '4px 8px',
              background: THEME.borderRgba(0.1),
              border: `1px solid ${THEME.border}`,
              borderRadius: 4,
              color: THEME.foreground,
              cursor: 'pointer',
              fontSize: '12px'
            }}
          >
            Clear All
          </button>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Pattern Filter */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            color: THEME.foreground,
            marginBottom: 8
          }}>
            Interaction Pattern
          </label>
          <select
            value={filters.pattern}
            onChange={(e) => updateFilter('pattern', e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px',
              background: THEME.card,
              border: `1px solid ${THEME.border}`,
              borderRadius: 4,
              color: THEME.foreground,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Patterns</option>
            {availablePatterns.map(pattern => (
              <option key={pattern} value={pattern}>
                {pattern.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Tone Filter */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            color: THEME.foreground,
            marginBottom: 8
          }}>
            Emotional Tone
          </label>
          <select
            value={filters.tone}
            onChange={(e) => updateFilter('tone', e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px',
              background: THEME.card,
              border: `1px solid ${THEME.border}`,
              borderRadius: 4,
              color: THEME.foreground,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Tones</option>
            {availableTones.map(tone => (
              <option key={tone} value={tone}>
                {tone.charAt(0).toUpperCase() + tone.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Intensity Range Filter */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            color: THEME.foreground,
            marginBottom: 8
          }}>
            Emotional Intensity: {filters.intensityRange[0].toFixed(2)} - {filters.intensityRange[1].toFixed(2)}
          </label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="range"
              min={intensityRange[0]}
              max={intensityRange[1]}
              step={0.01}
              value={filters.intensityRange[0]}
              onChange={(e) => updateFilter('intensityRange', [parseFloat(e.target.value), filters.intensityRange[1]])}
              style={{ flex: 1 }}
            />
            <input
              type="range"
              min={intensityRange[0]}
              max={intensityRange[1]}
              step={0.01}
              value={filters.intensityRange[1]}
              onChange={(e) => updateFilter('intensityRange', [filters.intensityRange[0], parseFloat(e.target.value)])}
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {/* Message Count Range Filter */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            color: THEME.foreground,
            marginBottom: 8
          }}>
            Message Count: {filters.messageCountRange[0]} - {filters.messageCountRange[1]}
          </label>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              type="range"
              min={messageCountRange[0]}
              max={messageCountRange[1]}
              step={1}
              value={filters.messageCountRange[0]}
              onChange={(e) => updateFilter('messageCountRange', [parseInt(e.target.value), filters.messageCountRange[1]])}
              style={{ flex: 1 }}
            />
            <input
              type="range"
              min={messageCountRange[0]}
              max={messageCountRange[1]}
              step={1}
              value={filters.messageCountRange[1]}
              onChange={(e) => updateFilter('messageCountRange', [filters.messageCountRange[0], parseInt(e.target.value)])}
              style={{ flex: 1 }}
            />
          </div>
        </div>

        {/* Source Filter */}
        <div>
          <label style={{
            display: 'block',
            fontSize: '13px',
            fontWeight: 500,
            color: THEME.foreground,
            marginBottom: 8
          }}>
            Source
          </label>
          <select
            value={filters.source || 'all'}
            onChange={(e) => updateFilter('source', e.target.value)}
            style={{
              width: '100%',
              padding: '6px 10px',
              background: THEME.card,
              border: `1px solid ${THEME.border}`,
              borderRadius: 4,
              color: THEME.foreground,
              fontSize: '13px',
              cursor: 'pointer'
            }}
          >
            <option value="all">All Sources</option>
            <option value="chatbot_arena">Chatbot Arena</option>
            <option value="wildchat">WildChat</option>
            <option value="oasst">OASST</option>
          </select>
        </div>
      </div>

      {/* Filter Summary */}
      {hasActiveFilters && (
        <div style={{
          marginTop: 16,
          padding: '8px 12px',
          background: THEME.accentRgba(0.1),
          border: `1px solid ${THEME.accentRgba(0.3)}`,
          borderRadius: 4,
          fontSize: '12px',
          color: THEME.foreground
        }}>
          <strong>Active Filters:</strong>
          <ul style={{ margin: '4px 0 0 0', paddingLeft: 20 }}>
            {filters.pattern !== 'all' && <li>Pattern: {filters.pattern}</li>}
            {filters.tone !== 'all' && <li>Tone: {filters.tone}</li>}
            {(filters.intensityRange[0] !== 0 || filters.intensityRange[1] !== 1) && (
              <li>Intensity: {filters.intensityRange[0].toFixed(2)} - {filters.intensityRange[1].toFixed(2)}</li>
            )}
            {(filters.messageCountRange[0] !== messageCountRange[0] || filters.messageCountRange[1] !== messageCountRange[1]) && (
              <li>Messages: {filters.messageCountRange[0]} - {filters.messageCountRange[1]}</li>
            )}
            {filters.source && filters.source !== 'all' && (
              <li>Source: {
                filters.source === 'chatbot_arena' ? 'Chatbot Arena' :
                filters.source === 'wildchat' ? 'WildChat' :
                filters.source === 'oasst' ? 'OASST' :
                filters.source
              }</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

