import { useState, useEffect } from 'react'
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts'
import { Trees, Wind, Thermometer, Droplets, Waves, Volume2, Gauge, CloudRain } from 'lucide-react'

const ENV_SENSORS = [
  { key: 'methane', label: 'Methane (CH₄)', unit: '%', icon: Wind, color: '#f59e0b', limit: 1.5 },
  { key: 'co', label: 'Carbon Monoxide', unit: 'ppm', icon: Wind, color: '#ef4444', limit: 35 },
  { key: 'co2', label: 'Carbon Dioxide', unit: 'ppm', icon: Wind, color: '#8b5cf6', limit: 1500 },
  { key: 'h2s', label: 'Hydrogen Sulfide', unit: 'ppm', icon: Wind, color: '#ec4899', limit: 10 },
  { key: 'o2', label: 'Oxygen Level', unit: '%', icon: Wind, color: '#3b82f6', limit: 19.5 },
  { key: 'temperature', label: 'Temperature', unit: '°C', icon: Thermometer, color: '#f97316', limit: 35 },
  { key: 'humidity', label: 'Humidity', unit: '%', icon: Droplets, color: '#06b6d4', limit: 90 },
  { key: 'vibration', label: 'Vibration', unit: 'mm/s', icon: Waves, color: '#a855f7', limit: 6 },
  { key: 'dust_pm25', label: 'PM2.5 Dust', unit: 'µg/m³', icon: Wind, color: '#f472b6', limit: 100 },
  { key: 'dust_pm10', label: 'PM10 Dust', unit: 'µg/m³', icon: Wind, color: '#fb923c', limit: 180 },
  { key: 'noise_level', label: 'Noise Level', unit: 'dB', icon: Volume2, color: '#94a3b8', limit: 90 },
  { key: 'ventilation_efficiency', label: 'Ventilation', unit: '%', icon: Gauge, color: '#10b981', limit: 80 },
]

export default function EnvironmentalMonitor() {
  const [sensorData, setSensorData] = useState(null)
  const [selectedSensor, setSelectedSensor] = useState('methane')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sensorRes, histRes] = await Promise.all([
          fetch('/api/sensors/live'),
          fetch(`/api/sensors/historical?sensor=${selectedSensor}&hours=6&points=60`),
        ])
        setSensorData(await sensorRes.json())
        const histData = await histRes.json()
        setHistory(histData.data || [])
      } catch {
        setSensorData({
          methane: 0.85, co: 14.2, co2: 820, h2s: 2.1, o2: 20.4,
          temperature: 29.5, humidity: 68.3, vibration: 2.8,
          dust_pm25: 48, dust_pm10: 92, noise_level: 84,
          ventilation_efficiency: 87, water_seepage: 0.45,
        })
        setHistory(Array.from({ length: 60 }, (_, i) => ({
          timestamp: new Date(Date.now() - (60 - i) * 360000).toISOString(),
          value: 0.8 + Math.sin(i / 8) * 0.2 + Math.random() * 0.05,
        })))
      }
      setLoading(false)
    }
    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [selectedSensor])

  if (loading || !sensorData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-12 h-12 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

  const selConfig = ENV_SENSORS.find(s => s.key === selectedSensor)

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Trees className="w-5 h-5 text-amber-400" />
          Environmental Monitor
        </h1>
        <p className="text-xs text-slate-500 mt-1">Comprehensive environmental sensor tracking & analysis</p>
      </div>

      {/* Sensor Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {ENV_SENSORS.map(cfg => {
          const val = sensorData[cfg.key] || 0
          const isO2 = cfg.key === 'o2'
          const isVent = cfg.key === 'ventilation_efficiency'
          let statusColor = '#10b981'
          if (isO2) {
            if (val < cfg.limit) statusColor = '#ef4444'
            else if (val < cfg.limit + 0.5) statusColor = '#f59e0b'
          } else if (isVent) {
            if (val < cfg.limit) statusColor = '#ef4444'
            else if (val < cfg.limit + 10) statusColor = '#f59e0b'
          } else {
            if (val > cfg.limit) statusColor = '#ef4444'
            else if (val > cfg.limit * 0.7) statusColor = '#f59e0b'
          }
          const isSelected = selectedSensor === cfg.key

          return (
            <div
              key={cfg.key}
              onClick={() => setSelectedSensor(cfg.key)}
              className={`glass-card-hover p-3 cursor-pointer transition-all ${isSelected ? 'border-amber-500/30 ring-1 ring-amber-500/20' : ''}`}
            >
              <div className="flex items-center gap-1.5 mb-2">
                <cfg.icon className="w-3.5 h-3.5" style={{ color: cfg.color }} />
                <span className="text-[10px] text-slate-400 font-medium truncate">{cfg.label}</span>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-lg font-bold font-mono" style={{ color: statusColor }}>{val}</span>
                  <span className="text-[10px] text-slate-500 ml-1">{cfg.unit}</span>
                </div>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: statusColor }} />
              </div>
              <div className="mt-2 h-0.5 bg-white/[0.04] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{
                  width: `${Math.min(isO2 || isVent ? (val / 100) * 100 : (val / cfg.limit) * 100, 100)}%`,
                  backgroundColor: statusColor
                }} />
              </div>
            </div>
          )
        })}
      </div>

      {/* Historical Chart */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: selConfig?.color }} />
            {selConfig?.label} — 6 Hour Trend
          </h3>
          <span className="text-xs text-slate-500">Threshold: {selConfig?.limit} {selConfig?.unit}</span>
        </div>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history.map((d, i) => ({
              time: new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              value: d.value,
              threshold: selConfig?.limit,
            }))}>
              <defs>
                <linearGradient id="gEnv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={selConfig?.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={selConfig?.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" tick={{ fontSize: 9 }} interval={5} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={{ backgroundColor: '#131b30', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="value" stroke={selConfig?.color} fill="url(#gEnv)" strokeWidth={2} dot={false} name={selConfig?.label} />
              <Line type="monotone" dataKey="threshold" stroke="#ef4444" strokeDasharray="6 3" strokeWidth={1.5} dot={false} name="Threshold" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Water Seepage & Extra Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <CloudRain className="w-4 h-4 text-blue-400" />
            <span className="stat-label">Water Seepage</span>
          </div>
          <p className="stat-value text-blue-400">{sensorData.water_seepage} <span className="text-sm text-slate-500">L/min</span></p>
          <p className="text-[10px] text-slate-500 mt-1">Threshold: 2.0 L/min</p>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Gauge className="w-4 h-4 text-emerald-400" />
            <span className="stat-label">Ventilation Efficiency</span>
          </div>
          <p className="stat-value text-emerald-400">{sensorData.ventilation_efficiency}%</p>
          <div className="mt-2 h-2 bg-white/[0.04] rounded-full overflow-hidden">
            <div className="h-full bg-emerald-400 rounded-full transition-all" style={{ width: `${sensorData.ventilation_efficiency}%` }} />
          </div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <span className="stat-label">Noise Level</span>
          </div>
          <p className="stat-value text-slate-300">{sensorData.noise_level} <span className="text-sm text-slate-500">dB</span></p>
          <p className="text-[10px] text-slate-500 mt-1">Safe limit: 85 dB</p>
        </div>
      </div>
    </div>
  )
}
