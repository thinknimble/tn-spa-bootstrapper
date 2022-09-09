import pytest

from my_project.utils.sites import get_site_url


@pytest.mark.parametrize(
    "custom_settings,expected_output",
    [
        ({"CURRENT_DOMAIN": "localhost", "CURRENT_PORT": 8080, "HEROKU_APP_NAME": None, "IN_DEV": True}, "http://localhost:8080"),
        ({"CURRENT_DOMAIN": "http://localhost/", "CURRENT_PORT": None, "HEROKU_APP_NAME": "", "IN_DEV": False}, "https://localhost"),
        ({"CURRENT_DOMAIN": "", "CURRENT_PORT": None, "HEROKU_APP_NAME": "example", "IN_DEV": False}, "https://example.herokuapp.com"),
    ],
)
def test_get_site_url(settings, custom_settings, expected_output):
    for key in custom_settings:
        settings.__setattr__(key, custom_settings[key])
    site_url = get_site_url()
    assert site_url == expected_output


@pytest.mark.parametrize(
    "custom_settings,expected_output",
    [
        ({"CURRENT_DOMAIN": None, "CURRENT_PORT": 8080, "HEROKU_APP_NAME": None, "IN_DEV": True}, "http://localhost:8080"),
        ({"CURRENT_DOMAIN": "", "CURRENT_PORT": None, "HEROKU_APP_NAME": "", "IN_DEV": False}, "https://example.herokuapp.com"),
    ],
)
def test_get_site_url_negative(settings, custom_settings, expected_output):
    for key in custom_settings:
        settings.__setattr__(key, custom_settings[key])
    with pytest.raises(Exception):
        get_site_url()
