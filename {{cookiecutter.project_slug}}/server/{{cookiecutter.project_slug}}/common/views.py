{% if cookiecutter.use_graphql == "n" -%}
from django.shortcuts import render
from django.template.exceptions import TemplateDoesNotExist
{% else -%}
from django.template.response import TemplateResponse
from django.views.decorators.cache import never_cache
from django.views.decorators.csrf import ensure_csrf_cookie
{% endif -%}


{% if cookiecutter.use_graphql == 'y' %}

@ensure_csrf_cookie
@never_cache
def index(request):
    return TemplateResponse(request, ["index.html", "core/index-placeholder.html"])
{% else %}

def index(request):
    try:
        return render(request, "index.html")
    except TemplateDoesNotExist:
        return render(request, "core/index-placeholder.html")
{% endif -%}
