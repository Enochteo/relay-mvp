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
    images = ItemImageSerializer(many=True, required=False)

    class Meta:
        model = Item
        fields = [
            "id", "title", "description", "price", 
            "category", "condition", "is_negotiable", 
            "created_at", "seller", "images"
        ]
        read_only_fields = ["id", "created_at", "seller"]

    def create(self, validated_data):
        request = self.context.get("request")
        images_data = request.FILES.getlist("images")
        item = Item.objects.create(**validated_data)
        for img in images_data:
            ItemImage.objects.create(item=item, image=img)
        return item
    
    def update(self, instance, validated_data):
        images_data = self.context.get("request").FILES.getlist("images")
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if images_data:
            # Replace old images if new ones uploaded
            instance.images.all().delete()
            for img in images_data:
                ItemImage.objects.create(item=instance, image=img)
        return instance