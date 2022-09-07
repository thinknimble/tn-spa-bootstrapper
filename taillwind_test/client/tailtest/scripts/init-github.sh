#!/bin/bash

#
# Creating tailtest git repo
#
git init
git add .
git commit -m "Initial commit"
# git remote add origin git@github.com:thinknimble/tailtest.git
gh repo create thinknimble/tailtest --private -y
git push origin main
printf "\033[0;32mRepo https://github.com/thinknimble/tailtest/\033[0m \n"
