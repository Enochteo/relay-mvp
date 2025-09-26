import json
from channels.generic.websocket import AsyncWebsocketConsumer
from .models import Message, Conversation
from django.contrib.auth.models import AnonymousUser

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conversation_id = self.scope["url_route"]["kwargs"]["conversation_id"]
        self.room_group_name = f"chat_{self.conversation_id}"

        if self.scope["user"] == AnonymousUser():
            await self.close()
        else:
            await self.channel_layer.group_add(self.room_group_name, self.channel_name)
            await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        message_text = data["message"]
        sender = self.scope["user"]

        # Save message
        conversation = await self.get_conversation()
        message = Message.objects.create(conversation=conversation, sender=sender, text=message_text)

        # Broadcast
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat_message",
                "message": message.text,
                "sender": sender.id,
                "timestamp": str(message.timestamp)
            }
        )

    async def chat_message(self, event):
        await self.send(text_data=json.dumps(event))

    async def get_conversation(self):
        return await Conversation.objects.aget(id=self.conversation_id)
