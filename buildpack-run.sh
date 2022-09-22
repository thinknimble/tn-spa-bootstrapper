#!/bin/bash
echo "Running cookiecutter on the current directory; accepting all defaults"
git init
config_file=$(./scripts/vue_or_react.sh)
cookiecutter . --config-file $config_file --no-input -f

# Instead....we should kill this file
# After that Cypress PR is merged, add the following:
# heroku config:set BUILDPACK_RUN='echo "Hello World"'
# Figure out the config file like we are doing for other github actions
# then just set that in Heroku so it knows what to use
# hmmm....race condition? will it get that step properly?
# meh....worst case the first build is wrong but all others wont be
