# add GraphQL mutations here
import graphene
from django.contrib.auth import get_user_model

from .types import UserType


class UserInput(graphene.InputObjectType):
    email = graphene.String(required=True)
    password = graphene.String(required=True)
    first_name = graphene.String(required=True)
    last_name = graphene.String(required=True)


class CreateUser(graphene.Mutation):
    class Arguments:
        data = UserInput(required=True)

    user = graphene.Field(UserType)

    def mutate(self, info, data):
        user = get_user_model().objects.create_user(**data)
        return CreateUser(user=user)
