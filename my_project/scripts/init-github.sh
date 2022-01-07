#!/bin/bash

#
# Creating my_project git repo
#
git init
git add .
git commit -m "Initial commit"
gh repo create thinknimble/my_project --private -y
git push origin main
printf "\033[0;32mRepo https://github.com/thinknimble/my_project/\033[0m \n"
