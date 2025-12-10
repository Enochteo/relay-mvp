from rest_framework import serializers
from .models import Item, ItemImage
from users.models import CustomUser, Profile
from PIL import Image
from io import BytesIO

class ProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Profile
        fields = ["graduation_year", "rating_avg", "rating_count"]

class SellerSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = CustomUser
        fields = ["id", "email", "full_name", "profile"]

class ItemImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ItemImage
        fields = ["id", "image", "image_url", "is_primary", "uploaded_at"]
        read_only_fields = ["uploaded_at"]
    
    def get_image_url(self, obj):
        """Return the full URL of the image"""
        if obj.image:
            request = self.context.get('request')
            image_url = obj.image.url
            if request is not None:
                return request.build_absolute_uri(image_url)
            return image_url
        return None

class ItemSerializer(serializers.ModelSerializer):
    seller = SellerSerializer(read_only=True)
    images = ItemImageSerializer(many=True, required=False, read_only=True)

    class Meta:
        model = Item
        fields = [
            "id", "title", "description", "price", 
            "category", "condition", "is_negotiable", 
            "created_at", "seller", "images"
        ]
        read_only_fields = ["id", "created_at", "seller"]
    
    def validate_image_upload(self, image_file):
        """Validate image file size and format"""
        # Max file size: 5MB
        MAX_FILE_SIZE = 5 * 1024 * 1024
        if image_file.size > MAX_FILE_SIZE:
            raise serializers.ValidationError(
                f"Image file is too large. Max size is 5MB, got {image_file.size / (1024*1024):.1f}MB"
            )
        
        # Validate image format
        allowed_formats = ('JPEG', 'PNG', 'GIF', 'WEBP')
        try:
            img = Image.open(image_file)
            if img.format not in allowed_formats:
                raise serializers.ValidationError(
                    f"Unsupported image format: {img.format}. Allowed: {', '.join(allowed_formats)}"
                )
        except Exception as e:
            raise serializers.ValidationError(f"Invalid image file: {str(e)}")
        
        return image_file

    def create(self, validated_data):
        request = self.context.get("request")
        images_data = request.FILES.getlist("images") if request else []
        
        # Validate all images before creating item
        for img in images_data:
            self.validate_image_upload(img)
        
        item = Item.objects.create(**validated_data)
        
        # Create ItemImage objects
        for idx, img in enumerate(images_data):
            ItemImage.objects.create(
                item=item,
                image=img,
                is_primary=(idx == 0)  # First image is primary
            )
        
        return item
    
    def update(self, instance, validated_data):
        request = self.context.get("request")
        images_data = request.FILES.getlist("images") if request else []
        
        # Update basic fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # Handle image updates
        if images_data:
            # Validate all images before replacing
            for img in images_data:
                self.validate_image_upload(img)
            
            # Delete old images
            instance.images.all().delete()
            
            # Create new images
            for idx, img in enumerate(images_data):
                ItemImage.objects.create(
                    item=instance,
                    image=img,
                    is_primary=(idx == 0)
                )
        
        return instance