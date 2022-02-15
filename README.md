# Thinknimble SPA Bootstrapper (Django | Vue | React)

Thinknimble Cookiecutter is a framework for jumpstarting production-ready Django projects along side with client side SPA quickly.

## Quick Start

First, get cookiecutter:

```bash
python3 -m pip install cookiecutter
```

Now run it against this repo:

```bash
cookiecutter git@github.com:thinknimble/tn-spa-bootstrapper.git
```

## Features

See: [Maintained Foundation fork]

 - For Django 3.1
 - Uses Python 3.9 by default
 - Renders Django projects with 100% starting test coverage
 - Secure by default. We believe in SSL.
 - Optimized development and production settings
 - Comes with custom user model ready to go
 - Optional basic ASGI setup for Websockets
 - Optional basic Django channel setup for Websockets
 - Optional client side applications Vue or React 
 - Send emails using [Mailgun] by default or Amazon SES if AWS is selected cloud provider.
 - Media storage using Amazon S3 or Google Cloud Storage
 - [Procfile] for deploying to Heroku
 - Run tests with unittest or pytest
 - Default integration with [pre-commit] for identifying simple issues before submission to code review

## Optional Integrations

These features can be enabled after initial project setup:

 - Serve static files from Amazon S3 or Whitenoise
 - Integration with [MailHog] for local email testing
 - Integration with [Rollbar] for error logging

## Usage

Let's pretend you want to create a Django project called "therock". Rather than using `startproject` and then editing the results to include your name, email, and various configuration issues that always get forgotten until the worst possible moment, get cookiecutter to do all the work.

Follow the Quick Start above.

You'll be prompted for some values. Provide them, then a Django project will be created for you.

Answer the prompts with your own desired options. For example:

    project_name [My Project]: The Rock
    author_name [ThinkNimble]: Test Author
    email [hello@thinknimble.com]: test@thinknimble.com
    project_slug [the_rock]:
    Select mail_service:
    1 - Mailgun
    2 - Amazon SES
    3 - Custom SMTP
    Choose from 1, 2, 3 [1]: 1
    Select client_app:
    1 - Vue3
    2 - None
    Choose from 1, 2 [1]: 1
    Error: "my_project" directory already exists
    william@Williams-MacBook-Pro thinknimble % rm -rf my_project 
    william@Williams-MacBook-Pro thinknimble % cookiecutter git@github.com:thinknimble/tn-spa-cookiecutter.git --checkout cleanup
    You've downloaded /Users/william/.cookiecutters/tn-spa-cookiecutter before. Is it okay to delete and re-download it? [yes]: 
    project_name [My Project]: 
    author_name [ThinkNimble]: 
    email [hello@thinknimble.com]: 
    project_slug [my_project]: 
    Select mail_service:
    1 - Mailgun
    2 - Amazon SES
    3 - Custom SMTP
    Choose from 1, 2, 3 [1]: 
    Select client_app:
    1 - Vue3
    2 - None
    Choose from 1, 2 [1]: 

Create a git repo and push it there::

```bash
git init
git add .
git commit -m "first awesome commit"
git remote set-url origin git@github.com:thinknimble/the-rock.git
git push -u origin main 
```

Now take a look at your repo. Don't forget to carefully look at the generated README. Awesome, right?

## Want to Help Us Improve the Bootstrapper?

See the [CONTRIBUTING] file for information about reporting issues, setting up your dev environment, running tests, and making pull requests.

[CONTRIBUTING]: ./CONTRIBUTING.md
[Procfile]: https://devcenter.heroku.com/articles/procfile
[Mailgun]: http://www.mailgun.com/
[Whitenoise]: https://whitenoise.readthedocs.io/
[MailHog]: https://github.com/mailhog/MailHog
[Rollbar]: https://docs.rollbar.com/docs
[pre-commit]: https://github.com/pre-commit/pre-commit
[Maintained Foundation Fork]: https://github.com/Parbhat/cookiecutter-django-foundation
