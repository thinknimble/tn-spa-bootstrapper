import logging

import rollbar
from django.conf import settings

logger = logging.getLogger(__name__)


def log_errors(fn):
    def wrapper(*args, **kwargs):
        try:
            return fn(*args, **kwargs)
        except Exception as e:
            logger.exception(f"Error in {fn.__name__}: {e}")
            if settings.USE_ROLLBAR:
                rollbar.report_exc_info()

    return wrapper