# إنشاء ملف: surveillance/weather_analyzer.py

from django.utils import timezone
from .models import Alert, WeatherData, ThreatType
import logging
from datetime import timedelta

logger = logging.getLogger(__name__)

class WeatherImpactAnalyzer:
    def __init__(self):
        self.weather_impact_rules = {
            'visibility': {
                'excellent': {'min': 10.0, 'impact': -0.3},  # تقليل الإنذارات
                'good': {'min': 5.0, 'impact': 0.0},
                'poor': {'min': 2.0, 'impact': 0.2},       # زيادة الإنذارات
                'very_poor': {'min': 0.0, 'impact': 0.4}
            },
            'precipitation': {
                'none': {'max': 0.0, 'impact': 0.0},
                'light': {'max': 2.5, 'impact': 0.1},
                'moderate': {'max': 7.5, 'impact': 0.25},
                'heavy': {'max': 100.0, 'impact': 0.4}
            },
            'wind_speed': {
                'calm': {'max': 10.0, 'impact': 0.0},
                'moderate': {'max': 25.0, 'impact': 0.15},
                'strong': {'max': 40.0, 'impact': 0.3},
                'storm': {'max': 100.0, 'impact': 0.5}
            }
        }
    
    def analyze_weather_impact(self, camera, hours_back=24):
        """تحليل تأثير الطقس على الأنشطة الحدودية للكاميرا"""
        try:
            # الحصول على بيانات الطقس والإنذارات الحديثة
            end_time = timezone.now()
            start_time = end_time - timedelta(hours=hours_back)
            
            weather_data = WeatherData.objects.filter(
                camera=camera,
                recorded_at__range=(start_time, end_time)
            ).order_by('recorded_at')
            
            alerts = Alert.objects.filter(
                media_file__camera=camera,
                created_at__range=(start_time, end_time)
            )
            
            if not weather_data or not alerts:
                return {'status': 'no_data', 'message': 'لا توجد بيانات كافية للتحليل'}
            
            # تحليل التأثير
            impact_analysis = self._calculate_impact(weather_data, alerts)
            
            logger.info(f"تم تحليل تأثير الطقس للكاميرا {camera.name}: {impact_analysis}")
            return impact_analysis
            
        except Exception as e:
            logger.error(f"خطأ في تحليل تأثير الطقس: {e}")
            return {'status': 'error', 'message': str(e)}
    
    def _calculate_impact(self, weather_data, alerts):
        """حساب تأثير الطقس على الإنذارات"""
        analysis = {
            'total_alerts': alerts.count(),
            'weather_impact_score': 0.0,
            'risk_adjustments': {},
            'recommendations': []
        }
        
        # حساب متوسط ظروف الطقس
        avg_visibility = sum(w.visibility for w in weather_data) / len(weather_data)
        avg_precipitation = sum(w.precipitation for w in weather_data) / len(weather_data)
        avg_wind_speed = sum(w.wind_speed for w in weather_data) / len(weather_data)
        
        # تحليل تأثير كل عنصر طقس
        visibility_impact = self._get_visibility_impact(avg_visibility)
        precipitation_impact = self._get_precipitation_impact(avg_precipitation)
        wind_impact = self._get_wind_impact(avg_wind_speed)
        
        # حساب التأثير الكلي
        total_impact = visibility_impact + precipitation_impact + wind_impact
        analysis['weather_impact_score'] = total_impact
        
        # إضافة التوصيات
        analysis['recommendations'] = self._generate_recommendations(
            avg_visibility, avg_precipitation, avg_wind_speed, total_impact
        )
        
        # تحليل تأثير الطقس على أنواع التهديدات
        analysis['threat_analysis'] = self._analyze_threat_weather_correlation(alerts, weather_data)
        
        return analysis
    
    def _get_visibility_impact(self, visibility):
        """تأثير مدى الرؤية"""
        for level, rules in self.weather_impact_rules['visibility'].items():
            if visibility >= rules['min']:
                return rules['impact']
        return 0.0
    
    def _get_precipitation_impact(self, precipitation):
        """تأثير هطول الأمطار"""
        for level, rules in self.weather_impact_rules['precipitation'].items():
            if precipitation <= rules['max']:
                return rules['impact']
        return 0.0
    
    def _get_wind_impact(self, wind_speed):
        """تأثير سرعة الرياح"""
        for level, rules in self.weather_impact_rules['wind_speed'].items():
            if wind_speed <= rules['max']:
                return rules['impact']
        return 0.0
    
    def _generate_recommendations(self, visibility, precipitation, wind_speed, impact):
        """توليد توصيات بناءً على ظروف الطقس"""
        recommendations = []
        
        if visibility < 5.0:
            recommendations.append("🔄 زيادة حساسية الكشف بسبب ضعف الرؤية")
        
        if precipitation > 5.0:
            recommendations.append("🌧️ مراقبة الأنشطة البحرية عن كثب due to heavy precipitation")
        
        if wind_speed > 25.0:
            recommendations.append("💨 توخي الحذر من الإنذارات الكاذبة due to strong winds")
        
        if impact > 0.3:
            recommendations.append("⚠️ رفع مستوى التأهب due to adverse weather conditions")
        
        return recommendations
    
    def _analyze_threat_weather_correlation(self, alerts, weather_data):
        """تحليل العلاقة بين الطقس وأنواع التهديدات"""
        threat_analysis = {}
        
        for alert in alerts:
            threat_type = alert.threat_type.name
            if threat_type not in threat_analysis:
                threat_analysis[threat_type] = {
                    'count': 0,
                    'weather_conditions': []
                }
            
            threat_analysis[threat_type]['count'] += 1
            
            # إيجاد بيانات الطقس المقابلة للإنذار
            alert_weather = self._find_closest_weather(alert.created_at, weather_data)
            if alert_weather:
                threat_analysis[threat_type]['weather_conditions'].append({
                    'visibility': alert_weather.visibility,
                    'precipitation': alert_weather.precipitation,
                    'wind_speed': alert_weather.wind_speed
                })
        
        return threat_analysis
    
    def _find_closest_weather(self, alert_time, weather_data):
        """إيجاد بيانات الطقس الأقرب لوقت الإنذار"""
        closest_weather = None
        min_time_diff = timedelta(hours=24)
        
        for weather in weather_data:
            time_diff = abs(weather.recorded_at - alert_time)
            if time_diff < min_time_diff:
                min_time_diff = time_diff
                closest_weather = weather
        
        return closest_weather if min_time_diff < timedelta(hours=1) else None
# في نفس الملف: surveillance/weather_analyzer.py

class WeatherPredictor:
    def __init__(self):
        self.prediction_rules = {
            'storm_approaching': {
                'conditions': {'pressure_change': -5, 'wind_increase': 15},
                'prediction': 'عاصفة مقبلة',
                'action': 'زيادة المراقبة'
            },
            'visibility_drop': {
                'conditions': {'humidity': 80, 'wind_speed': 5},
                'prediction': 'انخفاض متوقع في الرؤية',
                'action': 'تفعيل أنظمة الرؤية الليلية'
            },
            'high_risk_period': {
                'conditions': {'visibility': 3, 'precipitation': 10},
                'prediction': 'فترة خطورة عالية',
                'action': 'رفع مستوى التأهب'
            }
        }
    
    def predict_risk_periods(self, camera, forecast_hours=6):
        """التنبؤ بفترات الخطورة بناءً على توقعات الطقس"""
        try:
            # في الواقع، هنا سنتكامل مع خدمة توقعات الطقس
            # حالياً سنستخدم تحليلات بسيطة
            
            recent_weather = WeatherData.objects.filter(
                camera=camera
            ).order_by('-recorded_at')[:10]
            
            if not recent_weather:
                return {'status': 'no_data', 'predictions': []}
            
            predictions = self._generate_predictions(recent_weather, forecast_hours)
            
            return {
                'status': 'success',
                'camera': camera.name,
                'forecast_hours': forecast_hours,
                'predictions': predictions
            }
            
        except Exception as e:
            logger.error(f"خطأ في التنبؤ بفترات الخطورة: {e}")
            return {'status': 'error', 'message': str(e)}
    
    def _generate_predictions(self, weather_data, forecast_hours):
        """توليد تنبؤات بناءً على بيانات الطقس"""
        predictions = []
        
        # تحليل اتجاهات الطقس
        trends = self._analyze_weather_trends(weather_data)
        
        # تطبيق قواعد التنبؤ
        for rule_name, rule in self.prediction_rules.items():
            if self._check_rule_conditions(rule['conditions'], trends):
                predictions.append({
                    'type': rule_name,
                    'prediction': rule['prediction'],
                    'action': rule['action'],
                    'confidence': 0.7,  # يمكن تحسين هذا
                    'timeframe': f'within {forecast_hours} hours'
                })
        
        return predictions
    
    def _analyze_weather_trends(self, weather_data):
        """تحليل اتجاهات الطقس"""
        if len(weather_data) < 2:
            return {}
        
        latest = weather_data[0]
        previous = weather_data[1]
        
        trends = {
            'pressure_change': latest.pressure - previous.pressure,
            'wind_increase': latest.wind_speed - previous.wind_speed,
            'visibility_trend': latest.visibility - previous.visibility,
            'current_conditions': {
                'humidity': latest.humidity,
                'wind_speed': latest.wind_speed,
                'visibility': latest.visibility,
                'precipitation': latest.precipitation
            }
        }
        
        return trends
    
    def _check_rule_conditions(self, conditions, trends):
        """التحقق من شروط القاعدة"""
        for condition, threshold in conditions.items():
            if condition in trends.get('current_conditions', {}):
                current_value = trends['current_conditions'][condition]
                if not self._evaluate_condition(current_value, threshold, condition):
                    return False
            elif condition in trends:
                if not self._evaluate_condition(trends[condition], threshold, condition):
                    return False
            else:
                return False
        return True
    
    def _evaluate_condition(self, value, threshold, condition_type):
        """تقييم الشرط"""
        if 'change' in condition_type or 'increase' in condition_type:
            return value <= threshold  # للتغيرات (ضغط منخفض، رياح متزايدة)
        else:
            return value >= threshold  # للقيم المطلقة    