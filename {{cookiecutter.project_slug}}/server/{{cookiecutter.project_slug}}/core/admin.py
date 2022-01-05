from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django import forms
from django.utils.html import format_html
from django.urls import re_path, path, include
from django.http import HttpResponseRedirect


from django.contrib.auth.tokens import default_token_generator


from django.conf import settings


from .models import User
from safedelete.admin import SafeDeleteAdmin, SafeDeleteAdminFilter, highlight_deleted

# admin.site.register(User)

class UserAdmin(SafeDeleteAdmin):
    list_display = (highlight_deleted, "highlight_deleted_field", "first_name", "last_name", "email") + SafeDeleteAdmin.list_display
    list_filter = ("last_name", SafeDeleteAdminFilter,) + SafeDeleteAdmin.list_filter
    field_to_highlight = "id"
    
admin.site.register(User, UserAdmin)