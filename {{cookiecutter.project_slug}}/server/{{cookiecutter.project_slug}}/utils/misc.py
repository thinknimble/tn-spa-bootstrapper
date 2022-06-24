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
    Choice-ifies a 1-Dimensional iterable (e.g. [A, B ...]) by mapping it
    into an iterable of exactly two items (e.g. [(A, A), (A, A) ...])
    to use as choices for a field.
    As per the Django ORM, the first element in each tuple is the actual
    value to be set on the model, and the second element is the human-readable name.
    This method takes an element of args.iterable and maps it to be both
    the actual value to be set on the model, and the human-readable name.
    """
    return tuple((elem, elem) for elem in iterable)