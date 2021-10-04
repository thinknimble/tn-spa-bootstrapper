from django.urls import path, include
from django.contrib import admin
from graphene_django.views import GraphQLView


urlpatterns = [
    path(r"admin/", admin.site.urls),
    path(r"", include("{{ cookiecutter.project_slug }}.core.favicon_urls")),
    path(r"", include("{{ cookiecutter.project_slug }}.core.urls")),
    path("graphql", GraphQLView.as_view(graphiql=True)),
]
