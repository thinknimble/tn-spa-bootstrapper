#!/bin/bash

#
# Creating taillwind_test git repo
#
git init
git add .
git commit -m "Initial commit"
# git remote add origin git@github.com:thinknimble/taillwind_test.git
gh repo create thinknimble/taillwind_test --private -y
git push origin main
printf "\033[0;32mRepo https://github.com/thinknimble/taillwind_test/\033[0m \n"
