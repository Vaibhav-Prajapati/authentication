from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
from django.views.decorators.csrf import ensure_csrf_cookie

from .serializers import CookieTokenRefreshSerializer
from django.utils.decorators import method_decorator
from django.conf import settings

from .serializers import RegistrationSerializer, LoginSerializer, MeSerializer


class RegistrationView(generics.CreateAPIView):
    serializer_class = RegistrationSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.save()

        return Response(
            {
                "message": "User registered successfully.",
                "user": {
                    "id": user.id,
                    "email": user.email,
                },
            },
            status=status.HTTP_201_CREATED,
        )

class LoginView(generics.GenericAPIView):
    serializer_class = LoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.validated_data["user"]
        access_token = serializer.validated_data["access"]
        refresh_token = serializer.validated_data["refresh"]

        response = Response(
            {
                "message": "Login successful.",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "first_name": user.first_name,
                    "last_name": user.last_name
                },
                "access": access_token
                
            },
            status=status.HTTP_200_OK,
        )

        print("ABC", settings.REFRESH_COOKIE_NAME)
        response.set_cookie(
            key=settings.REFRESH_COOKIE_NAME,
            value=refresh_token,
            httponly=settings.REFRESH_COOKIE_HTTP_ONLY,
            secure=settings.REFRESH_COOKIE_SECURE,
            samesite=settings.REFRESH_COOKIE_SAMESITE,
            path=settings.REFRESH_COOKIE_PATH,
        )
        return response

class MeView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self, request):
        serializer = MeSerializer(request.user)
        return Response(serializer.data)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.COOKIES.get("refresh_token")

        if not refresh_token:
            return Response(
                {"detail": "Refresh token is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()

            response = Response(
                {"detail": "Logout successful."},
                status=status.HTTP_200_OK,
            )

            response.delete_cookie(
                key=settings.REFRESH_COOKIE_NAME,
            path=settings.REFRESH_COOKIE_PATH
            )

            return response

        except Exception:
            return Response(
                {"detail": "Invalid refresh token."},
                status=status.HTTP_400_BAD_REQUEST,
            )

class CookieTokenRefreshView(TokenRefreshView):
    serializer_class = CookieTokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)

        rotated_refresh_token = response.data.pop("refresh", None)
        if rotated_refresh_token:
            response.set_cookie(
                key=settings.REFRESH_COOKIE_NAME,
                value=rotated_refresh_token,
                httponly=settings.REFRESH_COOKIE_HTTP_ONLY,
                secure=settings.REFRESH_COOKIE_SECURE,
                samesite=settings.REFRESH_COOKIE_SAMESITE,
                path=settings.REFRESH_COOKIE_PATH,
            )

        return response
@method_decorator(ensure_csrf_cookie, name="dispatch")
class CSRFTokenView(APIView):

    def get(self, request):
        return Response(
            {"detail": "CSRF cookie set."}
        )