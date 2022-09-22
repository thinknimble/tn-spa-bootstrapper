#!/bin/bash

# cookiecutter tn-spa-bootstrapper --config-file tn-spa-bootstrapper/cookiecutter/vue_template.yaml --no-input
git fetch origin main
ts_count=$(git diff --name-only origin/main -- | grep "\.ts$" | wc -l)
tsx_count=$(git diff --name-only origin/main -- | grep "\.tsx$" | wc -l)
react_count=$(($ts_count + $tsx_count))
vue_count=$(git diff --name-only origin/main -- | grep "\.vue$" | wc -l)

if [ $react_count -gt $vue_count ]; then
  echo "cookiecutter/react_template.yaml"
else
  echo "cookiecutter/vue_template.yaml"
fi
