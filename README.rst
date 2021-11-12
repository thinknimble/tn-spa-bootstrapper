Thinknimble Cookiecutter (Django | Vue )
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



.. _Procfile: https://devcenter.heroku.com/articles/procfile
.. _Mailgun: http://www.mailgun.com/
.. _Whitenoise: https://whitenoise.readthedocs.io/
.. _Anymail: https://github.com/anymail/django-anymail
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

First, get Cookiecutter::

    $ pip install cookiecutter

Now run it against this repo::

    $ cookiecutter git@github.com:thinknimble/tn-cookiecutter.git

You'll be prompted for some values. Provide them, then a Django project will be created for you.


Answer the prompts with your own desired options. For example::

    project_name [My Awesome Project]: The Rock
    project_slug [the_rock]: 
    Choose from 1, 2, 3 [1]: 1
    Select mail_service:
    1 - Mailgun
    2 - Amazon SES
    4 - Custom SMTP
    Choose from 1, 2, 3, 4, 5, 6, 7, 8, 9 [1]: 9
    Choose from 1, 2, 3 [1]: 2
    Choose from 1, 2 [1]: 1
    Select client_app:
    1 - Vue3
    2 - None
    Choose from 1, 2, 3, 4 [1]: 1
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

    $ python server/manage.py makemigrations && python server/manage.py migrate
    $ npm install --prefix client
    $ npm run build --prefix client
    $ server/runserver.sh

Now take a look at your repo. Don't forget to carefully look at the generated README. Awesome, right?
