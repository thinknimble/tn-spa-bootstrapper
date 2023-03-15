#!/bin/bash

# cookiecutter tn-spa-bootstrapper --config-file tn-spa-bootstrapper/cookiecutter/vue_template.yaml --no-input
git fetch origin main
react_count=$(git diff --name-only origin/main -- | grep "/clients/web/react" | wc -l)
vue_count=$(git diff --name-only origin/main -- | grep "/clients/web/vue" | wc -l)

if [ $react_count -gt $vue_count ]; then
  echo "cookiecutter/react_template.yaml"
else
  echo "cookiecutter/vue_template.yaml"
fi
