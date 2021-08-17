from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from {{ cookiecutter.project_slug }}.core.models import User


class CustomUserAdmin(UserAdmin):
    model = User

    fieldsets = (
        (
            None,
            {"fields": ("password", "last_login", "is_staff", "first_name", "last_name", "email")},
        ),
    )

    add_fieldsets = ((None, {"classes": ("wide",), "fields": ("email", "password1", "password2")}),)

    list_display = ("is_active", "email", "first_name", "last_name")

    list_display_links = ("is_active", "email", "first_name", "last_name")

    search_fields = ("email", "first_name", "last_name")

    ordering = []


admin.site.register(User, CustomUserAdmin)


