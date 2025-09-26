from dj_rest_auth.registration.serializers import RegisterSerializer
from .models import CustomUser, Profile, Rating
from rest_framework import serializers
from dj_rest_auth.serializers import LoginSerializer

class EDURegisterSerializer(RegisterSerializer):
    password1 = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)
    full_name = serializers.CharField(required=True)
    
    major = serializers.CharField(required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    graduation_year = serializers.IntegerField(required=False)
    class Meta:
        model = CustomUser
        fields = ["email", "full_name", "password1", "password2","major",
            "bio",
            "graduation_year",]

    username = None

    def get_cleaned_data(self):
        data = super().get_cleaned_data()
        data.pop("username", None)
        return {
        "email": data.get("email", ""),
        "password1": data.get("password1", ""),
        "password2": data.get("password2", ""),
        "full_name": self.validated_data.get("full_name", ""),  
        "major": self.validated_data.get("major", ""),
        "bio": self.validated_data.get("bio", ""),
        "graduation_year": self.validated_data.get("graduation_year", None),
    }
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
        profile = user.profile
        profile.major = validated_data.get("major", "")
        profile.bio = validated_data.get("bio", "")
        profile.graduation_year = validated_data.get("graduation_year")
        profile.grad_month = validated_data.get("grad_month", "")
        profile.save()
        return user       
    

class EmailLoginSerializer(LoginSerializer):
    username = None  # remove username
    email = serializers.EmailField(required=True)

    def validate(self, attrs):
        # Map email -> username field expected by the parent
        attrs['username'] = attrs.get('email')
        validated_data = super().validate(attrs)

        user = self.user
        if not user.is_active:
            raise serializers.ValidationError("Please verify your email before logging in.")

        return validated_data


class ReviewerSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ["id", "full_name", "email"]

class RatingSerializer(serializers.ModelSerializer):
    rater = ReviewerSerializer(read_only=True)

    class Meta:
        model = Rating
        fields = ["id", "score", "comment", "rater", "created_at"]

class ProfileSerializer(serializers.ModelSerializer):
    user_full_name = serializers.CharField(source="user.full_name", read_only=True)
    user_email = serializers.EmailField(source="user.email", read_only=True)
    ratings = RatingSerializer(many=True, read_only=True)

    class Meta:
        model = Profile
        fields = [
            "id",
            "user_full_name",
            "user_email",
            "graduation_year",
            "rating_avg",
            "rating_count",
            "ratings", 
        ]
