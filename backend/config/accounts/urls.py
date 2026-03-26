from django.urls import path
from .views import register, login, send_otp, verify_otp, profile,check_email

urlpatterns = [
    path('register/', register),
    path('login/', login),
    path('send-otp/', send_otp),
    path('verify-otp/', verify_otp),
    path('check-email/', check_email),
    path('profile/', profile),
]