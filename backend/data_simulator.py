"""
Real-time sensor data simulator for mining environment.
Generates realistic time-series data with trends, seasonality, and anomalies.
"""

import numpy as np
import time
import random
from datetime import datetime, timedelta

class MineDataSimulator:
    def __init__(self):
        self.base_time = datetime.now()
        self.tick = 0
        self.miners = self._init_miners()
        self.zones = ['Zone A - Main Shaft', 'Zone B - East Tunnel', 'Zone C - West Tunnel',
                      'Zone D - Deep Level', 'Zone E - Ventilation Hub', 'Zone F - Loading Bay']
        self.alert_history = []
        self._generate_alert_history()

    def _init_miners(self):
        names = [
            ('Rajesh Kumar', 'MNR-001'), ('Amit Singh', 'MNR-002'),
            ('Suresh Patel', 'MNR-003'), ('Vikram Sharma', 'MNR-004'),
            ('Deepak Yadav', 'MNR-005'), ('Manoj Gupta', 'MNR-006'),
            ('Ravi Verma', 'MNR-007'), ('Sanjay Tiwari', 'MNR-008'),
            ('Ashok Mishra', 'MNR-009'), ('Pradeep Joshi', 'MNR-010'),
            ('Ramesh Dubey', 'MNR-011'), ('Gopal Chauhan', 'MNR-012'),
        ]
        miners = []
        zones = ['Zone A - Main Shaft', 'Zone B - East Tunnel', 'Zone C - West Tunnel',
                 'Zone D - Deep Level', 'Zone E - Ventilation Hub', 'Zone F - Loading Bay']
        for i, (name, mid) in enumerate(names):
            miners.append({
                'id': mid,
                'name': name,
                'zone': zones[i % len(zones)],
                'shift': random.choice(['Morning', 'Afternoon', 'Night']),
                'status': random.choice(['Active', 'Active', 'Active', 'Active', 'Rest']),
                'base_heart_rate': random.randint(68, 85),
                'base_spo2': random.uniform(95.0, 99.0),
                'base_body_temp': random.uniform(36.2, 37.0),
                'fatigue_base': random.uniform(10, 30),
                'shift_start': random.uniform(1, 6),
            })
        return miners

    def _generate_alert_history(self):
        alert_types = [
            ('Methane level elevated in Zone D', 'Warning', 'Environmental'),
            ('CO concentration spike detected', 'Critical', 'Environmental'),
            ('Miner MNR-003 heart rate anomaly', 'Warning', 'Miner Health'),
            ('Ventilation system efficiency drop', 'Info', 'Equipment'),
            ('Ground vibration threshold exceeded', 'Critical', 'Structural'),
            ('Dust levels above safe limit in Zone B', 'Warning', 'Environmental'),
            ('Temperature rise in Zone C', 'Info', 'Environmental'),
            ('Miner MNR-007 fatigue index high', 'Warning', 'Miner Health'),
            ('Seismic activity detected near Zone D', 'Critical', 'Structural'),
            ('O2 depletion warning in Zone E', 'Warning', 'Environmental'),
            ('Equipment malfunction in loading bay', 'Info', 'Equipment'),
            ('Water seepage detected Zone C', 'Warning', 'Structural'),
            ('Emergency evacuation drill completed', 'Info', 'Operations'),
            ('Hydrogen sulfide spike in Zone A', 'Critical', 'Environmental'),
            ('Miner MNR-011 exposure limit approaching', 'Warning', 'Miner Health'),
        ]
        now = datetime.now()
        for i, (msg, level, category) in enumerate(alert_types):
            self.alert_history.append({
                'id': f'ALT-{1000 + i}',
                'message': msg,
                'level': level,
                'category': category,
                'timestamp': (now - timedelta(hours=random.uniform(0.5, 48))).isoformat(),
                'acknowledged': random.choice([True, False, False]),
                'zone': random.choice(self.zones),
            })
        self.alert_history.sort(key=lambda x: x['timestamp'], reverse=True)

    def _add_noise(self, value, noise_level=0.02):
        return value * (1 + np.random.normal(0, noise_level))

    def _seasonal_component(self, t, period=100, amplitude=1.0):
        return amplitude * np.sin(2 * np.pi * t / period)

    def _trend_component(self, t, slope=0.001):
        return slope * t

    def get_sensor_reading(self):
        self.tick += 1
        t = self.tick
        methane = max(0, self._add_noise(0.8 + self._seasonal_component(t, 80, 0.3) + self._trend_component(t, 0.002), 0.05))
        co = max(0, self._add_noise(12 + self._seasonal_component(t, 60, 3) + self._trend_component(t, 0.01), 0.04))
        co2 = max(0, self._add_noise(800 + self._seasonal_component(t, 120, 100) + self._trend_component(t, 0.5), 0.03))
        h2s = max(0, self._add_noise(2.5 + self._seasonal_component(t, 90, 0.8), 0.06))
        o2 = min(21, max(18, self._add_noise(20.5 - self._seasonal_component(t, 100, 0.3), 0.01)))
        temperature = self._add_noise(28 + self._seasonal_component(t, 150, 3) + self._trend_component(t, 0.005), 0.02)
        humidity = min(100, max(30, self._add_noise(65 + self._seasonal_component(t, 130, 10), 0.03)))
        vibration = max(0, self._add_noise(2.5 + self._seasonal_component(t, 70, 1.2) + abs(np.random.normal(0, 0.3)), 0.05))
        dust_pm25 = max(0, self._add_noise(45 + self._seasonal_component(t, 100, 15) + self._trend_component(t, 0.02), 0.04))
        dust_pm10 = max(0, self._add_noise(85 + self._seasonal_component(t, 100, 25) + self._trend_component(t, 0.03), 0.04))
        noise_level = max(60, self._add_noise(82 + self._seasonal_component(t, 50, 5), 0.02))
        water_seepage = max(0, self._add_noise(0.5 + self._seasonal_component(t, 200, 0.3), 0.1))
        ventilation_eff = min(100, max(60, self._add_noise(88 - self._trend_component(t, 0.01) + self._seasonal_component(t, 100, 3), 0.02)))

        # Inject anomalies occasionally
        if random.random() < 0.03:
            methane *= random.uniform(1.5, 2.5)
        if random.random() < 0.02:
            co *= random.uniform(1.8, 3.0)
        if random.random() < 0.02:
            vibration *= random.uniform(2.0, 3.5)

        return {
            'timestamp': datetime.now().isoformat(),
            'tick': t,
            'methane': round(methane, 3),
            'co': round(co, 2),
            'co2': round(co2, 1),
            'h2s': round(h2s, 3),
            'o2': round(o2, 2),
            'temperature': round(temperature, 1),
            'humidity': round(humidity, 1),
            'vibration': round(vibration, 3),
            'dust_pm25': round(dust_pm25, 1),
            'dust_pm10': round(dust_pm10, 1),
            'noise_level': round(noise_level, 1),
            'water_seepage': round(water_seepage, 2),
            'ventilation_efficiency': round(ventilation_eff, 1),
        }

    def get_historical_data(self, sensor='methane', hours=24, points=200):
        data = []
        now = datetime.now()
        for i in range(points):
            t_offset = (hours * 3600 / points) * i
            t = i * 5
            ts = now - timedelta(seconds=hours * 3600 - t_offset)

            if sensor == 'methane':
                val = max(0, 0.8 + self._seasonal_component(t, 80, 0.3) + self._trend_component(t, 0.002) + np.random.normal(0, 0.05))
            elif sensor == 'co':
                val = max(0, 12 + self._seasonal_component(t, 60, 3) + self._trend_component(t, 0.01) + np.random.normal(0, 0.5))
            elif sensor == 'co2':
                val = max(0, 800 + self._seasonal_component(t, 120, 100) + self._trend_component(t, 0.5) + np.random.normal(0, 20))
            elif sensor == 'h2s':
                val = max(0, 2.5 + self._seasonal_component(t, 90, 0.8) + np.random.normal(0, 0.15))
            elif sensor == 'temperature':
                val = 28 + self._seasonal_component(t, 150, 3) + self._trend_component(t, 0.005) + np.random.normal(0, 0.5)
            elif sensor == 'humidity':
                val = min(100, max(30, 65 + self._seasonal_component(t, 130, 10) + np.random.normal(0, 2)))
            elif sensor == 'vibration':
                val = max(0, 2.5 + self._seasonal_component(t, 70, 1.2) + abs(np.random.normal(0, 0.3)))
            elif sensor == 'dust_pm25':
                val = max(0, 45 + self._seasonal_component(t, 100, 15) + self._trend_component(t, 0.02) + np.random.normal(0, 3))
            elif sensor == 'dust_pm10':
                val = max(0, 85 + self._seasonal_component(t, 100, 25) + self._trend_component(t, 0.03) + np.random.normal(0, 5))
            else:
                val = np.random.normal(50, 10)

            # Inject anomalies
            is_anomaly = False
            if random.random() < 0.02:
                val *= random.uniform(1.5, 2.5)
                is_anomaly = True

            data.append({
                'timestamp': ts.isoformat(),
                'value': round(val, 3),
                'is_anomaly': is_anomaly,
            })
        return data

    def get_miner_data(self):
        result = []
        for m in self.miners:
            hr = self._add_noise(m['base_heart_rate'] + random.uniform(-5, 15), 0.03)
            spo2 = min(100, self._add_noise(m['base_spo2'], 0.005))
            bt = self._add_noise(m['base_body_temp'] + random.uniform(-0.2, 0.5), 0.005)
            fatigue = min(100, max(0, m['fatigue_base'] + self.tick * 0.05 + random.uniform(-5, 10)))
            exposure_hours = round(m['shift_start'] + self.tick * 0.002, 1)

            status = m['status']
            if fatigue > 70:
                status = 'Fatigued'
            elif hr > 110:
                status = 'Stressed'

            result.append({
                'id': m['id'],
                'name': m['name'],
                'zone': m['zone'],
                'shift': m['shift'],
                'status': status,
                'heart_rate': round(hr),
                'spo2': round(spo2, 1),
                'body_temperature': round(bt, 1),
                'fatigue_index': round(fatigue, 1),
                'exposure_hours': min(8, exposure_hours),
                'last_update': datetime.now().isoformat(),
            })
        return result

    def get_zone_data(self):
        result = []
        for i, zone in enumerate(self.zones):
            t = self.tick + i * 20
            risk = min(100, max(0, 30 + self._seasonal_component(t, 60, 20) + random.uniform(-5, 15)))
            result.append({
                'name': zone,
                'risk_score': round(risk, 1),
                'risk_level': 'Critical' if risk > 75 else 'High' if risk > 55 else 'Medium' if risk > 35 else 'Low',
                'active_miners': random.randint(1, 4),
                'methane': round(max(0, 0.5 + self._seasonal_component(t, 80, 0.4) + random.uniform(0, 0.3)), 3),
                'temperature': round(26 + i * 1.5 + self._seasonal_component(t, 100, 2) + random.uniform(-1, 1), 1),
                'humidity': round(min(100, max(40, 60 + i * 3 + random.uniform(-5, 5))), 1),
                'ventilation': round(min(100, max(60, 90 - i * 3 + random.uniform(-5, 5))), 1),
                'last_inspection': (datetime.now() - timedelta(hours=random.uniform(1, 24))).isoformat(),
            })
        return result

    def get_alerts(self):
        return self.alert_history

    def get_shift_reports(self):
        shifts = ['Morning (6AM-2PM)', 'Afternoon (2PM-10PM)', 'Night (10PM-6AM)']
        reports = []
        for i, shift in enumerate(shifts):
            reports.append({
                'shift': shift,
                'total_miners': random.randint(8, 15),
                'incidents': random.randint(0, 3),
                'avg_risk_score': round(random.uniform(25, 55), 1),
                'compliance_rate': round(random.uniform(88, 99), 1),
                'production_tons': round(random.uniform(150, 350), 1),
                'safety_score': round(random.uniform(75, 98), 1),
            })
        return reports
