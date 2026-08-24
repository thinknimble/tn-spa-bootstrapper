"""WebSocket consumer for the goal-coach agent.

Frame protocol (server to client):
- ``{"session_id": "<uuid>"}`` — sent once per turn; reuse it to continue
  the conversation.
- ``{"delta": {"content": "<text>"}}`` — a streamed chunk of the reply.
- ``{"tool_call": {"name": ..., "args": ...}}`` — the agent invoked a tool.
- ``{"tool_result": {"name": ..., "content": ...}}`` — the tool returned.
- ``{"done": true}`` — the turn is complete.
- ``{"error": "<message>"}`` — the turn failed.

The client sends ``{"message": "<text>", "session_id": "<uuid, optional>"}``.
"""

import asyncio
import json
import logging
from typing import Any

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from django.core.exceptions import ValidationError
from pydantic_ai import Agent
from pydantic_ai.messages import (
    FunctionToolCallEvent,
    FunctionToolResultEvent,
    ModelMessagesTypeAdapter,
    PartDeltaEvent,
    PartStartEvent,
    TextPart,
    TextPartDelta,
)

from .agents import CoachService, coach_agent, get_model
from .models import AgentSession

logger = logging.getLogger(__name__)


class AgentConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        self.user = self.scope["user"]
        self._run_task: asyncio.Task | None = None
        await self.accept()

    async def disconnect(self, close_code):
        if self._run_task and not self._run_task.done():
            self._run_task.cancel()

    async def receive_json(self, data: dict[str, Any]):
        if not isinstance(data, dict):
            await self.send_json({"error": "Send a JSON object with a 'message' key."})
            return
        message = str(data.get("message") or "").strip()
        if not message:
            await self.send_json({"error": "Send a JSON object with a 'message' key."})
            return
        if self._run_task and not self._run_task.done():
            await self.send_json({"error": "A response is already in progress."})
            return
        logger.info(f"Agent message from user {self.user.email}")
        self._run_task = asyncio.create_task(self._run_agent(message, data.get("session_id")))

    async def _run_agent(self, message: str, session_id: str | None):
        try:
            session = await self._get_session(session_id)
            await self.send_json({"session_id": str(session.id)})

            history = None
            if session.messages:
                history = ModelMessagesTypeAdapter.validate_python(session.messages)

            async with coach_agent.iter(
                message,
                model=get_model(),
                deps=CoachService(user=self.user),
                message_history=history,
            ) as run:
                async for node in run:
                    if Agent.is_model_request_node(node):
                        await self._stream_model_request(node, run)
                    elif Agent.is_call_tools_node(node):
                        await self._stream_tool_calls(node, run)

            session.messages = json.loads(run.result.all_messages_json())
            await session.asave(update_fields=["messages", "last_edited"])
            await self.send_json({"done": True})
        except asyncio.CancelledError:
            raise
        except Exception:
            logger.exception("Agent run failed")
            try:
                await self.send_json({"error": "An error occurred while processing your request"})
            except Exception:  # noqa: BLE001 — the socket may already be closed
                logger.debug("Could not deliver the error frame; socket closed")

    async def _stream_model_request(self, node, run):
        async with node.stream(run.ctx) as stream:
            async for event in stream:
                if (
                    isinstance(event, PartStartEvent)
                    and isinstance(event.part, TextPart)
                    and event.part.content
                ):
                    await self.send_json({"delta": {"content": event.part.content}})
                elif (
                    isinstance(event, PartDeltaEvent)
                    and isinstance(event.delta, TextPartDelta)
                    and event.delta.content_delta
                ):
                    await self.send_json({"delta": {"content": event.delta.content_delta}})

    async def _stream_tool_calls(self, node, run):
        async with node.stream(run.ctx) as stream:
            async for event in stream:
                if isinstance(event, FunctionToolCallEvent):
                    await self.send_json(
                        {"tool_call": {"name": event.part.tool_name, "args": event.part.args}}
                    )
                elif isinstance(event, FunctionToolResultEvent):
                    await self.send_json(
                        {
                            "tool_result": {
                                "name": event.part.tool_name,
                                "content": str(event.part.content),
                            }
                        }
                    )

    async def _get_session(self, session_id: str | None) -> AgentSession:
        if session_id:
            try:
                return await AgentSession.objects.aget(id=session_id, user=self.user)
            except (AgentSession.DoesNotExist, ValidationError, ValueError):
                logger.info("Unknown session id; starting a new session")
        return await AgentSession.objects.acreate(user=self.user)
