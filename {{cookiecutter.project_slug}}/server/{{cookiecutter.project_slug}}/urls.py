from django.contrib import admin
from django.urls import include, path
{% if cookiecutter.use_graphql == 'y' %}
from django.conf import settings
{% endif %}

urlpatterns = [
    path(r"staff/", admin.site.urls),
    path(r"", include("{{ cookiecutter.project_slug }}.core.favicon_urls")),
    path(r"", include("{{ cookiecutter.project_slug }}.core.urls")),
]

{% if cookiecutter.use_graphql == 'y' %}
urlpatterns += [
    path("graphql", csrf_exempt(GraphQLView.as_view(graphiql=settings.DEBUG))),
]
{% endif %}
