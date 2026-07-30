# Factories go here
import factory
from django.contrib.auth.models import Group

from .models import User


class GroupFactory(factory.django.DjangoModelFactory):
    name = factory.Sequence(lambda n: f"Group {n}")

    class Meta:
        model = Group


class UserFactory(factory.django.DjangoModelFactory):
    email = factory.faker.Faker("email")
    password = factory.PostGenerationMethodCall("set_password", "password")
    first_name = factory.faker.Faker("first_name")
    last_name = factory.faker.Faker("last_name")
    is_staff = False
    is_superuser = False

    class Meta:
        model = User

    @factory.post_generation
    def groups(self, create, extracted, **kwargs):
        """Add groups to the user after creation."""
        if not create:
            return
        if extracted:
            # If groups are passed in, add them
            for group in extracted:
                self.groups.add(group)

    @classmethod
    def create_staff_user(cls, **kwargs):
        """Create a staff user with optional groups."""
        kwargs.setdefault("is_staff", True)
        return cls.create(**kwargs)

    @classmethod
    def create_superuser(cls, **kwargs):
        """Create a superuser with optional groups."""
        kwargs.setdefault("is_staff", True)
        kwargs.setdefault("is_superuser", True)
        return cls.create(**kwargs)
