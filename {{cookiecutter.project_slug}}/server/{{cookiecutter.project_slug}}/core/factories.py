# Factories go here
import factory

from .models import User


class UserFactory(factory.Factory):
    email = factory.faker.Faker("email")
    password = factory.PostGenerationMethodCall("set_password", "password")
    first_name = factory.faker.Faker("first_name")
    last_name = factory.faker.Faker("last_name")

    class Meta:
        model = User
