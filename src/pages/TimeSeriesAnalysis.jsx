import { useState, useEffect } from 'react'
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ScatterChart, Scatter, Legend
} from 'recharts'
import { TrendingUp, Activity, AlertCircle, Layers, Search } from 'lucide-react'

const SENSORS = ['methane', 'co', 'co2', 'h2s', 'temperature', 'humidity', 'vibration', 'dust_pm25', 'dust_pm10']
const METHODS = [
  { value: 'zscore', label: 'Z-Score' },
  { value: 'iqr', label: 'IQR Method' },
  { value: 'isolation_forest', label: 'Isolation Forest' },
]

export default function TimeSeriesAnalysis() {
  const [sensor, setSensor] = useState('methane')
  const [anomalyMethod, setAnomalyMethod] = useState('zscore')
  const [decomposition, setDecomposition] = useState(null)
  const [anomalies, setAnomalies] = useState(null)
  const [correlation, setCorrelation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('decomposition')

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [decRes, anomRes, corrRes] = await Promise.all([
          fetch(`/api/analysis/decompose?sensor=${sensor}&hours=24&period=20`),
          fetch(`/api/analysis/anomalies?sensor=${sensor}&method=${anomalyMethod}&hours=24`),
          fetch(`/api/analysis/correlation?sensors=methane,co,temperature,humidity,vibration`),
        ])
        setDecomposition(await decRes.json())
        setAnomalies(await anomRes.json())
        setCorrelation(await corrRes.json())
      } catch {
        // Generate fallback decomposition data
        const n = 200
        const fallbackDec = {
          timestamps: Array.from({ length: n }, (_, i) => new Date(Date.now() - (n - i) * 432000).toISOString()),
          original: Array.from({ length: n }, (_, i) => 0.8 + 0.3 * Math.sin(i / 12) + Math.random() * 0.1),
          trend: Array.from({ length: n }, (_, i) => 0.8 + i * 0.002),
          seasonal: Array.from({ length: n }, (_, i) => 0.3 * Math.sin(i / 12)),
          residual: Array.from({ length: n }, () => (Math.random() - 0.5) * 0.1),
        }
        setDecomposition(fallbackDec)
        setAnomalies({
          anomalies: [
            { index: 45, timestamp: new Date().toISOString(), value: 1.85, z_score: 3.2, severity: 'Warning' },
            { index: 120, timestamp: new Date().toISOString(), value: 2.1, z_score: 4.1, severity: 'Critical' },
          ],
          summary: { total_points: 200, anomaly_count: 2, anomaly_rate: 1.0, mean: 0.82, std: 0.18, min: 0.4, max: 2.1 }
        })
        setCorrelation({
          sensors: ['methane', 'co', 'temperature', 'humidity', 'vibration'],
          correlation_matrix: {
            methane: { methane: 1, co: 0.72, temperature: 0.45, humidity: -0.31, vibration: 0.28 },
            co: { methane: 0.72, co: 1, temperature: 0.38, humidity: -0.22, vibration: 0.15 },
            temperature: { methane: 0.45, co: 0.38, temperature: 1, humidity: -0.55, vibration: 0.12 },
            humidity: { methane: -0.31, co: -0.22, temperature: -0.55, humidity: 1, vibration: -0.08 },
            vibration: { methane: 0.28, co: 0.15, temperature: 0.12, humidity: -0.08, vibration: 1 },
          }
        })
      }
      setLoading(false)
    }
    fetchAll()
  }, [sensor, anomalyMethod])

  const tabs = [
    { id: 'decomposition', label: 'Decomposition', icon: Layers },
    { id: 'anomalies', label: 'Anomaly Detection', icon: AlertCircle },
    { id: 'correlation', label: 'Correlation', icon: Search },
  ]

  const prepDecompData = () => {
    if (!decomposition) return []
    return decomposition.timestamps?.map((ts, i) => ({
      index: i,
      time: new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      original: decomposition.original?.[i]?.toFixed(3),
      trend: decomposition.trend?.[i]?.toFixed(3),
      seasonal: decomposition.seasonal?.[i]?.toFixed(4),
      residual: decomposition.residual?.[i]?.toFixed(4),
    })) || []
  }

  const getCorrColor = (v) => {
    if (v >= 0.7) return 'bg-emerald-500/60 text-white'
    if (v >= 0.4) return 'bg-emerald-500/30 text-emerald-300'
    if (v >= 0.1) return 'bg-emerald-500/10 text-emerald-400'
    if (v >= -0.1) return 'bg-white/5 text-slate-400'
    if (v >= -0.4) return 'bg-red-500/10 text-red-400'
    if (v >= -0.7) return 'bg-red-500/30 text-red-300'
    return 'bg-red-500/60 text-white'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            Time-Series Analysis
          </h1>
          <p className="text-xs text-slate-500 mt-1">Advanced decomposition, anomaly detection & correlation analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={sensor}
            onChange={(e) => setSensor(e.target.value)}
            className="bg-mine-800 border border-white/10 text-sm text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500/40"
          >
            {SENSORS.map(s => (
              <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-mine-900/60 rounded-xl border border-white/[0.06] w-fit">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'text-slate-400 hover:text-slate-300'}`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Decomposition */}
      {activeTab === 'decomposition' && decomposition && (
        <div className="space-y-4">
          {[
            { key: 'original', label: 'Original Signal', color: '#f59e0b', gradStart: 0.3 },
            { key: 'trend', label: 'Trend Component', color: '#3b82f6', gradStart: 0.2 },
            { key: 'seasonal', label: 'Seasonal Component', color: '#10b981', gradStart: 0.3 },
            { key: 'residual', label: 'Residual (Noise)', color: '#ef4444', gradStart: 0.2 },
          ].map(({ key, label, color, gradStart }) => (
            <div key={key} className="glass-card p-4">
              <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                {label}
              </h3>
              <div className="h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={prepDecompData()}>
                    <defs>
                      <linearGradient id={`g_${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={gradStart} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" tick={{ fontSize: 9 }} interval={Math.floor(prepDecompData().length / 8)} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ backgroundColor: '#131b30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey={key} stroke={color} fill={`url(#g_${key})`} strokeWidth={1.5} dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Anomaly Detection */}
      {activeTab === 'anomalies' && anomalies && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Detection Method:</span>
            {METHODS.map(m => (
              <button
                key={m.value}
                onClick={() => setAnomalyMethod(m.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${anomalyMethod === m.value ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'bg-white/[0.03] text-slate-400 hover:text-slate-300 border border-white/[0.06]'}`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {/* Summary Stats */}
          {anomalies.summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {Object.entries(anomalies.summary).map(([key, val]) => (
                <div key={key} className="glass-card p-3 text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">{key.replace('_', ' ')}</p>
                  <p className="text-lg font-bold font-mono text-white mt-1">{typeof val === 'number' ? val.toFixed(2) : val}</p>
                </div>
              ))}
            </div>
          )}

          {/* Anomaly Table */}
          {anomalies.anomalies?.length > 0 && (
            <div className="glass-card overflow-hidden">
              <div className="p-4 border-b border-white/[0.06]">
                <h3 className="text-sm font-semibold text-white">Detected Anomalies ({anomalies.anomalies.length})</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">#</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Timestamp</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Value</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Score</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Severity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {anomalies.anomalies.map((a, i) => (
                      <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                        <td className="px-4 py-2.5 text-slate-500 font-mono text-xs">{a.index}</td>
                        <td className="px-4 py-2.5 text-slate-300 text-xs font-mono">{new Date(a.timestamp).toLocaleString()}</td>
                        <td className="px-4 py-2.5 text-white font-mono font-semibold">{a.value}</td>
                        <td className="px-4 py-2.5 text-amber-400 font-mono">{a.z_score || a.anomaly_score || a.deviation || '-'}</td>
                        <td className="px-4 py-2.5">
                          <span className={a.severity === 'Critical' ? 'badge-critical' : 'badge-medium'}>{a.severity}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Correlation */}
      {activeTab === 'correlation' && correlation && (
        <div className="glass-card p-5">
          <h3 className="text-sm font-semibold text-white mb-4">Cross-Correlation Matrix</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="p-2 text-xs text-slate-500"></th>
                  {correlation.sensors?.map(s => (
                    <th key={s} className="p-2 text-xs text-slate-400 font-semibold uppercase">{s}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {correlation.sensors?.map(s1 => (
                  <tr key={s1}>
                    <td className="p-2 text-xs text-slate-400 font-semibold uppercase">{s1}</td>
                    {correlation.sensors.map(s2 => {
                      const val = correlation.correlation_matrix?.[s1]?.[s2] || 0
                      return (
                        <td key={s2} className="p-1">
                          <div className={`p-2 rounded-lg text-center text-xs font-mono font-semibold ${getCorrColor(val)} transition-all`}>
                            {val.toFixed(2)}
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 flex items-center gap-4 text-[10px] text-slate-500">
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500/60" /> Strong Positive</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500/20" /> Weak Positive</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-white/5" /> No Correlation</span>
            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-red-500/30" /> Negative</span>
          </div>
        </div>
      )}
    </div>
  )
}
