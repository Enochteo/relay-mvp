from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Q, Max
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
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


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def get_unread_count(request):
    """Get the total number of unread messages for the current user"""
    unread_count = Message.objects.filter(
        conversation__participants=request.user,
        is_read=False
    ).exclude(sender=request.user).count()
    
    return Response({"unread_count": unread_count})


@api_view(["POST"])
@permission_classes([permissions.IsAuthenticated])
def mark_conversation_read(request, conversation_id):
    """Mark all messages in a conversation as read for the current user"""
    try:
        conversation = Conversation.objects.get(
            id=conversation_id,
            participants=request.user
        )
        
        # Mark all unread messages in this conversation as read
        # (exclude messages sent by the current user)
        Message.objects.filter(
            conversation=conversation,
            is_read=False
        ).exclude(sender=request.user).update(is_read=True)
        
        return Response({"success": True})
        
    except Conversation.DoesNotExist:
        return Response({"error": "Conversation not found"}, status=404)


@api_view(["GET"])
@permission_classes([permissions.IsAuthenticated])
def get_conversations_with_unread(request):
    """Get conversations with unread message counts"""
    conversations = Conversation.objects.filter(
        participants=request.user
    ).prefetch_related('messages', 'participants').annotate(
        unread_count=Count(
            'messages',
            filter=Q(messages__is_read=False) & ~Q(messages__sender=request.user)
        ),
        last_message_time=Max('messages__timestamp')
    ).order_by('-last_message_time')
    
    serializer = ConversationSerializer(conversations, many=True)
    
    # Add unread counts to serialized data
    data = serializer.data
    for i, conversation in enumerate(conversations):
        data[i]['unread_count'] = conversation.unread_count
    
    return Response(data)
