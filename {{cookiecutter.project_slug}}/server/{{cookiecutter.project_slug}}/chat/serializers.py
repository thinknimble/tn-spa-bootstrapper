from rest_framework import serializers


class SystemPromptSerializer(serializers.Serializer):
    content = serializers.CharField()
