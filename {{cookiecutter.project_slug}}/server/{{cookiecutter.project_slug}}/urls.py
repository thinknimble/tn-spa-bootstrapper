from django.contrib import admin
from django.urls import include, path
{% if cookiecutter.use_graphql == 'y' %}
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from graphene_django.views import GraphQLView
{% endif %}

urlpatterns = [
    {% if cookiecutter.use_graphql == 'y' %}
    path("graphql", csrf_exempt(GraphQLView.as_view(graphiql=settings.DEBUG))),
    {% endif %}
    path(r"staff/", admin.site.urls),
    path(r"", include("{{ cookiecutter.project_slug }}.core.favicon_urls")),
    path(r"", include("{{ cookiecutter.project_slug }}.core.urls")),
]
