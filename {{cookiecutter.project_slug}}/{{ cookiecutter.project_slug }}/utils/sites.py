from django.conf import settings


def get_site_url():
    """Get the full base URL for this site based on settings."""
    protocol = "http" if settings.IN_DEV else "https"
    domain = settings.CURRENT_DOMAIN
    return "{0}://{1}{2}".format(
        protocol, domain, f":{settings.CURRENT_PORT}" if settings.CURRENT_PORT else ""
    )

def get_portal_url():
    """Get the full base URL for this site based on settings."""
    protocol = "http" if settings.IN_DEV else "https"
    domain = settings.CURRENT_DOMAIN
    if domain == "https://{{ cookiecutter.project_slug }}.herokuapp.com":
        return "https://revsetter-portal.herokuapp.com"
    else:
        return "{0}://{1}{2}".format(protocol, domain, f":8089")
