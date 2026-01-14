import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface QuickWinsData {
  metadata: {
    analysis_date: string;
    total_conversations: number;
    sources: {
      chatbot_arena: number;
      wildchat: number;
    };
  };
  role_transitions: {
    [humanRole: string]: {
      [aiRole: string]: number;
    };
  };
  message_lengths: {
    user: {
      mean: number;
      median: number;
      std: number;
      min: number;
      max: number;
      count: number;
      histogram: number[];
      bins: number[];
    };
    assistant: {
      mean: number;
      median: number;
      std: number;
      min: number;
      max: number;
      count: number;
      histogram: number[];
      bins: number[];
    };
    ratio: number;
  };
  confidence: {
    overall: {
      mean: number;
      median: number;
      std: number;
      histogram: number[];
      bins: number[];
    };
  };
  pad_lifecycle: {
    phases: number[];
    pleasure: number[];
    arousal: number[];
    dominance: number[];
    emotionalIntensity: number[];
    sample_sizes: number[];
  };
  typical_conversations: Array<{
    id: string;
    source: string;
    distance: number;
    human_role: string;
    ai_role: string;
    message_count: number;
    first_message: string;
  }>;
  unusual_conversations: Array<{
    id: string;
    source: string;
    distance: number;
    human_role: string;
    ai_role: string;
    message_count: number;
    first_message: string;
  }>;
}

export function InsightsDashboardPage() {
  const [data, setData] = useState<QuickWinsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/reports/quick-wins-analysis.json')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to load insights:', err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading insights...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-20">
            <p className="text-red-600">Failed to load insights data</p>
          </div>
        </div>
      </div>
    );
  }

  const maxHistValue = Math.max(...data.message_lengths.user.histogram, ...data.message_lengths.assistant.histogram);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 mb-4 transition-colors group"
          >
            <span className="group-hover:-translate-x-1 transition-transform">←</span>
            <span>Back to Home</span>
          </Link>
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">
              📊 Quick Wins Analysis
            </h1>
          </div>
          <p className="text-lg text-gray-700">
            Instant insights from <span className="font-semibold text-indigo-600">{data.metadata.total_conversations}</span> classified conversations
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {new Date(data.metadata.analysis_date).toLocaleString()}
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="group bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl p-6 border border-indigo-100 hover:border-indigo-300 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">Total Conversations</div>
              <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-2xl">💬</div>
            </div>
            <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
              {data.metadata.total_conversations}
            </div>
            <div className="text-xs text-gray-600 flex items-center gap-2">
              <span className="px-2 py-1 bg-indigo-50 rounded text-indigo-700">{data.metadata.sources.chatbot_arena} Arena</span>
              <span className="text-gray-400">+</span>
              <span className="px-2 py-1 bg-purple-50 rounded text-purple-700">{data.metadata.sources.wildchat} WildChat</span>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl p-6 border border-green-100 hover:border-green-300 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-green-600 uppercase tracking-wide">AI/User Ratio</div>
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-2xl">📏</div>
            </div>
            <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
              {data.message_lengths.ratio.toFixed(2)}×
            </div>
            <div className="text-xs text-gray-600">
              AI responses are <span className="font-semibold text-green-700">{data.message_lengths.ratio.toFixed(1)}× longer</span>
            </div>
          </div>

          <div className="group bg-white/80 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl p-6 border border-purple-100 hover:border-purple-300 transition-all duration-300 hover:scale-105">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-semibold text-purple-600 uppercase tracking-wide">Confidence</div>
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-2xl">🎯</div>
            </div>
            <div className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              {(data.confidence.overall.mean * 100).toFixed(1)}%
            </div>
            <div className="text-xs text-gray-600">
              Standard deviation: <span className="font-semibold text-purple-700">{(data.confidence.overall.std * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>

        {/* Role Transitions Matrix */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 md:p-8 mb-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 flex items-center justify-center text-2xl">🔄</div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Role Transitions</h2>
              <p className="text-sm text-gray-600">Most common human → AI role pairings</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left p-3 font-bold text-gray-700 bg-gray-50">Human Role</th>
                  <th className="text-left p-3 font-bold text-gray-700 bg-gray-50">AI Role</th>
                  <th className="text-right p-3 font-bold text-gray-700 bg-gray-50">Count</th>
                  <th className="text-right p-3 font-bold text-gray-700 bg-gray-50">Percentage</th>
                  <th className="text-left p-3 font-bold text-gray-700 bg-gray-50">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(data.role_transitions)
                  .flatMap(([humanRole, aiRoles]) =>
                    Object.entries(aiRoles).map(([aiRole, count]) => ({
                      humanRole,
                      aiRole,
                      count,
                    }))
                  )
                  .sort((a, b) => b.count - a.count)
                  .map(({ humanRole, aiRole, count }) => {
                    const percentage = (count / data.metadata.total_conversations) * 100;
                    return (
                      <tr key={`${humanRole}-${aiRole}`} className="border-b border-gray-200 hover:bg-gradient-to-r hover:from-teal-50 hover:to-cyan-50 transition-colors">
                        <td className="p-3">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            {humanRole}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
                            {aiRole}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-gray-900">{count}</td>
                        <td className="p-3 text-right font-mono text-teal-600 font-semibold">{percentage.toFixed(1)}%</td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-100 rounded-full overflow-hidden h-6">
                              <div
                                className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Confidence Distribution */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 md:p-8 mb-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">🎯</div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Classification Confidence</h2>
          </div>

          {/* Stats Table */}
          <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
              <div className="text-sm font-semibold text-purple-700 mb-1">Mean Confidence</div>
              <div className="text-3xl font-bold text-purple-900">{(data.confidence.overall.mean * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-gradient-to-br from-pink-50 to-pink-100 p-4 rounded-lg border border-pink-200">
              <div className="text-sm font-semibold text-pink-700 mb-1">Median Confidence</div>
              <div className="text-3xl font-bold text-pink-900">{(data.confidence.overall.median * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 p-4 rounded-lg border border-indigo-200">
              <div className="text-sm font-semibold text-indigo-700 mb-1">Std Deviation</div>
              <div className="text-3xl font-bold text-indigo-900">{(data.confidence.overall.std * 100).toFixed(1)}%</div>
            </div>
          </div>

          {/* Histogram */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-purple-500"></span>
              Confidence Score Distribution
            </h3>
            <div className="space-y-1.5">
              {data.confidence.overall.histogram.map((count, idx) => {
                const binStart = data.confidence.overall.bins[idx] * 100;
                const binEnd = data.confidence.overall.bins[idx + 1] * 100;
                const maxCount = Math.max(...data.confidence.overall.histogram);
                return (
                  <div key={idx} className="flex items-center gap-2 group">
                    <span className="text-xs text-gray-500 w-24 font-mono">
                      {binStart.toFixed(0)}-{binEnd.toFixed(0)}%
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-5 rounded-full transition-all duration-500 ease-out group-hover:from-purple-600 group-hover:to-pink-600"
                        style={{ width: `${(count / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Message Length Distribution */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 md:p-8 mb-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-orange-500 flex items-center justify-center text-2xl">📏</div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Message Length Distribution</h2>
          </div>

          {/* Statistics Table */}
          <div className="mb-8 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-300">
                  <th className="text-left p-3 font-bold text-gray-700 bg-gray-50">Metric</th>
                  <th className="text-right p-3 font-bold text-blue-700 bg-blue-50">User Messages</th>
                  <th className="text-right p-3 font-bold text-orange-700 bg-orange-50">AI Messages</th>
                  <th className="text-right p-3 font-bold text-purple-700 bg-purple-50">Ratio (AI/User)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-semibold text-gray-700">Mean</td>
                  <td className="p-3 text-right font-mono text-blue-600">{data.message_lengths.user.mean.toFixed(0)} chars</td>
                  <td className="p-3 text-right font-mono text-orange-600">{data.message_lengths.assistant.mean.toFixed(0)} chars</td>
                  <td className="p-3 text-right font-mono text-purple-600 font-bold">{(data.message_lengths.assistant.mean / data.message_lengths.user.mean).toFixed(2)}×</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-semibold text-gray-700">Median</td>
                  <td className="p-3 text-right font-mono text-blue-600">{data.message_lengths.user.median.toFixed(0)} chars</td>
                  <td className="p-3 text-right font-mono text-orange-600">{data.message_lengths.assistant.median.toFixed(0)} chars</td>
                  <td className="p-3 text-right font-mono text-purple-600">{(data.message_lengths.assistant.median / data.message_lengths.user.median).toFixed(2)}×</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-semibold text-gray-700">Std Dev</td>
                  <td className="p-3 text-right font-mono text-blue-600">{data.message_lengths.user.std.toFixed(0)} chars</td>
                  <td className="p-3 text-right font-mono text-orange-600">{data.message_lengths.assistant.std.toFixed(0)} chars</td>
                  <td className="p-3 text-right text-gray-400">—</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-semibold text-gray-700">Min</td>
                  <td className="p-3 text-right font-mono text-blue-600">{data.message_lengths.user.min} chars</td>
                  <td className="p-3 text-right font-mono text-orange-600">{data.message_lengths.assistant.min} chars</td>
                  <td className="p-3 text-right text-gray-400">—</td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="p-3 font-semibold text-gray-700">Max</td>
                  <td className="p-3 text-right font-mono text-blue-600">{data.message_lengths.user.max} chars</td>
                  <td className="p-3 text-right font-mono text-orange-600">{data.message_lengths.assistant.max} chars</td>
                  <td className="p-3 text-right text-gray-400">—</td>
                </tr>
                <tr className="bg-gray-100 font-bold">
                  <td className="p-3 font-bold text-gray-800">Total Messages</td>
                  <td className="p-3 text-right font-mono text-blue-700">{data.message_lengths.user.count.toLocaleString()}</td>
                  <td className="p-3 text-right font-mono text-orange-700">{data.message_lengths.assistant.count.toLocaleString()}</td>
                  <td className="p-3 text-right text-gray-400">—</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Histograms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* User */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                User Message Lengths
              </h3>
              <div className="space-y-1.5">
                {data.message_lengths.user.histogram.map((count, idx) => (
                  <div key={idx} className="flex items-center gap-2 group">
                    <span className="text-xs text-gray-500 w-24 font-mono">
                      {Math.round(data.message_lengths.user.bins[idx])}-{Math.round(data.message_lengths.user.bins[idx + 1])}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-indigo-500 h-5 rounded-full transition-all duration-500 ease-out group-hover:from-blue-600 group-hover:to-indigo-600"
                        style={{ width: `${(count / maxHistValue) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-12 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Assistant */}
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
                AI Message Lengths
              </h3>
              <div className="space-y-1.5">
                {data.message_lengths.assistant.histogram.map((count, idx) => (
                  <div key={idx} className="flex items-center gap-2 group">
                    <span className="text-xs text-gray-500 w-24 font-mono">
                      {Math.round(data.message_lengths.assistant.bins[idx])}-{Math.round(data.message_lengths.assistant.bins[idx + 1])}
                    </span>
                    <div className="flex-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-red-500 h-5 rounded-full transition-all duration-500 ease-out group-hover:from-orange-600 group-hover:to-red-600"
                        style={{ width: `${(count / maxHistValue) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-gray-700 w-12 text-right">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* PAD Lifecycle */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 md:p-8 mb-8 border border-gray-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-red-500 via-purple-500 to-blue-500 flex items-center justify-center text-2xl">📈</div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Average Conversation Lifecycle</h2>
          </div>
          <p className="text-sm text-gray-600 mb-8 bg-indigo-50 p-4 rounded-lg border border-indigo-100">
            <span className="font-semibold text-indigo-700">How emotional dimensions evolve:</span> Each conversation is normalized to 10 phases, showing the typical emotional journey from start to finish.
          </p>

          <div className="space-y-8">
            {(['pleasure', 'arousal', 'dominance', 'emotionalIntensity'] as const).map((dimension) => {
              const values = data.pad_lifecycle[dimension];
              const minVal = Math.min(...values);
              const maxVal = Math.max(...values);
              const range = maxVal - minVal;

              return (
                <div key={dimension} className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 capitalize flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${dimension === 'pleasure' ? 'bg-blue-500' :
                          dimension === 'arousal' ? 'bg-orange-500' :
                            dimension === 'dominance' ? 'bg-purple-500' :
                              'bg-red-500'
                        }`} />
                      {dimension}
                    </h3>
                    <span className="text-xs text-gray-500 font-mono">Range: {minVal.toFixed(2)} - {maxVal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-end gap-2 h-40 mb-3">
                    {values.map((val, idx) => {
                      const height = range > 0 ? ((val - minVal) / range) * 100 : 50;
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 group">
                          <div className="relative w-full bg-gray-100 rounded-t flex items-end transition-all duration-300 hover:bg-gray-200" style={{ height: '100%' }}>
                            <div
                              className={`w-full rounded-t transition-all duration-500 group-hover:scale-y-105 origin-bottom ${dimension === 'pleasure' ? 'bg-gradient-to-t from-blue-600 to-blue-400' :
                                  dimension === 'arousal' ? 'bg-gradient-to-t from-orange-600 to-orange-400' :
                                    dimension === 'dominance' ? 'bg-gradient-to-t from-purple-600 to-purple-400' :
                                      'bg-gradient-to-t from-red-600 to-red-400'
                                }`}
                              style={{ height: `${height}%` }}
                              title={`Phase ${idx}: ${val.toFixed(3)}`}
                            />
                          </div>
                          <span className="text-xs text-gray-500 font-mono group-hover:font-bold transition-all">{idx}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-gray-600">Start: <span className="text-gray-900">{values[0].toFixed(3)}</span></span>
                    <span className="text-gray-600">End: <span className="text-gray-900">{values[values.length - 1].toFixed(3)}</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Typical vs Unusual Conversations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Most Typical */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 md:p-8 border border-green-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-2xl">🎯</div>
              <h2 className="text-2xl font-bold text-gray-900">
                Most Typical
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-6 bg-green-50 p-3 rounded-lg border border-green-100">
              Conversations closest to median PAD values - these represent the <span className="font-semibold text-green-700">most common patterns</span>
            </p>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {data.typical_conversations.slice(0, 10).map((conv, idx) => (
                <div key={conv.id} className="group border border-green-200 rounded-lg p-4 hover:bg-green-50 hover:border-green-300 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 font-semibold">
                        {conv.source}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">d: {conv.distance.toFixed(4)}</span>
                  </div>
                  <div className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">{conv.human_role}</span>
                    <span className="text-gray-400">→</span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">{conv.ai_role}</span>
                  </div>
                  <div className="text-xs text-gray-600 mb-2 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <span>💬</span>
                      <span>{conv.message_count} turns</span>
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 italic line-clamp-2 bg-gray-50 p-2 rounded group-hover:bg-white transition-colors">
                    "{conv.first_message}"
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Most Unusual */}
          <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg p-6 md:p-8 border border-purple-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-2xl">🌟</div>
              <h2 className="text-2xl font-bold text-gray-900">
                Most Unusual
              </h2>
            </div>
            <p className="text-sm text-gray-600 mb-6 bg-purple-50 p-3 rounded-lg border border-purple-100">
              Conversations furthest from median PAD values - these show <span className="font-semibold text-purple-700">rare and distinctive patterns</span>
            </p>
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {data.unusual_conversations.slice(0, 10).map((conv, idx) => (
                <div key={conv.id} className="group border border-purple-200 rounded-lg p-4 hover:bg-purple-50 hover:border-purple-300 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-100 text-purple-700 text-xs font-bold">
                        {idx + 1}
                      </span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 font-semibold">
                        {conv.source}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 font-mono">d: {conv.distance.toFixed(4)}</span>
                  </div>
                  <div className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">{conv.human_role}</span>
                    <span className="text-gray-400">→</span>
                    <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded">{conv.ai_role}</span>
                  </div>
                  <div className="text-xs text-gray-600 mb-2 flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <span>💬</span>
                      <span>{conv.message_count} turns</span>
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 italic line-clamp-2 bg-gray-50 p-2 rounded group-hover:bg-white transition-colors">
                    "{conv.first_message}"
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
