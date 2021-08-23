#!/bin/bash

#
# {{cookiecutter.project_name}} necessary reqs
#

# gnome-terminal for running simultaneous scripts 
sudo apt-get install gnome-terminal
# sphinx for creating Docs
sudo apt-get install python3-sphinx
# nice looking sphinx template 
pip install karma-sphinx-theme
# some good luck qoute lib
pip install jotquote
# heroku cli 
curl https://cli-assets.heroku.com/install.sh | sh