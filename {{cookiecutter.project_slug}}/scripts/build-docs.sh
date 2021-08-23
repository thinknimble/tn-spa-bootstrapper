#!/bin/bash

#
# Generating {{cookiecutter.project_name}} Docs
#
pip install jotquote
sudo apt-get install python3-sphinx
pip install karma-sphinx-theme
make -C docs html