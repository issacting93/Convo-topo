import React, { useMemo, useState } from 'react';
import { useConversationStore } from '../store/useConversationStore';
import { calculateVolatility } from '../utils/volatility';



const FlightRecorderPage: React.FC = () => {
    const { conversations } = useConversationStore();
    const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

    // 1. Calculate and Sort Incidents
    const incidents = useMemo(() => {
        return conversations
            .map(conv => {
                const metrics = calculateVolatility(conv);
                return {
                    id: conv.id,
                    volatility: metrics.volatility,
                    messageCount: conv.messages?.length || 0,
                    peakIntensity: metrics.peakIntensity,
                    timestamp: '2023-11-20', // Placeholder or extract from filename/meta
                    intensities: metrics.intensities, // Pass this through for the chart
                    drift: metrics.drift,
                    status: metrics.status,
                    conv: conv
                };
            })
            .sort((a, b) => b.volatility - a.volatility);
    }, [conversations]);

    const selectedIncident = incidents.find(i => i.id === selectedIncidentId) || incidents[0];

    return (
        <div style={{
            width: '100vw',
            minHeight: '100vh',
            background: '#050505',
            color: '#e0e0e0',
            fontFamily: '"JetBrains Mono", "Courier New", monospace',
            display: 'flex',
            overflowY: 'auto',
            overflowX: 'hidden'
        }}>
            {/* LEFT PANEL: INCIDENT LIST */}
            <div style={{
                width: '320px',
                borderRight: '1px solid #333',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div style={{
                    padding: '20px',
                    borderBottom: '1px solid #333',
                    background: '#0a0a0a'
                }}>
                    <h2 style={{ margin: 0, fontSize: '14px', letterSpacing: '2px', color: '#ff4444' }}>
                        FLIGHT RECORDER //
                    </h2>
                    <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                        VOLATILITY SCANNER ACTIVE
                    </div>
                </div>

                <div style={{ flex: 1, overflowY: 'auto' }}>
                    {incidents.map((incident) => (
                        <div
                            key={incident.id}
                            onClick={() => setSelectedIncidentId(incident.id)}
                            style={{
                                padding: '12px 20px',
                                borderBottom: '1px solid #1a1a1a',
                                cursor: 'pointer',
                                background: selectedIncident?.id === incident.id ? '#151515' : 'transparent',
                                borderLeft: selectedIncident?.id === incident.id ? '2px solid #ff4444' : '2px solid transparent'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '11px', color: '#fff' }}>
                                    {incident.id.slice(0, 18)}...
                                </span>
                                <span style={{
                                    fontSize: '9px',
                                    padding: '2px 4px',
                                    borderRadius: '2px',
                                    background: getStatusColor(incident.status),
                                    color: '#000',
                                    fontWeight: 'bold'
                                }}>
                                    {incident.status}
                                </span>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', fontSize: '9px', color: '#666' }}>
                                <span style={{ color: '#fff' }}>VOL: {(incident.volatility * 1000).toFixed(1)}</span>
                                <span>DRIFT: {incident.drift > 0 ? '+' : ''}{incident.drift.toFixed(2)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* MAIN PANEL: SEISMOGRAPH */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {selectedIncident && (
                    <>
                        {/* HEADER */}
                        <div style={{
                            height: '60px',
                            borderBottom: '1px solid #333',
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0 40px',
                            justifyContent: 'space-between'
                        }}>
                            <div>
                                <div style={{ fontSize: '10px', color: '#666' }}>TRAJECTORY ID</div>
                                <div style={{ fontSize: '16px' }}>{selectedIncident.id}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '10px', color: '#666' }}>SYSTEM STATUS</div>
                                <div style={{ fontSize: '16px', color: getStatusColor(selectedIncident.status) }}>
                                    {selectedIncident.status} ({selectedIncident.drift > 0 ? '+' : ''}{selectedIncident.drift.toFixed(2)})
                                </div>
                            </div>
                        </div>

                        {/* SEISMOGRAPH VIEW */}
                        <div style={{ flex: 1, padding: '40px', display: 'flex', flexDirection: 'column' }}>

                            {/* THE CHART CONTAINER */}
                            <div style={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'flex-end',
                                gap: '4px',
                                paddingBottom: '40px',
                                borderBottom: '1px solid #333',
                                position: 'relative'
                            }}>
                                {/* Horizontal Grid lines */}
                                <div style={{ position: 'absolute', top: '20%', left: 0, right: 0, height: '1px', background: '#222' }} />
                                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: '#222' }} />
                                <div style={{ position: 'absolute', top: '80%', left: 0, right: 0, height: '1px', background: '#222' }} />

                                {selectedIncident.intensities.map((intensity, i) => {
                                    const height = Math.max(5, intensity * 100);
                                    const isPeak = intensity > 0.6;

                                    return (
                                        <div
                                            key={i}
                                            className="seismic-bar"
                                            style={{
                                                flex: 1,
                                                height: `${height}%`,
                                                background: isPeak ? '#ff4444' : '#444',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                justifyContent: 'flex-end',
                                                position: 'relative',
                                                transition: 'all 0.2s',
                                                opacity: 0.8
                                            }}
                                            title={`Msg ${i + 1}: ${(intensity * 100).toFixed(0)}% Intensity`}
                                        >
                                            {/* Optional reflection effect (faint bar going down) */}
                                            <div style={{
                                                position: 'absolute',
                                                bottom: `-${height * 0.5}%`,
                                                left: 0,
                                                right: 0,
                                                height: `${height * 0.5}%`,
                                                background: isPeak ? '#ff4444' : '#444',
                                                opacity: 0.2,
                                                transform: 'scaleY(-1)'
                                            }} />
                                        </div>
                                    );
                                })}
                            </div>

                            {/* MESSAGE LOG (FORENSICS) */}
                            <div style={{ height: '200px', marginTop: '20px', overflowY: 'auto', border: '1px solid #222', padding: '20px' }}>
                                <div style={{ fontSize: '10px', color: '#666', marginBottom: '10px', borderBottom: '1px solid #222', paddingBottom: '5px' }}>
                                    FORENSIC LOG //
                                </div>
                                {selectedIncident.conv.messages?.map((msg, i) => {
                                    const intensity = selectedIncident.intensities[i];
                                    const isHigh = intensity > 0.6;

                                    return (
                                        <div key={i} style={{ marginBottom: '12px', display: 'flex', gap: '20px', opacity: isHigh ? 1 : 0.5 }}>
                                            <div style={{ width: '40px', fontSize: '10px', color: isHigh ? '#ff4444' : '#666' }}>
                                                T+{i}
                                            </div>
                                            <div style={{ flex: 1, fontSize: '12px' }}>
                                                <span style={{ color: msg.role === 'user' ? '#888' : '#ccc', marginRight: '8px' }}>
                                                    [{msg.role.toUpperCase()}]
                                                </span>
                                                {msg.content.slice(0, 160)}...
                                            </div>
                                            <div style={{ width: '60px', textAlign: 'right', fontSize: '10px', color: isHigh ? '#ff4444' : '#666' }}>
                                                {(intensity * 100).toFixed(0)}%
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

// Helpers
function getStatusColor(status: string): string {
    switch (status) {
        case 'CRASHED': return '#ff4444'; // Red
        case 'ESCALATED': return '#ffaa00'; // Amber
        case 'RECOVERED': return '#44ff44'; // Green
        default: return '#666'; // Grey
    }
}

export default FlightRecorderPage;
