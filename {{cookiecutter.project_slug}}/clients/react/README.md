# React

Tn-spa-bootstrapper react client

## Developer setup

### Pre-requisites

For working in this client, you will probably need to modify the parent `package.json` at.

For the project to run properly remove the templating syntax:

```diff
{
  "scripts": {
-    {% if cookiecutter.client_app == 'React' %}
    "build": "cd client && npm install && npm run build"
-    {% else %}
    "postinstall": "cd client && npm install",
    "heroku-postbuild": "cd client && npm run heroku-postbuild"
-    {% endif %}
  },
  "engines": {
    "node": "16.*.*",
    "npm": "7.*.*"
  },
  "cacheDirectories": [
    "client/node_modules",
    ".cache/Cypress"
  ],
  "dependencies": {
  }
}
```

Do not commit this change.

### Install deps

```shell
npm ci
```

### Start client

```shell
npm start
```
