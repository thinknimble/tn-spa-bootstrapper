#!/usr/bin/env python

import os
import sys

try:
    from setuptools import setup
except ImportError:
    from distutils.core import setup

# Our version ALWAYS matches the version of Django we support
# If Django has a new release, we branch, tag, then update this setting after the tag.
version = "1.2.0"

if sys.argv[-1] == "tag":
    os.system(f'git tag -a {version} -m "version {version}"')
    os.system("git push --tags")
    sys.exit()

with open("README.rst") as readme_file:
    long_description = readme_file.read()

setup(
    name="tn-spa-bootstrapper",
    version=version,
    description="A Cookiecutter template for creating customizable Django projects quickly with the option of adding client side application (Vue or React).",
    long_description=long_description,
    author="ThinkNimble",
    author_email="support@thinknimble.com",
    url="https://github.com/thinknimble/tn-spa-bootstrapper",
    packages=[],
    license="Proprietary",
    zip_safe=False,
    classifiers=[
        "Development Status :: 1 - Beta",
        "Environment :: Console",
        "Framework :: Django :: 3.0",
        "Client Framework :: Vue",
        "Intended Audience :: Thinknimble Developers",
        "Natural Language :: English",
        "License :: Proprietary License",
        "Programming Language :: Python",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: Implementation :: CPython",
        "Topic :: Software Development",
    ],
    keywords=(
        "cookiecutter, Python, projects, project templates, django, "
        "skeleton, scaffolding, project directory, setup.py, django+vue, django+react"
    ),
)
