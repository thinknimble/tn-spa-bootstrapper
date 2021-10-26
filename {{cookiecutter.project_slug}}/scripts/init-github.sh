#!/bin/bash

#
# Creating {{cookiecutter.project_name}} git repo
# Pushing docs 
#
git init
git add .
git commit -m "Initial commit"
gh repo create {{cookiecutter.github_organization}}/{{cookiecutter.github_repo_name}} --private -y
git push origin master
printf "\033[0;32mRepo https://github.com/{{cookiecutter.github_organization}}/{{cookiecutter.github_repo_name}}/\033[0m \n"
