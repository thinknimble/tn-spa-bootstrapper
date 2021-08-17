{%- if cookiecutter.use_stripe == 'y' %}
class StripePaymentMethodParser:
    """
    Class to format data structure and remove unnecessary fields of a payment method from stripe
    """

    def __init__(self, data):
        self.id = data.get("id")
        self.billing_address = data["billing_details"]["address"]
        self.brand = data["card"]["brand"]
        self.exp_month = data["card"]["exp_month"]
        self.exp_year = data["card"]["exp_year"]
        self.last4 = data["card"]["last4"]
        self.type = data["type"]

    @property
    def as_dict(self):
        return {
            "id": self.id,
            "billing_address": {
                "address1": self.billing_address["line1"],
                "address2": self.billing_address["line2"],
                "city": self.billing_address["city"],
                "province": self.billing_address["state"],
                "zipcode": self.billing_address["postal_code"],
            },
            "brand": self.brand,
            "exp_date": f"{self.exp_month}/{self.exp_year}",
            "last4": self.last4,
            "type": self.type,
        }
{%- endif %}