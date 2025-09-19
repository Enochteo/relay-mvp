#from django.shortcuts import render """"no rendering""""
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView

from .models import Profile, CustomUser
from .serializers import ProfileSerializer, EDURegisterSerializer

from django.core.mail import send_mail
from django.conf import settings
from .utils import verify_token, generate_verification_token

# Create your views here.
class MyProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return Profile.objects.get(user=self.request.user)
    
class RegisterView(generics.CreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = EDURegisterSerializer
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

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
            status=status.HTTP_201_CREATED
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
        return Response({
            "detail": "Email verified successfully.",
            "user": {
                "id": user.id,
                "email": user.email,
                "full_name": user.full_name,
            },
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        })