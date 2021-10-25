Getting Up and Running Locally
==============================

.. index:: pipenv, virtualenv, PostgreSQL


Setting Up Development Environment
----------------------------------

Make sure to have the following on your host:

* Python 3.9
* PostgreSQL_.
* Redis_, if using Celery_ or Django-Channels_

First things first.


#. Complete the required vars in .env file: ::

    $ .env

#. CD to {{cookiecutter.project_slug}}: ::

    $  cd {{cookiecutter.project_slug}}

#. Install pipenv: ::

    $  pip install pipenv

#. install and Start the virtualenv: ::

    $ pipenv install

#. Create a new PostgreSQL database using createdb_ or run the file init-db.sh in case you are on ubuntu: ::

    $ createdb {{cookiecutter.project_slug}}_db -U {{cookiecutter.project_slug}} --password !!!POSTGRES_PASSWORD!!! 
    or ::
    $ ./scripts/init-db.sh
    
   .. note::

       if this is the first time a database is created on your machine you might need an
       `initial PostgreSQL set up`_ to allow local connections & set a password for
       the ``postgres`` user. The `postgres documentation`_ explains the syntax of the config file
       that you need to change.


#. Make and Apply migrations: ::

    $ python server/manage.py makemigrations && python server/manage.py migrate

#. If you're running synchronously, see the application being served through Django development server: ::

    $ python server/manage.py runserver localhost:8080
    or use gunicorn::
    $ gunicorn -b $CURRENT_DOMAIN:$CURRENT_PORT --chdir=server {{ cookiecutter.project_slug }}.wsgi --log-file -

or if you're running asynchronously: ::

    $ gunicorn --chdir=server {{ cookiecutter.project_slug }}.asgi:application -k uvicorn.workers.UvicornWorker


or in the case you're running Django Channels: ::

    $ daphne -b $CURRENT_DOMAIN -p $CURRENT_PORT server.{{ cookiecutter.project_slug }}.asgi:application

note :: You can run all together via ::
    $ server/runserver.sh
 
Email Backend
----------------------------------


Console
~~~~~~~

.. note:: In development emails are dellivered over console 

``EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'``.

In production, we have Mailgun_ configured to have your back!

.. _Mailgun: https://www.mailgun.com/


{% if cookiecutter.use_celery == 'y' %}
Celery
------

If the project is configured to use Celery as a task scheduler then by default tasks are set to run on the main thread
when developing locally. If you have the appropriate setup on your local machine then set the following

in ``.env``::

    CELERY_TASK_ALWAYS_EAGER = False
    
To run Celery locally, make sure redis-server is installed (instructions are available at https://redis.io/topics/quickstart ) ,run the server in one terminal with redis-server, and then start celery in another terminal with the following command::
    
    celery -A {{cookiecutter.project_slug}}.celery_app worker --loglevel=info --workdir=server

{% endif %}

{% if cookiecutter.client_app.lower() != 'none' %}
Client application
---------------------------------

- Make sure that nodejs_ is installed. Then in the project root run::

    $ cd client
    $ npm install


- Now you just need::

    $ npm run build

- The client app will now be created you just need to run ``manage.py runserver localhost:8080`` and open the browser

- In case you just need to run the client app in hot-reloading mode::

    $ npm run serve

.. note:: If you made any changes to the client app, you have to rebuild it again in order for it to loaded::

    $ npm run build

{% endif %}


Summary
-------

Congratulations, you have made it! Keep on reading to unleash full potential of Thinknimble Cookiecutter.


.. _PostgreSQL: https://www.postgresql.org/download/
.. _Redis: https://redis.io/download
.. _createdb: https://www.postgresql.org/docs/current/static/app-createdb.html
.. _initial PostgreSQL set up: http://suite.opengeo.org/docs/latest/dataadmin/pgGettingStarted/firstconnect.html
.. _postgres documentation: https://www.postgresql.org/docs/current/static/auth-pg-hba-conf.html
.. _pre-commit: https://pre-commit.com/
.. _direnv: https://direnv.net/
.. _nodejs: http://nodejs.org/download/
.. _Django-Channels: https://channels.readthedocs.io/en/stable/
.. _Celery: https://docs.celeryproject.org/en/stable/