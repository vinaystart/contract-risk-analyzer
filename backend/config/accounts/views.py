from django.contrib.auth.models import User
from django.core.mail import send_mail
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from rest_framework_simplejwt.tokens import RefreshToken

from datetime import timedelta

from .models import EmailOTP
from .utils import generate_otp


# ================= REGISTER =================
@api_view(['POST'])
def register(request):
    name = request.data.get("name")
    email = request.data.get("email")
    password = request.data.get("password")

    if not name or not email or not password:
        return Response({"error": "All fields are required"}, status=400)

    try:
        user = User.objects.get(username=email)
    except User.DoesNotExist:
        return Response({"error": "Verify OTP first"}, status=400)

    # ✅ SET password instead of creating again
    user.set_password(password)
    user.first_name = name
    user.save()

    return Response({
        "message": "User registered successfully"
    })

# ================= LOGIN (PASSWORD) =================
@api_view(['POST'])
def login(request):
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response({"error": "Email and password required"}, status=400)

    try:
        user = User.objects.get(username=email)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=400)

    if not user.check_password(password):
        return Response({"error": "Invalid password"}, status=400)

    refresh = RefreshToken.for_user(user)

    return Response({
        "access": str(refresh.access_token),
        "user": {
            "name": user.first_name,
            "email": user.email
        }
    })


# ================= SEND OTP =================
@api_view(['POST'])
def send_otp(request):
    email = request.data.get("email")

    if not email:
        return Response({"error": "Email is required"}, status=400)

    # Optional: delete old OTPs
    EmailOTP.objects.filter(email=email).delete()

    otp = generate_otp()

    # Save OTP
    EmailOTP.objects.create(email=email, otp=otp)

    # Send Email
    send_mail(
        'Your Login OTP',
        f'Your OTP is {otp}',
        'your_email@gmail.com',  # same as settings
        [email],
        fail_silently=False,
    )

    return Response({"message": "OTP sent successfully"})


# ================= VERIFY OTP (LOGIN) =================
@api_view(['POST'])
def verify_otp(request):
    email = request.data.get("email")
    otp = request.data.get("otp")

    if not email or not otp:
        return Response({"error": "Email and OTP required"}, status=400)

    try:
        record = EmailOTP.objects.filter(email=email, otp=otp).latest('created_at')
    except EmailOTP.DoesNotExist:
        return Response({"error": "Invalid OTP"}, status=400)

    # ⏳ Expiry check (5 minutes)
    if timezone.now() - record.created_at > timedelta(minutes=5):
        return Response({"error": "OTP expired"}, status=400)

    # ✅ Auto-create user if not exists (optional but recommended)
    user, created = User.objects.get_or_create(
        username=email,
        defaults={"email": email}
    )

    # Generate JWT
    refresh = RefreshToken.for_user(user)

    return Response({
        "access": str(refresh.access_token),
        "user": {
            "name": user.first_name if user.first_name else "User",
            "email": user.email
        }
    })


# ================= PROFILE (PROTECTED) =================
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user

    return Response({
        "name": user.first_name,
        "email": user.email
    })