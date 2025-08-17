import pytest

from .models import PromptTemplate


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
