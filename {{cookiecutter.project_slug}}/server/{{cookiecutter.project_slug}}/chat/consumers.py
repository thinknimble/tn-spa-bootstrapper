import logging
from typing import Any, Dict, List

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.conf import settings
from openai import AsyncOpenAI

from .models import PromptTemplate

logger = logging.getLogger(__name__)

# Initialize OpenAI client
client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)


class ChatConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        # Generate a fresh system prompt for this connection using async version
        self.system_prompt = await PromptTemplate.objects.aget_assembled_prompt(
            agent=PromptTemplate.AgentType.CHAT
        )
        await self.accept()
        self.groups = ["chat"]

    async def disconnect(self, close_code):
        pass

    async def receive_json(self, data: Dict[str, Any]):
        try:
            logger.info(f"Received message from user {self.user.email}")
            messages = data.get("messages", [])

            # Use instance-specific system prompt
            openai_messages = [{"role": "system", "content": self.system_prompt}]
            openai_messages.extend(messages)

            await self.handle_streaming_chat(openai_messages)

        except Exception as e:
            logger.error(f"Error in receive_json: {str(e)}")
            await self.send_json({"error": "An error occurred while processing your request"})

    async def handle_streaming_chat(self, messages: List[Dict[str, str]]):
        try:
            stream = await client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=messages,
                stream=True,
            )

            async for event in stream:
                if event.choices:
                    first_choice = event.model_dump()["choices"][0]
                    await self.send_json({"delta": first_choice["delta"]})

        except Exception as e:
            logger.error(f"Error in handle_streaming_chat: {str(e)}")
            await self.send_json({"error": "Stream interrupted"})
