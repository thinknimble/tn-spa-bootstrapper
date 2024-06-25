# Factories go here
import factory

from .models import User


class UserFactory(factory.Factory):
    email = factory.faker.Faker("email")
    password = factory.PostGenerationMethodCall("set_password", "password")

    class Meta:
        model = User
