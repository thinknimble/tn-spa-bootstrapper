# Terraform AWS Configuration

This folder contains the files necessary to deploy a front-end app, server, and database to AWS.

## Quickstart

`cd` into to this folder, then run:

```
terraform init
terraform plan
terraform apply
```

## Prerequisites

### 1. [Install AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html#getting-started-install-instructions)

### 2. Configure AWS Profile

Log in to the [console](https://aws.amazon.com/console), and [generate an access key](https://docs.aws.amazon.com/IAM/latest/UserGuide/access-key-self-managed.html). Then set up a profile for this account locally by running the following command:

```
aws configure --profile <profile_name>
```

### 3. Initialize Terraform

If it's your first time deploying from this directory, run `terraform init`. This will download

### 4. Deploy

`terraform plan`

## Reference

### Terraform

- [Terraform Docs](https://developer.hashicorp.com/terraform/intro) - _On this page there's a helpful 18 minute video on what Terraform is and how it works, worth watching_
- [Terraform AWS Tutorial](https://developer.hashicorp.com/terraform/tutorials/aws-get-started) - _You can start from the top and go through everything, or just pick a section you'd like to understand better_
- [Terraform AWS Provider Docs](https://registry.terraform.io/providers/hashicorp/aws/latest/docs) - _This is where you'll find all the details for configuring each of the resources in these configuration files_

### AWS

#### Networking

- [VPC User Guide](https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html) - _For understanding `Subnets`, `Route Tables`, and `Internet Gateways`. Also explains `Security Groups`, a fundamental concept_
- [ELB User Guide](https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html) - _For understanding `Load Balancers`, `Listeners`, and `Target Groups`_

#### Access Management

- [IAM User Guide](https://docs.aws.amazon.com/IAM/latest/UserGuide/getting-started.html) - _For understanding IAM `Identities`, `Roles`, and  `Policies`_

#### Database

- [RDS User Guide](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html) - _For understanding database deployment details_

#### Application Deployment
- [ECS Docs](https://docs.aws.amazon.com/AmazonECS/latest/developerguide/Welcome.html) - _For understanding how to run Dockerized applications_