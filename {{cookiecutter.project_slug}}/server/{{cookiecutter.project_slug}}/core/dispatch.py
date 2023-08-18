{%- if cookiecutter.include_mobile == 'y' %}
from django import dispatch

new_reset_password_code_created_ds = dispatch.Signal(providing_args=["code", "instance", "created"])
new_verification_code_created_ds = dispatch.Signal(providing_args=["code", "instance", "created"])
{%- endif %}