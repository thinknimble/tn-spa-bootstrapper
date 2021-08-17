from collections import namedtuple
from collections import OrderedDict

def namedtuplefetchall(cursor):
    "Return all rows from a cursor as a namedtuple"
    desc = cursor.description
    nt_result = namedtuple('Result', [col[0] for col in desc])
    return [nt_result(*row) for row in cursor.fetchall()]

def tuplefetchall(cursor,rename=False):
    "Return all rows from a cursor as a namedtuple"
    desc = cursor.description
    nt_result = namedtuple('Result', [col[0] for col in desc],rename=rename)
    return [nt_result(*row)._as_dict() for row in cursor.fetchall()]

def orderdDict(cursor):
    "Return all rows from a cursor as a order dict"
    desc = cursor.description
    keys = [col[0] for col in desc]
    return [OrderedDict(zip(keys,row)) for row in cursor.fetchall()]

def is_integer(n):
    try:
        float(n)
    except ValueError:
        return False
    else:
        return float(n).is_integer()

def injectSQLParam(p):
    if is_integer(p):
        return f"{p}"
    return f"'{p}'"