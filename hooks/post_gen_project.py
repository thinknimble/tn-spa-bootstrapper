import secrets
from os import remove, rename
from os.path import exists, join
from shutil import copy2, move, rmtree

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


def get_random_secret_key():
    # Vendoring Django's get_random_secret_key() so users don't need to install it
    chars = "abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*(-_=+)"
    return "".join(secrets.choice(chars) for i in range(50))


def remove_client_files(client):
    rmtree(join("clients", client))

def move_client_to_root(client):
    if exists("client"):
        # We must be running as an update script
        rmtree("client")
    move(join("clients", client), join("client"))
    rmtree(join("clients"))
    env_path = join("client", ".env.local.example")
    if exists(env_path):
        rename(env_path, join("client", ".env.local"))


def set_flag(file_path, flag, value=None):
    value = value or get_random_secret_key()
    with open(file_path, "r+") as f:
        file_contents = f.read().replace(flag, value)
        f.seek(0)
        f.write(file_contents)
        f.truncate()


def set_django_secret_key(file_path, value):
    return set_flag(file_path, "!!!DJANGO_SECRET_KEY!!!", value=value)


def remove_graphql_files():
    file_names = [
        join("server/{{ cookiecutter.project_slug }}/core", "schema.py"),
        join("server/{{ cookiecutter.project_slug }}/core", "types.py"),
        join("server/{{ cookiecutter.project_slug }}/core", "mutations.py"),
        join("server/{{ cookiecutter.project_slug }}/core", "jwt_auth.py"),
    ]
    for file_name in file_names:
        if exists(file_name):
            remove(file_name)

def remove_rest_react_files():
    file_names = [
        join("client/src/services","axios-instance.ts"),
        join("client/src/services","auth.ts"),
    ]
    for file_name in file_names:
        if exists(file_name):
            remove(file_name)

def remove_gql_react_files():
    file_names = [
        join("client/src/utils","mutations.ts"),
        join("client/src/utils","queries.ts"),
        join("client/src/utils","get-cookie.js"),
        join("client/src/services","apollo-client.ts"),
    ]
    for file_name in file_names:
        if exists(file_name):
            remove(file_name)


def set_keys_in_envs():
    env_file_path = join(".env.example")
    pull_request_template_path = join(".github", "pull_request_template.md")
    cookie_cutter_settings_path = join("app.json")
    postgres_init_file = join("scripts/init-db.sh")
    django_secret_key = get_random_secret_key()
    set_django_secret_key(env_file_path, django_secret_key)
    set_django_secret_key(pull_request_template_path, django_secret_key)
    set_django_secret_key(cookie_cutter_settings_path, django_secret_key)
    secret = get_random_secret_key()
    set_flag(env_file_path, "!!!POSTGRES_PASSWORD!!!", value=secret)
    set_flag(postgres_init_file, "!!!POSTGRES_PASSWORD!!!", value=secret)
    copy2(env_file_path, join(".env"))
    cypress_example_file_dir = join("clients", "react")
    cypress_example_file = join(cypress_example_file_dir, "cypress.example.env.json")
    set_flag(cypress_example_file, "!!!POSTGRES_PASSWORD!!!", value=secret)
    copy2(cypress_example_file, join(cypress_example_file_dir, "cypress.env.json"))


def main():
    set_keys_in_envs()

    if "{{ cookiecutter.client_app }}".lower() == "none":
        rmtree("clients")
        remove(join("package.json"))
    elif "{{ cookiecutter.client_app }}".lower() == "vue3":
        remove_client_files("react")
        move_client_to_root("vue3")
    elif "{{ cookiecutter.client_app }}".lower() == "react":
        remove_client_files("vue3")
        move_client_to_root("react")
        if "{{ cookiecutter.use_graphql }}".lower() == "y":
            remove_rest_react_files()
        else:
            remove_gql_react_files()

    if "{{ cookiecutter.use_graphql }}".lower() == "n":
        remove_graphql_files()

    print_thankyou()
    print(f"\n{SUCCESS}Awesome! Project initialized...{END}\n")

    project_slug = "{{ cookiecutter.project_slug }}"
    print(f"{INFO}To install missing system requirements see {project_slug}/scripts/install-reqs.sh{END}")
    print(f"{INFO}To initialize the database see {project_slug}/scripts/init-db.sh{END}")
    print(f"{INFO}To initialize the app see {project_slug}/scripts/init-app.sh{END}")
    print(f"{INFO}To deploy on Heroku see {project_slug}/scripts/deploy-on-heroku.sh{END}")
    print(f"{INFO}To push the project to github {project_slug}/scripts/init-github.sh{END}")


if __name__ == "__main__":
    main()
