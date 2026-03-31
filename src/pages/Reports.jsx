import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts'
import { FileText, Download, Calendar, Shield, Users, AlertTriangle, TrendingUp, CheckCircle2 } from 'lucide-react'

export default function Reports() {
  const [summary, setSummary] = useState(null)
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumRes, shiftRes] = await Promise.all([
          fetch('/api/reports/summary'),
          fetch('/api/reports/shifts'),
        ])
        setSummary(await sumRes.json())
        const shiftData = await shiftRes.json()
        setShifts(shiftData.reports || [])
      } catch {
        setSummary({
          safety_score: 82, total_miners: 12, active_miners: 10,
          avg_risk: 42.5, high_risk_zones: 1, compliance_rate: 96.2,
          incidents_today: 2, near_misses: 5,
        })
        setShifts([
          { shift: 'Morning (6AM-2PM)', total_miners: 12, incidents: 1, avg_risk_score: 38.5, compliance_rate: 97.2, production_tons: 285.3, safety_score: 88.5 },
          { shift: 'Afternoon (2PM-10PM)', total_miners: 10, incidents: 2, avg_risk_score: 45.1, compliance_rate: 94.8, production_tons: 242.1, safety_score: 82.3 },
          { shift: 'Night (10PM-6AM)', total_miners: 8, incidents: 0, avg_risk_score: 32.0, compliance_rate: 98.5, production_tons: 178.6, safety_score: 92.1 },
        ])
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  if (loading || !summary) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

  const pieData = [
    { name: 'Safe Operations', value: 100 - summary.avg_risk, color: '#10b981' },
    { name: 'Risk Factor', value: summary.avg_risk, color: '#f59e0b' },
  ]

  const safetyColor = summary.safety_score > 80 ? '#10b981' : summary.safety_score > 60 ? '#f59e0b' : '#ef4444'

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" />
            Reports & Analytics
          </h1>
          <p className="text-xs text-slate-500 mt-1">Comprehensive safety reports & operational analytics</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-amber-500/15 border border-amber-500/20 text-amber-400 rounded-lg text-sm font-medium hover:bg-amber-500/25 transition-colors">
          <Download className="w-4 h-4" />
          Export Report
        </button>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { icon: Shield, label: 'Safety Score', value: summary.safety_score, color: safetyColor, suffix: '/100' },
          { icon: CheckCircle2, label: 'Compliance', value: `${summary.compliance_rate}%`, color: '#10b981' },
          { icon: AlertTriangle, label: 'Incidents Today', value: summary.incidents_today, color: '#ef4444' },
          { icon: TrendingUp, label: 'Near Misses', value: summary.near_misses, color: '#f59e0b' },
        ].map(({ icon: Icon, label, value, color, suffix }) => (
          <div key={label} className="glass-card-hover p-4">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" style={{ color }} />
              <span className="stat-label">{label}</span>
            </div>
            <p className="stat-value" style={{ color }}>
              {value}
              {suffix && <span className="text-xs text-slate-500 ml-1">{suffix}</span>}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Risk Distribution */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Risk Distribution</h3>
          <div className="h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#131b30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                <Legend formatter={(value) => <span className="text-xs text-slate-400">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Operational Stats */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Operational Overview</h3>
          <div className="space-y-3">
            {[
              { label: 'Total Miners', value: summary.total_miners, max: 20, color: '#3b82f6' },
              { label: 'Active Miners', value: summary.active_miners, max: 20, color: '#10b981' },
              { label: 'High Risk Zones', value: summary.high_risk_zones, max: 6, color: '#ef4444' },
              { label: 'Avg Risk Score', value: summary.avg_risk, max: 100, color: '#f59e0b' },
              { label: 'Compliance Rate', value: summary.compliance_rate, max: 100, color: '#10b981' },
            ].map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">{item.label}</span>
                  <span className="font-mono font-semibold" style={{ color: item.color }}>{item.value}</span>
                </div>
                <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${(item.value / item.max) * 100}%`, backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Shift Reports */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/[0.06] flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-white">Shift-Wise Reports</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Shift', 'Miners', 'Incidents', 'Avg Risk', 'Compliance', 'Production', 'Safety Score'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shifts.map((s, i) => (
                <tr key={i} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-white font-medium text-xs">{s.shift}</td>
                  <td className="px-4 py-3 text-slate-300 font-mono text-xs">{s.total_miners}</td>
                  <td className="px-4 py-3">
                    <span className={s.incidents > 1 ? 'text-red-400 font-semibold' : s.incidents > 0 ? 'text-amber-400' : 'text-emerald-400'}>
                      {s.incidents}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    <span className={s.avg_risk_score > 50 ? 'text-red-400' : s.avg_risk_score > 35 ? 'text-amber-400' : 'text-emerald-400'}>
                      {s.avg_risk_score}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-emerald-400">{s.compliance_rate}%</td>
                  <td className="px-4 py-3 font-mono text-xs text-slate-300">{s.production_tons} T</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{
                          width: `${s.safety_score}%`,
                          backgroundColor: s.safety_score > 85 ? '#10b981' : s.safety_score > 70 ? '#f59e0b' : '#ef4444',
                        }} />
                      </div>
                      <span className="font-mono text-xs text-white">{s.safety_score}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shift Comparison Chart */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Shift Performance Comparison</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={shifts.map(s => ({ name: s.shift?.split(' (')[0], safety: s.safety_score, risk: s.avg_risk_score, compliance: s.compliance_rate }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip contentStyle={{ backgroundColor: '#131b30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
              <Legend formatter={(value) => <span className="text-xs text-slate-400">{value}</span>} />
              <Bar dataKey="safety" fill="#10b981" radius={[4, 4, 0, 0]} name="Safety Score" />
              <Bar dataKey="risk" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Risk Score" />
              <Bar dataKey="compliance" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Compliance %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
