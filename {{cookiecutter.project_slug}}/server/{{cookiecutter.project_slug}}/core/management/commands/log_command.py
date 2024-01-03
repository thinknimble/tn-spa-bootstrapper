import logging

from decouple import config
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = "DELETE ME"

    def handle(self, *args, **kwargs):
        logger.info(f"Starting management command {__name__}")
        json_data = {
            "a": "foo",
            "b": 2,
            "c": [
                "a", "b", "c"
            ],
            "d": {
                "e": "aaaa",
                "f": 1234
            }
        }
        logger.info(json_data)
        logger.info(f"f-string version of the log: {json_data}")
        logger.info(".format version of the log: {}".format(json_data))
        logger.info("percent S version would be: %s" % str(json_data))
        try:
            raise Exception("something bad happened")
        except Exception as e:
            logger.error(e)
        logger.info('What about this: {"a": "foo"}')
        logger.info(f"Finished management command {__name__}")
