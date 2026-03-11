from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    LoginView,
    RegisterView,               # ✅ import manquant
    TwoFactorVerifyView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
)


app_name = 'users'

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path("register/", RegisterView.as_view(), name="register"),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('2fa/verify/', TwoFactorVerifyView.as_view(), name='2fa_verify'),
    path('password/reset/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
]