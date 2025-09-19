from dj_rest_auth.registration.serializers import RegisterSerializer
from .models import CustomUser, Profile
from rest_framework import serializers

class EDURegisterSerializer(serializers.ModelSerializer):
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ["email", "full_name", "password1", "password2"]

    def validate_email(self, email):
        if not email.lower().endswith(".edu"):
            raise serializers.ValidationError("Please use your .edu email address.")
        return email

    def validate(self, data):
        if data["password1"] != data["password2"]:
            raise serializers.ValidationError("Passwords do not match.")
        return data

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            email=validated_data["email"],
            password=validated_data["password1"],
            full_name=validated_data.get("full_name", "")
        )
        user.is_active = False   # require verification
        user.save()
        return user


class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["graduation_year", "rating_avg", "rating_count"]
        read_only_fields = ["rating_avg", "rating_count"]
