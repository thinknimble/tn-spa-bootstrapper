from django.contrib import admin
from django.contrib.auth.admin import GroupAdmin, UserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from django.contrib.auth.models import Group, Permission

from {{ cookiecutter.project_slug }}.common.admin.filters import AutocompleteAdminMedia, AutocompleteFilter

from .forms import GroupAdminForm
from .models import User


class CustomUserAdmin(UserAdmin):
    form = UserChangeForm
    add_form = UserCreationForm
    fieldsets = (
        (
            None,
            {
                "fields": (
                    "password",
                    "first_name",
                    "last_name",
                    "email",
                )
            },
        ),
        ("Admin Options", {"classes": ("collapse",), "fields": ("is_active", "is_staff", "is_superuser", "groups")}),
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
    list_display = (
        "email",
        "permissions",
        "is_active",
        "is_staff",
        "is_superuser",
        "first_name",
        "last_name",
    )
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
    list_filter = (
        ("groups", AutocompleteFilter),
        "is_active",
        "is_staff",
        "is_superuser",
    )
    filter_horizontal = ("groups",)
    ordering = []

    def permissions(self, obj):
        return [g.name for g in obj.groups.all()]

    class Media(AutocompleteAdminMedia):
        pass


class CustomGroupAdmin(GroupAdmin):
    form = GroupAdminForm
    list_filter = (("permissions", AutocompleteFilter),)

    class Media(AutocompleteAdminMedia):
        pass


# If we want the autocomplete filter by permission on the Group admin to work, we need to include an admin
# site for the permissions themselves, and we definitely need to define the search_fields.
@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    search_fields = ("name", "content_type__app_label", "content_type__model", "codename")


admin.site.register(User, CustomUserAdmin)

# Since Django's contrib apps already register Group to the admin site, we need to remove it and add it again
# but with our custom admin class.
admin.site.unregister(Group)
admin.site.register(Group, CustomGroupAdmin)
