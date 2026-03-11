# إنشاء ملف جديد: surveillance/tasks.py

from celery import shared_task
from .models import Camera
from .weather_service import WeatherService
import logging

logger = logging.getLogger(__name__)

@shared_task
def update_all_cameras_weather():
    """مهمة لتحديث بيانات الطقس لجميع الكاميرات"""
    try:
        weather_service = WeatherService()
        cameras = Camera.objects.filter(
            location_lat__isnull=False, 
            location_lng__isnull=False
        )
        
        updated_count = 0
        for camera in cameras:
            try:
                weather_service.update_camera_weather(camera)
                updated_count += 1
            except Exception as e:
                logger.error(f"Failed to update weather for camera {camera.id}: {e}")
        
        logger.info(f"Weather update completed: {updated_count}/{cameras.count()} cameras updated")
        return updated_count
        
    except Exception as e:
        logger.error(f"Weather update task failed: {e}")
        raise
    