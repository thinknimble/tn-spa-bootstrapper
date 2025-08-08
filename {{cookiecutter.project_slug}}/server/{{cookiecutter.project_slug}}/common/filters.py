###
# A helper for comma separated filters
#
###

from django.db.models import Q
from django_filters import CharFilter


class MultiValueCharFilter(CharFilter):
    """
    Allows for multiple values separated by a separator.
    Returns a queryset that contains any of the values passed to the filter.
    The lookup expression can be customized.
    """

    def _get_operator(self, operator="OR"):
        """Returns the operator to use for combining Q objects."""
        if operator.upper() == "AND":
            return Q.AND
        return Q.OR

    def __init__(self, *args, **kwargs):
        self.separator = kwargs.pop("separator", ",")
        lookup_expression = kwargs.pop("lookup_expression", "icontains")
        kwargs["lookup_expr"] = lookup_expression
        self.operator = self._get_operator(kwargs.pop("operator", "OR"))
        super().__init__(*args, **kwargs)

    def filter(self, qs, value):
        if not value:
            return qs
        
        values = value.split(self.separator)
        if self.lookup_expr == "overlap":
            return qs.filter(Q(**{f"{self.field_name}__overlap": values}))
            
        q_objects = Q()
        for val in values:
            if self.operator == Q.AND:
                q_objects &= Q(**{f"{self.field_name}__{self.lookup_expr}": val})
            else:
                q_objects |= Q(**{f"{self.field_name}__{self.lookup_expr}": val})
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
