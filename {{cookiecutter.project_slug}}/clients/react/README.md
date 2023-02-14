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
