import pyotp
import qrcode
import io
import base64
import hashlib
import secrets
from django.utils import timezone
from django.core.mail import send_mail
from django.conf import settings


def generate_2fa_secret(user):
    """توليد سر 2FA فريد للمستخدم"""
    if not user.two_factor_secret:
        user.two_factor_secret = pyotp.random_base32()
        user.save()
    return user.two_factor_secret


def generate_2fa_qr_code(user, secret):
    """توليد QR code لـ 2FA"""
    totp = pyotp.TOTP(secret)
    provisioning_uri = totp.provisioning_uri(
        name=user.email or user.username,
        issuer_name="SafeBorder AI System"
    )
    
    # توليد QR code
    qr = qrcode.make(provisioning_uri)
    buffer = io.BytesIO()
    qr.save(buffer, format='PNG')
    qr_base64 = base64.b64encode(buffer.getvalue()).decode()
    
    return f"data:image/png;base64,{qr_base64}"


def verify_2fa_code(user, code):
    """التحقق من كود 2FA"""
    if not user.two_factor_secret:
        return False
    
    totp = pyotp.TOTP(user.two_factor_secret)
    return totp.verify(code, valid_window=1)  # ✅允许时间偏移


def send_password_reset_email(user, reset_token):
    """إرسال بريد إعادة تعيين كلمة المرور"""
    try:
        subject = "إعادة تعيين كلمة المرور - SafeBorder AI"
        message = f"""
        عزيزي/عزيزتي {user.username},
        
        لقد طلبت إعادة تعيين كلمة المرور لحسابك في نظام SafeBorder AI.
        
        الرمز: {reset_token}
        
        هذا الرمز صالح لمدة ساعة واحدة.
        
        إذا لم تطلب إعادة التعيين، يرجى تجاهل هذه الرسالة.
        
        مع التحية،
        فريق SafeBorder AI
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False


def create_password_reset_token(user):
    """إنشاء رمز إعادة تعيين كلمة المرور"""
    token = secrets.token_urlsafe(32)
    expires_at = timezone.now() + timezone.timedelta(hours=1)
    
    from .models import PasswordResetToken
    reset_token = PasswordResetToken.objects.create(
        user=user,
        token=hashlib.sha256(token.encode()).hexdigest(),
        expires_at=expires_at
    )
    
    return token