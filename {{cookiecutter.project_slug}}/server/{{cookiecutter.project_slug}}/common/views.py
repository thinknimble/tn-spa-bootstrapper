from django.shortcuts import render
from django.template.exceptions import TemplateDoesNotExist
from django.http import JsonResponse
from rest_framework import status


def index(request):
    try:
        return render(request, "index.html")
    except TemplateDoesNotExist:
        return render(request, "core/index-placeholder.html", status=status.HTTP_404_NOT_FOUND)


def health_check(request):
    return JsonResponse({"status": "healthy"}, status=200)
