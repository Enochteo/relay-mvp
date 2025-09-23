from django.urls import path
from .views import MyProfileView, RegisterView, VerifyEmailView, LogoutView

urlpatterns = [
    path("me/", MyProfileView.as_view(), name="my-profile"),
    path("register/", RegisterView.as_view(), name="custom-register"),
    path("verify-email/<str:token>/", VerifyEmailView.as_view(), name="verify-email"),
    path("api/logout/", LogoutView.as_view(), name="logout"),
]