import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message, Conversation
from django.contrib.auth.models import AnonymousUser
from datetime import datetime


def format_timestamp(self, iso_timestamp: str) -> str:
    """Convert ISO timestamp to human-readable format."""
    try:
        # Parse the ISO timestamp
        dt = datetime.datetime.fromisoformat(iso_timestamp.replace("Z", "+00:00"))

        # Convert to local time
        dt = dt.replace(tzinfo=datetime.timezone.utc).astimezone()

        # Format as "January 5th, 1999 5:00 PM"
        day = dt.day
        if 4 <= day <= 20 or 24 <= day <= 30:
            suffix = "th"
        else:
            suffix = ["st", "nd", "rd"][day % 10 - 1]

        formatted_date = dt.strftime(f"%B {day}{suffix}, %Y %I:%M %p")
        return formatted_date
    except Exception:
        return formatted_date


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # normalize conversation id to int to avoid accidental string mismatches
        raw_id = self.scope["url_route"]["kwargs"].get("conversation_id")
        try:
            self.conversation_id = int(raw_id)
        except (TypeError, ValueError):
            print(f"[ChatConsumer] Invalid conversation_id: {raw_id}")
            await self.close()
            return
        self.room_group_name = f"chat_{self.conversation_id}"

        # If the middleware did not attach an authenticated user, close the
        # connection. Middleware now sets an AnonymousUser when token is
        # missing/invalid so check for that.
        user = self.scope.get("user")
        if user is None or getattr(user, "is_anonymous", True):
            print(f"[ChatConsumer] Unauthenticated user attempted to connect to conversation {self.conversation_id}")
            await self.close()
            return

        print(f"[ChatConsumer] User {getattr(user, 'id', None)} connecting to conversation {self.conversation_id}")
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        print(f"[ChatConsumer] User {getattr(user, 'id', None)} successfully connected to conversation {self.conversation_id}")

    async def disconnect(self, close_code):
        user = self.scope.get("user")
        print(f"[ChatConsumer] User {getattr(user, 'id', None)} disconnecting from conversation {self.conversation_id} with code {close_code}")
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        try:
            data = json.loads(text_data)
            message_text = data.get("message", "").strip()
            
            if not message_text:
                print(f"[ChatConsumer] Empty message received from user {getattr(self.scope.get('user'), 'id', None)}")
                return
                
            sender = self.scope["user"]

            # Save message
            conversation = await self.get_conversation()
            # security: ensure sender is a participant of this conversation
            if not await self.is_participant(sender, conversation):
                print(f"[ChatConsumer] Rejecting message: sender {getattr(sender,'id',None)} not participant of conversation {getattr(conversation,'id',None)}")
                return
                
            print(f"[ChatConsumer] Received message for conversation={self.conversation_id} sender={getattr(sender,'id',None)} text={message_text}")
            message = await self.create_message(conversation, sender, message_text)

            # Broadcast to all participants in the conversation
            broadcast_data = {
                "type": "chat_message",
                "conversation_id": conversation.id, 
                "message": message.text,
                "sender": sender.id,
                "timestamp": str(message.timestamp),
            }
            
            await self.channel_layer.group_send(self.room_group_name, broadcast_data)
            print(f"[ChatConsumer] Broadcast to {self.room_group_name}: conversation={conversation.id} sender={sender.id} message={message.text}")
            
        except json.JSONDecodeError:
            print(f"[ChatConsumer] Invalid JSON received from user {getattr(self.scope.get('user'), 'id', None)}")
        except Exception as e:
            print(f"[ChatConsumer] Error processing message: {e}")
            # Could send error message back to client here if needed

    @database_sync_to_async
    def is_participant(self, user, conversation):
        return conversation.participants.filter(id=getattr(user, 'id', None)).exists()

    @database_sync_to_async
    def create_message(self, conversation, sender, text):
        return Message.objects.create(conversation=conversation, sender=sender, text=text)

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    async def get_conversation(self):
        return await Conversation.objects.aget(id=self.conversation_id)
