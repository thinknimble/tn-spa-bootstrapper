#!/bin/bash
echo "Running cookiecutter on the current directory; accepting all defaults"
git init
config_file=$(./scripts/vue_or_react.sh)
cookiecutter . --config-file $config_file --no-input -f
