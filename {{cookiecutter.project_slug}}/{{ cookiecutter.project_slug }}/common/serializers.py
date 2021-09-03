from rest_framework import serializers

# Global Serializers to organize Responses 

class ResponseSerializer(serializers.Serializer):
    status = serializers.CharField()
    title = serializers.CharField()
    data = serializers.CharField()


class ErrorResponseSerializer(serializers.Serializer):
    meta = serializers.CharField()
    code = serializers.CharField()  # code to identifiy the response
    title = serializers.CharField()  # human readable resonse status
    errors = serializers.CharField()
