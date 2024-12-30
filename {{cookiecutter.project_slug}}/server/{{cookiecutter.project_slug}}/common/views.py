from django.contrib.staticfiles.storage import staticfiles_storage
from django.http import FileResponse, Http404
from django.shortcuts import render
from django.template.exceptions import TemplateDoesNotExist
from django.views.generic.base import View
from rest_framework import permissions, status


def index(request):
    try:
        return render(request, "index.html")
    except TemplateDoesNotExist:
        return render(request, "core/index-placeholder.html", status=status.HTTP_404_NOT_FOUND)


class WellKnownExampleFile(View):

    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        try:
            file = staticfiles_storage.open("well-known-example/example.txt", "rb")
            return FileResponse(file, as_attachment=False)
        except FileNotFoundError:
            raise Http404("Static file not found")
