import functools
import inspect
import logging

import rollbar
from background_task.tasks import Task
from django.conf import settings

logger = logging.getLogger(__name__)


def log_errors(fn):
    """
    Decorator to log errors and report to Rollbar.
    Works with both synchronous functions, async functions, and background tasks.
    """

    @functools.wraps(fn)
    def sync_wrapper(*args, **kwargs):
        try:
            # Check if this is a background task
            if isinstance(args[0], Task):
                # Background tasks pass the Task instance as first arg
                # Real args start from index 1
                return fn(*args[1:], **kwargs)
            return fn(*args, **kwargs)
        except Exception as e:
            logger.exception(f"Error in {fn.__name__}: {e}")
            if settings.ROLLBAR_ACCESS_TOKEN:
                rollbar.report_exc_info()
            # Re-raise the exception to ensure the task is marked as failed
            raise

    @functools.wraps(fn)
    async def async_wrapper(*args, **kwargs):
        try:
            return await fn(*args, **kwargs)
        except Exception as e:
            logger.exception(f"Error in async {fn.__name__}: {e}")
            if settings.ROLLBAR_ACCESS_TOKEN:
                rollbar.report_exc_info()
            # Re-raise the exception
            raise

    # Return appropriate wrapper based on whether fn is a coroutine function
    if inspect.iscoroutinefunction(fn):
        return async_wrapper
    return sync_wrapper
