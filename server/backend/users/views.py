#from django.shortcuts import render """"no rendering""""
from rest_framework import generics, permissions
from .models import Profile
from .serializers import ProfileSerializer

# Create your views here.
class MyProfileView(generics.RetrieveUpdateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return Profile.objects.get(user=self.request.user)