from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from django.core.mail import send_mail
from django.conf import settings

from .models import Profile, CustomUser, Rating
from .serializers import (
    ProfileSerializer,
    EDURegisterSerializer,
    RatingSerializer,
)
from .utils import verify_token, generate_verification_token
from django.db import models

class MyProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = ProfileSerializer

    def get_object(self):
        return get_object_or_404(Profile, user=self.request.user)


class ProfileDetailView(generics.RetrieveAPIView):
    """View a specific user's profile by ID"""
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "pk"


class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = EDURegisterSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save(request)

        token = generate_verification_token(user)
        verification_link = f"http://localhost:8000/api/users/verify-email/{token}/"
        send_mail(
            subject="Verify your email",
            message=f"Hi {user.full_name}, click the link to verify your account: {verification_link}",
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
        )

        return Response(
            {"detail": "Please check your email to verify your account."},
            status=status.HTTP_201_CREATED,
        )


class VerifyEmailView(APIView):
    def get(self, request, token, *args, **kwargs):
        email = verify_token(token)
        if not email:
            return Response({"detail": "Invalid or expired token."}, status=400)

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response({"detail": "User not found."}, status=404)

        if user.is_active:
            return Response({"detail": "User already verified."})

        # Activate user
        user.is_active = True
        user.save()

        # Issue JWT
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "detail": "Email verified successfully.",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "full_name": user.full_name,
                },
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            }
        )


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class RateProfileView(generics.CreateAPIView):
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        profile = get_object_or_404(Profile, id=self.kwargs["pk"])
        rating, created = Rating.objects.update_or_create(
            rater=self.request.user,
            profile=profile,
            defaults={"score": self.request.data.get("score"), "comment": self.request.data.get("comment")},
        )

        # recalc aggregate
        ratings = Rating.objects.filter(profile=profile)
        profile.rating_avg = ratings.aggregate(models.Avg("score"))["score__avg"] or 0.0
        profile.rating_count = ratings.count()
        profile.save()

        return rating