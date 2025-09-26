from rest_framework import generics, permissions
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import Conversation
from .serializers import ConversationSerializer
from django.contrib.auth import get_user_model

# Create your views here.

User = get_user_model()

class ConversationListCreateView(generics.ListCreateAPIView):
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(participants=self.request.user)

    def create(self, request, *args, **kwargs):
        participants = request.data.get("participants", [])
        if not participants:
            return Response({"error": "Participants required"}, status=400)

        other_user_id = participants[0]
        try:
            other_user = User.objects.get(id=other_user_id)
        except User.DoesNotExist:
            return Response({"error": "User not found"}, status=404)

        # Check if conversation exists
        conversation = Conversation.objects.filter(
            participants=self.request.user
        ).filter(participants=other_user).first()

        if conversation:
            serializer = self.get_serializer(conversation)
            return Response(serializer.data)

        # Otherwise create new conversation
        conversation = Conversation.objects.create()
        conversation.participants.add(request.user, other_user)
        serializer = self.get_serializer(conversation)
        return Response(serializer.data, status=201)


class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Message.objects.filter(conversation_id=self.kwargs["conversation_id"])

    def perform_create(self, serializer):
        serializer.save(sender=self.request.user, conversation_id=self.kwargs["conversation_id"])
