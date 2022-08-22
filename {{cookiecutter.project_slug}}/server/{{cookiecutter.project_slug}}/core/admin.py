from django.contrib import admin

from .models import User

# this is a required model for the admin console to hash passwords
class CustomUserAdmin(UserAdmin):
    model = User

    fieldsets = (
        (
            None,
            {
                "fields": (
                    "email",
                    "first_name",
                    "last_name",
                    "password",
                    "last_login",
                    "is_staff",
                )
            },
        ),
    )

    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("email", "password1", "password2"),
            },
        ),
    )

    list_display = ("is_active", "email", "first_name", "last_name")

    list_display_links = (
        "is_active",
        "email",
        "first_name",
        "last_name",
    )

    search_fields = (
        "email",
        "first_name",
        "last_name",
    )

    ordering = []

admin.site.register(User, CustomUserAdmin)
