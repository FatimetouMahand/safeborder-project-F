from django.contrib import admin
from .models import Camera, MediaFile, Alert, ThreatType, WeatherData


@admin.register(Camera)
class CameraAdmin(admin.ModelAdmin):
    list_display = ['name', 'camera_type', 'location_lat', 'location_lng', 'is_active', 'created_by', 'created_at']
    list_filter = ['camera_type', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('created_by')


@admin.register(MediaFile)
class MediaFileAdmin(admin.ModelAdmin):
    list_display = ['id', 'camera', 'media_type', 'file_size', 'uploaded_by', 'uploaded_at', 'processed']
    list_filter = ['media_type', 'processed', 'uploaded_at']
    search_fields = ['camera__name', 'uploaded_by__username']
    readonly_fields = ['file_size', 'uploaded_at', 'processed']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('camera', 'uploaded_by')


@admin.register(Alert)
class AlertAdmin(admin.ModelAdmin):
    list_display = ['id', 'threat_type', 'risk_level', 'confidence', 'status', 'created_at']
    list_filter = ['risk_level', 'status', 'created_at', 'threat_type']
    search_fields = ['threat_type__name', 'description']
    readonly_fields = ['created_at', 'processed_at']
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('threat_type', 'media_file')


@admin.register(ThreatType)
class ThreatTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'risk_level', 'description']
    list_filter = ['risk_level']
    search_fields = ['name', 'description']


@admin.register(WeatherData)
class WeatherDataAdmin(admin.ModelAdmin):
    list_display = ['camera', 'temperature', 'humidity', 'weather_condition', 'recorded_at']
    list_filter = ['weather_condition', 'recorded_at']
    search_fields = ['camera__name']
    readonly_fields = ['recorded_at']