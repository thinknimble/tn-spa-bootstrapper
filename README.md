<p align="center">
  <a href="https://thinknimble.com">
    <kbd>
      <img src="https://images.squarespace-cdn.com/content/v1/5fa085940154ad57199d527c/e9075780-7f4f-47cf-abc3-147db5547c95/Group+1370+%281%29.png" alt="ThinkNimble Logo" width="300">
    </kbd>
  </a>
</p>

<h1 align="center">ThinkNimble Bootstrapper</h1>

<div align="center">

[![Build Status](https://github.com/thinknimble/tn-spa-bootstrapper/actions/workflows/pytest.yml/badge.svg)](https://github.com/thinknimble/tn-spa-bootstrapper/actions/workflows/pytest.yml)
[![Linting](https://github.com/thinknimble/tn-spa-bootstrapper/actions/workflows/linting.yml/badge.svg)](https://github.com/thinknimble/tn-spa-bootstrapper/actions/workflows/linting.yml)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-4.2-092E20)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6)](https://www.typescriptlang.org/)
[![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4)](https://tailwindcss.com/)

</div>

<p align="center">
  <b>Ship production-ready full-stack apps in minutes, not months</b>
</p>

<p align="center">
  The ThinkNimble Bootstrapper is a battle-tested cookiecutter template that generates a complete,<br>
  production-ready Django + React application with authentication, payments, email,<br>
  and deployment configurations—all following industry best practices.
</p>

---

## What You Get

<table>
<tr>
<td width="50%" valign="top">

### Backend (Django)
- **Django 4.2** with custom user model
- **Comprehensive test suite** included
- **API-first architecture** with Django REST Framework
- **Secure by default** - SSL, CORS, CSP headers configured
- **Email ready** - Mailgun, AWS SES, or SMTP
- **File storage** - S3, GCS, or local
- **Background tasks** with Celery (optional)
- **WebSockets** with Django Channels (optional)

</td>
<td width="50%" valign="top">

### Frontend (React)
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for lightning-fast builds
- **React Router** for navigation
- **API integration** with Axios
- **Form handling** with react-hook-form
- **State management** ready
- **Mobile responsive** from day one

</td>
</tr>
</table>

### Deploy Anywhere
- **Heroku** - Production-ready with Procfile included
- **Docker** - Fully containerized for any cloud platform
- **Flexible** - Deploy to AWS, Google Cloud, or any Docker-compatible host

### Enterprise-Ready
- Pre-commit hooks for code quality
- GitHub Actions CI/CD pipelines
- Error tracking with Rollbar/Sentry
- Performance monitoring
- GDPR compliance helpers
- Comprehensive documentation

---

## See It In Action

Check out a live deployment: **[Demo App](https://tn-spa-bootstrapper-staging.herokuapp.com/)**

---

## Why ThinkNimble?

**Stop reinventing the wheel.** Every new project shouldn't start from scratch. The ThinkNimble Bootstrapper gives you a production-quality foundation so you can focus on what makes your app unique.

- **Save weeks of setup time** - Authentication, payments, emails, deployment—it's all there
- **Best practices built-in** - 10+ years of production experience distilled into one template
- **Fully customizable** - Not a framework, just a starting point you own completely
- **Active community** - Regular updates and responsive support

---

## Quick Start

### Fastest Way - Using [tn-cli](https://github.com/thinknimble/tn-cli)

Get up and running in seconds with the ThinkNimble CLI:

```bash
# Install tn-cli (one-time setup)
curl -fsSL https://nimbl.sh/install | bash

# Create your project
tn new-project
# or use the alias
tn bootstrap
```

### Alternative - Using Cookiecutter Directly

First, install `pipx` if you don't have it ([installation guide](https://pipx.pypa.io/stable/installation/#installing-pipx)):

```bash
pipx install cookiecutter
pipx run cookiecutter gh:thinknimble/tn-spa-bootstrapper
```

## Features

### Authentication & User Management
- **Custom user model** with email-based authentication
- **Token-based authentication** using Django REST Framework
- **Password reset flows** with email verification
- **User registration** with email confirmation
- **User profile management** endpoints

### Developer Experience
- **Hot module reloading** for React development with Vite
- **Pre-configured linting** with Ruff for Python, ESLint and Prettier for JavaScript
- **Pre-commit hooks** for code quality enforcement
- **Test suite** with pytest for Django and testing setup for React
- **Type safety** with TypeScript for frontend
- **API documentation** with Swagger/OpenAPI via drf-spectacular
- **Docker development environment** with PostgreSQL and Redis

### Production Ready
- **Environment-based settings** for dev/staging/production
- **Security headers** configured (CORS, CSP, HSTS)
- **Error tracking** with Sentry integration (mobile) and Rollbar support
- **Comprehensive logging** configuration
- **Database migrations** with Django's migration system
- **Static file handling** with WhiteNoise
- **Email services** via Mailgun, AWS SES, or custom SMTP
- **File storage** with S3 or Google Cloud Storage support

### Built-in Features
- **WebSocket support** with Django Channels for real-time features
- **Redis integration** for caching and channel layers
- **GitHub Actions** workflows for CI/CD
- **Heroku deployment** configuration with Procfile
- **PostgreSQL** as default database
- **Mobile app support** with React Native template


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
