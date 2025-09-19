from dj_rest_auth.registration.serializers import RegisterSerializer
from rest_framework import serializers
from .models import Profile

class EDURegisterSerializer(RegisterSerializer):
    full_name = serializers.CharField(required=False, allow_blank=True)

    def validate_email(self, email):
        email = super().validate_email(email)
        if not email.lower().endswith(".edu"):
            raise serializers.ValidationError("Please use your .edu email address.")
        return email

    def save(self, request):
        user = super().save(request)
        user.first_name = self.data.get("full_name", "")
        user.save()
        return user
    
class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["graduation_year", "rating_avg", "rating_count"]
        read_only_fields = ["rating_avg", "rating_count"]