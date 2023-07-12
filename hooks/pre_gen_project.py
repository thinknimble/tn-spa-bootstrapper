from os.path import exists
from shutil import copyfile

TERMINATOR = "\x1b[0m"
WARNING = "\x1b[1;33m [WARNING]: "
INFO = "\x1b[1;33m [INFO]: "
HINT = "\x1b[3;33m"
SUCCESS = "\x1b[1;32m [SUCCESS]: "

project_slug = "{{ cookiecutter.project_slug }}"


def main():
    if hasattr(project_slug, "isidentifier") and not project_slug.isidentifier():
        raise Exception(f"'{project_slug}' project slug is not a valid Python identifier.")
    if project_slug != project_slug.lower():
        raise Exception(f"'{project_slug}' project slug should be all lowercase")

    # For rerunning against an existing project: Make a backup of the env example file.
    # We'll use that to keep the existing secrets in place when post_get_project runs later
    if exists(".env.example"):
        copyfile(".env.example", ".env.example.bak")


if __name__ == "__main__":
    main()
