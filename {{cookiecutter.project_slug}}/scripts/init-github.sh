#!/bin/bash

#
# Creating {{cookiecutter.project_slug}} git repo
#
git init
git add .
git commit -m "Initial commit"
gh repo create thinknimble/{{cookiecutter.project_slug}} --private -y
git push origin main
printf "\033[0;32mRepo https://github.com/thinknimble/{{cookiecutter.project_slug}}/\033[0m \n"
