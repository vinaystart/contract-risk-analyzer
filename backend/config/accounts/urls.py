from django.urls import path
from .views import register, login, send_otp, verify_otp, profile

urlpatterns = [
    path('register/', register),
    path('login/', login),
    path('send-otp/', send_otp),
    path('verify-otp/', verify_otp),
    path('profile/', profile),
]