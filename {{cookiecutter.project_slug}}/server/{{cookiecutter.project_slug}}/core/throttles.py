from rest_framework.throttling import AnonRateThrottle


class ResetPasswordRequestLimit(AnonRateThrottle):
    rate = "5/hour"
    scope = "reset_password_request_code"


class ResetPasswordConfirmLimit(AnonRateThrottle):
    rate = "5/hour"
    scope = "reset_password_confirm"
