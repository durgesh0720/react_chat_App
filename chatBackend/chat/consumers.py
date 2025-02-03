import json
from channels.generic.websocket import AsyncWebsocketConsumer
from asgiref.sync import sync_to_async
import time



class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Add the channel to a group named 'chatroom'
        self.room_id = self.scope['url_route']['kwargs']['room_id']
        self.groupName=f"chatroom_{self.room_id}"
        await self.channel_layer.group_add(f"{self.groupName}", self.channel_name)

        # Accept the WebSocket connection (important!)
        await self.accept()

        # Send previous messages to the newly connected WebSocket client

    async def disconnect(self, close_code):
    # Remove the channel from the correct room group
        await self.channel_layer.group_discard(self.groupName, self.channel_name)


    async def receive(self, text_data):
        print("Chat received: ", text_data)

        # Parse the received JSON data
        message_data = json.loads(text_data)
        username = message_data['username']
        text = message_data['text']

        # Create a new message in the database with the timestamp
        # message = await self.create_message(username, text)
        # Send the newly created message (including the timestamp) to all clients in the group
        await self.channel_layer.group_send(
            self.groupName,  # 🔥 Now sending messages to the correct room group
            {
                'type': 'chat_message',
                'username': username,
                'text': text,
                'timestamp':time.strftime("%Y-%m-%d %H:%M:%S", time.localtime()),
            }
        )



    # @sync_to_async
    # def create_message(self, username, text):
    # # Retrieve the Room object based on room_id
    #     try:
    #         room = Room.objects.get(room_id=self.room_id)
    #     except Room.DoesNotExist:
    #         # Handle case where room does not exist
    #         raise ValueError(f"Room with ID {self.room_id} not found.")
        
    #     # Create and save the new message in the database
    #     message = Message.objects.create(username=username, text=text, room=room)
    #     return message

    # @sync_to_async
    # def get_messages(self):
    # # Fetch last 20 messages for the room
    #     return list(Message.objects.order_by('-timestamp')[:20].values('username', 'text'))


    async def chat_message(self, event):
    # Sends the received message to WebSocket clients, including the timestamp
        await self.send(text_data=json.dumps(event))
