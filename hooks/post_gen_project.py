import secrets
from os import remove
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


clients_path = "clients"
web_clients_path = f"{clients_path}/web"
mobile_clients_path = f"{clients_path}/mobile"


def clean_up_clients_folder():
    rmtree(clients_path)


def remove_web_client_files(client):
    rmtree(join(web_clients_path, client))


def move_web_client_to_root(client):
    if exists("client"):
        # We must be running as an update script
        rmtree("client")
    move(join(web_clients_path, client), join("client"))
    rmtree(join(web_clients_path))


def remove_mobile_client_files(client):
    rmtree(join(mobile_clients_path, client))


def remove_special_mobile_files():
    file_names = [join("scripts/setup_mobile_config.sh")]
    directories = [join("resources")]
    for file in file_names:
        if exists(file):
            remove(file)
    for directory in directories:
        rmtree(directory)


def move_mobile_client_to_root(client):
    if exists("mobile"):
        rmtree("mobile")
    move(join(mobile_clients_path, client), join("mobile"))
    rmtree(join(mobile_clients_path))


def set_flag(file_path, flag, value=None):
    value = value or get_random_secret_key()
    with open(file_path, "r+") as f:
        file_contents = f.read().replace(flag, value)
        f.seek(0)
        f.write(file_contents)
        f.truncate()


def remove_expo_yaml_files():
    file_names = [
        join(".github/workflows", "expo-emergency-prod-update.yml"),
        join(".github/workflows", "expo-main.yml"),
        join(".github/workflows", "expo-pr-teardown.yml"),
        join(".github/workflows", "expo-pr.yml"),
        join(".github/workflows", "expo-teststore-build-android.yml"),
        join(".github/workflows", "expo-teststore-build-ios.yml"),
        join(".github/workflows", "expo-build.yml"),
    ]
    for file_name in file_names:
        if exists(file_name):
            remove(file_name)


def remove_terraform_files():
    """Remove Terraform-related files when Heroku deployment is chosen"""
    file_names = [
        join(".github/workflows", "app-deploy.yml"),
        join(".github/workflows", "SETUP.md"),
        join(".github", "environments.json"),
        join(".github", "app-config.json"),
        join(".github/scripts", "get-env-config.sh"),
        join(".github/scripts", "secrets-sync.sh"),
        "secrets-template.json",  # Remove secrets template for Heroku deployments
    ]
    directories = [
        "terraform",
        join(".github", "actions"),
    ]
    
    for file_name in file_names:
        if exists(file_name):
            remove(file_name)
    
    for directory in directories:
        if exists(directory):
            rmtree(directory)


def remove_heroku_files():
    """Remove Heroku-related files when Terraform deployment is chosen"""
    file_names = [
        join("scripts", "deploy-on-heroku.sh"),
        "app.json",
        "Procfile",
        "runtime.txt"
    ]
    
    for file_name in file_names:
        if exists(file_name):
            remove(file_name)


def set_keys_in_envs(django_secret, postgres_secret):
    env_file_path = join(".env.example")
    pull_request_template_path = join(".github", "pull_request_template.md")
    cookie_cutter_settings_path = join("app.json")
    postgres_init_file = join("scripts/init-db.sh")
    set_flag(env_file_path, "!!!DJANGO_SECRET_KEY!!!", django_secret)
    set_flag(env_file_path, "!!!PLAYWRIGHT_SECRET_KEY!!!", django_secret)
    set_flag(pull_request_template_path, "!!!DJANGO_SECRET_KEY!!!", django_secret)
    set_flag(cookie_cutter_settings_path, "!!!DJANGO_SECRET_KEY!!!", django_secret)
    set_flag(env_file_path, "!!!POSTGRES_PASSWORD!!!", postgres_secret)
    set_flag(postgres_init_file, "!!!POSTGRES_PASSWORD!!!", postgres_secret)
    copy2(env_file_path, join(".env"))


def get_secrets():
    """
    If updating an existing project, fetch the previously set secrets so there is no change
    Otherwise, generate new random values
    """
    django_secret = get_random_secret_key()
    postgres_secret = get_random_secret_key()
    if exists(".env.example.bak"):
        # Logic inferred from python-decouple library
        # Hacky...but users won't have to pip install a library for this to work on their machine
        with open(".env.example.bak") as f:
            for line in f:
                line = line.strip()
                if line.startswith("SECRET_KEY="):
                    django_secret = line.removeprefix("SECRET_KEY=").strip().strip("'")
                elif line.startswith("DB_PASS="):
                    postgres_secret = line.removeprefix("DB_PASS=").strip().strip("'")
        remove(".env.example.bak")
    return django_secret, postgres_secret


def create_secrets_files():
    """Create secrets template files for each environment when using Terraform"""
    template_file = "secrets-template.json"
    environments = ["development", "staging", "production"]
    
    if not exists(template_file):
        print(f"{INFO}Warning: {template_file} not found, skipping secrets file creation{END}")
        return
    
    print(f"{INFO}Creating secrets template files for environments: {', '.join(environments)}{END}")
    
    # Read the template
    with open(template_file, 'r') as f:
        template_content = f.read()
    
    for env in environments:
        output_file = f"secrets-{env}.json"
        
        # Replace environment placeholder
        env_content = template_content.replace("ENVIRONMENT_NAME", env)
        
        # Write the environment-specific file
        with open(output_file, 'w') as f:
            f.write(env_content)
        
        print(f"{INFO}Created {output_file}{END}")
    
    # Remove the template file
    remove(template_file)
    print(f"{INFO}Removed template file{END}")



def main():
    django_secret, postgres_secret = get_secrets()
    set_keys_in_envs(django_secret, postgres_secret)

    if "{{ cookiecutter.client_app }}".lower() == "none":
        rmtree(web_clients_path)
        remove(join("package.json"))
    elif "{{ cookiecutter.client_app }}".lower() == "react":
        move_web_client_to_root("react")
    if "{{ cookiecutter.include_mobile }}".lower() == "y":
        move_mobile_client_to_root("react-native")
    else:
        remove_expo_yaml_files()
        remove_special_mobile_files()

    clean_up_clients_folder()

    # Handle deployment option choice
    deployment_option = "{{ cookiecutter.deployment_option }}"
    if deployment_option.lower() == "heroku":
        remove_terraform_files()
        print(f"{INFO}Heroku deployment selected - removed Terraform files{END}")
    elif deployment_option.lower().startswith("terraform"):
        remove_heroku_files()
        print(f"{INFO}Terraform (AWS) deployment selected - removed Heroku files{END}")
        create_secrets_files()
        print(f"{INFO}S3 secrets management workflow configured{END}")
        print(f"\n{INFO}{'=' * 60}{END}")
        print(f"{INFO}  Terraform (AWS) Setup — follow these steps in order{END}")
        print(f"{INFO}{'=' * 60}{END}")
        print(f"{INFO}{END}")
        print(f"{INFO}  Placeholder Key:{END}")
        print(f"{INFO}    <service>        — kebab-case project name (e.g., my-project).{END}")
        print(f"{INFO}                       Same as SERVICE_NAME and sanitized_tf_service_name.{END}")
        print(f"{INFO}    <github_org>     — GitHub org that owns the repo (e.g., thinknimble){END}")
        print(f"{INFO}    <environment>    — target environment: development, staging, or production{END}")
        print(f"{INFO}    <profile>        — AWS CLI profile name (defaults to 'default'){END}")
        print(f"{INFO}    <region>         — AWS region (defaults to 'us-east-1'){END}")
        print(f"{INFO}    <secrets_bucket> — S3 bucket for secrets, conventionally{END}")
        print(f"{INFO}                       <service>-terraform-secrets (created in step 4){END}")
        print(f"{INFO}{END}")
        print(f"{INFO}  Step 1. Create shared VPC (once per AWS account){END}")
        print(f"{INFO}    tn aws-setup-vpc{END}")
        print(f"{INFO}{END}")
        print(f"{INFO}  Step 2. Create Terraform state backend (once per project){END}")
        print(f"{INFO}    tn aws-tf-setup-backend{END}")
        print(f"{INFO}{END}")
        print(f"{INFO}  Step 3. Initialize Terraform backend (once per environment){END}")
        print(f"{INFO}    → Connects Terraform to the S3 state bucket from step 2.{END}")
        print(f"{INFO}    tn aws-tf-init-backend -e development -s <service>{END}")
        print(f"{INFO}    tn aws-tf-init-backend -e staging    -s <service>{END}")
        print(f"{INFO}    tn aws-tf-init-backend -e production -s <service>{END}")
        print(f"{INFO}{END}")
        print(f"{INFO}  Step 4. Create secrets bucket (once per environment){END}")
        print(f"{INFO}    → Outputs: <secrets_bucket> name needed for OIDC setup (step 5).{END}")
        print(f"{INFO}    tn aws-setup-secrets development{END}")
        print(f"{INFO}    tn aws-setup-secrets staging{END}")
        print(f"{INFO}    tn aws-setup-secrets production{END}")
        print(f"{INFO}{END}")
        print(f"{INFO}  Step 5. Create or update OIDC roles (once per environment){END}")
        print(f"{INFO}    → Idempotent & per-account: reuses existing roles. Re-run only{END}")
        print(f"{INFO}      when a new project uses a different <secrets_bucket> so the{END}")
        print(f"{INFO}      role's S3 policy is updated to include the new bucket.{END}")
        print(f"{INFO}    → Outputs: role_arn for environments.json (step 6).{END}")
        print(f"{INFO}    tn aws-setup-oidc secrets_bucket='<service>-terraform-secrets'{END}")
        print(f"{INFO}    (run for each environment's AWS account — dev, staging, prod){END}")
        print(f"{INFO}{END}")
        print(f"{INFO}  Step 6. Update .github/environments.json{END}")
        print(f"{INFO}    → Set account_id, role_arn (from step 5), secrets_bucket,{END}")
        print(f"{INFO}      and region for each environment (development, staging, production).{END}")
        print(f"{INFO}{END}")
        print(f"{INFO}  Step 7. Set GitHub repository variables{END}")
        print(f"{INFO}    → Settings > Secrets and variables > Actions > Variables:{END}")
        print(f"{INFO}      SERVICE_NAME, ECR_REPOSITORY_NAME, AWS_ACCOUNT_ID{END}")
        print(f"{INFO}{END}")
        print(f"{INFO}  Step 8. Edit secrets files (once per environment){END}")
        print(f"{INFO}    → secrets-development.json, secrets-staging.json, and{END}")
        print(f"{INFO}      secrets-production.json were created above.{END}")
        print(f"{INFO}      Replace all CHANGE-ME values with real credentials.{END}")
        print(f"{INFO}{END}")
        print(f"{INFO}  Step 9. Push secrets to S3 (once per environment){END}")
        print(f"{INFO}    → Uploads edited secrets to the bucket created in step 4.{END}")
        print(f"{INFO}    .github/scripts/secrets-sync.sh push development{END}")
        print(f"{INFO}    .github/scripts/secrets-sync.sh push staging{END}")
        print(f"{INFO}    .github/scripts/secrets-sync.sh push production{END}")
        print(f"{INFO}{END}")
        print(f"{INFO}  Full setup docs: .github/workflows/SETUP.md{END}")
        print(f"{INFO}  Terraform docs:  terraform/README.md{END}")
        print(f"{INFO}{'=' * 60}{END}")

    print_thankyou()
    print(f"\n{SUCCESS}Awesome! Project initialized...{END}\n")

    project_slug = "{{ cookiecutter.project_slug }}"
    print(
        f"{INFO}To install missing system requirements see {project_slug}/scripts/install-reqs.sh{END}"
    )
    print(f"{INFO}To initialize the database see {project_slug}/scripts/init-db.sh{END}")
    print(f"{INFO}To initialize the app see {project_slug}/scripts/init-app.sh{END}")
    
    # Show deployment-specific instructions
    if deployment_option.lower() == "heroku":
        print(f"{INFO}To deploy on Heroku see {project_slug}/scripts/deploy-on-heroku.sh{END}")
    elif deployment_option.lower().startswith("terraform"):
        print(f"{INFO}Setup docs: {project_slug}/.github/workflows/SETUP.md{END}")
        print(f"{INFO}Terraform docs: {project_slug}/terraform/README.md{END}")
    
    print(f"{INFO}To push the project to github {project_slug}/scripts/init-github.sh{END}")


if __name__ == "__main__":
    main()
