{%- if cookiecutter.use_stripe == 'y' %}
from {{ cookiecutter.project_slug }}.core.data_parsers import StripePaymentMethodParser
import logging
import stripe
from rest_framework import exceptions


logger = logging.getLogger("{{ cookiecutter.project_name }}")

class _StripeApi:
    """
    Class to hold functions to interact with Stripe API
    """

    def get_card_token(self, card_data):
        card_token = stripe.Token.create(card=card_data)
        return card_token

    @staticmethod
    def get_user_payment_methods(user):
        """
        Returns a list of payment methods from stripe associated with the user
        """
        payment_methods = stripe.PaymentMethod.list(customer=user.stripe_customer_token, type="card")
        try:
            return payment_methods["data"]
        except stripe.error.InvalidRequestError as e:
            logger.exception(e)
            raise exceptions.ValidationError(detail=e)

    @staticmethod
    def get_user_stripe_details(user):
        """
        Returns a stripe customer for a given user
        # TODO: error handling
        """
        details = stripe.Customer.retrieve(user.stripe_customer_token)
        return details

    @staticmethod
    def update_card_billing_details(card_token, billing_data):
        """
        @param pm_token: Token representing the payment method to update
            ex. "pm_xxxxxxxxxxxxxxxxx"

        @param data: dictionary of billing details data to be updated on the source
            ex. "billing_details": {
                    "address": {
                      "city": null,
                      "country": null,
                      "line1": null,
                      "line2": null,
                      "postal_code": null,
                      "state": null
                    },
                    "email": null,
                    "name": null,
                    "phone": null
                  },
        """

        updated_card = stripe.PaymentMethod.modify(card_token, **billing_data)
        return updated_card

    @staticmethod
    def update_customer(customer_id, data):
        try:
            updated_customer = stripe.Customer.modify(customer_id, **data)
            return updated_customer
        except (stripe.error.InvalidRequestError, stripe.error.CardError) as e:
            logger.exception(e)
            raise exceptions.ValidationError(detail=e)

    @staticmethod
    def update_customer_payment_method(customer_id, pm_token):
        try:
            stripe.PaymentMethod.attach(pm_token, customer=customer_id)
            updated_customer = stripe.Customer.modify(
                customer_id, invoice_settings={"default_payment_method": pm_token}
            )
            return updated_customer
        except (stripe.error.InvalidRequestError, stripe.error.CardError) as e:
            logger.exception(e)
            raise exceptions.ValidationError(detail=e)


# Utils

def get_formatted_user_payment_methods(user):
    """Format Stripe PaymentMethods for front end data."""
    customer = StripeApi.get_user_stripe_details(user)
    default_payment_source = customer["invoice_settings"]["default_payment_method"]

    payment_methods = StripeApi.get_user_payment_methods(user)
    formatted_data = [StripePaymentMethodParser(pm).as_dict for pm in payment_methods]

    for card in formatted_data:
        if card["id"] == default_payment_source:
            card['is_primary']=True
        else:
            card['is_primary']=False

    return formatted_data



StripeApi = _StripeApi()

{%- endif %}