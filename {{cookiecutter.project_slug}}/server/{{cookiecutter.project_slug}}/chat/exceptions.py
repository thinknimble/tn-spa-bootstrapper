import logging
from functools import wraps
from inspect import iscoroutinefunction

from channels.exceptions import AcceptConnection, DenyConnection, StopConsumer

logger = logging.getLogger(__name__)


class BadTemplateException(Exception):
    pass


def catch_exceptions(consumer_class):
    for method_name, method in list(consumer_class.__dict__.items()):
        if iscoroutinefunction(method):  # an async method
            # wrap the method with a decorator that propagate exceptions
            setattr(consumer_class, method_name, propagate_exceptions(method))
    return consumer_class


def propagate_exceptions(func):
    async def wrapper(*args, **kwargs):  # we're wrapping an async function
        try:
            return await func(*args, **kwargs)
        except (AcceptConnection, DenyConnection, StopConsumer):  # these are handled by channels
            raise
        except Exception as exception:  # any other exception
            # avoid logging the same exception multiple times
            if not getattr(exception, "caught", False):
                setattr(exception, "caught", True)
                logger.error(
                    "Exception occurred in {}:".format(func.__qualname__),
                    exc_info=exception,
                )
            raise  # propagate the exception

    return wraps(func)(wrapper)
