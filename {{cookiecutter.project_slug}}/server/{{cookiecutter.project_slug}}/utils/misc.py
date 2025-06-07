import random

from django.utils import timezone


def datetime_appended_filepath(instance, filename):
    """
    Appending datetime to filepath makes each filepath unique.
    This prevents users from overwriting each others' files.
    """
    extension = filename.split(".")[-1]
    original_name = filename.split(".")[:-1][0]
    time = str(timezone.now().isoformat())
    time = time.split(".")[0]  # Remove trailing tz info
    name = f"{original_name}_{time}.{extension}"
    return name


def as_choices(iterable):
    """
    Takes in an iterable such as a 1D List and maps it,
    such that each element of the original iterable is mapped
    to be both elements of a tuple.

    [A, B ...] is mapped to [(A, A), (B, B) ...]
    """
    return tuple((elem, elem) for elem in iterable)


def random_pin_generator(count=4):
    """
    Generates a random count digit pin code
    """
    num = ""
    for _ in range(1, count + 1):
        n = random.randint(0, 9)
        num += str(n)
    return num
