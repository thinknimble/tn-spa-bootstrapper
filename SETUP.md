# Setup
### Bootstrapper setup instructions

Once you've run cookiecutter and set up the bootstrapper, there are a few more steps you'll need to complete.


1. Add the following config vars to your Heroku Pipeline (i.e., contains all your dynos):
    - `DJANGO_SUPERUSER_PASSWORD`
    - `NPM_PRIVATE_TOKEN`

2. Domain DNS pointed to Heroku with ACM turned on

2. Mailgun
    - TODO: do we have a TN account or should they make their own or the client?
    - Add the `MAILGUN_API_KEY` config var to your Heroku Pipeline.

3. Rollbar
    - Setup your project in the ThinkNimble Rollbar account
    - Follow the integration setup steps to validate your app
    - Add the `ROLLBAR_ACCESS_TOKEN` config var to your Heroku Pipeline.