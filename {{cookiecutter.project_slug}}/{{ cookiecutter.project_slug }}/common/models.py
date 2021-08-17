from django.db import models

import uuid

class AbstractBaseModel(models.Model):
    """
    An abstract model with fields/properties that should belong to all our models.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    datetime_created = models.DateTimeField(auto_now_add=True)
    last_edited = models.DateTimeField(auto_now=True)
    is_removed = models.BooleanField(default=False)


    class Meta:
        abstract = True

