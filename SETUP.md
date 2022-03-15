# Setup
### Bootstrapper post setup instructions

Once you've run cookiecutter and set up the bootstrapper, there are a few more steps you'll want to complete.


#### Setup Review Apps/Heroku

1. Create git repo
```bash
git init
git add .
git commit -m "first awesome commit"
git remote set-url origin git@github.com:thinknimble/the-rock.git
git push -u origin main 
```
- This should auto-deploy a review app to Heroku


1. Add the following config vars to your Heroku Pipeline (i.e., contains all your dynos):
    - `DJANGO_SUPERUSER_PASSWORD`
    - `NPM_PRIVATE_TOKEN`


1. Rollbar
    - Setup your project in the ThinkNimble Rollbar account
    - Follow the integration setup steps to validate your app
    - Add the `ROLLBAR_ACCESS_TOKEN` config var to your Heroku Pipeline.


1. Mailgun
    - TODO: do we have a TN account or should they make their own or the client?
    - Add the `MAILGUN_API_KEY` config var to your Heroku Pipeline.


1. Domain DNS pointed to Heroku with ACM turned on


#### Setup Staging
##### TODO

#### Setup Production
##### TODO
