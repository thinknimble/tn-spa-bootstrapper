Project Generation Options
==========================

project_name:
    Your project's human-readable name, capitals and spaces allowed.

project_slug:
    Your project's slug without dashes or spaces. Used to name your repo
    and in other places where a Python-importable version of your project name
    is needed.

description:
    Describes your project and gets used in places like ``README.rst`` and such.

author_name:
    This is you! The value goes into places like ``LICENSE`` and such.

email:
    The email address you want to identify yourself in the project.

domain_name:
    The domain name you plan to use for your project once it goes live.
    Note that it can be safely changed later on whenever you need to.

version:
    The version of the project at its inception.

timezone:
    The value to be used for the ``TIME_ZONE`` setting of the project.


cloud_provider:
    Select a cloud provider for static & media files. The choices are:

    1. AWS_
    2. GCP_
    3. None

    Note that if you choose no cloud provider, media files won't work.

mail_service:
    Select an email service that Django-Anymail provides

    1. Mailgun_
    2. `Amazon SES`_
    3. Mailjet_
    4. Mandrill_
    5. Postmark_
    6. SendGrid_
    7. SendinBlue_
    8. SparkPost_
    9. `Custom SMTP`_

async:
    Indicates which async method you like the project to use.


use_celery:
    Indicates whether the project should be configured to use Celery_.

use_mailhog:
    Indicates whether the project should be configured to use MailHog_.

use_sentry:
    Indicates whether the project should be configured to use Sentry_.

use_rollbar:
    Indicates whether the project should be configured to use Rollbar_.

use_whitenoise:
    Indicates whether the project should be configured to use WhiteNoise_.

use_heroku:
    Indicates whether the project should be configured so as to be deployable
    to Heroku_.

client_app:
    Indicates which client app (SPA) should the project use

create_db:
    Indicates whether to run the script that initiales the postgress db for you

ci_tool:
    Select a CI tool for running tests. The choices are:

    1. None
    2. `Bitbucket pipelines`_




.. _PostgreSQL: https://www.postgresql.org/docs/

.. _AWS: https://aws.amazon.com/s3/
.. _GCP: https://cloud.google.com/storage/

.. _Amazon SES: https://aws.amazon.com/ses/
.. _Mailgun: https://www.mailgun.com
.. _Mailjet: https://www.mailjet.com
.. _Mandrill: http://mandrill.com
.. _Postmark: https://postmarkapp.com
.. _SendGrid: https://sendgrid.com
.. _SendinBlue: https://www.sendinblue.com
.. _SparkPost: https://www.sparkpost.com
.. _Custom SMTP: Custom django SMTP

.. _Django Rest Framework: https://github.com/encode/django-rest-framework/


.. _Celery: https://github.com/celery/celery

.. _MailHog: https://github.com/mailhog/MailHog

.. _Sentry: https://github.com/getsentry/sentry

.. _WhiteNoise: https://github.com/evansd/whitenoise

.. _Heroku: https://github.com/heroku/heroku-buildpack-python

.. _Bitbucket pipelines: https://support.atlassian.com/bitbucket-cloud/docs/get-started-with-bitbucket-pipelines/
