from rest_framework import serializers
from .models import Conversation, Message
from django.contrib.auth import get_user_model

User = get_user_model()

class UserMiniSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "full_name"]

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ["id", "conversation", "sender", "text", "is_read", "timestamp"]

class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    last_message = serializers.SerializerMethodField()
    participants = UserMiniSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = ["id", "participants", "created_at", "messages", "last_message"]

    def get_last_message(self, obj):
        last = obj.messages.order_by("-timestamp").first()
        if not last:
            return None
        return {"text": last.text, "timestamp": last.timestamp}
