#!/bin/bash

cd /app

python3 manage.py migrate --no-input
# python3 manage.py create_test_data
