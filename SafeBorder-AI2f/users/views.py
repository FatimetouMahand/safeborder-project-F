# users/views.py
from rest_framework import status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.utils import timezone
from django.db.models import Q
from .models import User, LoginAttempt, PasswordResetToken
from .serializers import UserSerializer, LoginSerializer, PasswordResetSerializer
from .utils import verify_2fa_code, send_password_reset_email, create_password_reset_token
import hashlib
from rest_framework import permissions, generics
from .serializers import UserRegistrationSerializer
from .models import User

# ✅ استيراد Swagger بعد التثبيت
try:
    from drf_yasg.utils import swagger_auto_schema
    from drf_yasg import openapi
    from .schemas import login_body, login_success_response, error_response
    SWAGGER_AVAILABLE = True
except ImportError:
    SWAGGER_AVAILABLE = False
    # دالة وهمية إذا Swagger غير متوفر
    def swagger_auto_schema(**kwargs):
        def decorator(func):
            return func
        return decorator


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    
    @swagger_auto_schema(
        operation_description="تسجيل دخول المستخدم إلى النظام",
        request_body=login_body,
        responses={
            200: login_success_response,
            401: error_response,
            400: error_response
        }
    )
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        username = serializer.validated_data['username']
        password = serializer.validated_data['password']
        
        # تسجيل محاولة الدخول
        login_attempt = LoginAttempt(
            username=username,
            ip_address=self.get_client_ip(request),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            success=False
        )
        
        try:
            user = authenticate(
                request=request,
                username=username,
                password=password
)

        except TypeError:
            # Fallback للتوافق مع الإصدارات القديمة
             user = authenticate(
        request=request,
        username=username,
        password=password
    )
        
        if user is not None and user.is_active:
            login_attempt.user = user
            login_attempt.success = True
            login_attempt.save()
            
            # التحقق من تفعيل 2FA للإدارة
            if user.user_type == 'admin' and user.two_factor_enabled:
                return Response({
                    'message': 'يتطلب التحقق بخطوتين',
                    'requires_2fa': True,
                    'user_id': user.id
                }, status=status.HTTP_200_OK)
            
            # توليد التوكنات
            tokens = self.get_user_tokens(user)
            return Response({
                'access': tokens['access'],
                'refresh': tokens['refresh'],
                'user': UserSerializer(user).data
            }, status=status.HTTP_200_OK)
        else:
            login_attempt.save()
            return Response({
                'error': 'اسم المستخدم أو كلمة المرور غير صحيحة'
            }, status=status.HTTP_401_UNAUTHORIZED)
    
    def get_user_tokens(self, user):
        refresh = RefreshToken.for_user(user)
        return {
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class TwoFactorVerifyView(APIView):
    permission_classes = [permissions.AllowAny]
    
    @swagger_auto_schema(
        operation_description="التحقق من كود المصادقة الثنائية (2FA)",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['user_id', 'code'],
            properties={
                'user_id': openapi.Schema(type=openapi.TYPE_INTEGER, description='معرف المستخدم'),
                'code': openapi.Schema(type=openapi.TYPE_STRING, description='كود التحقق بخطوتين'),
            }
        ),
        responses={
            200: login_success_response,
            400: error_response,
            404: error_response
        }
    )
    def post(self, request):
        user_id = request.data.get('user_id')
        code = request.data.get('code')
        
        if not user_id or not code:
            return Response({
                'error': 'يجب إدخال user_id و code'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(
                id=user_id, 
                user_type='admin', 
                two_factor_enabled=True,
                is_active=True
            )
            
            if verify_2fa_code(user, code):
                refresh = RefreshToken.for_user(user)
                return Response({
                    'access': str(refresh.access_token),
                    'refresh': str(refresh),
                    'user': UserSerializer(user).data
                })
            else:
                return Response({
                    'error': 'كود التحقق غير صحيح'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except User.DoesNotExist:
            return Response({
                'error': 'المستخدم غير موجود أو غير مفعل'
            }, status=status.HTTP_404_NOT_FOUND)


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]
    
    @swagger_auto_schema(
        operation_description="طلب إعادة تعيين كلمة المرور",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'email': openapi.Schema(type=openapi.TYPE_STRING, description='البريد الإلكتروني'),
                'username': openapi.Schema(type=openapi.TYPE_STRING, description='اسم المستخدم'),
            }
        ),
        responses={
            200: openapi.Response(
                description="تم إرسال طلب إعادة التعيين",
                examples={
                    "application/json": {
                        "message": "تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني"
                    }
                }
            ),
            400: error_response
        }
    )
    def post(self, request):
        # الكود الأصلي يبقى كما هو
        email = request.data.get('email')
        username = request.data.get('username')
        
        if not email and not username:
            return Response({
                'error': 'يجب إدخال البريد الإلكتروني أو اسم المستخدم'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            query = Q(is_active=True)
            if email:
                query &= Q(email=email)
            if username:
                query &= Q(username=username)
                
            user = User.objects.get(query)
            
            # إنشاء رمز إعادة التعيين
            token = create_password_reset_token(user)
            
            # إرسال البريد الإلكتروني (في الواقع)
            email_sent = send_password_reset_email(user, token)
            
            if email_sent:
                return Response({
                    'message': 'تم إرسال رابط إعادة التعيين إلى بريدك الإلكتروني'
                })
            else:
                return Response({
                    'error': 'فشل في إرسال البريد الإلكتروني'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
                
        except User.DoesNotExist:
            # عدم الكشف عن وجود المستخدم لأسباب أمنية
            return Response({
                'message': 'إذا كان البريد الإلكتروني مسجلاً، ستتلقى رابط إعادة التعيين'
            })


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]
    
    @swagger_auto_schema(
        operation_description="تأكيد إعادة تعيين كلمة المرور",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['token', 'new_password', 'confirm_password'],
            properties={
                'token': openapi.Schema(type=openapi.TYPE_STRING, description='رمز إعادة التعيين'),
                'new_password': openapi.Schema(type=openapi.TYPE_STRING, description='كلمة المرور الجديدة'),
                'confirm_password': openapi.Schema(type=openapi.TYPE_STRING, description='تأكيد كلمة المرور الجديدة'),
            }
        ),
        responses={
            200: openapi.Response(
                description="تم إعادة تعيين كلمة المرور",
                examples={
                    "application/json": {
                        "message": "تم إعادة تعيين كلمة المرور بنجاح"
                    }
                }
            ),
            400: error_response
        }
    )
    def post(self, request):
        # الكود الأصلي يبقى كما هو
        serializer = PasswordResetSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
        token = serializer.validated_data['token']
        new_password = serializer.validated_data['new_password']
        
        hashed_token = hashlib.sha256(token.encode()).hexdigest()
        
        try:
            reset_token = PasswordResetToken.objects.get(
                token=hashed_token,
                is_used=False,
                expires_at__gt=timezone.now()
            )
            
            user = reset_token.user
            user.set_password(new_password)
            user.save()
            
            reset_token.is_used = True
            reset_token.save()
            
            # إلغاء جميع الجلسات النشطة
            user.auth_token_set.all().delete()
            
            return Response({
                'message': 'تم إعادة تعيين كلمة المرور بنجاح'
            })
            
        except PasswordResetToken.DoesNotExist:
            return Response({
                'error': 'رمز إعادة التعيين غير صالح أو منتهي الصلاحية'
            }, status=status.HTTP_400_BAD_REQUEST)  
class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = UserRegistrationSerializer
    queryset = User.objects.all()