"""
URL configuration for core project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
# core/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# ✅ استيراد Swagger
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# إعداد Swagger
schema_view = get_schema_view(
    openapi.Info(
        title="SafeBorder AI API",
        default_version='v1',
        description="""
        نظام SafeBorder AI - واجهات برمجة التطبيقات
        
        ### نظام المراقبة الذكي بالذكاء الاصطناعي
        
        **الميزات:**
        - 🔐 نظام مصادقة متكامل (JWT + 2FA)
        - 🤖 معالجة وسائط تلقائية باستخدام YOLOv8
        - 🚨 نظام إنذارات ذكي
        - 🌤️ تكامل مع بيانات الطقس
        - 📊 تحليلات متقدمة
        
        **أنواع المستخدمين:**
        - فريق الإدارة (Admin)
        - مشغلو المحاكاة (Simulation)  
        - الصيادين (Fisherman)
        """,
        terms_of_service="https://www.safeborder.ai/terms/",
        contact=openapi.Contact(email="support@safeborder.ai"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/surveillance/', include('surveillance.urls')),
    
    # ✅ مسارات Swagger
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    
    # الصفحة الرئيسية - توجيه إلى Swagger
    path('', schema_view.with_ui('swagger', cache_timeout=0), name='home'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)