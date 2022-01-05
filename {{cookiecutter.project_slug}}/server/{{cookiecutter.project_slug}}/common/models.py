from django.db import models
from safedelete.models import SafeDeleteModel
from safedelete.models import SOFT_DELETE
import uuid


class AbstractBaseModel(SafeDeleteModel):
    """
    An abstract model with fields/properties that should belong to all our models.
    """
    _safedelete_policy = SOFT_DELETE

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    datetime_created = models.DateTimeField(auto_now_add=True)
    last_edited = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def __str__(self):
        return "ah yes"
