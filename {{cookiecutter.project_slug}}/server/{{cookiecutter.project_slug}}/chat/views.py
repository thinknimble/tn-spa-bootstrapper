from rest_framework.decorators import api_view
from rest_framework.response import Response

from .exceptions import BadTemplateException
from .models import PromptTemplate
from .serializers import SystemPromptSerializer


@api_view(["GET"])
def get_current_system_prompt(request):
    try:
        assembled_prompt = PromptTemplate.objects.get_assembled_prompt()
    except BadTemplateException as e:
        return Response({"error": str(e)}, status=500)

    serializer = SystemPromptSerializer({"content": assembled_prompt})
    return Response(serializer.data)
