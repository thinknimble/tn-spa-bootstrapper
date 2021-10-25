.. _testing:

Type checks
-----------

Running type checks with mypy:

::

  $ mypy {{cookiecutter.project_slug}}

Test coverage
-------------

To run the tests, check your test coverage, and generate an HTML coverage report::

    $ coverage run -m pytest
    $ coverage html
    $ open htmlcov/index.html

Running tests with py.test
~~~~~~~~~~~~~~~~~~~~~~~~~~

::

  $ pytest


{%- if cookiecutter.use_sentry == "y" %}

Test coverage
-------------

Sentry
^^^^^^

Sentry is an error logging aggregator service. You can sign up for a free account at  https://sentry.io/signup/  or download and host it yourself.
The system is setup with reasonable defaults, including 404 logging and integration with the WSGI application.

You must set the DSN url in production.
{%- endif %}

{%- if cookiecutter.use_rollbar == "y" %}

Test coverage
-------------

Rollbar
^^^^^^^

Rollbar is an error logging aggregator service. You can sign up for a free account at  https://sentry.io/signup/  or download and host it yourself.
The system is setup with reasonable defaults, including 404 logging and integration with the WSGI application.

You must set the DSN url in production.
{%- endif %}