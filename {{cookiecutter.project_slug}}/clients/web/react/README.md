# React

This project was created from [Vite](https://vitejs.dev) React's Typescript template.

## Summary

This app includes basic configurations for developers to have a starting point on new projects.

### Current stack

- Typescript
- React
- TailwindCss
{% if cookiecutter.use_graphql=='y' -%}
- Apollo
{% else -%}
- Axios
- Tanstack Query (server state management)
{% endif -%}
- React Router
- TN Forms
- Vitest
- React testing library
- Cypress

## Getting started

### Favicon Setup

The Django app is already configured to serve favorite icons for all browsers and platforms (include, for example, apple-icons and android-icons at various sizes). By default, this icon is the TN logo.

**_Note your image must be a square otherwise a white bg will appear because the file is cropped if it is not a square go to [iloveimg.com](https://www.iloveimg.com/resize-image) and resize it._**
Visit [favicon-generator.org](https://www.favicon-generator.org/) and upload a high resolution, square version of the image you would like to use as the favicon for this app.

Download the ZIP file of icons that the site generates for you and paste them in the `client/public/static/favicons/` directory.

When we run collectstatic the public folder is copied as is and enables serving of the favicons

### Logo Setup

Swap out the logo files in these locations:
`client/src/assets/logo.png` (Used by the webapp)
`server/{{ cookiecutter.project_slug }}/core/static/images/logo.png` (Used by HTML emails)

### Install deps

```
yarn
```

### Run locally

First, create .env.local at the top-level of the client directory, and copy the contents of .env.local.example into it. Update the value of VITE_DEV_BACKEND_URL to point to your desired backend.

Then run the project with:
```
yarn start
```

### Run Integration tests

Watch your tests with:

```
yarn test:watch
```

Or run them only once with:

```
yarn test
```

If you want to watch a single test you can specify its path as an argument to:

```
yarn test:single path/to/test/file
```

### Run e2e tests with Cypress

```
yarn cypress
```

Will open cypress wizard. Make sure you run your app locally with `yarn start` and them choose the test you want to run from the wizard.
