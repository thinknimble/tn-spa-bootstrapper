---
paths: server/**/*.py
---
# Django Backend Development Guide

Backend-specific guidance for Django development. See `/CLAUDE.md` in the root directory for architecture overview.

## Purpose

This guide covers Django-specific patterns, conventions, and anti-patterns for the backend. Follow these patterns when creating models, serializers, viewsets, and tests.

## Apps Structure

### core
- Custom User model with email-based authentication (no username field)
- Token-based authentication via Django REST Framework
- Permissions and authentication infrastructure
- Email verification and password reset

### common
- `AbstractBaseModel` base class (UUID primary keys, `created`/`last_edited` timestamps)
- Shared utilities, filters, and mixins

### chat
- Real-time chat using Django Channels
- WebSocket consumers
- Redis channel layer integration

### utils
- Email utilities (Anymail integration)
- Site utilities
- Helper functions

## Code Conventions

### Naming

- Functions and variables: `snake_case`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Model fields: `snake_case`
- URL patterns: `kebab-case`
- **Imports**: Prefer absolute imports (e.g., `from myproject.core.models import User`)

### Models

- Inherit from `AbstractBaseModel` for UUID primary keys and timestamp tracking
- Use custom QuerySet managers for reusable filtering logic
- Define `for_user()` QuerySet methods for access control
- Always implement `__str__()` for admin interface clarity

### Serializers

- Use descriptive names: `ModelSerializer`, `ModelListSerializer`, `ModelNestedSerializer`
- Read-only fields: Use `read_only=True` or include in `read_only_fields` tuple
- Nested serializers: Create separate `*NestedSerializer` classes for related objects
- Use `source` parameter for field name mapping

### ViewSets

- Filter querysets in `get_queryset()` based on user access
- Override `perform_destroy()` for soft deletes (set `is_active=False`)
- Use `get_serializer_class()` to return different serializers per action
- Custom actions: Use `@action` decorator with explicit `methods` and `url_path`

## Access Control Patterns

### QuerySet Filtering

```python
class YourModelQuerySet(models.QuerySet):
    def for_user(self, user):
        """Filter based on user access."""
        if user.is_staff:
            return self.all()
        # Apply user-specific filtering
        return self.filter(owner=user)

class YourModel(AbstractBaseModel):
    # ... fields
    objects = YourModelQuerySet.as_manager()
```

### ViewSet Filtering

```python
class YourModelViewSet(viewsets.ModelViewSet):
    queryset = YourModel.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_staff:
            return queryset
        return queryset.for_user(self.request.user)
```

## Serializer Patterns

### Nested Serializer Usage

Create separate nested serializers for related objects:

```python
# Nested serializer (lightweight)
class RelatedNestedSerializer(serializers.ModelSerializer):
    class Meta:
        model = RelatedModel
        fields = ("id", "name")
        read_only_fields = fields

# Full serializer with nested relationships
class YourModelSerializer(serializers.ModelSerializer):
    related_items = RelatedNestedSerializer(many=True, read_only=True)

    class Meta:
        model = YourModel
        fields = ("id", "name", "related_items", "created", "last_edited")
        read_only_fields = ("id", "created", "last_edited")
```

### List vs Detail Serializers

Use lightweight serializers for list views:

```python
class YourModelViewSet(viewsets.ModelViewSet):
    def get_serializer_class(self):
        if self.action == "list":
            return YourModelListSerializer
        return YourModelSerializer
```

## ViewSet Patterns

### Permission Classes

```python
from rest_framework import permissions

# Standard permission options
permission_classes = [permissions.IsAuthenticated]

# Staff-only write access
permission_classes = [IsStaffOrReadOnly]
```

### Custom Actions with @action Decorator

```python
from rest_framework.decorators import action
from rest_framework.response import Response

class YourModelViewSet(viewsets.ModelViewSet):
    @action(detail=True, methods=["post"], url_path="custom-action")
    def custom_action(self, request, pk=None):
        obj = self.get_object()  # Applies permission checks
        # ... action logic
        return Response({"status": "success"})

    @action(detail=False, methods=["get"], url_path="summary")
    def summary(self, request):
        queryset = self.filter_queryset(self.get_queryset())
        return Response({"count": queryset.count()})
```

### Soft Deletes

Always implement soft deletes by setting `is_active=False`:

```python
class YourModelViewSet(viewsets.ModelViewSet):
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
```

## Testing Patterns

### Factory Boy Usage

Create factories in `app/factories.py`:

```python
import factory
from .models import YourModel

class YourModelFactory(factory.django.DjangoModelFactory):
    name = factory.Sequence(lambda n: f"Model {n}")
    is_active = True

    class Meta:
        model = YourModel
        django_get_or_create = ("name",)

    class Params:
        inactive = factory.Trait(is_active=False)
```

Register factories in `conftest.py`:

```python
from pytest_factoryboy import register
from your_app.factories import YourModelFactory

register(YourModelFactory)
```

### API Testing Pattern

```python
import pytest
from rest_framework.test import APIClient
from django.urls import reverse

@pytest.mark.django_db
class TestYourModelAPI:
    def test_list(self, user_factory, your_model_factory):
        user = user_factory()
        obj = your_model_factory()

        client = APIClient()
        client.force_authenticate(user=user)
        response = client.get(reverse("your-model-list"))

        assert response.status_code == 200
```

### requests-mock for External APIs

```python
import pytest
import requests_mock

def test_external_api_call():
    with requests_mock.Mocker() as m:
        m.post(
            "https://api.external.com/endpoint",
            json={"status": "success"},
            status_code=200,
        )
        response = your_service.call_external_api()
        assert response["status"] == "success"
```

## Anti-patterns

### DON'T: Hard-delete objects -- use soft deletes

### DON'T: Skip queryset filtering

```python
# DON'T
class YourModelViewSet(viewsets.ModelViewSet):
    queryset = YourModel.objects.all()  # No filtering = data leak
```

```python
# DO
class YourModelViewSet(viewsets.ModelViewSet):
    queryset = YourModel.objects.all()

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.is_staff:
            return queryset
        return queryset.for_user(self.request.user)
```

### DON'T: Inline nested object creation

```python
# DON'T
class ParentSerializer(serializers.ModelSerializer):
    child = ChildSerializer()  # Tries to create/update child
```

```python
# DO
class ParentSerializer(serializers.ModelSerializer):
    child = serializers.PrimaryKeyRelatedField(queryset=Child.objects.all())
    child_name = serializers.CharField(source="child.name", read_only=True)
```

### DON'T: Use bare model instances in tests

```python
# DON'T
def test_example():
    user = User.objects.create(email="test@example.com")  # Fragile, verbose
```

```python
# DO
def test_example(user_factory):
    user = user_factory(email="test@example.com")  # Factory handles defaults
```

### DON'T: Bypass permissions in viewsets

```python
# DON'T
class YourModelViewSet(viewsets.ModelViewSet):
    permission_classes = []  # No authentication required
```

### DON'T: Return querysets from API endpoints

```python
# DON'T
@action(detail=False, methods=["get"])
def custom_list(self, request):
    queryset = YourModel.objects.all()
    return Response(queryset)  # Queryset is not serializable
```

```python
# DO
@action(detail=False, methods=["get"])
def custom_list(self, request):
    queryset = self.filter_queryset(self.get_queryset())
    serializer = self.get_serializer(queryset, many=True)
    return Response(serializer.data)
```

### DON'T: Forget select_related/prefetch_related for related objects

### DON'T: Use auto_now on timestamp fields -- inherit `AbstractBaseModel` instead
