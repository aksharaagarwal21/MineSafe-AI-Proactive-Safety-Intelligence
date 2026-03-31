import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { ShieldAlert, MapPin, TrendingUp, AlertTriangle, Users, Clock } from 'lucide-react'

export default function RiskAssessment() {
  const [zones, setZones] = useState([])
  const [risk, setRisk] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [zoneRes, riskRes] = await Promise.all([
          fetch('/api/zones'),
          fetch('/api/predict/risk'),
        ])
        const zoneData = await zoneRes.json()
        const riskData = await riskRes.json()
        setZones(zoneData.zones || [])
        setRisk(riskData)
      } catch {
        setZones([
          { name: 'Zone A - Main Shaft', risk_score: 32.5, risk_level: 'Low', active_miners: 3, methane: 0.6, temperature: 27, ventilation: 92 },
          { name: 'Zone B - East Tunnel', risk_score: 55.2, risk_level: 'Medium', active_miners: 2, methane: 1.1, temperature: 30, ventilation: 78 },
          { name: 'Zone C - West Tunnel', risk_score: 48.8, risk_level: 'Medium', active_miners: 2, methane: 0.9, temperature: 31, ventilation: 82 },
          { name: 'Zone D - Deep Level', risk_score: 72.1, risk_level: 'High', active_miners: 3, methane: 1.4, temperature: 34, ventilation: 68 },
          { name: 'Zone E - Ventilation Hub', risk_score: 25.3, risk_level: 'Low', active_miners: 1, methane: 0.3, temperature: 25, ventilation: 95 },
          { name: 'Zone F - Loading Bay', risk_score: 38.7, risk_level: 'Medium', active_miners: 2, methane: 0.5, temperature: 28, ventilation: 88 },
        ])
        setRisk({
          risk_score: 42.5, risk_level: 'Medium',
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
      }
      setLoading(false)
    }
    fetchData()
    const interval = setInterval(fetchData, 8000)
    return () => clearInterval(interval)
  }, [])

  const getRiskColor = (level) => {
    switch (level) {
      case 'Critical': return '#ef4444'
      case 'High': return '#f97316'
      case 'Medium': return '#f59e0b'
      default: return '#10b981'
    }
  }

  const getRiskBg = (level) => {
    switch (level) {
      case 'Critical': return 'from-red-500/20 to-red-500/5'
      case 'High': return 'from-orange-500/20 to-orange-500/5'
      case 'Medium': return 'from-amber-500/20 to-amber-500/5'
      default: return 'from-emerald-500/20 to-emerald-500/5'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

  const avgRisk = zones.length > 0 ? (zones.reduce((a, z) => a + z.risk_score, 0) / zones.length).toFixed(1) : 0
  const highRiskZones = zones.filter(z => ['High', 'Critical'].includes(z.risk_level))

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-amber-400" />
          Risk Assessment
        </h1>
        <p className="text-xs text-slate-500 mt-1">Multi-factor risk scoring & zone-wise analysis</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card p-4">
          <p className="stat-label">Average Risk</p>
          <p className="stat-value text-amber-400">{avgRisk}</p>
          <p className="text-[10px] text-slate-500">across all zones</p>
        </div>
        <div className="glass-card p-4">
          <p className="stat-label">High Risk Zones</p>
          <p className="stat-value text-red-400">{highRiskZones.length}</p>
          <p className="text-[10px] text-slate-500">of {zones.length} zones</p>
        </div>
        <div className="glass-card p-4">
          <p className="stat-label">Highest Risk</p>
          <p className="stat-value text-red-400">{zones.length > 0 ? Math.max(...zones.map(z => z.risk_score)).toFixed(1) : '-'}</p>
          <p className="text-[10px] text-slate-500">{zones.length > 0 ? zones.reduce((a, z) => z.risk_score > a.risk_score ? z : a, zones[0]).name?.split(' - ')[1] : '-'}</p>
        </div>
        <div className="glass-card p-4">
          <p className="stat-label">Overall Status</p>
          <p className={`stat-value ${parseFloat(avgRisk) > 60 ? 'text-red-400' : parseFloat(avgRisk) > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
            {parseFloat(avgRisk) > 60 ? 'Elevated' : parseFloat(avgRisk) > 40 ? 'Moderate' : 'Safe'}
          </p>
        </div>
      </div>

      {/* Zone Risk Heat Map */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map((zone, i) => (
          <div
            key={i}
            className={`glass-card overflow-hidden transition-all hover:scale-[1.02] duration-300`}
            style={{ borderColor: `${getRiskColor(zone.risk_level)}20` }}
          >
            <div className={`bg-gradient-to-b ${getRiskBg(zone.risk_level)} p-4`}>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-semibold text-white">{zone.name}</h3>
                <span className={zone.risk_level === 'Critical' ? 'badge-critical' : zone.risk_level === 'High' ? 'badge-high' : zone.risk_level === 'Medium' ? 'badge-medium' : 'badge-low'}>
                  {zone.risk_level}
                </span>
              </div>

              {/* Risk Score Bar */}
              <div className="mt-3 mb-4">
                <div className="flex items-end justify-between mb-1">
                  <span className="text-xs text-slate-400">Risk Score</span>
                  <span className="text-2xl font-black font-mono" style={{ color: getRiskColor(zone.risk_level) }}>{zone.risk_score?.toFixed(1)}</span>
                </div>
                <div className="h-2 bg-white/[0.06] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${zone.risk_score}%`, backgroundColor: getRiskColor(zone.risk_level) }} />
                </div>
              </div>

              {/* Zone Details */}
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: Users, label: 'Miners', value: zone.active_miners },
                  { icon: AlertTriangle, label: 'CH₄', value: `${zone.methane}%` },
                  { icon: TrendingUp, label: 'Temp', value: `${zone.temperature}°C` },
                  { icon: MapPin, label: 'Vent.', value: `${zone.ventilation}%` },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-1.5 text-xs">
                    <Icon className="w-3 h-3 text-slate-500" />
                    <span className="text-slate-500">{label}:</span>
                    <span className="text-slate-300 font-mono font-medium">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Zone Risk Comparison */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Zone Risk Comparison</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={zones.map(z => ({ name: z.name?.split(' - ')[1] || z.name, risk: z.risk_score, fill: getRiskColor(z.risk_level) }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#131b30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="risk" name="Risk Score" radius={[6, 6, 0, 0]}>
                {zones.map((z, idx) => (
                  <rect key={idx} fill={getRiskColor(z.risk_level)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Contributing Factors */}
      {risk?.feature_contributions && (
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Risk Contributing Factors</h3>
          <div className="space-y-3">
            {risk.feature_contributions.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-xs text-slate-400 w-20 text-right capitalize">{f.feature}</span>
                <div className="flex-1 h-3 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{
                    width: `${f.contribution_pct}%`,
                    background: `linear-gradient(90deg, #f59e0b, ${f.contribution_pct > 20 ? '#ef4444' : '#f59e0b'})`,
                  }} />
                </div>
                <span className="text-xs font-mono font-semibold text-amber-400 w-12 text-right">{f.contribution_pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
