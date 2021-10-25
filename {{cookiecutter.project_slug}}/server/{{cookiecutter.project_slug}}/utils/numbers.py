from decimal import (
    Decimal,
    ROUND_DOWN,
)


def round_decimal(value, quantize=".01"):
    """"""
    if value is not None:
        return Decimal(value).quantize(Decimal(quantize), rounding=ROUND_DOWN)
