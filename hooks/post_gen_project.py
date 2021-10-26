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
import sys
import random
import shutil
import string
import subprocess
import platform

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


def remove_heroku_files():
    file_names = [
        os.path.join("Procfile"),
        os.path.join("runtime.txt"),
    ]
    for file_name in file_names:
        os.remove(file_name)


def remove_celery_files():
    file_names = [
        os.path.join("server/{{ cookiecutter.project_slug }}", "celery_app.py"),
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


def remove_asgi_file():
    file_names = [
        os.path.join("server/{{ cookiecutter.project_slug }}", "asgi.py"),
    ]
    for file_name in file_names:
        os.remove(file_name)


def remove_async_files():
    file_names = [
        os.path.join("server/{{ cookiecutter.project_slug }}", "websocket.py"),
    ]
    for file_name in file_names:
        os.remove(file_name)


def remove_channel_files():
    file_names = [
        os.path.join("server/{{ cookiecutter.project_slug }}", "routing.py"),
        os.path.join("server/{{ cookiecutter.project_slug }}", "consumers.py"),
    ]
    for file_name in file_names:
        os.remove(file_name)


def set_keys_in_envs():
    env_file_path = os.path.join(".env.example")
    postgres_init_file = os.path.join("scripts/init-db.sh")
    postgres_docs_init_file = os.path.join("docs/deployment-locally.rst")
    set_django_secret_key(env_file_path)

    secret = generate_random_string(
        length=50, using_digits=True, using_ascii_letters=True, using_punctuation=True
    )
    set_postgres_password(env_file_path, value=secret)
    set_postgres_password(postgres_init_file, value=secret)
    set_postgres_password(postgres_docs_init_file, value=secret)

    shutil.copy2(env_file_path, os.path.join(".env"))


def main():

    set_keys_in_envs()

    if "{{ cookiecutter.use_celery }}".lower() == "n":
        remove_celery_files()

    if "{{ cookiecutter.use_heroku }}".lower() == "n":
        remove_heroku_files()

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
        os.remove(os.path.join("package.json"))

    elif "{{ cookiecutter.client_app }}".lower() == "vue3":
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

    print(INFO + "Building docs:" + END)
    shellscript = subprocess.Popen(
        [
            os.path.join(
                "..", "{{ cookiecutter.project_slug }}", "scripts", "build-docs.sh"
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
        + "Awesome! Project initialized, press Enter to continue..."
        + END,end="  "
    )
    input()

    print("\n" + QUESTION + "Do you wanna create the database?(y/n) [n]" + END,end="  ")
    sys.stdout.flush()
    init_db = input()
    if init_db and init_db.lower() == "y":
        print(INFO + "Initializing Database" + END)
        shellscript = subprocess.Popen(
            [
                "/bin/bash",
                "-i",
                os.path.join(
                    "..", "{{ cookiecutter.project_slug }}", "scripts", "init-db.sh"
                ),
            ],
            stdin=subprocess.PIPE,
        )
        shellscript.wait()
        shellscript.stdin.close()

    if platform.system() != "Darwin":
        # Question
        print("\n"+QUESTION+"Do you wanna initialize the app (run migrations and install dependencies)?(y/n) [n]"+END,end="  ")
        sys.stdout.flush()
        init_app = input()
        if init_app and init_app.lower() == "y":
            print(
                INFO
                + "Opening another terminal to build and running locally:"
                + END
            )
            subprocess.Popen(
                [
                    "gnome-terminal",
                    "--tab",
                    "-t",
                    "{{ cookiecutter.project_name }} initialization",
                    "--",
                    os.path.join(
                        "..",
                        "{{ cookiecutter.project_slug }}",
                        "scripts",
                        "init-app.sh",
                    ),
                ],
                stdin=subprocess.PIPE,
            )
            shellscript.wait()
            shellscript.stdin.close()
        # Question
        print("\n" + QUESTION + "Do you wanna deploy on Heroku?(y/n) [n]" + END,end="  ")
        sys.stdout.flush()
        depoly_on_heroku = input()
        if depoly_on_heroku and depoly_on_heroku.lower() == "y":
            print(INFO + "Deploying on Heroku" + END)
            subprocess.call(
                [
                    os.path.join(
                        "..",
                        "{{ cookiecutter.project_slug }}",
                        "scripts",
                        "deploy-on-heroku.sh",
                    )
                ]
            )
        # Question
        print("\n" + QUESTION + "Do you wanna push the project to github?(y/n) [n]" + END,end="  ")
        sys.stdout.flush()
        init_git = input()
        if init_git and init_git.lower() == "y":
            shellscript = subprocess.Popen(
                [
                    "/bin/bash",
                    "-i",
                    os.path.join(
                        "..", "{{ cookiecutter.project_slug }}", "scripts", "init-github.sh"
                    ),
                ],
                stdin=subprocess.PIPE,
            )
        shellscript.wait()
        shellscript.stdin.close()
    else:
        init_app = ""
        while init_app is not None:
            print(
                "\n"
                + QUESTION
                + "Please selection and option ? [1,2,3]"
                + END
            )
            print(
                "\n"
                + INFO
                + "1.  Initialize the app locally (run migrations and install dependencies)"
                + END
            )
            print(
                "\n"
                + INFO
                + "2.  Deploy on Heroku"
                + END
            )
            print(
                "\n"
                + INFO
                + "3.  Push the project to github"
                + END
            )
            print(
                "\n"
                + INFO
                + "4.  Finish & Exit [Any Key]"
                + END
            )
            sys.stdout.flush()
            init_app = input()
            if init_app == "1":
                print(INFO + "Initialize the app " + END)
                subprocess.call(
                    [
                        os.path.join(
                            "..",
                            "{{ cookiecutter.project_slug }}",
                            "scripts",
                            "init-app.sh",
                        )
                    ]
                )
            elif init_app == "2":
                print(INFO + "Deploying on Heroku" + END)
                subprocess.call(
                    [
                        os.path.join(
                            "..",
                            "{{ cookiecutter.project_slug }}",
                            "scripts",
                            "deploy-on-heroku.sh",
                        )
                    ]
                )
            elif init_app == "3":
                print(INFO + "Push to Github" + END)
                subprocess.call(
                    [
                        os.path.join(
                            "..",
                            "{{ cookiecutter.project_slug }}",
                            "scripts",
                            "init-github.sh",
                        )
                    ]
                )
            else:
                break

    print_thankyou()
    print("")
    print(SUCCESS)
    subprocess.call(["jotquote"])
    print(END)


if __name__ == "__main__":
    main()
