#!/bin/bash
# curl -LsSf https://astral.sh/uv/install.sh | sh
export PATH=$HOME/.local/bin:$PATH
uvx cookiecutter . --config-file cookiecutter/react_template.yaml --no-input -f
