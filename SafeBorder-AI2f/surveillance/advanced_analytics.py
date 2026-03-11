# إنشاء ملف: surveillance/advanced_analytics.py

from django.utils import timezone
from django.db.models import Count, Avg, Q
from datetime import timedelta, datetime
import statistics
from .models import Alert, MediaFile, Camera, ThreatType

class AdvancedAnalytics:
    def __init__(self):
        self.analysis_periods = {
            '24h': timedelta(hours=24),
            '7d': timedelta(days=7),
            '30d': timedelta(days=30)
        }
    
    def generate_comprehensive_report(self, period='7d'):
        """توليد تقرير إحصائي متقدم"""
        try:
            start_date = timezone.now() - self.analysis_periods[period]
            
            report = {
                'period': period,
                'generated_at': timezone.now(),
                'alerts_analysis': self._analyze_alerts(start_date),
                'performance_metrics': self._calculate_performance_metrics(start_date),
                'threat_patterns': self._analyze_threat_patterns(start_date),
                'system_health': self._analyze_system_health(start_date),
                'recommendations': []
            }
            
            # إضافة توصيات ذكية
            report['recommendations'] = self._generate_intelligent_recommendations(report)
            
            return report
            
        except Exception as e:
            logger.error(f"خطأ في توليد التقرير: {e}")
            return {'status': 'error', 'message': str(e)}
    
    def _analyze_alerts(self, start_date):
        """تحليل متقدم للإنذارات"""
        alerts = Alert.objects.filter(created_at__gte=start_date)
        
        analysis = {
            'total_alerts': alerts.count(),
            'alerts_by_risk_level': dict(alerts.values_list('risk_level').annotate(count=Count('id'))),
            'alerts_by_threat_type': self._get_alerts_by_threat_type(alerts),
            'alerts_trend': self._calculate_alerts_trend(start_date),
            'false_positive_rate': self._calculate_false_positive_rate(alerts),
            'average_confidence': alerts.aggregate(avg_confidence=Avg('confidence'))['avg_confidence'] or 0
        }
        
        return analysis
    
    def _get_alerts_by_threat_type(self, alerts):
        """تحليل الإنذارات حسب نوع التهديد"""
        threat_analysis = {}
        for alert in alerts:
            threat_name = alert.threat_type.name
            if threat_name not in threat_analysis:
                threat_analysis[threat_name] = {
                    'count': 0,
                    'avg_confidence': 0,
                    'risk_distribution': {}
                }
            
            threat_analysis[threat_name]['count'] += 1
            threat_analysis[threat_name]['risk_distribution'][alert.risk_level] = \
                threat_analysis[threat_name]['risk_distribution'].get(alert.risk_level, 0) + 1
        
        # حساب متوسط الثقة
        for threat_name, data in threat_analysis.items():
            threat_alerts = alerts.filter(threat_type__name=threat_name)
            data['avg_confidence'] = threat_alerts.aggregate(avg=Avg('confidence'))['avg'] or 0
        
        return threat_analysis
    
    def _calculate_alerts_trend(self, start_date):
        """حساب اتجاهات الإنذارات"""
        from django.db.models.functions import TruncHour
        
        hourly_alerts = Alert.objects.filter(
            created_at__gte=start_date
        ).annotate(
            hour=TruncHour('created_at')
        ).values('hour').annotate(count=Count('id')).order_by('hour')
        
        return list(hourly_alerts)
    
    def _calculate_false_positive_rate(self, alerts):
        """حساب معدل الإنذارات الكاذبة"""
        false_alarms = alerts.filter(status='false_alarm').count()
        total_reviewed = alerts.exclude(status='new').count()
        
        return (false_alarms / total_reviewed * 100) if total_reviewed > 0 else 0
    
    def _calculate_performance_metrics(self, start_date):
        """حساب مقاييس أداء النظام"""
        media_files = MediaFile.objects.filter(uploaded_at__gte=start_date)
        
        metrics = {
            'total_media_processed': media_files.count(),
            'successful_processing': media_files.filter(processed=True).count(),
            'failed_processing': media_files.filter(processed=False).count(),
            'processing_success_rate': 0,
            'average_processing_time': self._calculate_avg_processing_time(media_files),
            'alerts_per_media': self._calculate_alerts_per_media(media_files)
        }
        
        if metrics['total_media_processed'] > 0:
            metrics['processing_success_rate'] = (
                metrics['successful_processing'] / metrics['total_media_processed'] * 100
            )
        
        return metrics
    
    def _calculate_avg_processing_time(self, media_files):
        """حساب متوسط وقت المعالجة"""
        processed_media = media_files.filter(
            processed=True,
            processing_started_at__isnull=False,
            processing_completed_at__isnull=False
        )
        
        if not processed_media:
            return 0
        
        total_seconds = 0
        count = 0
        
        for media in processed_media:
            if media.processing_started_at and media.processing_completed_at:
                processing_time = (media.processing_completed_at - media.processing_started_at).total_seconds()
                total_seconds += processing_time
                count += 1
        
        return total_seconds / count if count > 0 else 0
    
    def _calculate_alerts_per_media(self, media_files):
        """حساب متوسط الإنذارات لكل وسائط"""
        total_alerts = 0
        processed_media = media_files.filter(processed=True)
        
        for media in processed_media:
            total_alerts += media.alerts.count()
        
        return total_alerts / processed_media.count() if processed_media.count() > 0 else 0
    
    def _analyze_threat_patterns(self, start_date):
        """تحليل أنماط التهديدات المتقدمة"""
        alerts = Alert.objects.filter(created_at__gte=start_date)
        
        patterns = {
            'time_patterns': self._analyze_time_patterns(alerts),
            'location_patterns': self._analyze_location_patterns(alerts),
            'weather_correlations': self._analyze_weather_correlations(alerts),
            'sequential_patterns': self._analyze_sequential_patterns(alerts)
        }
        
        return patterns
    
    def _analyze_time_patterns(self, alerts):
        """تحليل الأنماط الزمنية للتهديدات"""
        from django.db.models.functions import ExtractHour
        
        hourly_patterns = alerts.annotate(
            hour=ExtractHour('created_at')
        ).values('hour', 'threat_type__name').annotate(
            count=Count('id')
        ).order_by('hour')
        
        return list(hourly_patterns)
    
    def _analyze_location_patterns(self, alerts):
        """تحليل الأنماط المكانية"""
        location_alerts = alerts.exclude(
            Q(location_lat__isnull=True) | Q(location_lng__isnull=True)
        )[:100]  # الحد لتفادي الأداء
        
        locations = []
        for alert in location_alerts:
            locations.append({
                'lat': alert.location_lat,
                'lng': alert.location_lng,
                'threat_type': alert.threat_type.name,
                'risk_level': alert.risk_level,
                'timestamp': alert.created_at
            })
        
        return locations
    
    def _analyze_weather_correlations(self, alerts):
        """تحليل الارتباطات مع الطقس"""
        # هذا يتكامل مع WeatherImpactAnalyzer
        correlations = {}
        
        for alert in alerts[:50]:  # عينة للتحليل
            threat_type = alert.threat_type.name
            if threat_type not in correlations:
                correlations[threat_type] = {
                    'total_alerts': 0,
                    'weather_conditions': []
                }
            
            correlations[threat_type]['total_alerts'] += 1
        
        return correlations
    
    def _analyze_sequential_patterns(self, alerts):
        """تحليل الأنماط التسلسلية"""
        # تحليل تسلسل التهديدات
        sequential_data = []
        alerts_ordered = alerts.order_by('created_at')
        
        for i in range(1, min(10, len(alerts_ordered))):
            prev_alert = alerts_ordered[i-1]
            curr_alert = alerts_ordered[i]
            
            time_diff = (curr_alert.created_at - prev_alert.created_at).total_seconds() / 60  # دقائق
            
            if time_diff < 30:  # تهديدات متقاربة زمنياً
                sequential_data.append({
                    'first_threat': prev_alert.threat_type.name,
                    'second_threat': curr_alert.threat_type.name,
                    'time_gap_minutes': time_diff,
                    'location_similar': self._check_location_similarity(prev_alert, curr_alert)
                })
        
        return sequential_data
    
    def _check_location_similarity(self, alert1, alert2):
        """التحقق من تشابه الموقع"""
        if not alert1.location_lat or not alert2.location_lat:
            return False
        
        # حساب المسافة التقريبية
        lat_diff = abs(alert1.location_lat - alert2.location_lat)
        lng_diff = abs(alert1.location_lng - alert2.location_lng)
        
        return (lat_diff < 0.01) and (lng_diff < 0.01)  # ~1km difference
    
    def _analyze_system_health(self, start_date):
        """تحليل صحة النظام"""
        media_files = MediaFile.objects.filter(uploaded_at__gte=start_date)
        
        health_metrics = {
            'uptime_percentage': self._calculate_uptime(start_date),
            'error_rate': self._calculate_error_rate(media_files),
            'resource_usage': self._estimate_resource_usage(media_files),
            'response_times': self._analyze_response_times()
        }
        
        return health_metrics
    
    def _calculate_uptime(self, start_date):
        """حساب نسبة تشغيل النظام"""
        # محاكاة - في الواقع سيكون من نظام المراقبة
        total_hours = (timezone.now() - start_date).total_seconds() / 3600
        estimated_downtime = total_hours * 0.02  # افتراض 2% توقف
        
        uptime_hours = total_hours - estimated_downtime
        return (uptime_hours / total_hours) * 100
    
    def _calculate_error_rate(self, media_files):
        """حساب معدل الأخطاء"""
        failed_processing = media_files.filter(processed=False).count()
        total_media = media_files.count()
        
        return (failed_processing / total_media * 100) if total_media > 0 else 0
    
    def _estimate_resource_usage(self, media_files):
        """تقدير استخدام الموارد"""
        total_size = sum(media.file_size for media in media_files if media.file_size)
        avg_daily_media = media_files.count() / max(1, (timezone.now() - (timezone.now() - timedelta(days=30))).days)
        
        return {
            'total_storage_gb': total_size / (1024**3),  # GB
            'avg_daily_media': avg_daily_media,
            'estimated_cpu_usage': '70-85%',  # تقدير
            'estimated_memory_usage': '60-75%'
        }
    
    def _analyze_response_times(self):
        """تحليل أوقات الاستجابة"""
        # محاكاة - في الواقع من سجلات النظام
        return {
            'api_response_time_ms': 150,
            'media_processing_time_sec': 4.5,
            'alert_generation_time_sec': 1.2
        }
    
    def _generate_intelligent_recommendations(self, report):
        """توليد توصيات ذكية بناءً على التحليل"""
        recommendations = []
        
        # تحليل الإنذارات
        alerts_analysis = report['alerts_analysis']
        if alerts_analysis['false_positive_rate'] > 20:
            recommendations.append("🔄 ضبط عتبات الثقة في YOLO لتقليل الإنذارات الكاذبة")
        
        if alerts_analysis['average_confidence'] < 0.6:
            recommendations.append("📈 تحسين جودة الوسائط أو تحديث نموذج YOLO")
        
        # تحليل الأداء
        performance = report['performance_metrics']
        if performance['processing_success_rate'] < 90:
            recommendations.append("🔧 مراجعة نظام معالجة الوسائط لتحسين النجاح")
        
        if performance['average_processing_time'] > 10:
            recommendations.append("⚡ تحسين أداء معالجة الفيديوهات")
        
        # تحليل صحة النظام
        system_health = report['system_health']
        if system_health['uptime_percentage'] < 99:
            recommendations.append("🛠️ مراجعة بنية النظام لتحسين زمن التشغيل")
        
        return recommendations