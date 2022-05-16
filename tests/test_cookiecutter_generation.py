import os
import re

import pytest
import sh
from binaryornot.check import is_binary
from cookiecutter.exceptions import FailedHookException

PATTERN = r"{{(\s?cookiecutter)[.](.*?)}}"
RE_OBJ = re.compile(PATTERN)


@pytest.fixture
def context():
    return {
        "project_name": "My Test Project",
        "project_slug": "my_test_project",
        "author_name": "Test Author",
        "email": "test@example.com",
        "description": "A short description of the project.",
        "domain_name": "example.com",
        "version": "0.1.0",
        "timezone": "UTC",
        "client+app": "Vue3",
    }


SUPPORTED_COMBINATIONS = [
    {"client_app": "Vue3"},
    {"client_app": "None"},
    {"mail_service": "Mailgun"},
    {"mail_service": "Amazon SES"},
    {"mail_service": "Custom SMTP"},
]
UNSUPPORTED_COMBINATIONS = []


def _fixture_id(ctx):
    """Helper to get a user friendly test name from the parametrized context."""
    return "-".join(f"{key}:{value}" for key, value in ctx.items())


def build_files_list(root_dir):
    """Build a list containing absolute paths to the generated files."""
    return [os.path.join(dirpath, file_path) for dirpath, subdirs, files in os.walk(root_dir) for file_path in files]


def check_paths(paths):
    """Method to check all paths have correct substitutions."""
    # Assert that no match is found in any of the files
    for path in paths:
        if is_binary(path):
            continue

        for line in open(path, "r"):
            match = RE_OBJ.search(line)
            assert match is None, f"cookiecutter variable not replaced in {path}"


@pytest.mark.parametrize("context_override", SUPPORTED_COMBINATIONS, ids=_fixture_id)
def test_project_generation(cookies, context, context_override):
    """Test that project is generated and fully rendered."""
    result = cookies.bake(extra_context={**context, **context_override})

    if result.exit_code != 0:
        raise result.exception

    assert result.exception is None
    assert result.project_path.name == context["project_slug"]
    assert result.project_path.is_dir()

    paths = build_files_list(str(result.project_path))
    assert paths
    check_paths(paths)


#
# TODO: Create a separate branch to clean up flake8 and black linting errors globally and then
#       re-enable these tests.
#
# @pytest.mark.parametrize("context_override", SUPPORTED_COMBINATIONS, ids=_fixture_id)
# def test_flake8_passes(cookies, context_override):
#     """Generated project should pass flake8."""
#     result = cookies.bake(extra_context=context_override)

#     if result.exit_code != 0:
#         raise result.exception

#     try:
#         sh.flake8(_cwd=str(result.project_path))
#     except sh.ErrorReturnCode as e:
#         pytest.fail(e.stdout.decode())


# @pytest.mark.parametrize("context_override", SUPPORTED_COMBINATIONS, ids=_fixture_id)
# def test_black_passes(cookies, context_override):
#     """Generated project should pass black."""
#     result = cookies.bake(extra_context=context_override)

#     try:
#         sh.black(
#             "--check", "--diff", "--exclude", "migrations", _cwd=str(result.project)
#         )
#     except sh.ErrorReturnCode as e:
#         pytest.fail(e.stdout.decode())
# END TODO


@pytest.mark.parametrize("slug", ["project slug", "Project_Slug"])
def test_invalid_slug(cookies, context, slug):
    """Invalid slug should failed pre-generation hook."""
    context.update({"project_slug": slug})

    result = cookies.bake(extra_context=context)

    assert result.exit_code != 0
    assert isinstance(result.exception, FailedHookException)


@pytest.mark.parametrize("invalid_context", UNSUPPORTED_COMBINATIONS)
def test_error_if_incompatible(cookies, context, invalid_context):
    """It should not generate project an incompatible combination is selected."""
    context.update(invalid_context)
    result = cookies.bake(extra_context=context)

    assert result.exit_code != 0
    assert isinstance(result.exception, FailedHookException)
