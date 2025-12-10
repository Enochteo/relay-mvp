from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags

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

        # Generate verification token
        token = generate_verification_token(user)
        
        # Build verification link - backend endpoint that redirects to frontend
        verification_link = f"{request.build_absolute_uri('/api/users/verify-email/')}{token}/"
        
        # Email content
        subject = "Verify Your Relay Account"
        html_message = f"""
        <html>
            <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2>Welcome to Relay!</h2>
                    <p>Hi <strong>{user.full_name}</strong>,</p>
                    <p>Thank you for registering. Please verify your email address to activate your account.</p>
                    
                    <div style="margin: 30px 0;">
                        <a href="{verification_link}" 
                           style="display: inline-block; background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                            Verify Email
                        </a>
                    </div>
                    
                    <p>Or copy this link: <br><code>{verification_link}</code></p>
                    
                    <p style="color: #666; font-size: 12px;">
                        This link will expire in 24 hours.<br>
                        If you didn't create this account, please ignore this email.
                    </p>
                </div>
            </body>
        </html>
        """
        
        plain_message = strip_tags(html_message)
        
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=False,
            )
        except Exception as e:
            print(f"Email sending failed: {e}")
            # Don't fail the registration, just log the error

        return Response(
            {
                "detail": "Registration successful! Please check your email to verify your account.",
                "email": user.email,
            },
            status=status.HTTP_201_CREATED,
        )


class VerifyEmailView(APIView):
    def get(self, request, token, *args, **kwargs):
        email = verify_token(token)
        if not email:
            # Token invalid or expired - redirect to frontend with error
            return Response(
                {"detail": "Invalid or expired verification token. Please register again."},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user = CustomUser.objects.get(email=email)
        except CustomUser.DoesNotExist:
            return Response(
                {"detail": "User not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if user.is_active:
            # Already verified
            refresh = RefreshToken.for_user(user)
            return Response(
                {
                    "detail": "Email already verified.",
                    "user": {
                        "id": user.id,
                        "email": user.email,
                        "full_name": user.full_name,
                    },
                    "refresh": str(refresh),
                    "access": str(refresh.access_token),
                },
                status=status.HTTP_200_OK
            )

        # Activate user
        user.is_active = True
        user.save()

        # Issue JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "detail": "Email verified successfully! You can now log in.",
                "user": {
                    "id": user.id,
                    "email": user.email,
                    "full_name": user.full_name,
                },
                "refresh": str(refresh),
                "access": str(refresh.access_token),
            },
            status=status.HTTP_200_OK
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