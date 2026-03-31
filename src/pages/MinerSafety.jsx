import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar } from 'recharts'
import { HardHat, Heart, Activity, Thermometer, Brain, Clock, MapPin, AlertTriangle } from 'lucide-react'

export default function MinerSafety() {
  const [miners, setMiners] = useState([])
  const [selectedMiner, setSelectedMiner] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMiners = async () => {
      try {
        const res = await fetch('/api/miners')
        const data = await res.json()
        setMiners(data.miners || [])
      } catch {
        setMiners([
          { id: 'MNR-001', name: 'Rajesh Kumar', zone: 'Zone A', shift: 'Morning', status: 'Active', heart_rate: 78, spo2: 97.2, body_temperature: 36.8, fatigue_index: 25.3, exposure_hours: 4.2 },
          { id: 'MNR-002', name: 'Amit Singh', zone: 'Zone B', shift: 'Morning', status: 'Active', heart_rate: 92, spo2: 96.1, body_temperature: 37.1, fatigue_index: 45.8, exposure_hours: 5.1 },
          { id: 'MNR-003', name: 'Suresh Patel', zone: 'Zone C', shift: 'Afternoon', status: 'Fatigued', heart_rate: 105, spo2: 95.5, body_temperature: 37.3, fatigue_index: 72.1, exposure_hours: 6.8 },
          { id: 'MNR-004', name: 'Vikram Sharma', zone: 'Zone D', shift: 'Night', status: 'Active', heart_rate: 74, spo2: 98.0, body_temperature: 36.6, fatigue_index: 18.5, exposure_hours: 2.3 },
          { id: 'MNR-005', name: 'Deepak Yadav', zone: 'Zone E', shift: 'Morning', status: 'Stressed', heart_rate: 115, spo2: 94.8, body_temperature: 37.5, fatigue_index: 68.9, exposure_hours: 7.2 },
          { id: 'MNR-006', name: 'Manoj Gupta', zone: 'Zone F', shift: 'Afternoon', status: 'Rest', heart_rate: 65, spo2: 98.5, body_temperature: 36.4, fatigue_index: 12.0, exposure_hours: 0 },
        ])
      }
      setLoading(false)
    }
    fetchMiners()
    const interval = setInterval(fetchMiners, 5000)
    return () => clearInterval(interval)
  }, [])

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Active': return 'badge-low'
      case 'Rest': return 'bg-blue-500/15 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold'
      case 'Fatigued': return 'badge-high'
      case 'Stressed': return 'badge-critical'
      default: return 'badge-medium'
    }
  }

  const getHealthColor = (metric, value) => {
    if (metric === 'heart_rate') return value > 110 ? '#ef4444' : value > 95 ? '#f59e0b' : '#10b981'
    if (metric === 'spo2') return value < 94 ? '#ef4444' : value < 96 ? '#f59e0b' : '#10b981'
    if (metric === 'fatigue_index') return value > 70 ? '#ef4444' : value > 50 ? '#f59e0b' : '#10b981'
    if (metric === 'body_temperature') return value > 37.5 ? '#ef4444' : value > 37.2 ? '#f59e0b' : '#10b981'
    return '#10b981'
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
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <HardHat className="w-5 h-5 text-amber-400" />
          Miner Safety Monitor
        </h1>
        <p className="text-xs text-slate-500 mt-1">Real-time health monitoring & safety tracking for deployed miners</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card p-3">
          <p className="stat-label">Total Miners</p>
          <p className="stat-value text-white">{miners.length}</p>
        </div>
        <div className="glass-card p-3">
          <p className="stat-label">Active</p>
          <p className="stat-value text-emerald-400">{miners.filter(m => m.status === 'Active').length}</p>
        </div>
        <div className="glass-card p-3">
          <p className="stat-label">Alerts</p>
          <p className="stat-value text-amber-400">{miners.filter(m => ['Fatigued', 'Stressed'].includes(m.status)).length}</p>
        </div>
        <div className="glass-card p-3">
          <p className="stat-label">On Rest</p>
          <p className="stat-value text-blue-400">{miners.filter(m => m.status === 'Rest').length}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Miners List */}
        <div className="lg:col-span-2 glass-card overflow-hidden">
          <div className="p-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-white">Deployed Personnel</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  {['ID', 'Name', 'Zone', 'Status', 'HR', 'SpO₂', 'Fatigue', 'Exposure'].map(h => (
                    <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {miners.map(m => (
                  <tr
                    key={m.id}
                    onClick={() => setSelectedMiner(m)}
                    className={`border-b border-white/[0.03] hover:bg-white/[0.02] cursor-pointer transition-colors ${selectedMiner?.id === m.id ? 'bg-amber-500/5' : ''}`}
                  >
                    <td className="px-3 py-2.5 text-xs font-mono text-slate-500">{m.id}</td>
                    <td className="px-3 py-2.5 text-white font-medium text-xs">{m.name}</td>
                    <td className="px-3 py-2.5 text-slate-400 text-xs">{m.zone?.split(' - ')[0]}</td>
                    <td className="px-3 py-2.5"><span className={getStatusStyle(m.status)}>{m.status}</span></td>
                    <td className="px-3 py-2.5 font-mono text-xs" style={{ color: getHealthColor('heart_rate', m.heart_rate) }}>{m.heart_rate}</td>
                    <td className="px-3 py-2.5 font-mono text-xs" style={{ color: getHealthColor('spo2', m.spo2) }}>{m.spo2}%</td>
                    <td className="px-3 py-2.5 font-mono text-xs" style={{ color: getHealthColor('fatigue_index', m.fatigue_index) }}>{m.fatigue_index?.toFixed(1)}</td>
                    <td className="px-3 py-2.5 font-mono text-xs text-slate-400">{m.exposure_hours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Panel */}
        <div className="glass-card p-5">
          {selectedMiner ? (
            <div className="space-y-4 animate-fade-in">
              <div className="text-center pb-4 border-b border-white/[0.06]">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mx-auto mb-2 text-white font-bold text-lg">
                  {selectedMiner.name.split(' ').map(n => n[0]).join('')}
                </div>
                <h3 className="text-white font-semibold">{selectedMiner.name}</h3>
                <p className="text-xs text-slate-500">{selectedMiner.id} · {selectedMiner.shift} Shift</p>
                <span className={`mt-2 inline-block ${getStatusStyle(selectedMiner.status)}`}>{selectedMiner.status}</span>
              </div>

              {/* Health Metrics */}
              {[
                { icon: Heart, label: 'Heart Rate', value: `${selectedMiner.heart_rate} BPM`, color: getHealthColor('heart_rate', selectedMiner.heart_rate) },
                { icon: Activity, label: 'SpO₂', value: `${selectedMiner.spo2}%`, color: getHealthColor('spo2', selectedMiner.spo2) },
                { icon: Thermometer, label: 'Body Temp', value: `${selectedMiner.body_temperature}°C`, color: getHealthColor('body_temperature', selectedMiner.body_temperature) },
                { icon: Brain, label: 'Fatigue Index', value: selectedMiner.fatigue_index?.toFixed(1), color: getHealthColor('fatigue_index', selectedMiner.fatigue_index) },
                { icon: Clock, label: 'Exposure', value: `${selectedMiner.exposure_hours}h`, color: '#94a3b8' },
                { icon: MapPin, label: 'Zone', value: selectedMiner.zone?.split(' - ')[0], color: '#94a3b8' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-white/[0.03]">
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-slate-500" />
                    <span className="text-xs text-slate-400">{label}</span>
                  </div>
                  <span className="text-sm font-semibold font-mono" style={{ color }}>{value}</span>
                </div>
              ))}

              {/* Fatigue Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Fatigue Level</span>
                  <span style={{ color: getHealthColor('fatigue_index', selectedMiner.fatigue_index) }}>{selectedMiner.fatigue_index?.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${selectedMiner.fatigue_index}%`, backgroundColor: getHealthColor('fatigue_index', selectedMiner.fatigue_index) }} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <HardHat className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-sm text-slate-500">Select a miner to view details</p>
            </div>
          )}
        </div>
      </div>

      {/* Health Overview Chart */}
      <div className="glass-card p-4">
        <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          Team Health Overview
        </h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={miners.map(m => ({ name: m.name.split(' ')[0], fatigue: m.fatigue_index, hr: m.heart_rate }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#131b30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="fatigue" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Fatigue Index" />
              <Bar dataKey="hr" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Heart Rate" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
