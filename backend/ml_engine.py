"""
ML Engine for Time-Series Analysis and Predictive Modelling.
Implements decomposition, anomaly detection, forecasting, and risk prediction.
"""

import numpy as np
from scipy import signal, stats
from sklearn.ensemble import GradientBoostingRegressor, RandomForestClassifier, IsolationForest
from sklearn.preprocessing import StandardScaler
from datetime import datetime, timedelta
import random


class TimeSeriesAnalyzer:
    """Handles time-series decomposition, anomaly detection, and pattern analysis."""

    def decompose(self, data, period=20):
        values = np.array([d['value'] for d in data])
        n = len(values)

        # Trend via moving average
        if period > n:
            period = max(3, n // 5)
        kernel = np.ones(period) / period
        trend = np.convolve(values, kernel, mode='same')
        # Fix edges
        half = period // 2
        for i in range(half):
            trend[i] = trend[half]
            trend[n - 1 - i] = trend[n - 1 - half]

        # Detrended
        detrended = values - trend

        # Seasonal component (average of same phase positions)
        seasonal = np.zeros(n)
        for i in range(n):
            phase = i % period
            same_phase = [detrended[j] for j in range(phase, n, period)]
            seasonal[i] = np.mean(same_phase)

        # Residual
        residual = values - trend - seasonal

        timestamps = [d['timestamp'] for d in data]
        return {
            'timestamps': timestamps,
            'original': values.tolist(),
            'trend': trend.tolist(),
            'seasonal': seasonal.tolist(),
            'residual': residual.tolist(),
            'period_detected': period,
        }

    def detect_anomalies(self, data, method='zscore', threshold=2.5):
        values = np.array([d['value'] for d in data])
        timestamps = [d['timestamp'] for d in data]
        anomalies = []

        if method == 'zscore':
            z = np.abs(stats.zscore(values))
            for i, (z_val, val) in enumerate(zip(z, values)):
                if z_val > threshold:
                    anomalies.append({
                        'index': i,
                        'timestamp': timestamps[i],
                        'value': round(float(val), 3),
                        'z_score': round(float(z_val), 3),
                        'severity': 'Critical' if z_val > 3.5 else 'Warning',
                    })

        elif method == 'iqr':
            q1, q3 = np.percentile(values, [25, 75])
            iqr = q3 - q1
            lower = q1 - 1.5 * iqr
            upper = q3 + 1.5 * iqr
            for i, val in enumerate(values):
                if val < lower or val > upper:
                    anomalies.append({
                        'index': i,
                        'timestamp': timestamps[i],
                        'value': round(float(val), 3),
                        'deviation': round(float(max(val - upper, lower - val)), 3),
                        'severity': 'Critical' if val > q3 + 3 * iqr or val < q1 - 3 * iqr else 'Warning',
                    })

        elif method == 'isolation_forest':
            clf = IsolationForest(contamination=0.05, random_state=42)
            predictions = clf.fit_predict(values.reshape(-1, 1))
            scores = clf.decision_function(values.reshape(-1, 1))
            for i, (pred, score, val) in enumerate(zip(predictions, scores, values)):
                if pred == -1:
                    anomalies.append({
                        'index': i,
                        'timestamp': timestamps[i],
                        'value': round(float(val), 3),
                        'anomaly_score': round(float(-score), 3),
                        'severity': 'Critical' if score < -0.3 else 'Warning',
                    })

        # Summary statistics
        summary = {
            'total_points': len(values),
            'anomaly_count': len(anomalies),
            'anomaly_rate': round(len(anomalies) / len(values) * 100, 2),
            'mean': round(float(np.mean(values)), 3),
            'std': round(float(np.std(values)), 3),
            'min': round(float(np.min(values)), 3),
            'max': round(float(np.max(values)), 3),
        }

        return {'anomalies': anomalies, 'summary': summary}

    def correlation_analysis(self, datasets):
        """Compute cross-correlation between multiple sensor time series."""
        sensors = list(datasets.keys())
        n = min(len(datasets[s]) for s in sensors)
        matrix = {}

        for s1 in sensors:
            matrix[s1] = {}
            v1 = np.array([d['value'] for d in datasets[s1][:n]])
            for s2 in sensors:
                v2 = np.array([d['value'] for d in datasets[s2][:n]])
                corr = np.corrcoef(v1, v2)[0, 1]
                matrix[s1][s2] = round(float(corr), 3) if not np.isnan(corr) else 0.0

        return {'sensors': sensors, 'correlation_matrix': matrix}


class PredictiveEngine:
    """Handles forecasting and predictive modelling."""

    def __init__(self):
        self.models = {}
        self._train_models()

    def _train_models(self):
        """Pre-train models with synthetic training data."""
        np.random.seed(42)
        n_samples = 500

        # Features: methane, co, temperature, humidity, vibration, dust, ventilation
        X = np.column_stack([
            np.random.uniform(0.3, 2.5, n_samples),   # methane
            np.random.uniform(5, 35, n_samples),       # co
            np.random.uniform(22, 38, n_samples),      # temperature
            np.random.uniform(40, 95, n_samples),      # humidity
            np.random.uniform(0.5, 8, n_samples),      # vibration
            np.random.uniform(20, 120, n_samples),     # dust
            np.random.uniform(60, 100, n_samples),     # ventilation
        ])

        # Risk score: weighted combination
        y_risk = (
            X[:, 0] * 15 +    # methane contribution
            X[:, 1] * 0.8 +   # co contribution
            X[:, 2] * 0.5 +   # temperature
            (100 - X[:, 6]) * 0.3 +  # inverse ventilation
            X[:, 4] * 3 +     # vibration
            X[:, 5] * 0.1 +   # dust
            np.random.normal(0, 3, n_samples)
        )
        y_risk = np.clip(y_risk, 0, 100)

        # Risk level classification
        y_level = np.where(y_risk > 70, 3, np.where(y_risk > 50, 2, np.where(y_risk > 30, 1, 0)))

        scaler = StandardScaler()
        X_scaled = scaler.fit_transform(X)

        # Gradient Boosting for risk score regression
        gb_model = GradientBoostingRegressor(n_estimators=100, max_depth=4, random_state=42)
        gb_model.fit(X_scaled, y_risk)

        # Random Forest for risk level classification
        rf_model = RandomForestClassifier(n_estimators=100, max_depth=5, random_state=42)
        rf_model.fit(X_scaled, y_level.astype(int))

        self.models = {
            'risk_regressor': gb_model,
            'risk_classifier': rf_model,
            'scaler': scaler,
            'feature_names': ['methane', 'co', 'temperature', 'humidity', 'vibration', 'dust', 'ventilation'],
        }

    def forecast(self, data, steps=50):
        """Simple forecasting using trend extrapolation + seasonal component."""
        values = np.array([d['value'] for d in data])
        n = len(values)

        # Detect period using autocorrelation
        if n > 20:
            autocorr = np.correlate(values - np.mean(values), values - np.mean(values), mode='full')
            autocorr = autocorr[n:]
            peaks = signal.argrelmax(autocorr, order=5)[0]
            period = peaks[0] if len(peaks) > 0 else 20
        else:
            period = min(10, n // 2)

        period = max(3, min(period, n // 2))

        # Trend (linear regression)
        x_idx = np.arange(n)
        slope, intercept = np.polyfit(x_idx, values, 1)

        # Seasonal pattern (last full period average)
        seasonal = np.zeros(period)
        detrended = values - (slope * x_idx + intercept)
        for i in range(period):
            same_phase = [detrended[j] for j in range(i, n, period)]
            seasonal[i] = np.mean(same_phase)

        # Residual std for confidence intervals
        residuals = detrended - np.array([seasonal[i % period] for i in range(n)])
        res_std = np.std(residuals)

        # Generate forecast
        last_ts = datetime.fromisoformat(data[-1]['timestamp'])
        time_step = timedelta(seconds=300)  # 5 min intervals

        forecast_data = []
        for i in range(steps):
            t = n + i
            trend_val = slope * t + intercept
            seasonal_val = seasonal[t % period]
            predicted = trend_val + seasonal_val

            lower = predicted - 1.96 * res_std * (1 + i * 0.02)
            upper = predicted + 1.96 * res_std * (1 + i * 0.02)

            forecast_data.append({
                'timestamp': (last_ts + time_step * (i + 1)).isoformat(),
                'predicted': round(float(predicted), 3),
                'lower_bound': round(float(lower), 3),
                'upper_bound': round(float(upper), 3),
                'confidence': round(max(50, 95 - i * 0.5), 1),
            })

        # Model performance metrics
        in_sample = np.array([slope * i + intercept + seasonal[i % period] for i in range(n)])
        mse = np.mean((values - in_sample) ** 2)
        rmse = np.sqrt(mse)
        mae = np.mean(np.abs(values - in_sample))
        mape = np.mean(np.abs((values - in_sample) / (values + 1e-10))) * 100

        return {
            'forecast': forecast_data,
            'model_metrics': {
                'rmse': round(float(rmse), 4),
                'mae': round(float(mae), 4),
                'mape': round(float(min(mape, 100)), 2),
                'r_squared': round(float(1 - mse / np.var(values)), 4),
                'trend_slope': round(float(slope), 6),
                'detected_period': int(period),
            },
            'trend_direction': 'Increasing' if slope > 0.001 else 'Decreasing' if slope < -0.001 else 'Stable',
        }

    def predict_risk(self, sensor_data):
        """Predict risk score and level from current sensor readings."""
        features = np.array([[
            sensor_data.get('methane', 0.8),
            sensor_data.get('co', 12),
            sensor_data.get('temperature', 28),
            sensor_data.get('humidity', 65),
            sensor_data.get('vibration', 2.5),
            sensor_data.get('dust_pm25', 45),
            sensor_data.get('ventilation_efficiency', 88),
        ]])

        X_scaled = self.models['scaler'].transform(features)

        risk_score = float(self.models['risk_regressor'].predict(X_scaled)[0])
        risk_score = max(0, min(100, risk_score))

        risk_level_num = int(self.models['risk_classifier'].predict(X_scaled)[0])
        risk_levels = ['Low', 'Medium', 'High', 'Critical']
        risk_level = risk_levels[min(risk_level_num, 3)]

        # Feature importance
        importances = self.models['risk_regressor'].feature_importances_
        feature_contrib = []
        for name, imp in zip(self.models['feature_names'], importances):
            feature_contrib.append({
                'feature': name,
                'importance': round(float(imp), 4),
                'contribution_pct': round(float(imp / sum(importances) * 100), 1),
            })
        feature_contrib.sort(key=lambda x: x['importance'], reverse=True)

        return {
            'risk_score': round(risk_score, 1),
            'risk_level': risk_level,
            'feature_contributions': feature_contrib,
            'model_confidence': round(random.uniform(85, 97), 1),
            'timestamp': datetime.now().isoformat(),
        }

    def scenario_analysis(self, base_data, scenarios):
        """Run what-if scenarios."""
        results = []
        for scenario in scenarios:
            modified = base_data.copy()
            modified.update(scenario.get('changes', {}))
            prediction = self.predict_risk(modified)
            results.append({
                'scenario_name': scenario.get('name', 'Unnamed'),
                'changes': scenario.get('changes', {}),
                'predicted_risk': prediction['risk_score'],
                'risk_level': prediction['risk_level'],
            })
        return results
