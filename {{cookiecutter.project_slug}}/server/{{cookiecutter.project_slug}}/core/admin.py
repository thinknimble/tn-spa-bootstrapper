from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django import forms
from django.utils.html import format_html
from django.urls import re_path, path, include
from django.http import HttpResponseRedirect


from django.contrib.auth.tokens import default_token_generator


from django.conf import settings


from .models import User


admin.site.register(User)
