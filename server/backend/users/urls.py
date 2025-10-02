from django.urls import path
from .views import (
    MyProfileView, ProfileDetailView, RegisterView,
    VerifyEmailView, LogoutView, RateProfileView
)


urlpatterns = [
    path("me/", MyProfileView.as_view(), name="my-profile"),
    path("register/", RegisterView.as_view(), name="custom-register"),
    path("verify-email/<str:token>/", VerifyEmailView.as_view(), name="verify-email"),
    path("logout/", LogoutView.as_view(), name="logout"),   # <-- fixed
    path("profile/me/", MyProfileView.as_view(), name="my-profile"),
    path("profile/<int:pk>/", ProfileDetailView.as_view(), name="profile-detail"),
    path("profile/<int:pk>/rate/", RateProfileView.as_view(), name="profile-rate"),
]
