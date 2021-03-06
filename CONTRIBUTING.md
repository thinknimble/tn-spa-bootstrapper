# How to Contribute

We are always happy to get issues identified and pull requests!

## Testing locally

Make sure to clean up your local DB between runs so you can test things as a fresh install:
```bash
sudo -u $(whoami) psql -c "DROP DATABASE <project_slug>_db;
sudo -u $(whoami) psql -c "DROP USER <project_slug>;"
```

You can run cookiecutter against the `main` branch on Github:

`cookiecutter https://github.com/thinknimble/tn-spa-bootstrapper.git`

You can run it against your own branch:

`cookiecutter https://github.com/thinknimble/tn-spa-bootstrapper.git --checkout my-branch-name`

You can run it against your locally cloned changes:

`cookiecutter tn-spa-bootstrapper/`

If you don't want to say "yes" to every prompt, you run:

`cookiecutter tn-spa-bootstrapper/ --no-input`

## Getting your pull request merged in

1. Keep it small. The smaller the pull request, the more likely I'll pull it in.
1. Pull requests that fix a current issue get priority for review.

## Testing

### Installation

Please install [`tox`], which is a generic virtualenv management and test command line tool.

[`tox`] is available for download from [`PyPI`] via [`pip`]:

```bash
pip install tox
```

It will automatically create a fresh virtual environment and install our test dependencies,
such as [`pytest-cookies`] and [`flake8`].

### Run the Tests

Tox uses py.test under the hood, hence it supports the same syntax for selecting tests.

For further information please consult the [`pytest usage docs`].

To run all tests using various versions of python in virtualenvs defined in tox.ini, just run tox.

```bash
tox
```

It is possible to test with a specific version of python. To do this, the command is:

```bash
tox -e py39
```

This will run py.test with the python3.9 interpreter, for example.

To run a particular test with tox for against your current Python version::

```bash
tox -e py -- -k test_default_configuration
```

[`pytest usage docs`]: https://pytest.org/latest/usage.html#specifying-tests-selecting-tests
[`tox`]: https://tox.readthedocs.io/en/latest/
[`pip`]: https://pypi.python.org/pypi/pip/
[`pytest-cookies`]: https://pypi.python.org/pypi/pytest-cookies/
[`flake8`]: https://pypi.python.org/pypi/flake8/
[`PyPI`]: https://pypi.python.org/pypi
