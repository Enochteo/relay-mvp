from django.urls import path
from .views import (
    ConversationListCreateView, 
    MessageListCreateView,
    get_unread_count,
    mark_conversation_read,
    get_conversations_with_unread
)

urlpatterns = [
    path("conversations/", ConversationListCreateView.as_view(), name="conversation-list"),
    path("conversations/with-unread/", get_conversations_with_unread, name="conversations-with-unread"),
    path("conversations/<int:conversation_id>/messages/", MessageListCreateView.as_view(), name="message-list"),
    path("conversations/<int:conversation_id>/mark-read/", mark_conversation_read, name="mark-conversation-read"),
    path("unread-count/", get_unread_count, name="unread-count"),
]