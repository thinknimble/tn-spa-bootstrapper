from django.contrib import admin
from django.urls import include, path
from graphene_django.views import GraphQLView

urlpatterns = [
    path(r"admin/", admin.site.urls),
    path(r"", include("my_project.core.favicon_urls")),
    path(r"", include("my_project.core.urls")),
    path("graphql", GraphQLView.as_view(graphiql=True)),
]
