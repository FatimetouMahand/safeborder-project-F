# surveillance/schemas.py
from drf_yasg import openapi
from drf_yasg.utils import swagger_auto_schema
from rest_framework import status

# مخططات الـ parameters المشتركة
camera_id_param = openapi.Parameter(
    'camera_id', 
    openapi.IN_QUERY, 
    description="معرف الكاميرا", 
    type=openapi.TYPE_INTEGER,
    required=True
)

period_param = openapi.Parameter(
    'period', 
    openapi.IN_QUERY, 
    description="الفترة الزمنية (24h, 7d, 30d)", 
    type=openapi.TYPE_STRING,
    default='7d'
)

hours_back_param = openapi.Parameter(
    'hours_back', 
    openapi.IN_QUERY, 
    description="عدد الساعات للخلف", 
    type=openapi.TYPE_INTEGER,
    default=24
)

# مخططات الـ responses
success_response = openapi.Response(
    description="نجاح العملية",
    examples={
        "application/json": {
            "status": "success",
            "data": {}
        }
    }
)

error_response = openapi.Response(
    description="خطأ",
    examples={
        "application/json": {
            "error": "رسالة الخطأ"
        }
    }
)

# مخططات الـ request bodies
media_upload_body = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=['camera', 'media_type', 'file'],
    properties={
        'camera': openapi.Schema(type=openapi.TYPE_INTEGER, description='معرف الكاميرا'),
        'media_type': openapi.Schema(type=openapi.TYPE_STRING, description='نوع الوسائط (image/video)', enum=['image', 'video']),
        'file': openapi.Schema(type=openapi.TYPE_FILE, description='ملف الوسائط'),
    }
)

login_body = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=['username', 'password'],
    properties={
        'username': openapi.Schema(type=openapi.TYPE_STRING, description='اسم المستخدم'),
        'password': openapi.Schema(type=openapi.TYPE_STRING, description='كلمة المرور'),
    }
)

fisherman_report_body = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=['title', 'description', 'location_lat', 'location_lng'],
    properties={
        'title': openapi.Schema(type=openapi.TYPE_STRING, description='عنوان البلاغ'),
        'description': openapi.Schema(type=openapi.TYPE_STRING, description='وصف البلاغ'),
        'location_lat': openapi.Schema(type=openapi.TYPE_NUMBER, description='خط العرض'),
        'location_lng': openapi.Schema(type=openapi.TYPE_NUMBER, description='خط الطول'),
        'threat_type': openapi.Schema(type=openapi.TYPE_INTEGER, description='نوع التهديد'),
        'risk_level': openapi.Schema(type=openapi.TYPE_STRING, description='مستوى الخطورة', enum=['critical', 'high', 'medium', 'low']),
    }
)