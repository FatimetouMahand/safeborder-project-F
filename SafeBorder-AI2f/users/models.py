from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils import timezone
import secrets
from django.core.validators import MinValueValidator, MaxValueValidator

class User(AbstractUser):
    USER_TYPE_CHOICES = (
        ('admin', 'فريق الإدارة'),
        ('simulation', 'مشغلو المحاكاة'),
        ('fisherman', 'الصيادين'),
    )
    
    user_type = models.CharField(
        max_length=20, 
        choices=USER_TYPE_CHOICES, 
        default='simulation'
    )
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    two_factor_enabled = models.BooleanField(default=False)
    two_factor_secret = models.CharField(max_length=32, blank=True, null=True)  # ✅ جديد
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'users'
        verbose_name = 'مستخدم'
        verbose_name_plural = 'المستخدمين'
    
    def __str__(self):
        return f"{self.username} - {self.get_user_type_display()}"
    
    def generate_2fa_secret(self):
        """توليد سر 2FA فريد"""
        import pyotp
        self.two_factor_secret = pyotp.random_base32()
        self.save()
        return self.two_factor_secret


class LoginAttempt(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    username = models.CharField(max_length=150)  # ✅ تسجيل اسم المستخدم حتى لو فشل الدخول
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)
    success = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'user_login_attempts'
        verbose_name = 'محاولة دخول'
        verbose_name_plural = 'محاولات الدخول'
        ordering = ['-timestamp']


class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(default=timezone.now)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'password_reset_tokens'
        verbose_name = 'رمز إعادة تعيين كلمة المرور'
        verbose_name_plural = 'رموز إعادة تعيين كلمات المرور'
    
    def is_valid(self):
        return not self.is_used and timezone.now() < self.expires_at
