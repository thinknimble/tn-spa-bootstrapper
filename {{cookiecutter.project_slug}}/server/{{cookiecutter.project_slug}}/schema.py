import graphene
import graphql_jwt
from graphql_jwt.decorators import login_required

from .types import TalentType, UserType


class Query(graphene.ObjectType):
    me = graphene.Field(UserType)

class AuthMutation(graphene.ObjectType):
    create_user = CreateUser.Field()
    token_auth = ObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()

class Mutation(AuthMutation, graphene.ObjectType):
    pass

schema = graphene.Schema(query=Query, mutation=Mutation)
