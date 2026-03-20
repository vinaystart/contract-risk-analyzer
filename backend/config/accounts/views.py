from django.contrib.auth.models import User
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken


# ================= REGISTER =================
@api_view(['POST'])
def register(request):
    name = request.data.get("name")
    email = request.data.get("email")
    password = request.data.get("password")

    # ✅ Validation
    if not name or not email or not password:
        return Response({"error": "All fields are required"}, status=400)

    if User.objects.filter(username=email).exists():
        return Response({"error": "User already exists"}, status=400)

    # ✅ Create user
    user = User.objects.create_user(
        username=email,
        email=email,
        password=password
    )

    user.first_name = name
    user.save()

    return Response({
        "message": "User registered successfully"
    })


# ================= LOGIN =================
@api_view(['POST'])
def login(request):
    email = request.data.get("email")
    password = request.data.get("password")

    print("LOGIN DATA:", email, password)

    # ✅ Validation
    if not email or not password:
        return Response({"error": "Email and password required"}, status=400)

    try:
        user = User.objects.get(username=email)
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=400)

    # ✅ Password check
    if not user.check_password(password):
        return Response({"error": "Invalid password"}, status=400)

    print("AUTH SUCCESS")

    # ✅ Generate JWT
    refresh = RefreshToken.for_user(user)

    return Response({
        "access": str(refresh.access_token),
        "user": {
            "name": user.first_name,
            "email": user.email
        }
    })


# ================= PROFILE (PROTECTED) =================
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import permission_classes

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def profile(request):
    user = request.user

    return Response({
        "name": user.first_name,
        "email": user.email
    })