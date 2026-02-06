###
# A helper for comma separated filters
#
###

import uuid

from django.db.models import Q
from django_filters import CharFilter


class MultiValueCharFilter(CharFilter):
    """Allows for multiple values separated by commas. Returns a queryset that contains any of the values passed to the filter."""

    def _get_operator(self, operator="OR"):
        """Returns the operator to use for combining Q objects."""
        if operator.upper() == "AND":
            return Q.AND
        return Q.OR

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.operator = self._get_operator(kwargs.pop("operator", "OR"))

    def filter(self, qs, value):
        if not value:
            return qs
        values = value.split(",")
        has_null = "null" in values
        values = [v for v in values if v != "null"]
        q_objects = Q()

        for val in values:
            if self.operator == Q.AND:
                q_objects &= Q(**{f"{self.field_name}__icontains": val})
            else:
                q_objects |= Q(**{f"{self.field_name}__icontains": val})

        if has_null:
            if self.operator == Q.AND and values:
                q_objects &= Q(**{f"{self.field_name}__isnull": True})
            else:
                q_objects |= Q(**{f"{self.field_name}__isnull": True})

        return qs.filter(q_objects).distinct()


class MultiValueModelFilter(CharFilter):
    """Allows for multiple values separated by commas. Returns a queryset that contains any of the values passed to the filter."""

    def _get_operator(self, operator="OR"):
        """Returns the operator to use for combining Q objects."""
        if operator.upper() == "AND":
            return Q.AND
        return Q.OR

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.operator = self._get_operator(kwargs.pop("operator", "OR"))

    def filter(self, qs, value):
        if not value:
            return qs
        values = value.split(",")
        has_null = "null" in values
        values = [v for v in values if v != "null"]
        q_objects = Q()

        if values:
            if self.operator == Q.AND:
                q_objects &= Q(**{f"{self.field_name}__in": values})
            else:
                q_objects |= Q(**{f"{self.field_name}__in": values})

        if has_null:
            if self.operator == Q.AND and values:
                q_objects &= Q(**{f"{self.field_name}__isnull": True})
            else:
                q_objects |= Q(**{f"{self.field_name}__isnull": True})

        return qs.filter(q_objects).distinct()


class WorkstreamFilter(CharFilter):
    def filter(self, qs, value):
        if not value:
            return qs

        values = [v.strip() for v in value.split(",") if v.strip()]

        q_objects = Q()

        for val in values:
            try:
                uuid.UUID(val)
                q_objects |= Q(workstreams__id=val)
            except ValueError:
                q_objects |= Q(workstreams__name__icontains=val)

        if not q_objects:
            return qs.none()

        return qs.filter(q_objects).distinct()
