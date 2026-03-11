# users/schemas.py
from drf_yasg import openapi

# مخططات request bodies
login_body = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=['username', 'password'],
    properties={
        'username': openapi.Schema(type=openapi.TYPE_STRING, description='اسم المستخدم'),
        'password': openapi.Schema(type=openapi.TYPE_STRING, description='كلمة المرور'),
    }
)

password_reset_body = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=['email'],
    properties={
        'email': openapi.Schema(type=openapi.TYPE_STRING, description='البريد الإلكتروني'),
    }
)

two_fa_body = openapi.Schema(
    type=openapi.TYPE_OBJECT,
    required=['user_id', 'code'],
    properties={
        'user_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='معرف المستخدم'),
        'code': openapi.Schema(type=openapi.TYPE_STRING, description='كود التحقق بخطوتين'),
    }
)

# مخططات responses
success_response = openapi.Response(
    description="نجاح العملية",
    examples={
        "application/json": {
            "status": "success",
            "message": "تمت العملية بنجاح"
        }
    }
)

error_response = openapi.Response(
    description="خطأ",
    examples={
        "application/json": {
            "error": "رسالة الخطأ",
            "detail": "تفاصيل إضافية عن الخطأ"
        }
    }
)

login_success_response = openapi.Response(
    description="نجاح تسجيل الدخول",
    examples={
        "application/json": {
            "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "user": {
                "id": 1,
                "username": "admin",
                "email": "admin@safeborder.ai",
                "user_type": "admin"
            }
        }
    }
)