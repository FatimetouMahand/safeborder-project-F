# إنشاء ملف جديد: surveillance/weather_service.py

import requests
from django.conf import settings
from django.utils import timezone
from .models import WeatherData, Camera
import logging

OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather"

def fetch_weather(lat, lon):
    params = {
        "lat": lat,
        "lon": lon,
        "appid": settings.OPENWEATHER_API_KEY,
        "units": "metric"
    }

    res = requests.get(OPENWEATHER_URL, params=params, timeout=10)
    res.raise_for_status()
    data = res.json()

    return {
        "temperature": data["main"]["temp"],
        "humidity": data["main"]["humidity"],
        "pressure": data["main"]["pressure"],
        "wind_speed": data["wind"]["speed"] * 3.6,  # m/s → km/h
        "visibility": (data.get("visibility", 10000)) / 1000,  # m → km
        "condition": data["weather"][0]["main"]
    }

logger = logging.getLogger(__name__)

class WeatherService:
    def __init__(self):
        self.api_key = settings.OPENWEATHER_API_KEY
        self.base_url = settings.OPENWEATHER_BASE_URL
        
        if not self.api_key or self.api_key == 'your-real-api-key-here':
            raise ValueError("OpenWeatherMap API key is not configured. Please set OPENWEATHER_API_KEY in your .env file")
    
    def get_weather_data(self, lat, lng):
        """الحصول على بيانات الطقس الحقيقية لموقع معين"""
        try:
            url = f"{self.base_url}/weather"
            params = {
                'lat': lat,
                'lon': lng,
                'appid': self.api_key,
                'units': 'metric',  # درجة مئوية
                'lang': 'ar'  # اللغة العربية
            }
            
            logger.info(f"Fetching weather data for location: {lat}, {lng}")
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            weather_info = self.parse_weather_data(data)
            
            logger.info(f"Weather data retrieved successfully: {weather_info}")
            return weather_info
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Weather API request failed: {e}")
            raise Exception(f"فشل في الحصول على بيانات الطقس: {e}")
        except Exception as e:
            logger.error(f"Unexpected weather error: {e}")
            raise Exception(f"خطأ غير متوقع في خدمة الطقس: {e}")
    
    def parse_weather_data(self, data):
        """تحليل بيانات الطقس الحقيقية من API"""
        try:
            main = data['main']
            weather = data['weather'][0]
            wind = data.get('wind', {})
            rain = data.get('rain', {})
            snow = data.get('snow', {})
            
            weather_info = {
                'temperature': main['temp'],
                'humidity': main['humidity'],
                'pressure': main['pressure'],
                'wind_speed': wind.get('speed', 0) * 3.6,  # تحويل م/ث إلى كم/س
                'visibility': data.get('visibility', 10000) / 1000,  # تحويل متر إلى كم
                'weather_condition': weather['description'],
                'precipitation': rain.get('1h', 0) or snow.get('1h', 0),
                'weather_main': weather['main'],
                'wind_degree': wind.get('deg', 0)
            }
            return weather_info
            
        except KeyError as e:
            logger.error(f"Missing key in weather data: {e} - Data: {data}")
            raise Exception(f"بيانات الطقس غير مكتملة: المفتاح {e} مفقود")
    
    def update_camera_weather(self, camera):
        """تحديث بيانات الطقس الحقيقية للكاميرا"""
        try:
            if not camera.location_lat or not camera.location_lng:
                raise ValueError(f"الكاميرا {camera.name} لا تحتوي على بيانات موقع")
            
            weather_data = self.get_weather_data(camera.location_lat, camera.location_lng)
            
            # حفظ بيانات الطقس في قاعدة البيانات
            weather_obj = WeatherData.objects.create(
                camera=camera,
                **weather_data
            )
            
            logger.info(f"Weather data updated for camera {camera.name}: {weather_data}")
            return weather_obj
            
        except Exception as e:
            logger.error(f"Failed to update weather for camera {camera.id}: {e}")
            raise