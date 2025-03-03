from django.contrib import admin
from django.utils.html import format_html

from .models import Feedback, Fingerprint, PromptTemplate


@admin.register(Fingerprint)
class FingerprintAdmin(admin.ModelAdmin):
    list_display = ("name", "created", "last_edited")
    search_fields = ("name", "example_dialogue")
    readonly_fields = ("created", "last_edited")
    ordering = ("name",)


@admin.register(Feedback)
class FeedbackAdmin(admin.ModelAdmin):
    list_display = ("get_feedback_type_badge", "get_messages_count", "detected_pattern", "created")
    list_filter = ("feedback_type", "detected_pattern", "created")
    search_fields = ("notes", "original_response", "corrected_response")
    readonly_fields = ("created", "last_edited")
    raw_id_fields = ("detected_pattern",)

    def get_feedback_type_badge(self, obj):
        colors = {"GOOD": "green", "NEUTRAL": "orange", "BAD": "red"}
        return format_html(
            '<span style="color: {}; font-weight: bold">{}</span>',
            colors.get(obj.feedback_type, "gray"),
            obj.feedback_type,
        )

    get_feedback_type_badge.short_description = "Feedback Type"

    def get_messages_count(self, obj):
        return len(obj.messages)

    get_messages_count.short_description = "Messages"


@admin.register(PromptTemplate)
class PromptTemplateAdmin(admin.ModelAdmin):
    list_display = ("name", "order")
    search_fields = ("name", "content", "description")
    ordering = ("order",)
    readonly_fields = ("created", "last_edited")
    fieldsets = (
        (None, {"fields": ("name", "content")}),
        ("Settings", {"fields": ("description", "order")}),
        ("Metadata", {"fields": ("created", "last_edited"), "classes": ("collapse",)}),
    )
