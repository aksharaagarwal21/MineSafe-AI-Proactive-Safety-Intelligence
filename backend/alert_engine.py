"""
Alert Engine for proactive safety warnings based on sensor thresholds and predictions.
"""

from datetime import datetime


class AlertEngine:
    # Threshold definitions
    THRESHOLDS = {
        'methane': {'warning': 1.0, 'critical': 1.5, 'emergency': 2.0, 'unit': '%'},
        'co': {'warning': 20, 'critical': 35, 'emergency': 50, 'unit': 'ppm'},
        'co2': {'warning': 1000, 'critical': 1500, 'emergency': 2000, 'unit': 'ppm'},
        'h2s': {'warning': 5, 'critical': 10, 'emergency': 15, 'unit': 'ppm'},
        'o2': {'warning': 19.5, 'critical': 19.0, 'emergency': 18.0, 'unit': '%', 'inverted': True},
        'temperature': {'warning': 32, 'critical': 35, 'emergency': 38, 'unit': '°C'},
        'humidity': {'warning': 80, 'critical': 90, 'emergency': 95, 'unit': '%'},
        'vibration': {'warning': 4.0, 'critical': 6.0, 'emergency': 8.0, 'unit': 'mm/s'},
        'dust_pm25': {'warning': 65, 'critical': 100, 'emergency': 150, 'unit': 'µg/m³'},
        'dust_pm10': {'warning': 120, 'critical': 180, 'emergency': 250, 'unit': 'µg/m³'},
    }

    def __init__(self):
        self.active_alerts = []

    def evaluate_sensors(self, sensor_data):
        """Evaluate sensor readings against thresholds and generate alerts."""
        alerts = []

        for sensor, thresholds in self.THRESHOLDS.items():
            value = sensor_data.get(sensor)
            if value is None:
                continue

            inverted = thresholds.get('inverted', False)

            level = None
            if inverted:
                if value < thresholds['emergency']:
                    level = 'Emergency'
                elif value < thresholds['critical']:
                    level = 'Critical'
                elif value < thresholds['warning']:
                    level = 'Warning'
            else:
                if value > thresholds['emergency']:
                    level = 'Emergency'
                elif value > thresholds['critical']:
                    level = 'Critical'
                elif value > thresholds['warning']:
                    level = 'Warning'

            if level:
                alerts.append({
                    'sensor': sensor,
                    'value': value,
                    'threshold': thresholds[level.lower()] if level.lower() in thresholds else thresholds['warning'],
                    'unit': thresholds['unit'],
                    'level': level,
                    'message': f"{sensor.upper().replace('_', ' ')} {'below' if inverted else 'above'} {level.lower()} threshold: {value}{thresholds['unit']}",
                    'timestamp': datetime.now().isoformat(),
                })

        return alerts

    def evaluate_miners(self, miners):
        """Evaluate miner health data for alerts."""
        alerts = []
        for miner in miners:
            if miner.get('heart_rate', 0) > 110:
                alerts.append({
                    'sensor': 'heart_rate',
                    'miner': miner['name'],
                    'value': miner['heart_rate'],
                    'level': 'Critical' if miner['heart_rate'] > 130 else 'Warning',
                    'message': f"Miner {miner['name']} heart rate elevated: {miner['heart_rate']} BPM",
                    'timestamp': datetime.now().isoformat(),
                })
            if miner.get('spo2', 100) < 94:
                alerts.append({
                    'sensor': 'spo2',
                    'miner': miner['name'],
                    'value': miner['spo2'],
                    'level': 'Critical' if miner['spo2'] < 90 else 'Warning',
                    'message': f"Miner {miner['name']} SpO2 low: {miner['spo2']}%",
                    'timestamp': datetime.now().isoformat(),
                })
            if miner.get('fatigue_index', 0) > 70:
                alerts.append({
                    'sensor': 'fatigue',
                    'miner': miner['name'],
                    'value': miner['fatigue_index'],
                    'level': 'Critical' if miner['fatigue_index'] > 85 else 'Warning',
                    'message': f"Miner {miner['name']} fatigue index high: {miner['fatigue_index']}",
                    'timestamp': datetime.now().isoformat(),
                })
        return alerts

    def get_safety_score(self, sensor_data, miners):
        """Calculate overall mine safety score (0-100)."""
        score = 100.0

        # Deductions for sensor readings
        thresholds = self.THRESHOLDS
        if sensor_data.get('methane', 0) > thresholds['methane']['warning']:
            score -= min(20, (sensor_data['methane'] - thresholds['methane']['warning']) * 15)
        if sensor_data.get('co', 0) > thresholds['co']['warning']:
            score -= min(15, (sensor_data['co'] - thresholds['co']['warning']) * 0.5)
        if sensor_data.get('temperature', 0) > thresholds['temperature']['warning']:
            score -= min(10, (sensor_data['temperature'] - thresholds['temperature']['warning']) * 2)
        if sensor_data.get('vibration', 0) > thresholds['vibration']['warning']:
            score -= min(15, (sensor_data['vibration'] - thresholds['vibration']['warning']) * 3)
        if sensor_data.get('dust_pm25', 0) > thresholds['dust_pm25']['warning']:
            score -= min(10, (sensor_data['dust_pm25'] - thresholds['dust_pm25']['warning']) * 0.2)

        vent = sensor_data.get('ventilation_efficiency', 100)
        if vent < 80:
            score -= (80 - vent) * 0.5

        # Deductions for miner health
        for m in miners:
            if m.get('fatigue_index', 0) > 70:
                score -= 2
            if m.get('heart_rate', 0) > 110:
                score -= 2

        return max(0, min(100, round(score, 1)))

    def get_thresholds(self):
        return self.THRESHOLDS
