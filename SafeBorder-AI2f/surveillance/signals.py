# في surveillance/signals.py

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from .models import Alert, MediaFile, Camera
from .weather_service import WeatherService
import logging
from surveillance.services.media_processing_service import process_media_file

logger = logging.getLogger(__name__)

@receiver(post_save, sender=MediaFile)
def auto_process_media(sender, instance, created, **kwargs):
    if created and not instance.processed:
        process_media_file(instance)

@receiver(post_save, sender=Alert)
def handle_new_alert(sender, instance, created, **kwargs):
    """معالجة الإنذارات الجديدة مع بيانات الطقس الحقيقية"""
    if created:
        try:
            # تحديث بيانات الطقس للإنذار
            update_alert_weather(instance)
            
            # إرسال إشعار للإنذارات الحرجة
            if instance.risk_level in ['critical', 'high']:
                send_alert_notification(instance)
                
        except Exception as e:
            logger.error(f"Error handling new alert: {e}")

def update_alert_weather(alert):
    """تحديث بيانات الطقس الحقيقية للإنذار"""
    try:
        camera = alert.media_file.camera
        weather_service = WeatherService()
        weather_data = weather_service.update_camera_weather(camera)
        
        logger.info(f"Weather data updated for alert {alert.id}")
        
    except Exception as e:
        logger.error(f"Failed to update weather for alert {alert.id}: {e}")
        raise

@receiver(post_save, sender=Camera)
def handle_new_camera(sender, instance, created, **kwargs):
    """تحديث بيانات الطقس عند إنشاء كاميرا جديدة"""
    if created and instance.location_lat and instance.location_lng:
        try:
            weather_service = WeatherService()
            weather_service.update_camera_weather(instance)
        except Exception as e:
            logger.error(f"Failed to get initial weather for new camera: {e}")

def send_alert_notification(alert):
    """إرسال إشعار حقيقي للإنذار"""
    # هنا سيتم دمج نظام إشعارات حقيقي لاحقاً
    logger.info(f"🔔 إنذار {alert.risk_level}: {alert.threat_type.name} - الثقة: {alert.confidence:.2f}")