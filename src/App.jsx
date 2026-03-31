import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Header from './components/Header'
import Dashboard from './pages/Dashboard'
import TimeSeriesAnalysis from './pages/TimeSeriesAnalysis'
import PredictiveModelling from './pages/PredictiveModelling'
import MinerSafety from './pages/MinerSafety'
import EnvironmentalMonitor from './pages/EnvironmentalMonitor'
import AlertSystem from './pages/AlertSystem'
import RiskAssessment from './pages/RiskAssessment'
import Reports from './pages/Reports'

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <Router>
      <div className="flex h-screen w-screen bg-mine-950 overflow-hidden">
        <Sidebar open={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto p-5" style={{ scrollbarGutter: 'stable' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/time-series" element={<TimeSeriesAnalysis />} />
              <Route path="/predictive" element={<PredictiveModelling />} />
              <Route path="/miners" element={<MinerSafety />} />
              <Route path="/environment" element={<EnvironmentalMonitor />} />
              <Route path="/alerts" element={<AlertSystem />} />
              <Route path="/risk" element={<RiskAssessment />} />
              <Route path="/reports" element={<Reports />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  )
}
