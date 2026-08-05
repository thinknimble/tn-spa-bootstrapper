"""A goal-coach agent built with pydantic-ai.

This module shows the pattern for agents with database-backed tools:

- ``CoachService`` is a small service layer. It carries the authenticated
  user, and every query filters by that user, so authorization lives in
  one place. The service is testable without an LLM.
- Tools are one-line delegations to the service.
- Instructions come from the admin-editable ``PromptTemplate`` records,
  with a code fallback when the database has none.
"""

import logging
from dataclasses import dataclass
from typing import TYPE_CHECKING

from django.conf import settings
from django.core.exceptions import ValidationError
from pydantic_ai import Agent, RunContext
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.providers.openai import OpenAIProvider

from .models import Goal, PromptTemplate

if TYPE_CHECKING:
    from {{ cookiecutter.project_slug }}.core.models import User

logger = logging.getLogger(__name__)

DEFAULT_INSTRUCTIONS = (
    "You are a friendly and practical goal coach. Help the user turn ideas into "
    "clear, achievable goals. Use your tools to save goals, list them, and mark "
    "them complete. After each tool action, confirm the result to the user in "
    "one short sentence. Refer to goals by title, not by id."
)


def get_model() -> OpenAIChatModel:
    # Built per run, not at import time, so an empty OPENAI_API_KEY does not
    # break ASGI startup.
    return OpenAIChatModel(
        settings.OPENAI_MODEL,
        provider=OpenAIProvider(api_key=settings.OPENAI_API_KEY),
    )


@dataclass
class CoachService:
    """Mediates all database access for the coach agent's tools."""

    user: "User"

    async def save_goal(self, title: str) -> str:
        goal = await Goal.objects.acreate(user=self.user, title=title)
        return f'Saved the goal "{goal.title}" (id {goal.id}).'

    async def list_goals(self) -> str:
        lines = []
        async for goal in Goal.objects.filter(user=self.user).order_by("created"):
            state = "complete" if goal.is_complete else "open"
            lines.append(f'- "{goal.title}" [{state}] (id {goal.id})')
        if not lines:
            return "The user has no saved goals yet."
        return "\n".join(lines)

    async def complete_goal(self, goal_id: str) -> str:
        try:
            goal = await Goal.objects.aget(user=self.user, id=goal_id)
        except (Goal.DoesNotExist, ValidationError, ValueError):
            return f"No goal with id {goal_id} exists for this user."
        goal.is_complete = True
        await goal.asave(update_fields=["is_complete", "last_edited"])
        return f'Marked the goal "{goal.title}" complete.'


coach_agent = Agent(deps_type=CoachService)


@coach_agent.instructions
async def coach_instructions(ctx: RunContext[CoachService]) -> str:
    prompt = await PromptTemplate.objects.aget_assembled_prompt(agent=PromptTemplate.AgentType.CHAT)
    return prompt or DEFAULT_INSTRUCTIONS


@coach_agent.tool
async def save_goal(ctx: RunContext[CoachService], title: str) -> str:
    """Save a new goal for the user. Use a short, action-oriented title."""
    return await ctx.deps.save_goal(title)


@coach_agent.tool
async def list_goals(ctx: RunContext[CoachService]) -> str:
    """List all of the user's saved goals with their current state and id."""
    return await ctx.deps.list_goals()


@coach_agent.tool
async def complete_goal(ctx: RunContext[CoachService], goal_id: str) -> str:
    """Mark one of the user's goals complete. Pass the goal's id."""
    return await ctx.deps.complete_goal(goal_id)
