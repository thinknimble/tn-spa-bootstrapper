#!/bin/bash
export PATH=$HOME/.local/bin:$PATH  # uv and uvx are installed in this directory
uvx cookiecutter . --config-file cookiecutter/react_template.yaml --no-input -f
