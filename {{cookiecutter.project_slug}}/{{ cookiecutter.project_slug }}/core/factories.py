import factory
from factory.django import DjangoModelFactory
from {{ cookiecutter.project_slug }}.core.models import User,Task
from {{ cookiecutter.project_slug }}.core.global_vars import TASK_STATUS


class UserFactory(DjangoModelFactory):
    class Meta:
        model = User

    first_name = factory.Faker('name')
    email = factory.LazyAttribute(lambda a: '{}.{}@{{ cookiecutter.domain_name }}'.format(a.first_name).lower())
    admin = False

class TaskFactory(DjangoModelFactory):
    class Meta:
        model = Task

    name = factory.Faker('job')
    description = factory.Faker('lorem')
    status = factory.Fasker.FuzzyChoice(TASK_STATUS)