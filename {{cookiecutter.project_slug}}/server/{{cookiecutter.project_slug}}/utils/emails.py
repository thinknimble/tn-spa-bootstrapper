import logging
import os
from email.mime.application import MIMEApplication
from io import StringIO

from django.conf import settings
from django.core.mail.message import EmailMultiAlternatives
from django.template.loader import render_to_string
from premailer import transform as inline_css

logger = logging.getLogger(__name__)


def log_email_details(html_text):
    if any(x in settings.EMAIL_BACKEND for x in ["console", "locmem"]):
        # Only true when running tests or in lower environments that don't email
        # Log URLs more clearing to help with debugging and automated tests
        for line in html_text.split("\n"):
            if "href" in line:
                url_path = line.split('href="')[1].split('"')[0]
                logger.info(f"Sending email with containing URL: '{url_path}'")


def get_html_body(template, context):
    # two steps:
    # Render the django jinja template to string with passed context
    # Use premailer to inline CSS styles for weird email clients
    return inline_css(render_to_string(template, context))


def send_html_email(subject, template, send_from, send_to, context={}, bcc_emails=[], files=[]):
    """Generic sender to build and send an HTML email with a plain-text fallback.

    Args:
        subject (str): Subject of the email.
        template (str): Path to the HTML template to use for this email. Use the Django
            template loader path.
        send_from (str): The email address of the sender.
        send_to (str or list of str): Email address(es) of recipients.
        context (dict, optional): Dictionary of context variables needed to render
            the HTML template. Defaults to an empty :obj:`dict`.
        bcc_emails (list of str, optional): List of email addresses to BCC
            on the email. Defaults to an empty :obj:`list`.
        files (list of str or tuple of (str, StringIO.OutputType), optional): Files to
            attach to the email. For flexibility, filenames or tuples of
            (filename, StringIO.OuputType)  are accepted. Defaults to empty `list`.

    Returns: None
    """

    # In non-prod environment, only send messages to valid testing domains
    # This avoids sending unnecessary emails
    # if (not settings.IN_PROD) and (settings.USE_CUSTOM_SMTP == "True"):
    #     for email in send_to:
    #         name, domain = email.split("@")
    #         valid_domains = settings.EMAIL_ALLOWED_DOMAINS.split(",")
    #         if domain not in valid_domains:
    #             return

    if not isinstance(send_to, (list, tuple, str)):
        raise Exception("send_to must be an instance of list, tuple, or str")

    if isinstance(send_to, str):
        send_to = [send_to]

    subject = "".join(subject.splitlines())

    # TODO: Generate plaintext version of the HTML email
    plaintext_body = f"This is an HTML email. If you can read this, then your email client does not support HTML emails. Please contact us at {settings.STAFF_EMAIL} to report the problem."  # noqa

    email = EmailMultiAlternatives(subject, plaintext_body, send_from, send_to, bcc_emails)
    html_text = get_html_body(template, context)
    email.attach_alternative(html_text, "text/html")

    # Handle file attachments
    for f in files or []:
        if isinstance(f, tuple):
            # Attach in-memory files with filename
            if isinstance(f[1], StringIO.OutputType):
                part = MIMEApplication(f[1].getvalue(), Name=f[0])
                part["Content-Disposition"] = 'attachment; filename="%s"' % f[0]
            else:
                # No other file type support -- only StringIO
                continue
        elif isinstance(f, str):
            # Read file and create attachment
            with open(f, "rb") as fil:
                part = MIMEApplication(fil.read(), Name=os.path.basename(f))
                part["Content-Disposition"] = 'attachment; filename="%s"' % os.path.basename(f)
        else:
            # Ignore list elements that are neither a tuple or string
            continue
        email.attach(part)

    email.send(fail_silently=False)
    log_email_details(html_text)
