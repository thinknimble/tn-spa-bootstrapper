#!/bin/bash

git fetch origin main
base=$(./scripts/mobile_diff_base.sh)
react_count=$(git diff --name-only "$base" HEAD -- | grep "/clients/web/react/" | wc -l)
rn_count=$(git diff --name-only "$base" HEAD -- | grep "/clients/mobile/react-native/" | wc -l)
config_file_path="cookiecutter/react_template.yaml"

if [ "$rn_count" != 0 ]; then
  cp -r resources/ {{cookiecutter.project_slug}}/resources/
  sed -i.bak 's/include_mobile: "n"/include_mobile: "y"/' $config_file_path
fi

echo $config_file_path
