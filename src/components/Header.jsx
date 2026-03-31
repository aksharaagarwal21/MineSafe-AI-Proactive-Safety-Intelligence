import { useState, useEffect } from 'react'
import { Bell, Search, Menu, Shield } from 'lucide-react'

export default function Header({ onMenuToggle }) {
  const [time, setTime] = useState(new Date())
  const [alertCount, setAlertCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('/api/alerts')
        const data = await res.json()
        setAlertCount(data.total_active || 0)
      } catch { setAlertCount(3) }
    }
    fetchAlerts()
    const interval = setInterval(fetchAlerts, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <header className="h-16 bg-mine-900/60 backdrop-blur-xl border-b border-white/[0.06] flex items-center justify-between px-5 flex-shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={onMenuToggle} className="p-2 rounded-lg hover:bg-white/[0.06] text-slate-400 lg:hidden">
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-sm font-semibold text-white">AI-Based Time-Series Analysis & Predictive Modelling</h1>
          <p className="text-[11px] text-slate-500">Miner & Environmental Proactive Safety Intelligence</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-1.5">
          <Search className="w-3.5 h-3.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search sensors, miners..."
            className="bg-transparent text-sm text-slate-300 placeholder:text-slate-600 outline-none w-44"
          />
        </div>

        {/* Safety Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400">OPERATIONAL</span>
        </div>

        {/* Alerts */}
        <button className="relative p-2 rounded-lg hover:bg-white/[0.06] text-slate-400 transition-colors">
          <Bell className="w-5 h-5" />
          {alertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center min-w-[18px] h-[18px] animate-pulse">
              {alertCount}
            </span>
          )}
        </button>

        {/* Clock */}
        <div className="hidden lg:block text-right">
          <div className="text-xs font-mono font-semibold text-white">{time.toLocaleTimeString()}</div>
          <div className="text-[10px] text-slate-500 font-mono">{time.toLocaleDateString()}</div>
        </div>
      </div>
    </header>
  )
}
