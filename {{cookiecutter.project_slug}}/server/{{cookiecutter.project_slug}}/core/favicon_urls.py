from django.conf import settings
from django.urls import path
from django.views.generic.base import RedirectView
from django.contrib.staticfiles.storage import staticfiles_storage

urlpatterns = []

# Only include the favicon urls if we are in a staging or production environment.
# Favicons are not needed in development, and this also prevents errors when running
# tests without having first built the front end app.
if settings.IN_STAGING or settings.IN_PROD:
    urlpatterns += [
        path(
            r"favicon.ico",
            RedirectView.as_view(url=staticfiles_storage.url("favicons/favicon.ico"), permanent=False),
            name="favicon",
        ),
        path(
            r"android-chrome-192x192.png",
            RedirectView.as_view(url=staticfiles_storage.url("favicons/android-chrome-192x192.png"), permanent=False),
            name="android-chrome-icon-192",
        ),
        path(
            r"android-chrome-512x512.png",
            RedirectView.as_view(url=staticfiles_storage.url("favicons/android-chrome-512x512.png"), permanent=False),
            name="android-chrome-icon-512",
        ),
        path(
            r"favicon-32x32.png",
            RedirectView.as_view(url=staticfiles_storage.url("favicons/favicon-32x32.png"), permanent=False),
            name="favicon-32",
        ),
        path(
            r"favicon-16x16.png",
            RedirectView.as_view(url=staticfiles_storage.url("favicons/favicon-16x16.png"), permanent=False),
            name="favicon-16",
        ),
        path(
            r"apple-touch-icon.png",
            RedirectView.as_view(url=staticfiles_storage.url("favicons/apple-touch-icon.png"), permanent=False),
            name="apple-touch-icon",
        ),
        path(
            r"mstile-150x150.png",
            RedirectView.as_view(url=staticfiles_storage.url("favicons/mstile-150x150.png"), permanent=False),
            name="mstile-icon",
        ),
        path(
            r"safari-pinned-tab.svg",
            RedirectView.as_view(url=staticfiles_storage.url("favicons/safari-pinned-tab.svg"), permanent=False),
            name="safari-pinned-tab",
        ),
    ]
