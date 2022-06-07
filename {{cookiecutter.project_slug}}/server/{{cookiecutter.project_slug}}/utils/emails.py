import os
from email.mime.application import MIMEApplication
from io import StringIO

from django.conf import settings
from django.core.mail.message import EmailMultiAlternatives
from django.template.loader import render_to_string


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

    assert isinstance(send_to, (list, tuple, str)), "send_to must be an instance of list, tuple, or str"

    if isinstance(send_to, str):
        send_to = [send_to]

    # Email subject *must not* contain newlines
    subject = "".join(subject.splitlines())

    # Render HTML and use premailer transform to force inline CSS
    html_body = render_to_string(template, context)

    # TODO: Generate plaintext version of the HTML email
    plaintext_body = (
        "This is an HTML email. If you can read this, then "
        "your email client does not support HTML emails. "
        "Please contact us at {0} to report the problem.".format(settings.STAFF_EMAIL)
    )
    # END TODO

    email = EmailMultiAlternatives(
        subject,
        plaintext_body,
        send_from,
        send_to,
        bcc_emails,
    )

    email.attach_alternative(html_body, "text/html")

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
