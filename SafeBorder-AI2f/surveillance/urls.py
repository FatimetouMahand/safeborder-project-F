from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    CameraViewSet,
    MediaFileViewSet,
    AlertViewSet,
    ThreatTypeViewSet,
    WeatherDataViewSet,
    FishermanReportViewSet,
    WeatherAnalysisViewSet,
    AdvancedAnalyticsViewSet,
    AdminReportViewSet,
)

app_name = "surveillance"

router = DefaultRouter()

router.register(r"fisherman-reports", FishermanReportViewSet, basename="fisherman-reports")
router.register(r"cameras", CameraViewSet)
router.register(r"media", MediaFileViewSet)
router.register(r"alerts", AlertViewSet)
router.register(r"threat-types", ThreatTypeViewSet)
router.register(r"weather", WeatherDataViewSet, basename='weather')
router.register(r"weather-analysis", WeatherAnalysisViewSet, basename="weather-analysis")
router.register(r"advanced-analytics", AdvancedAnalyticsViewSet, basename="advanced-analytics")
router.register(r"admin-reports", AdminReportViewSet, basename="admin-reports")

urlpatterns = [
     path("", include(router.urls)),
]
