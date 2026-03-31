import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, LineChart, BrainCircuit, HardHat, Trees,
  Bell, ShieldAlert, FileText, ChevronLeft, Activity
} from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/time-series', icon: LineChart, label: 'Time-Series Analysis' },
  { to: '/predictive', icon: BrainCircuit, label: 'Predictive Modelling' },
  { to: '/miners', icon: HardHat, label: 'Miner Safety' },
  { to: '/environment', icon: Trees, label: 'Environmental' },
  { to: '/alerts', icon: Bell, label: 'Alert System' },
  { to: '/risk', icon: ShieldAlert, label: 'Risk Assessment' },
  { to: '/reports', icon: FileText, label: 'Reports' },
]

export default function Sidebar({ open, onToggle }) {
  return (
    <aside className={`${open ? 'w-64' : 'w-20'} h-full bg-mine-900/80 backdrop-blur-xl border-r border-white/[0.06] flex flex-col transition-all duration-300 ease-in-out flex-shrink-0`}>
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-white/[0.06] gap-3">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0 glow-amber">
          <Activity className="w-5 h-5 text-white" />
        </div>
        {open && (
          <div className="animate-fade-in overflow-hidden">
            <div className="text-sm font-bold text-white tracking-tight whitespace-nowrap">MineSafe AI</div>
            <div className="text-[10px] text-amber-400/70 font-medium whitespace-nowrap">Proactive Safety</div>
          </div>
        )}
        <button onClick={onToggle} className={`ml-auto p-1.5 rounded-md hover:bg-white/[0.06] text-slate-500 transition-transform duration-300 ${!open ? 'rotate-180' : ''}`}>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''} ${!open ? 'justify-center px-2' : ''}`}
          >
            <item.icon className="w-[18px] h-[18px] flex-shrink-0" />
            {open && <span className="whitespace-nowrap animate-fade-in">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom status */}
      {open && (
        <div className="p-4 border-t border-white/[0.06] animate-fade-in">
          <div className="glass-card p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-400">System Online</span>
            </div>
            <p className="text-[10px] text-slate-500">All sensors operational</p>
          </div>
        </div>
      )}
    </aside>
  )
}
