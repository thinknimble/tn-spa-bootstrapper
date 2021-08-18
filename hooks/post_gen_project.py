"""
NOTE:
    the below code is to be maintained Python 2.x-compatible
    as the whole Cookiecutter Django project initialization
    can potentially be run in Python 2.x environment
    (at least so we presume in `pre_gen_project.py`).

TODO: ? restrict Cookiecutter Django project initialization to Python 3.x environments only
"""
from __future__ import print_function

import os
import random
import shutil
import string
import subprocess

try:
    # Inspired by
    # https://github.com/django/django/blob/master/django/utils/crypto.py
    random = random.SystemRandom()
    using_sysrandom = True
except NotImplementedError:
    using_sysrandom = False


TERMINATOR = "\x1b[0m"
WARNING = "\x1b[1;33m [WARNING]: "
INFO = "\x1b[1;33m [INFO]: "
HINT = "\x1b[3;33m"
SUCCESS = "\x1b[1;32m [SUCCESS]: "

DEBUG_VALUE = "debug"


def print_thankyou():
    print(HINT+"""
    e//////////////////////////////////////////////////////////////////////////g
    r//////////////////////////////////////////////////////////////////////////b
    y//////////////////////////////////////////////////////////////////////////o
    l////////////////////////////////////,P,///////////////////////////////////r
    G///////////////////////////////////,   ,//////////////////////////////////e
    q/////////////////////////////////*      ./////////////////////////////////r
    e////////////////////////////////          ,///////////////////////////////z
    n//////////////////////////////.             */////////////////////////////r
    j////////////////////////////*                 ////////////////////////////z
    q///////////////////////////.                   *//////////////////////////o
    R//////////////////////////                       /////////////////////////r
    a////////////////////////,                         *///////////////////////e
    n///////////////////////.                           .//////////////////////r
    l//////////////////////                               /////////////////////q
    E/////////////////////               2                 ////////////////////Z
    u////////////////////              .////                ///////////////////b
    n///////////////////              ///////                //////////////////h
    r//////////////////.            ,//////////               /////////////////f
    h/////////////////*             ////////////              *////////////////f
    F/////////////////             //////////////              ////////////////n
    n////////////////*            ////////////////             *///////////////J
    l////////////////*           //////////////////            *///////////////v
    n/////////////////          ////////////////////           ////////////////y
    Z/////////////////*        *////////////////////*         *////////////////y
    y//////////////////*       .////////////////////.        */////////////////v
    r/////////////////////.      *////////////////*        ////////////////////n
    v////////////////////////*.       .,,**,,.        .*///////////////////////z
    a//////////////////////////////////////////////////////////////////////////O
    n///////////////////// Made with love at Thinknimble //////////////////////e
    Q//////////////////////////////////////////////////////////////////////////h
    b//////////////////////////////////////////////////////////////////////////a"""+TERMINATOR)
    
def remove_vue2ts_files():
    shutil.rmtree(os.path.join("clients","vue2-ts"))
def remove_vue3_files():
    shutil.rmtree(os.path.join("clients","vue3"))
def remove_react_files():
    shutil.rmtree(os.path.join("clients","react"))



def move_client_to_root(client):
    shutil.move(os.path.join("clients", client),os.path.join("client"))
    shutil.rmtree(os.path.join("clients"))

def remove_heroku_files():
    file_names = [
        os.path.join("{{ cookiecutter.project_slug }}", "Procfile"),
        os.path.join("{{ cookiecutter.project_slug }}", "runtime.txt"),
    ]
    for file_name in file_names:
        os.remove(file_name)
def remove_celery_files():
    file_names = [
        os.path.join("{{ cookiecutter.project_slug }}", "celery_app.py"),
    ]
    for file_name in file_names:
        os.remove(file_name)





def generate_random_string(
    length, using_digits=False, using_ascii_letters=False, using_punctuation=False
):
    """
    Example:
        opting out for 50 symbol-long, [a-z][A-Z][0-9] string
        would yield log_2((26+26+50)^50) ~= 334 bit strength.
    """
    if not using_sysrandom:
        return None

    symbols = []
    if using_digits:
        symbols += string.digits
    if using_ascii_letters:
        symbols += string.ascii_letters
    if using_punctuation:
        all_punctuation = set(string.punctuation)
        # These symbols can cause issues in environment variables
        unsuitable = {"'", '"', "\\", "$"}
        suitable = all_punctuation.difference(unsuitable)
        symbols += "".join(suitable)
    return "".join([random.choice(symbols) for _ in range(length)])


def set_flag(file_path, flag, value=None, formatted=None, *args, **kwargs):
    if value is None:
        random_string = generate_random_string(*args, **kwargs)
        if random_string is None:
            print(
                "We couldn't find a secure pseudo-random number generator on your system. "
                "Please, make sure to manually {} later.".format(flag)
            )
            random_string = flag
        if formatted is not None:
            random_string = formatted.format(random_string)
        value = random_string

    with open(file_path, "r+") as f:
        file_contents = f.read().replace(flag, value)
        f.seek(0)
        f.write(file_contents)
        f.truncate()

    return value


def set_django_secret_key(file_path):
    django_secret_key = set_flag(
        file_path,
        "!!!SET DJANGO_SECRET_KEY!!!",
        length=64,
        using_digits=True,
        using_ascii_letters=True,
    )
    return django_secret_key



def generate_random_user():
    return generate_random_string(length=32, using_ascii_letters=True)


def generate_postgres_user(debug=False):
    return DEBUG_VALUE if debug else generate_random_user()


def set_postgres_user(file_path, value):
    postgres_user = set_flag(file_path, "!!!SET POSTGRES_USER!!!",length=32, value=value,using_ascii_letters=True,)
    return postgres_user


def set_postgres_password(file_path, value=None):

    postgres_password = set_flag(
        file_path,
        "!!!SET POSTGRES_PASSWORD!!!",
        value=value,
        length=64,
        using_digits=True,
        using_ascii_letters=True,
    )
    return postgres_password


def remove_bitbucket_file():
    file_names = [
        os.path.join("bitbucket-pipelines.yml"),
    ]
    for file_name in file_names:
        os.remove(file_name)
def remove_asgi_file():
    file_names = [
        os.path.join("{{ cookiecutter.project_slug }}", "asgi.py"),
    ]
    for file_name in file_names:
        os.remove(file_name)

def remove_async_files():
    file_names = [
        os.path.join("{{ cookiecutter.project_slug }}", "websocket.py"),
    ]
    for file_name in file_names:
        os.remove(file_name)

def remove_channel_files():
    file_names = [
        os.path.join("{{ cookiecutter.project_slug }}", "routing.py"),
        os.path.join("{{ cookiecutter.project_slug }}", "consumers.py"),
    ]
    for file_name in file_names:
        os.remove(file_name)

def set_keys_in_envs():
    envs_path = os.path.join(".env.example")
    postgres_init_file = os.path.join("install-ubuntu.sh")
    set_django_secret_key(envs_path)

    secret = generate_random_string(length=50,using_digits=True, using_ascii_letters=True, using_punctuation=True)
    set_postgres_password(envs_path, value=secret)
    set_postgres_password(postgres_init_file, value=secret)
    shutil.copy2(envs_path,os.path.join(".env"))



def main():

    set_keys_in_envs()


    if "{{ cookiecutter.use_celery }}".lower() == "n":
        remove_celery_files()

    if "{{ cookiecutter.use_heroku }}".lower() == "n":
        remove_heroku_files()

    if "{{ cookiecutter.ci_tool }}".lower() == "none":
        remove_bitbucket_file()
    
    if "{{ cookiecutter.async }}".lower() == "none":
        remove_asgi_file()
        remove_async_files()
        remove_channel_files()

    if "{{ cookiecutter.async }}".lower() == "django channels":
        remove_async_files()

    if "{{ cookiecutter.async }}".lower() == "async":
        remove_channel_files()
    
    if "{{ cookiecutter.client_app }}".lower() == "none":
        shutil.rmtree("clients")

    elif "{{ cookiecutter.client_app }}".lower() == "vue2-ts":
        remove_vue3_files()
        remove_react_files()
        move_client_to_root('vue2-ts')

    elif "{{ cookiecutter.client_app }}".lower() == "vue3":
        remove_vue2ts_files()
        remove_react_files()
        move_client_to_root('vue3')

    elif "{{ cookiecutter.client_app }}".lower() == "react":
        remove_vue2ts_files()
        remove_vue3_files()
        move_client_to_root('react')


    
    if "{{ cookiecutter.create_db }}".lower() == "y":
        print(INFO + "Creating DB and User : " + TERMINATOR)
        shellscript = subprocess.Popen([os.path.join("..","{{ cookiecutter.project_slug }}", "install-ubuntu.sh"),], stdin=subprocess.PIPE)
        shellscript.stdin.close()
        shellscript.wait()
        print(SUCCESS + "Awesome! Project initialized, to get started run the following:" + TERMINATOR)
        print(HINT + "$ cd {{ cookiecutter.project_slug }}" + TERMINATOR)
        print(HINT + "$ pipenv install && pipenv shell" + TERMINATOR)
        print(HINT + "$ python manage migrate" + TERMINATOR)
        if "{{ cookiecutter.client_app }}".lower() != "none":
            print(HINT + "$ cd client && npm install && npm build" + TERMINATOR)
            print(HINT + "$ cd .. && ./runserver.sh" + TERMINATOR)
        else:
            print(HINT + "$ ./runserver.sh" + TERMINATOR)
        print_thankyou()
    else:
        print(SUCCESS + "Project initialized, keep up the good work!" + TERMINATOR)
        print(HINT + "$ cd {{ cookiecutter.project_slug }}" + TERMINATOR)
        print(HINT + "$ ./install-ubuntu.sh to initialized the DB" + TERMINATOR)
        print(HINT + "$ pipenv install && pipenv shell" + TERMINATOR)
        if "{{ cookiecutter.client_app }}".lower() != "none":
            print(HINT + "$ cd client && npm install" + TERMINATOR)
            print(HINT + "$ cd .. && ./runserver.sh" + TERMINATOR)
        else:
            print(HINT + "$ ./runserver.sh" + TERMINATOR)
        print_thankyou()
    
if __name__ == "__main__":
    main()
