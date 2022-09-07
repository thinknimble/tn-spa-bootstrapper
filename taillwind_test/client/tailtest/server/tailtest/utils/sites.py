from urllib.parse import urlparse

from django.conf import settings


def get_site_url():
    if not (settings.HEROKU_APP_NAME or settings.CURRENT_DOMAIN):
        raise Exception("Environment variable for either HEROKU_APP_NAME or CURRENT_DOMAIN must exist")
    domain = f"{settings.HEROKU_APP_NAME}.herokuapp.com" if settings.HEROKU_APP_NAME else settings.CURRENT_DOMAIN
    domain = domain.strip("/").split("/")[-1]
    scheme = "http://" if settings.IN_DEV else "https://"
    site_url = urlparse(f"{scheme}{domain}")
    if settings.CURRENT_PORT:
        netloc = site_url.netloc + f":{settings.CURRENT_PORT}"
        site_url = site_url._replace(netloc=netloc)
    return site_url.geturl()
