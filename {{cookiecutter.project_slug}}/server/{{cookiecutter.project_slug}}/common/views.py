{%- if cookiecutter.client_app == "Vue3" -%}
from django.shortcuts import render
from django.template.exceptions import TemplateDoesNotExist
{% endif %}
{% if cookiecutter.use_graphql == 'y' -%}
from django.template.response import TemplateResponse
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import ensure_csrf_cookie
{% endif -%}


{% if cookiecutter.use_graphql == 'y' %}
# Serve React frontend
@ensure_csrf_cookie
@never_cache
def index(request):
    return TemplateResponse(request, ["index.html", "core/index-placeholder.html"])
{% elif cookiecutter.client_app.lower() == 'None' -%}
def index(request):
    return redirect(to="/docs/swagger/")
{% else -%}
def index(request):
    try:
        return render(request, "index.html")
    except TemplateDoesNotExist:
        return render(request, "core/index-placeholder.html")
{% endif -%}
