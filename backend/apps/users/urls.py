from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import RegistrationView, LoginView, MeView, LogoutView, CookieTokenRefreshView,CSRFTokenView


urlpatterns = [
    path("register/", RegistrationView.as_view(), name="register"),
    path("login/", LoginView.as_view(), name="login"),
    path("me/", MeView.as_view(), name="me"),
    path("csrf/", CSRFTokenView.as_view(), name="csrf_token"),
   path(
    "token/refresh/",
    CookieTokenRefreshView.as_view(),
    name="token_refresh"
),

path("logout/", LogoutView.as_view(), name="logout"),
]