###
# A helper for comma separated filters
#
###

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
        q_objects = Q()
        for val in values:
            if self.operator == Q.AND:
                q_objects &= Q(**{f"{self.field_name}__icontains": val})
            else:
                q_objects |= Q(**{f"{self.field_name}__icontains": val})
        return qs.filter(q_objects)


class MultiValueModelFilter(CharFilter):
    """Allows for multiple values separated by commas. Returns a queryset that contains any of the values passed to the filter."""

    def filter(self, qs, value):
        if not value:
            return qs
        values = value.split(",")
        q_objects = Q()
        q_objects |= Q(**{f"{self.field_name}__in": values})
        return qs.filter(q_objects)
