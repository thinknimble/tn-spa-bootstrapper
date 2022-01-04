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


END = "\x1b[0m"
QUESTION = "\x1b[0;36m [QUESTION]: "
INFO = "\x1b[1;33m [INFO]: "
HINT = "\x1b[3;33m"
SUCCESS = "\x1b[1;32m [SUCCESS]: "

DEBUG_VALUE = "debug"


def print_thankyou():
    print(
        HINT
        + """
    e/////////////////////////////////////////////////////////////////////////Cg
    r/////////////////////////////////////////////////////////////////////////nb
    y/////////////////////////////////////////////////////////////////////////eo
    l////////////////////////////////////,P,//////////////////////////////////vr
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
    b//////////////////////////////////////////////////////////////////////////a"""
        + END
    )


def remove_vue3_files():
    shutil.rmtree(os.path.join("clients", "vue3"))


def move_client_to_root(client):
    shutil.move(os.path.join("clients", client), os.path.join("client"))
    shutil.rmtree(os.path.join("clients"))


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
        "!!!DJANGO_SECRET_KEY!!!",
        length=64,
        using_digits=True,
        using_ascii_letters=True,
    )
    return django_secret_key


def generate_random_user():
    return generate_random_string(length=32, using_ascii_letters=True)


def generate_postgres_user(debug=False):
    return DEBUG_VALUE if debug else generate_random_user()


def set_postgres_password(file_path, value=None):

    postgres_password = set_flag(
        file_path,
        "!!!POSTGRES_PASSWORD!!!",
        value=value,
        length=64,
        using_digits=True,
        using_ascii_letters=True,
    )
    return postgres_password


def remove_github_folder():
    file_names = [
        os.path.join(".github"),
    ]
    for file_name in file_names:
        if os.path.exists(file_name):
            os.remove(file_name)


def set_keys_in_envs():
    env_file_path = os.path.join(".env.example")
    postgres_init_file = os.path.join("scripts/init-db.sh")
    set_django_secret_key(env_file_path)

    secret = generate_random_string(
        length=50, using_digits=True, using_ascii_letters=True, using_punctuation=True
    )
    set_postgres_password(env_file_path, value=secret)
    set_postgres_password(postgres_init_file, value=secret)

    shutil.copy2(env_file_path, os.path.join(".env"))


def main():

    set_keys_in_envs()

    if "{{ cookiecutter.client_app }}".lower() == "none":
        shutil.rmtree("clients")
        os.remove(os.path.join("package.json"))

    elif "{{ cookiecutter.client_app }}".lower() == "vue3":
        move_client_to_root("vue3")

    elif "{{ cookiecutter.client_app }}".lower().replace(" ", "") == "reactnative":
        remove_vue3_files()
        move_client_to_root("reactnative")

    elif "{{ cookiecutter.client_app }}".lower() == "hybrid":
        move_client_to_root("reactnative")
        move_client_to_root("vue3")



    print(INFO + "Installing necessary requirements:" + END)
    shellscript = subprocess.Popen(
        [
            os.path.join(
                "..", "{{ cookiecutter.project_slug }}", "scripts", "install-reqs.sh"
            )
        ],
        stdin=subprocess.PIPE,
    )
    shellscript.wait()
    shellscript.stdin.close()

    print_thankyou()
    print(
        "\n"
        + SUCCESS
        + "Awesome! Project initialized..."
        + END
        +"\n"
    )

    project_slug = "{{ cookiecutter.project_slug }}"
    print(f"{INFO}To initialize the database see {project_slug}/scripts/init-db.sh{END}")
    print(f"{INFO}To initialize the app see {project_slug}/scripts/init-app.sh{END}")
    print(f"{INFO}To deploy on Heroku see {project_slug}/scripts/deploy-on-heroku.sh{END}")
    print(f"{INFO}To push the project to github {project_slug}/scripts/init-github.sh{END}")


if __name__ == "__main__":
    main()
