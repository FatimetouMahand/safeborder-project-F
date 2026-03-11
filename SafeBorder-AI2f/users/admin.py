from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, LoginAttempt, PasswordResetToken


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'user_type', 'is_verified', 'two_factor_enabled', 'is_active']
    list_filter = ['user_type', 'is_verified', 'two_factor_enabled', 'is_active', 'created_at']
    search_fields = ['username', 'email', 'first_name', 'last_name']
    
    fieldsets = UserAdmin.fieldsets + (
        ('معلومات إضافية', {
            'fields': ('user_type', 'phone_number', 'is_verified', 'two_factor_enabled')
        }),
    )
    
    actions = ['enable_2fa', 'disable_2fa']
    
    def enable_2fa(self, request, queryset):
        updated = queryset.update(two_factor_enabled=True)
        self.message_user(request, f'تم تفعيل التحقق بخطوتين لـ {updated} مستخدم')
    enable_2fa.short_description = "تفعيل التحقق بخطوتين للمستخدمين المحددين"
    
    def disable_2fa(self, request, queryset):
        updated = queryset.update(two_factor_enabled=False)
        self.message_user(request, f'تم تعطيل التحقق بخطوتين لـ {updated} مستخدم')
    disable_2fa.short_description = "تعطيل التحقق بخطوتين للمستخدمين المحددين"


@admin.register(LoginAttempt)
class LoginAttemptAdmin(admin.ModelAdmin):
    list_display = ['user', 'ip_address', 'timestamp', 'success']
    list_filter = ['success', 'timestamp']
    search_fields = ['user__username', 'ip_address']
    readonly_fields = ['user', 'ip_address', 'user_agent', 'timestamp', 'success']
    
    def has_add_permission(self, request):
        return False
    
    def has_change_permission(self, request, obj=None):
        return False


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ['user', 'created_at', 'expires_at', 'is_used']
    list_filter = ['is_used', 'created_at']
    search_fields = ['user__username', 'token']
    readonly_fields = ['user', 'token', 'created_at', 'expires_at']