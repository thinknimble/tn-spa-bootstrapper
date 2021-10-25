#!/bin/bash

#
# {{cookiecutter.project_name}} necessary reqs
#

function install_linux() {
    sudo apt-get install $1
}
function install_darwin() {
    brew install $1
}

function install_package() {
    if [[ "$OSTYPE" == "linux-gnu"* ]]; then
        install_linux $1
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        install_darwin $1
    elif [[ "$OSTYPE" == "win32" ]]; then
        echo "WIP"
    else
        echo "Unknown Operating System"
    fi
}

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    install_package gnome-terminal
    install_package python3-sphinx
    pip install karma-sphinx-theme
    pip install jotquote
elif [[ "$OSTYPE" == "darwin"* ]]; then
    #install_package sphinx-doc
    sudo pip install -U sphinx
    sudo pip install karma-sphinx-theme
    sudo pip install jotquote
elif [[ "$OSTYPE" == "win32" ]]; then
    echo "WIP"
else
    echo "Unknown Operating System"
fi

# heroku cli
which heroku
if ! [ "$?" ]; then
    curl https://cli-assets.heroku.com/install.sh | sh
fi
