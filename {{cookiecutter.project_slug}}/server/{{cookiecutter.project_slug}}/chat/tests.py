import pytest
from asgiref.sync import sync_to_async
from pydantic_ai.models.test import TestModel

from .agents import CoachService, coach_agent
from .models import Goal, PromptTemplate


@pytest.mark.django_db
def test_chat_system_prompt_view(api_client, sample_user):
    api_client.force_authenticate(user=sample_user)
    PromptTemplate.objects.create(content="Hello, how can I help you today?", name="Welcome")
    response = api_client.get("/api/chat/system-prompt/")
    assert response.status_code == 200
    assert response.data["content"] == "Hello, how can I help you today?"


@pytest.mark.django_db
def test_prompt_template_agent_type_filtering():
    # Create templates with different agent types
    PromptTemplate.objects.create(
        name="Chat Template",
        content="This is a chat template",
        agent_types=[PromptTemplate.AgentType.CHAT],
        order=1,
    )

    PromptTemplate.objects.create(
        name="No Agent Template",
        content="This template has no agent types",
        agent_types=[],
        order=2,
    )

    # Test filtering by CHAT agent type
    prompt_with_chat = PromptTemplate.objects.get_assembled_prompt(
        agent=PromptTemplate.AgentType.CHAT
    )

    # Should only include the chat template
    assert "This is a chat template" in prompt_with_chat
    assert "This template has no agent types" not in prompt_with_chat

    # Test with no agent filter - should include all templates
    prompt_no_filter = PromptTemplate.objects.get_assembled_prompt()
    assert "This is a chat template" in prompt_no_filter
    assert "This template has no agent types" in prompt_no_filter


@pytest.mark.django_db
@pytest.mark.asyncio
async def test_prompt_template_async_agent_filtering():
    # Create a template with CHAT agent type
    await PromptTemplate.objects.acreate(
        name="Async Chat Template",
        content="Async chat content",
        agent_types=[PromptTemplate.AgentType.CHAT],
        order=1,
    )

    # Create a template without agent types
    await PromptTemplate.objects.acreate(
        name="Async General Template",
        content="General content",
        agent_types=[],
        order=2,
    )

    # Test async filtering with agent parameter
    prompt_with_agent = await PromptTemplate.objects.aget_assembled_prompt(
        agent=PromptTemplate.AgentType.CHAT
    )

    # Should only include the chat template
    assert "Async chat content" in prompt_with_agent
    assert "General content" not in prompt_with_agent


# transaction=True: the async ORM uses its own connection, which must see
# the fixture rows. A plain django_db transaction hides them from it.
@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_coach_service_goal_lifecycle(sample_user):
    service = CoachService(user=sample_user)

    reply = await service.save_goal("Read one book per month")
    assert "Read one book per month" in reply

    goal = await Goal.objects.aget(user=sample_user)
    assert goal.is_complete is False

    listing = await service.list_goals()
    assert "Read one book per month" in listing
    assert "[open]" in listing

    done = await service.complete_goal(str(goal.id))
    assert "complete" in done
    await goal.arefresh_from_db()
    assert goal.is_complete is True


# transaction=True: the async ORM uses its own connection, which must see
# the fixture rows. A plain django_db transaction hides them from it.
@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_coach_service_scopes_goals_to_the_user(sample_user, user_factory):
    other_user = await sync_to_async(user_factory)()
    await Goal.objects.acreate(user=other_user, title="Someone else's goal")

    service = CoachService(user=sample_user)
    listing = await service.list_goals()
    assert "no saved goals" in listing

    other_goal = await Goal.objects.aget(user=other_user)
    reply = await service.complete_goal(str(other_goal.id))
    assert "No goal with id" in reply
    await other_goal.arefresh_from_db()
    assert other_goal.is_complete is False


# transaction=True: the async ORM uses its own connection, which must see
# the fixture rows. A plain django_db transaction hides them from it.
@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_coach_service_rejects_bad_goal_id(sample_user):
    service = CoachService(user=sample_user)
    reply = await service.complete_goal("not-a-uuid")
    assert "No goal with id" in reply


# transaction=True: the async ORM uses its own connection, which must see
# the fixture rows. A plain django_db transaction hides them from it.
@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_coach_agent_tools_reach_the_database(sample_user):
    # TestModel calls every registered tool once, then produces text.
    # This proves the tool wiring and the service reach the database,
    # with no LLM and no network.
    result = await coach_agent.run(
        "Save a goal called Learn Django",
        model=TestModel(),
        deps=CoachService(user=sample_user),
    )
    assert result.output
    assert await Goal.objects.filter(user=sample_user).aexists()


# transaction=True: the async ORM uses its own connection, which must see
# the fixture rows. A plain django_db transaction hides them from it.
@pytest.mark.django_db(transaction=True)
@pytest.mark.asyncio
async def test_coach_agent_history_round_trip(sample_user):
    # The consumer persists result.all_messages_json() and replays it on
    # the next turn. This test proves the round trip stays valid.
    import json

    from pydantic_ai.messages import ModelMessagesTypeAdapter

    result = await coach_agent.run(
        "List my goals",
        model=TestModel(),
        deps=CoachService(user=sample_user),
    )
    stored = json.loads(result.all_messages_json())
    history = ModelMessagesTypeAdapter.validate_python(stored)

    result_two = await coach_agent.run(
        "Thanks!",
        model=TestModel(call_tools=[]),
        deps=CoachService(user=sample_user),
        message_history=history,
    )
    assert result_two.output


def test_asgi_application_serves_the_agent_websocket():
    # Import the real ASGI stack. This catches broken consumer wiring
    # (a bad import or a stale consumer name) at test time instead of
    # at deploy time.
    from {{ cookiecutter.project_slug }} import asgi
    from {{ cookiecutter.project_slug }}.chat.routing import websocket_urlpatterns

    assert asgi.application is not None
    assert any(str(p.pattern) == "ws/chat/" for p in websocket_urlpatterns)
