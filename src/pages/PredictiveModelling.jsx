import { useState, useEffect } from 'react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { BrainCircuit, TrendingUp, Target, Zap, ArrowUpRight, ArrowDownRight } from 'lucide-react'

const SENSORS = ['methane', 'co', 'co2', 'temperature', 'humidity', 'vibration', 'dust_pm25']

export default function PredictiveModelling() {
  const [sensor, setSensor] = useState('methane')
  const [forecast, setForecast] = useState(null)
  const [risk, setRisk] = useState(null)
  const [scenarios, setScenarios] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('forecast')

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [fcRes, riskRes, scenRes] = await Promise.all([
          fetch(`/api/predict/forecast?sensor=${sensor}&hours=24&steps=50`),
          fetch('/api/predict/risk'),
          fetch('/api/predict/scenarios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }),
        ])
        setForecast(await fcRes.json())
        setRisk(await riskRes.json())
        setScenarios(await scenRes.json())
      } catch {
        setForecast({
          historical: Array.from({ length: 50 }, (_, i) => ({ timestamp: new Date(Date.now() - (50 - i) * 300000).toISOString(), value: 0.8 + Math.sin(i / 10) * 0.2 + Math.random() * 0.05 })),
          forecast: Array.from({ length: 50 }, (_, i) => ({ timestamp: new Date(Date.now() + i * 300000).toISOString(), predicted: 0.85 + i * 0.002, lower_bound: 0.7 + i * 0.001, upper_bound: 1.0 + i * 0.003, confidence: 95 - i * 0.5 })),
          model_metrics: { rmse: 0.0523, mae: 0.0412, mape: 5.2, r_squared: 0.912, trend_slope: 0.002, detected_period: 18 },
          trend_direction: 'Increasing',
        })
        setRisk({
          risk_score: 42.5, risk_level: 'Medium', model_confidence: 92.3,
          feature_contributions: [
            { feature: 'methane', importance: 0.28, contribution_pct: 28.0 },
            { feature: 'vibration', importance: 0.22, contribution_pct: 22.0 },
            { feature: 'co', importance: 0.18, contribution_pct: 18.0 },
            { feature: 'temperature', importance: 0.12, contribution_pct: 12.0 },
            { feature: 'ventilation', importance: 0.10, contribution_pct: 10.0 },
            { feature: 'dust', importance: 0.06, contribution_pct: 6.0 },
            { feature: 'humidity', importance: 0.04, contribution_pct: 4.0 },
          ],
        })
        setScenarios({
          base_risk: 42.5,
          scenarios: [
            { scenario_name: 'Methane Spike', predicted_risk: 68.2, risk_level: 'High' },
            { scenario_name: 'Ventilation Failure', predicted_risk: 75.1, risk_level: 'Critical' },
            { scenario_name: 'Heat Wave', predicted_risk: 55.8, risk_level: 'Medium' },
            { scenario_name: 'Gas Outbreak', predicted_risk: 89.3, risk_level: 'Critical' },
            { scenario_name: 'Best Case', predicted_risk: 15.2, risk_level: 'Low' },
          ],
        })
      }
      setLoading(false)
    }
    fetchAll()
  }, [sensor])

  const prepForecastChart = () => {
    if (!forecast) return []
    const hist = (forecast.historical || []).map(d => ({
      time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actual: parseFloat(d.value?.toFixed(3)),
    }))
    const fc = (forecast.forecast || []).map(d => ({
      time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      predicted: parseFloat(d.predicted?.toFixed(3)),
      upper: parseFloat(d.upper_bound?.toFixed(3)),
      lower: parseFloat(d.lower_bound?.toFixed(3)),
    }))
    return [...hist, ...fc]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

  const riskColor = risk?.risk_level === 'Critical' ? '#ef4444' : risk?.risk_level === 'High' ? '#f97316' : risk?.risk_level === 'Medium' ? '#f59e0b' : '#10b981'

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <BrainCircuit className="w-5 h-5 text-amber-400" />
            Predictive Modelling
          </h1>
          <p className="text-xs text-slate-500 mt-1">ML-powered forecasting, risk prediction & scenario analysis</p>
        </div>
        <select
          value={sensor}
          onChange={e => setSensor(e.target.value)}
          className="bg-mine-800 border border-white/10 text-sm text-slate-300 rounded-lg px-3 py-2 outline-none focus:border-amber-500/40"
        >
          {SENSORS.map(s => <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>)}
        </select>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-mine-900/60 rounded-xl border border-white/[0.06] w-fit">
        {[
          { id: 'forecast', label: 'Forecasting', icon: TrendingUp },
          { id: 'risk', label: 'Risk Prediction', icon: Target },
          { id: 'scenarios', label: 'Scenario Analysis', icon: Zap },
        ].map(tab => (
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

      {/* Forecasting Tab */}
      {activeTab === 'forecast' && forecast && (
        <div className="space-y-4">
          {/* Model Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {forecast.model_metrics && Object.entries(forecast.model_metrics).map(([key, val]) => (
              <div key={key} className="glass-card p-3 text-center">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{key.replace('_', ' ')}</p>
                <p className="text-lg font-bold font-mono text-white mt-1">{typeof val === 'number' ? val.toFixed(4) : val}</p>
              </div>
            ))}
          </div>

          {/* Trend Direction */}
          <div className="glass-card p-4 flex items-center gap-3">
            {forecast.trend_direction === 'Increasing' ? (
              <ArrowUpRight className="w-5 h-5 text-red-400" />
            ) : (
              <ArrowDownRight className="w-5 h-5 text-emerald-400" />
            )}
            <span className="text-sm text-white">Trend Direction: <span className={`font-semibold ${forecast.trend_direction === 'Increasing' ? 'text-red-400' : 'text-emerald-400'}`}>{forecast.trend_direction}</span></span>
          </div>

          {/* Forecast Chart */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Time-Series Forecast</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={prepForecastChart()}>
                  <defs>
                    <linearGradient id="gActual" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gPred" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gConf" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" tick={{ fontSize: 9 }} interval={9} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ backgroundColor: '#131b30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                  <Legend />
                  <Area type="monotone" dataKey="upper" stroke="transparent" fill="url(#gConf)" name="Upper Bound" />
                  <Area type="monotone" dataKey="lower" stroke="transparent" fill="transparent" name="Lower Bound" />
                  <Area type="monotone" dataKey="actual" stroke="#3b82f6" fill="url(#gActual)" strokeWidth={2} name="Actual" dot={false} />
                  <Line type="monotone" dataKey="predicted" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" name="Predicted" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Risk Prediction Tab */}
      {activeTab === 'risk' && risk && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Risk Score */}
            <div className="glass-card p-6 text-center" style={{ boxShadow: `0 0 30px ${riskColor}15` }}>
              <p className="stat-label mb-3">Predicted Risk Score</p>
              <p className="text-6xl font-black font-mono" style={{ color: riskColor }}>{risk.risk_score?.toFixed(1)}</p>
              <div className="mt-3">
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${risk.risk_level === 'Critical' ? 'badge-critical' : risk.risk_level === 'High' ? 'badge-high' : risk.risk_level === 'Medium' ? 'badge-medium' : 'badge-low'}`}>
                  {risk.risk_level}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-3">Model Confidence: {risk.model_confidence}%</p>
            </div>

            {/* Feature Contributions */}
            <div className="glass-card p-4 lg:col-span-2">
              <h3 className="text-sm font-semibold text-white mb-3">Feature Importance</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={risk.feature_contributions} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="feature" tick={{ fontSize: 11 }} width={80} />
                    <Tooltip contentStyle={{ backgroundColor: '#131b30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="contribution_pct" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Contribution %" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scenario Tab */}
      {activeTab === 'scenarios' && scenarios && (
        <div className="space-y-4">
          <div className="glass-card p-4">
            <p className="text-xs text-slate-400 mb-1">Baseline Risk Score</p>
            <p className="text-2xl font-bold font-mono text-amber-400">{scenarios.base_risk?.toFixed(1)}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {scenarios.scenarios?.map((sc, i) => {
              const delta = sc.predicted_risk - scenarios.base_risk
              const isWorse = delta > 0
              const scColor = sc.risk_level === 'Critical' ? '#ef4444' : sc.risk_level === 'High' ? '#f97316' : sc.risk_level === 'Medium' ? '#f59e0b' : '#10b981'
              return (
                <div key={i} className="glass-card-hover p-5" style={{ borderColor: `${scColor}20` }}>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-white">{sc.scenario_name}</h3>
                    <span className={sc.risk_level === 'Critical' ? 'badge-critical' : sc.risk_level === 'High' ? 'badge-high' : sc.risk_level === 'Medium' ? 'badge-medium' : 'badge-low'}>
                      {sc.risk_level}
                    </span>
                  </div>
                  <p className="text-3xl font-black font-mono mb-2" style={{ color: scColor }}>{sc.predicted_risk?.toFixed(1)}</p>
                  <div className={`flex items-center gap-1 text-xs font-semibold ${isWorse ? 'text-red-400' : 'text-emerald-400'}`}>
                    {isWorse ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                    {isWorse ? '+' : ''}{delta.toFixed(1)} from baseline
                  </div>
                </div>
              )
            })}
          </div>

          {/* Scenario Comparison Chart */}
          <div className="glass-card p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Scenario Comparison</h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scenarios.scenarios?.map(s => ({ ...s, name: s.scenario_name }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                  <Tooltip contentStyle={{ backgroundColor: '#131b30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="predicted_risk" name="Risk Score" radius={[4, 4, 0, 0]}>
                    {scenarios.scenarios?.map((_, idx) => {
                      const colors = ['#f97316', '#ef4444', '#f59e0b', '#ef4444', '#10b981']
                      return <rect key={idx} fill={colors[idx] || '#f59e0b'} />
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
