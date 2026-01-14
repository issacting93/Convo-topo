import { useState, useMemo, useEffect } from 'react';
import { useConversationStore } from '../store/useConversationStore';
import { Navigation } from '../components/Navigation';

// Modular Components
import { OverviewContainer } from '../components/DISPictorial/OverviewContainer';
import { EncodingContainer } from '../components/DISPictorial/EncodingContainer';
import { TrajectoryContainer } from '../components/DISPictorial/TrajectoryContainer';
import { LandscapesContainer } from '../components/DISPictorial/LandscapesContainer';
import { ComparisonContainer } from '../components/DISPictorial/ComparisonContainer';
import { DesignContainer } from '../components/DISPictorial/DesignContainer';

// Tab definitions
const TABS = [
    { id: 'overview', label: 'Fig 1: Overview', title: 'Terrain Overview vs. Transcript' },
    { id: 'encoding', label: 'Fig 2: Encoding', title: 'Spatial Encoding Model (Tuning Fork)' },
    { id: 'trajectory', label: 'Fig 3: Trajectory', title: 'Trajectory Construction' },
    { id: 'landscapes', label: 'Fig 4: Landscapes', title: 'Clustered Landscapes' },
    { id: 'comparison', label: 'Fig 5: Comparison', title: 'Same Roles, Different Journeys' },
    { id: 'design', label: 'Fig 6: Design', title: 'Design Intervention (HUD)' },
];

export function DISPictorialPage() {
    const [activeTab, setActiveTab] = useState(TABS[0].id);
    const conversations = useConversationStore(state => state.conversations);
    const loading = useConversationStore(state => state.loading);
    const error = useConversationStore(state => state.error);
    const initialize = useConversationStore(state => state.initialize);

    // Initialize store on mount
    useEffect(() => {
        initialize();
    }, [initialize]);

    // Get a default conversation for initial visualization
    // Ideally detailed one
    const defaultConversation = useMemo(() => {
        if (conversations.length === 0) return null;
        // Try to find a reasonably long conversation
        return conversations.find(c => c.messages.length > 10) || conversations[0];
    }, [conversations]);

    return (
        <div style={{ width: '100vw', height: '100vh', background: '#030213', color: '#fff', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Navigation />

            {/* Header & Tabs */}
            <div style={{ padding: '20px 40px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <h1 style={{ fontSize: '24px', fontWeight: '300', marginBottom: '20px', letterSpacing: '2px' }}>
                    DIS 2026 PICTORIAL SUBMISSION FIGURES
                </h1>

                <div style={{ display: 'flex', gap: '10px' }}>
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                padding: '10px 20px',
                                background: activeTab === tab.id ? 'rgba(123, 104, 238, 0.2)' : 'transparent',
                                border: `1px solid ${activeTab === tab.id ? '#7b68ee' : 'rgba(255,255,255,0.2)'}`,
                                color: activeTab === tab.id ? '#7b68ee' : '#888',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontFamily: 'monospace',
                                fontSize: '12px',
                                transition: 'all 0.2s',
                                textTransform: 'uppercase',
                                letterSpacing: '1px'
                            }}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 20, left: 40, zIndex: 10 }}>
                    <h2 style={{ fontSize: '16px', color: '#888', fontWeight: 'normal' }}>
                        {TABS.find(t => t.id === activeTab)?.title}
                    </h2>
                </div>

                {loading && conversations.length === 0 ? (
                    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 20 }}>
                        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid rgba(255,255,255,0.1)', borderTopColor: '#7b68ee', animation: 'spin 1s linear infinite' }}></div>
                        <div style={{ color: '#888', fontFamily: 'monospace' }}>Loading Data...</div>
                        <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                    </div>
                ) : error ? (
                    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: 20 }}>
                        <div style={{ color: '#ff6b6b', fontSize: '16px' }}>Error Loading Data</div>
                        <div style={{ color: '#888', fontFamily: 'monospace' }}>{error}</div>
                        <button onClick={() => initialize()} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', cursor: 'pointer' }}>Retry</button>
                    </div>
                ) : activeTab === 'overview' && defaultConversation ? (
                    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
                        {/* Left: Transcript View */}
                        <div style={{
                            width: '30%',
                            borderRight: '1px solid rgba(255,255,255,0.1)',
                            background: '#0a0a0a',
                            padding: '60px 20px 20px 20px',
                            overflowY: 'auto',
                            fontFamily: 'monospace',
                            fontSize: '12px'
                        }}>
                            <div style={{ marginBottom: '20px', color: '#888', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                Raw Log / Transcript
                            </div>
                            {defaultConversation.messages.slice(0, 50).map((msg: any, i: number) => (
                                <div key={i} style={{ marginBottom: '15px' }}>
                                    <span style={{
                                        color: msg.role === 'user' ? '#7b68ee' : '#f97316',
                                        fontWeight: 'bold'
                                    }}>
                                        {msg.role === 'user' ? 'HUMAN' : 'AI'}
                                    </span>
                                    <div style={{ color: '#ccc', marginTop: '4px', lineHeight: '1.4' }}>
                                        {msg.content}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Right: Terrain View */}
                        <div style={{ flex: 1, position: 'relative' }}>
                            <OverviewContainer conversation={defaultConversation} />
                        </div>
                    </div>
                ) : activeTab === 'encoding' ? (
                    <div style={{ width: '100%', height: '100%' }}>
                        <EncodingContainer />
                    </div>
                ) : activeTab === 'trajectory' && defaultConversation ? (
                    <div style={{ width: '100%', height: '100%' }}>
                        <TrajectoryContainer conversation={defaultConversation} />
                    </div>
                ) : activeTab === 'landscapes' ? (
                    <div style={{ width: '100%', height: '100%' }}>
                        <LandscapesContainer conversations={conversations.slice(0, 50)} />
                    </div>
                ) : activeTab === 'comparison' ? (
                    <div style={{ width: '100%', height: '100%' }}>
                        <ComparisonContainer conversations={conversations} />
                    </div>
                ) : activeTab === 'design' && defaultConversation ? (
                    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#222' }}>
                        <DesignContainer conversation={defaultConversation} />
                    </div>
                ) : (
                    // Placeholder/Fallback
                    <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        color: 'rgba(255,255,255,0.3)',
                        fontFamily: 'monospace'
                    }}>
                        {conversations.length === 0 ? (
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                                <div>No conversations found.</div>
                                <button onClick={() => initialize()} style={{ padding: '8px 16px', background: 'rgba(255, 255, 255, 0.1)', border: 'none', color: '#fff', cursor: 'pointer' }}>Reload Data</button>
                            </div>
                        ) : (
                            <div>
                                Rendering {activeTab}... (Pending)
                                <br />
                                Loaded {conversations.length} conversations.
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
