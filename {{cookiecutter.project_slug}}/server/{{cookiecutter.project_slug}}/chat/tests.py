import pytest

from .models import PromptTemplate


@pytest.mark.django_db
def test_chat_system_prompt_view(api_client, sample_user):
    api_client.force_authenticate(user=sample_user)
    PromptTemplate.objects.create(content="Hello, how can I help you today?", name="Welcome")
    response = api_client.get("/api/chat/system-prompt/")
    assert response.status_code == 200
    assert response.data["content"] == "Hello, how can I help you today?"
