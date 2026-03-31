import { useState, useEffect, useCallback } from 'react'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts'
import {
  Activity, Thermometer, Droplets, Wind, AlertTriangle,
  Users, Shield, TrendingUp, Gauge, Waves
} from 'lucide-react'

const SENSOR_CONFIG = {
  methane: { label: 'Methane', unit: '%', color: '#f59e0b', icon: Wind, max: 3 },
  co: { label: 'CO', unit: 'ppm', color: '#ef4444', icon: AlertTriangle, max: 50 },
  temperature: { label: 'Temperature', unit: '°C', color: '#f97316', icon: Thermometer, max: 45 },
  humidity: { label: 'Humidity', unit: '%', color: '#3b82f6', icon: Droplets, max: 100 },
  vibration: { label: 'Vibration', unit: 'mm/s', color: '#a855f7', icon: Waves, max: 10 },
  dust_pm25: { label: 'PM2.5 Dust', unit: 'µg/m³', color: '#ec4899', icon: Wind, max: 200 },
}

function GaugeCard({ label, value, unit, max, color, icon: Icon }) {
  const pct = Math.min((value / max) * 100, 100)
  const status = pct > 80 ? 'Critical' : pct > 60 ? 'High' : pct > 40 ? 'Medium' : 'Normal'
  const statusColor = pct > 80 ? 'text-red-400' : pct > 60 ? 'text-orange-400' : pct > 40 ? 'text-amber-400' : 'text-emerald-400'

  return (
    <div className="glass-card-hover p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg" style={{ backgroundColor: `${color}15` }}>
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <span className="text-xs font-medium text-slate-400">{label}</span>
        </div>
        <span className={`text-[10px] font-semibold ${statusColor}`}>{status}</span>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <span className="stat-value" style={{ color }}>{value}</span>
          <span className="text-xs text-slate-500 ml-1">{unit}</span>
        </div>
        <div className="w-16 h-16">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="100%" startAngle={180} endAngle={0} data={[{ value: pct, fill: color }]}>
              <RadialBar dataKey="value" cornerRadius={5} background={{ fill: 'rgba(255,255,255,0.03)' }} />
            </RadialBarChart>
          </ResponsiveContainer>
        </div>
      </div>
      {/* Progress bar */}
      <div className="mt-2 h-1 bg-white/[0.04] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  )
}

export default function Dashboard() {
  const [sensorData, setSensorData] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    try {
      const [sensorRes, histRes] = await Promise.all([
        fetch('/api/sensors/live'),
        fetch('/api/sensors/historical?sensor=methane&hours=2&points=30'),
      ])
      const sensor = await sensorRes.json()
      const hist = await histRes.json()
      setSensorData(sensor)
      setHistory(prev => {
        const newPoint = {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          methane: sensor.methane,
          co: sensor.co,
          temperature: sensor.temperature,
          humidity: sensor.humidity,
        }
        const updated = [...prev, newPoint]
        return updated.slice(-30)
      })
      setLoading(false)
    } catch {
      // Generate fallback data
      setSensorData({
        methane: 0.85, co: 14.2, co2: 820, h2s: 2.1, o2: 20.4,
        temperature: 29.5, humidity: 68.3, vibration: 2.8,
        dust_pm25: 48, dust_pm10: 92, noise_level: 84,
        ventilation_efficiency: 87, safety_score: 82,
        active_alerts: 2, active_miners: 10,
      })
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 3000)
    return () => clearInterval(interval)
  }, [fetchData])

  if (loading || !sensorData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading sensor data...</p>
        </div>
      </div>
    )
  }

  const safetyScore = sensorData.safety_score || 82
  const safetyColor = safetyScore > 80 ? '#10b981' : safetyScore > 60 ? '#f59e0b' : safetyScore > 40 ? '#f97316' : '#ef4444'
  const safetyRadial = [{ name: 'Safety', value: safetyScore, fill: safetyColor }]

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Top Row — Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Safety Score */}
        <div className="glass-card p-4 col-span-2 md:col-span-1 flex items-center gap-4" style={{ boxShadow: `0 0 25px ${safetyColor}15` }}>
          <div className="w-20 h-20">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart cx="50%" cy="50%" innerRadius="65%" outerRadius="100%" startAngle={90} endAngle={-270} data={safetyRadial}>
                <RadialBar dataKey="value" cornerRadius={10} background={{ fill: 'rgba(255,255,255,0.03)' }} />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>
          <div>
            <p className="stat-label">Safety Score</p>
            <p className="text-3xl font-black font-mono" style={{ color: safetyColor }}>{safetyScore}</p>
            <p className="text-[10px] text-slate-500">/ 100 points</p>
          </div>
        </div>

        {/* Active Miners */}
        <div className="glass-card-hover p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="stat-label">Active Miners</span>
          </div>
          <p className="stat-value text-blue-400">{sensorData.active_miners || 10}</p>
          <p className="text-[10px] text-slate-500 mt-1">of 12 deployed</p>
        </div>

        {/* Active Alerts */}
        <div className="glass-card-hover p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span className="stat-label">Active Alerts</span>
          </div>
          <p className="stat-value text-amber-400">{sensorData.active_alerts || 2}</p>
          <p className="text-[10px] text-slate-500 mt-1">requires attention</p>
        </div>

        {/* Ventilation */}
        <div className="glass-card-hover p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="w-4 h-4 text-cyan-400" />
            <span className="stat-label">Ventilation</span>
          </div>
          <p className="stat-value text-cyan-400">{sensorData.ventilation_efficiency}%</p>
          <p className="text-[10px] text-slate-500 mt-1">efficiency rate</p>
        </div>
      </div>

      {/* Sensor Cards Grid */}
      <div>
        <h2 className="section-title mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-amber-400" />
          Live Sensor Readings
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Object.entries(SENSOR_CONFIG).map(([key, cfg]) => (
            <GaugeCard
              key={key}
              label={cfg.label}
              value={sensorData[key] || 0}
              unit={cfg.unit}
              max={cfg.max}
              color={cfg.color}
              icon={cfg.icon}
            />
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Real-time Trend */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-amber-400" />
            Real-Time Sensor Trend
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="gMethane" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gTemp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#131b30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="methane" stroke="#f59e0b" fill="url(#gMethane)" strokeWidth={2} name="Methane %" />
                <Area type="monotone" dataKey="temperature" stroke="#f97316" fill="url(#gTemp)" strokeWidth={2} name="Temp °C" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gas Levels Bar */}
        <div className="glass-card p-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            Gas Level Overview
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'CH₄', value: sensorData.methane, limit: 1.5, fill: '#f59e0b' },
                { name: 'CO', value: sensorData.co / 10, limit: 3.5, fill: '#ef4444' },
                { name: 'CO₂', value: sensorData.co2 / 500, limit: 3, fill: '#8b5cf6' },
                { name: 'H₂S', value: sensorData.h2s, limit: 5, fill: '#ec4899' },
                { name: 'O₂', value: sensorData.o2, limit: 19.5, fill: '#3b82f6' },
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ backgroundColor: '#131b30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Current">
                  {[
                    { fill: '#f59e0b' }, { fill: '#ef4444' }, { fill: '#8b5cf6' },
                    { fill: '#ec4899' }, { fill: '#3b82f6' },
                  ].map((entry, index) => (
                    <rect key={index} fill={entry.fill} />
                  ))}
                </Bar>
                <Bar dataKey="limit" radius={[4, 4, 0, 0]} fill="rgba(255,255,255,0.08)" name="Threshold" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Additional Info Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="glass-card p-3">
          <p className="stat-label mb-1">CO₂ Level</p>
          <p className="stat-value text-purple-400">{sensorData.co2}</p>
          <p className="text-[10px] text-slate-500">ppm</p>
        </div>
        <div className="glass-card p-3">
          <p className="stat-label mb-1">H₂S Level</p>
          <p className="stat-value text-pink-400">{sensorData.h2s}</p>
          <p className="text-[10px] text-slate-500">ppm</p>
        </div>
        <div className="glass-card p-3">
          <p className="stat-label mb-1">O₂ Level</p>
          <p className="stat-value text-blue-400">{sensorData.o2}</p>
          <p className="text-[10px] text-slate-500">%</p>
        </div>
        <div className="glass-card p-3">
          <p className="stat-label mb-1">Noise Level</p>
          <p className="stat-value text-slate-300">{sensorData.noise_level}</p>
          <p className="text-[10px] text-slate-500">dB</p>
        </div>
      </div>
    </div>
  )
}
