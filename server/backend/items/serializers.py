from rest_framework import serializers
from .models import Item, ItemImage
from users.models import CustomUser, Profile

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["graduation_year","rating_avg", "rating_count"]

class SellerSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = CustomUser
        fields = ["id", "email", "full_name", "profile"]

class ItemImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ItemImage
        fields = ["id", "image"]

class ItemSerializer(serializers.ModelSerializer):
    seller = SellerSerializer(read_only=True)
    images = ItemImageSerializer(many=True, read_only=True)

    class Meta:
        model = Item
        fields = [
            "id", "title", "description", "price", 
            "category", "condition", "is_negotiable", 
            "created_at", "seller", "images"
        ]
        read_only_fields = ["id", "created_at", "seller"]

    def create(self, validated_data):
        #seller = self.context["request"].user
        item = Item.objects.create(**validated_data)
        return item