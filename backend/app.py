"""
Flask Backend - AI-Based Time-Series Analysis & Predictive Modelling
for Miner and Environmental Proactive Safety
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
from data_simulator import MineDataSimulator
from ml_engine import TimeSeriesAnalyzer, PredictiveEngine
from alert_engine import AlertEngine

app = Flask(__name__)
CORS(app)

# Initialize components
simulator = MineDataSimulator()
ts_analyzer = TimeSeriesAnalyzer()
pred_engine = PredictiveEngine()
alert_engine = AlertEngine()


@app.route('/api/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'service': 'Mining Safety AI Backend'})


# === REAL-TIME DATA ===

@app.route('/api/sensors/live', methods=['GET'])
def live_sensors():
    """Get current sensor readings."""
    data = simulator.get_sensor_reading()
    miners = simulator.get_miner_data()
    sensor_alerts = alert_engine.evaluate_sensors(data)
    safety_score = alert_engine.get_safety_score(data, miners)
    data['safety_score'] = safety_score
    data['active_alerts'] = len(sensor_alerts)
    data['active_miners'] = len([m for m in miners if m['status'] != 'Rest'])
    return jsonify(data)


@app.route('/api/sensors/historical', methods=['GET'])
def historical_sensors():
    """Get historical sensor data for time-series analysis."""
    sensor = request.args.get('sensor', 'methane')
    hours = int(request.args.get('hours', 24))
    points = int(request.args.get('points', 200))
    data = simulator.get_historical_data(sensor=sensor, hours=hours, points=points)
    return jsonify({'sensor': sensor, 'hours': hours, 'data': data})


# === TIME-SERIES ANALYSIS ===

@app.route('/api/analysis/decompose', methods=['GET'])
def decompose():
    """Decompose time series into trend, seasonal, and residual."""
    sensor = request.args.get('sensor', 'methane')
    hours = int(request.args.get('hours', 24))
    period = int(request.args.get('period', 20))
    data = simulator.get_historical_data(sensor=sensor, hours=hours, points=200)
    result = ts_analyzer.decompose(data, period=period)
    result['sensor'] = sensor
    return jsonify(result)


@app.route('/api/analysis/anomalies', methods=['GET'])
def anomalies():
    """Detect anomalies in sensor data."""
    sensor = request.args.get('sensor', 'methane')
    method = request.args.get('method', 'zscore')
    hours = int(request.args.get('hours', 24))
    threshold = float(request.args.get('threshold', 2.5))
    data = simulator.get_historical_data(sensor=sensor, hours=hours, points=200)
    result = ts_analyzer.detect_anomalies(data, method=method, threshold=threshold)
    result['sensor'] = sensor
    result['method'] = method
    return jsonify(result)


@app.route('/api/analysis/correlation', methods=['GET'])
def correlation():
    """Cross-correlation between multiple sensors."""
    sensors = request.args.get('sensors', 'methane,co,temperature,humidity,vibration').split(',')
    hours = int(request.args.get('hours', 24))
    datasets = {}
    for s in sensors:
        datasets[s] = simulator.get_historical_data(sensor=s.strip(), hours=hours, points=200)
    result = ts_analyzer.correlation_analysis(datasets)
    return jsonify(result)


# === PREDICTIVE MODELLING ===

@app.route('/api/predict/forecast', methods=['GET'])
def forecast():
    """Forecast future sensor values."""
    sensor = request.args.get('sensor', 'methane')
    hours = int(request.args.get('hours', 24))
    steps = int(request.args.get('steps', 50))
    data = simulator.get_historical_data(sensor=sensor, hours=hours, points=200)
    result = pred_engine.forecast(data, steps=steps)
    result['sensor'] = sensor
    result['historical'] = data[-50:]  # Last 50 points for context
    return jsonify(result)


@app.route('/api/predict/risk', methods=['GET'])
def predict_risk():
    """Predict risk score from current sensor data."""
    sensor_data = simulator.get_sensor_reading()
    result = pred_engine.predict_risk(sensor_data)
    result['sensor_snapshot'] = sensor_data
    return jsonify(result)


@app.route('/api/predict/scenarios', methods=['POST'])
def scenarios():
    """Run what-if scenario analysis."""
    body = request.get_json() or {}
    base_data = simulator.get_sensor_reading()
    scenarios_list = body.get('scenarios', [
        {'name': 'Methane Spike', 'changes': {'methane': 2.0}},
        {'name': 'Ventilation Failure', 'changes': {'ventilation_efficiency': 50}},
        {'name': 'Heat Wave', 'changes': {'temperature': 38}},
        {'name': 'Gas Outbreak', 'changes': {'methane': 2.5, 'co': 40, 'h2s': 12}},
        {'name': 'Best Case', 'changes': {'methane': 0.3, 'co': 5, 'temperature': 24, 'ventilation_efficiency': 98}},
    ])
    result = pred_engine.scenario_analysis(base_data, scenarios_list)
    return jsonify({'base_risk': pred_engine.predict_risk(base_data)['risk_score'], 'scenarios': result})


# === MINER SAFETY ===

@app.route('/api/miners', methods=['GET'])
def miners():
    """Get all miner data."""
    data = simulator.get_miner_data()
    return jsonify({'miners': data, 'total': len(data), 'active': len([m for m in data if m['status'] != 'Rest'])})


# === ZONES ===

@app.route('/api/zones', methods=['GET'])
def zones():
    """Get zone-wise data."""
    data = simulator.get_zone_data()
    return jsonify({'zones': data})


# === ALERTS ===

@app.route('/api/alerts', methods=['GET'])
def alerts():
    """Get alert history."""
    alert_list = simulator.get_alerts()
    sensor_data = simulator.get_sensor_reading()
    miners_data = simulator.get_miner_data()
    live_alerts = alert_engine.evaluate_sensors(sensor_data)
    miner_alerts = alert_engine.evaluate_miners(miners_data)
    return jsonify({
        'history': alert_list,
        'live_sensor_alerts': live_alerts,
        'live_miner_alerts': miner_alerts,
        'total_active': len(live_alerts) + len(miner_alerts),
    })


@app.route('/api/alerts/thresholds', methods=['GET'])
def thresholds():
    """Get alert thresholds."""
    return jsonify(alert_engine.get_thresholds())


# === REPORTS ===

@app.route('/api/reports/shifts', methods=['GET'])
def shift_reports():
    """Get shift-wise reports."""
    data = simulator.get_shift_reports()
    return jsonify({'reports': data})


@app.route('/api/reports/summary', methods=['GET'])
def report_summary():
    """Get summary statistics for reports."""
    sensor = simulator.get_sensor_reading()
    miners_data = simulator.get_miner_data()
    zones_data = simulator.get_zone_data()
    safety = alert_engine.get_safety_score(sensor, miners_data)

    return jsonify({
        'safety_score': safety,
        'total_miners': len(miners_data),
        'active_miners': len([m for m in miners_data if m['status'] != 'Rest']),
        'avg_risk': round(sum(z['risk_score'] for z in zones_data) / len(zones_data), 1),
        'high_risk_zones': len([z for z in zones_data if z['risk_level'] in ['High', 'Critical']]),
        'compliance_rate': round(92.5 + (safety / 100) * 5, 1),
        'incidents_today': 2,
        'near_misses': 5,
    })


if __name__ == '__main__':
    app.run(debug=True, port=5001)
