import { useState, useEffect } from 'react'
import { Bell, AlertTriangle, Shield, CheckCircle2, Clock, Filter, XCircle } from 'lucide-react'

export default function AlertSystem() {
  const [alerts, setAlerts] = useState(null)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const [alertRes, threshRes] = await Promise.all([
          fetch('/api/alerts'),
          fetch('/api/alerts/thresholds'),
        ])
        const alertData = await alertRes.json()
        const threshData = await threshRes.json()
        setAlerts({ ...alertData, thresholds: threshData })
      } catch {
        setAlerts({
          history: [
            { id: 'ALT-1000', message: 'Methane level elevated in Zone D', level: 'Warning', category: 'Environmental', timestamp: new Date(Date.now() - 3600000).toISOString(), acknowledged: false, zone: 'Zone D' },
            { id: 'ALT-1001', message: 'CO concentration spike detected', level: 'Critical', category: 'Environmental', timestamp: new Date(Date.now() - 7200000).toISOString(), acknowledged: true, zone: 'Zone B' },
            { id: 'ALT-1002', message: 'Miner MNR-003 heart rate anomaly', level: 'Warning', category: 'Miner Health', timestamp: new Date(Date.now() - 10800000).toISOString(), acknowledged: false, zone: 'Zone C' },
            { id: 'ALT-1003', message: 'Ground vibration threshold exceeded', level: 'Critical', category: 'Structural', timestamp: new Date(Date.now() - 14400000).toISOString(), acknowledged: true, zone: 'Zone D' },
            { id: 'ALT-1004', message: 'Dust levels above safe limit', level: 'Warning', category: 'Environmental', timestamp: new Date(Date.now() - 18000000).toISOString(), acknowledged: false, zone: 'Zone B' },
          ],
          live_sensor_alerts: [
            { sensor: 'methane', value: 1.2, level: 'Warning', message: 'METHANE above warning threshold: 1.2%', timestamp: new Date().toISOString() },
          ],
          live_miner_alerts: [
            { sensor: 'fatigue', miner: 'Suresh Patel', value: 72.1, level: 'Warning', message: 'Miner Suresh Patel fatigue index high: 72.1', timestamp: new Date().toISOString() },
          ],
          total_active: 2,
          thresholds: {
            methane: { warning: 1.0, critical: 1.5, emergency: 2.0, unit: '%' },
            co: { warning: 20, critical: 35, emergency: 50, unit: 'ppm' },
            temperature: { warning: 32, critical: 35, emergency: 38, unit: '°C' },
            vibration: { warning: 4.0, critical: 6.0, emergency: 8.0, unit: 'mm/s' },
          },
        })
      }
      setLoading(false)
    }
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 10000)
    return () => clearInterval(interval)
  }, [])

  const getLevelIcon = (level) => {
    switch (level) {
      case 'Emergency': return <XCircle className="w-4 h-4 text-red-500" />
      case 'Critical': return <AlertTriangle className="w-4 h-4 text-red-400" />
      case 'Warning': return <AlertTriangle className="w-4 h-4 text-amber-400" />
      default: return <Shield className="w-4 h-4 text-blue-400" />
    }
  }
  const getLevelBadge = (level) => {
    switch (level) {
      case 'Emergency': return 'bg-red-600/20 text-red-400 border-red-600/20'
      case 'Critical': return 'badge-critical'
      case 'Warning': return 'badge-medium'
      default: return 'bg-blue-500/15 text-blue-400 border border-blue-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold'
    }
  }

  const allAlerts = alerts ? [
    ...(alerts.live_sensor_alerts || []).map(a => ({ ...a, source: 'live', id: `live-s-${a.sensor}` })),
    ...(alerts.live_miner_alerts || []).map(a => ({ ...a, source: 'live', id: `live-m-${a.miner}` })),
    ...(alerts.history || []).map(a => ({ ...a, source: 'history' })),
  ] : []

  const filtered = filter === 'all' ? allAlerts
    : filter === 'live' ? allAlerts.filter(a => a.source === 'live')
    : filter === 'unack' ? allAlerts.filter(a => !a.acknowledged && a.source === 'history')
    : allAlerts.filter(a => a.level === filter)

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
          <Bell className="w-5 h-5 text-amber-400" />
          Alert System
        </h1>
        <p className="text-xs text-slate-500 mt-1">Proactive safety alerts & threshold management</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div className="glass-card p-3">
          <p className="stat-label">Live Alerts</p>
          <p className="stat-value text-red-400">{alerts?.total_active || 0}</p>
        </div>
        <div className="glass-card p-3">
          <p className="stat-label">Critical</p>
          <p className="stat-value text-red-400">{allAlerts.filter(a => a.level === 'Critical').length}</p>
        </div>
        <div className="glass-card p-3">
          <p className="stat-label">Warnings</p>
          <p className="stat-value text-amber-400">{allAlerts.filter(a => a.level === 'Warning').length}</p>
        </div>
        <div className="glass-card p-3">
          <p className="stat-label">Acknowledged</p>
          <p className="stat-value text-emerald-400">{allAlerts.filter(a => a.acknowledged).length}</p>
        </div>
        <div className="glass-card p-3">
          <p className="stat-label">Total History</p>
          <p className="stat-value text-slate-300">{alerts?.history?.length || 0}</p>
        </div>
      </div>

      {/* Live Alerts Banner */}
      {(alerts?.live_sensor_alerts?.length > 0 || alerts?.live_miner_alerts?.length > 0) && (
        <div className="glass-card border-red-500/30 p-4 bg-red-500/5">
          <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Active Live Alerts
          </h3>
          <div className="space-y-2">
            {[...(alerts.live_sensor_alerts || []), ...(alerts.live_miner_alerts || [])].map((a, i) => (
              <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-red-500/5 border border-red-500/10">
                {getLevelIcon(a.level)}
                <span className="text-sm text-white flex-1">{a.message}</span>
                <span className={getLevelBadge(a.level)}>{a.level}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-slate-500" />
        {['all', 'live', 'Critical', 'Warning', 'unack'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' : 'bg-white/[0.03] text-slate-400 hover:text-slate-300 border border-white/[0.06]'}`}
          >
            {f === 'unack' ? 'Unacknowledged' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Alert History */}
      <div className="glass-card overflow-hidden">
        <div className="p-4 border-b border-white/[0.06]">
          <h2 className="text-sm font-semibold text-white">Alert Log ({filtered.length})</h2>
        </div>
        <div className="divide-y divide-white/[0.03]">
          {filtered.map((a, i) => (
            <div key={a.id || i} className="px-4 py-3 flex items-start gap-3 hover:bg-white/[0.02] transition-colors">
              {getLevelIcon(a.level)}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white">{a.message}</p>
                <div className="flex items-center gap-3 mt-1">
                  {a.zone && <span className="text-[10px] text-slate-500">{a.zone}</span>}
                  {a.category && <span className="text-[10px] text-slate-500">· {a.category}</span>}
                  <span className="text-[10px] text-slate-600 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(a.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className={getLevelBadge(a.level)}>{a.level}</span>
                {a.acknowledged && (
                  <span className="flex items-center gap-1 text-[10px] text-emerald-500">
                    <CheckCircle2 className="w-3 h-3" /> ACK
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Thresholds Table */}
      {alerts?.thresholds && (
        <div className="glass-card overflow-hidden">
          <div className="p-4 border-b border-white/[0.06]">
            <h2 className="text-sm font-semibold text-white">Alert Thresholds Configuration</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-400">Sensor</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-amber-400">Warning</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-orange-400">Critical</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-red-400">Emergency</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-slate-400">Unit</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(alerts.thresholds).map(([sensor, t]) => (
                  <tr key={sensor} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="px-4 py-2.5 text-white font-medium uppercase text-xs">{sensor.replace('_', ' ')}</td>
                    <td className="px-4 py-2.5 text-center font-mono text-amber-400">{t.warning}</td>
                    <td className="px-4 py-2.5 text-center font-mono text-orange-400">{t.critical}</td>
                    <td className="px-4 py-2.5 text-center font-mono text-red-400">{t.emergency}</td>
                    <td className="px-4 py-2.5 text-center text-slate-500 text-xs">{t.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
