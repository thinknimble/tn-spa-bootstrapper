Thinknimble Cookiecutter (Django | Vue | React)
===============================================


Thinknimble Cookiecutter is a framework for jumpstarting
production-ready Django projects along side with client side SPA quickly.

Features
---------

* For Django 3.1
* Works with Python 3.9
* Renders Django projects with 100% starting test coverage
* Secure by default. We believe in SSL.
* Optimized development and production settings
* Comes with custom user model ready to go
* Optional basic ASGI setup for Websockets
* Optional basic Django channel setup for Websockets
* Optional client side applications Vue or React 
* Send emails via Anymail_ (using Mailgun_ by default or Amazon SES if AWS is selected cloud provider, but switchable)
* Media storage using Amazon S3 or Google Cloud Storage
* Procfile_ for deploying to Heroku
* Run tests with unittest or pytest
* Default integration with pre-commit_ for identifying simple issues before submission to code review

.. _`maintained Foundation fork`: https://github.com/Parbhat/cookiecutter-django-foundation


Optional Integrations
---------------------

*These features can be enabled during initial project setup.*

* Serve static files from Amazon S3, Google Cloud Storage or Whitenoise_
* Configuration for Celery_
* Integration with MailHog_ for local email testing
* Integration with Sentry_ for error logging
* Integration with Rollbar_ for error logging



.. _Procfile: https://devcenter.heroku.com/articles/procfile
.. _Mailgun: http://www.mailgun.com/
.. _Whitenoise: https://whitenoise.readthedocs.io/
.. _Celery: http://www.celeryproject.org/
.. _Anymail: https://github.com/anymail/django-anymail
.. _MailHog: https://github.com/mailhog/MailHog
.. _Sentry: https://sentry.io/welcome/
.. _Rollbar: https://docs.rollbar.com/docs
.. _pre-commit: https://github.com/pre-commit/pre-commit

Constraints
-----------

* Only maintained 3rd party libraries are used.
* Uses PostgreSQL everywhere
* Environment variables for configuration (This won't work with Apache/mod_wsgi).


Usage
------

Let's pretend you want to create a Django project called "therock". Rather than using ``startproject``
and then editing the results to include your name, email, and various configuration issues that always get forgotten until the worst possible moment, get cookiecutter to do all the work.

First, get Cookiecutter. Trust me, it's awesome::

    $ pip install cookiecutter

Now run it against this repo::

    $ cookiecutter git@github.com:thinknimble/tn-cookiecutter.git

You'll be prompted for some values. Provide them, then a Django project will be created for you.


Answer the prompts with your own desired options. For example::

    project_name [My Awesome Project]: The Rock
    project_slug [the_rock]: 
    description [Behold My Awesome Project!]: The rock project
    author_name [Moussa Mokhtari]: Moussa Mokhtari
    domain_name [example.com]: the-rock.com       
    year [2021]: 
    email [moussa-mokhtari@example.com]: moussa@the-rock.com
    version [1.0.0]: 
    timezone [UTC]: 
    Select cloud_provider:
    1 - AWS
    2 - GCP
    3 - None
    Choose from 1, 2, 3 [1]: 1
    Select mail_service:
    1 - Mailgun
    2 - Amazon SES
    3 - Mailjet
    4 - Mandrill
    5 - Postmark
    6 - Sendgrid
    7 - SendinBlue
    8 - SparkPost
    9 - Custom SMTP
    Choose from 1, 2, 3, 4, 5, 6, 7, 8, 9 [1]: 9
    use_heroku [y]: y
    use_mailhog [y]: y
    Select async:
    1 - Async
    2 - Django Channels
    3 - None
    Choose from 1, 2, 3 [1]: 2
    use_redis [y]: y
    use_whitenoise [y]: y
    use_celery [y]: y
    use_rollbar [y]: y
    use_sentry [n]: y
    use_swagger [y]: y
    use_stripe [n]: n
    Select ci_tool:
    1 - Bitbucket pipelines
    2 - None
    Choose from 1, 2 [1]: 1
    Select client_app:
    1 - Vue3
    2 - Vue2-ts
    3 - React
    4 - None
    Choose from 1, 2, 3, 4 [1]: 1
    create_db [y]: y
    deploy_to_heroku [y]: y
    [SUCCESS]: Project initialized, keep up the good work!


Enter the project and take a look around::

    $ cd the-rock/
    $ ls

Create a git repo and push it there::

    $ git init
    $ git add .
    $ git commit -m "first awesome commit"
    $ git remote add origin https://bitbucket.org/thinknimble/the-rock.git
    $ git push -u origin master

To run it locally::

    $ python manage.py makemigrations
    $ python manage.py migrate
    $ npm install --prefix client
    $ npm run build --prefix client
    $ ./runserver.sh

Now take a look at your repo. Don't forget to carefully look at the generated README. Awesome, right?
