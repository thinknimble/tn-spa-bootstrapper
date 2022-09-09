from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from graphene_django.views import GraphQLView
urlpatterns = [
    path("graphql", csrf_exempt(GraphQLView.as_view(graphiql=settings.DEBUG))),
    path(r"staff/", admin.site.urls),
    path(r"", include("my_project.core.favicon_urls")),
    path(r"", include("my_project.core.urls")),
]
