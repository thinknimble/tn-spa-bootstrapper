#!/bin/bash

# cookiecutter tn-spa-bootstrapper --config-file tn-spa-bootstrapper/cookiecutter/vue_template.yaml --no-input
git fetch origin main
react_count=$(git diff --name-only origin/main -- | grep "/clients/web/react/" | wc -l)
vue_count=$(git diff --name-only origin/main -- | grep "/clients/web/vue3/" | wc -l)
rn_count=$(git diff --name-only origin/main -- | grep "/clients/mobile/react-native/" | wc -l)
config_file_path=""

if [ $react_count -gt $vue_count ]; then
  config_file_path="cookiecutter/react_template.yaml"
else
  config_file_path="cookiecutter/vue_template.yaml"
fi
ls -a cookiecutter/
if [ "$rn_count" != 0 ]; then 
  sed -i.bak 's/include_mobile: "n"/include_mobile: "y"/' $config_file_path
fi
echo $config_file_path