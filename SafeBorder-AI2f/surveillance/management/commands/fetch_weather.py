from django.core.management.base import BaseCommand
from surveillance.models import Camera
from surveillance.weather_service import WeatherService
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = "Fetch real weather data for all active cameras"

    def handle(self, *args, **options):
        service = WeatherService()

        cameras = Camera.objects.filter(
            is_active=True,
            location_lat__isnull=False,
            location_lng__isnull=False
        )

        if not cameras.exists():
            self.stdout.write(self.style.WARNING("No cameras with location found"))
            return

        for camera in cameras:
            try:
                weather = service.update_camera_weather(camera)
                self.stdout.write(
                    self.style.SUCCESS(
                        f"Weather saved for camera {camera.name}"
                    )
                )
            except Exception as e:
                logger.error(f"Weather failed for camera {camera.id}: {e}")
                self.stdout.write(
                    self.style.ERROR(
                        f"Failed for camera {camera.name}"
                    )
                )