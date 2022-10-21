import requests
from decouple import config
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = "Rerun Cypress Github Action now that Heroku has finished deploying"
    headers = {
        "Authorization": "",
        "Content-Type": "application/json",
        "Accept": "application/vnd.github+json"
    }
    github_root = None

    def find_cypress_workflow_id(self, branch):
        list_workflows_url = f"{self.github_root}/actions/runs"
        r = requests.get(list_workflows_url, headers=self.headers).json()
        return [a["id"] for a in r["workflow_runs"] if a["name"] == "Heroku" and a["head_branch"] == branch][0]

    def find_job_id_for_cypress_step(self, workflow_id):
        list_jobs_url = f"{self.github_root}/actions/runs/{workflow_id}/jobs"
        r = requests.get(list_jobs_url, headers=self.headers).json()
        return [a["id"] for a in r["jobs"] if a["name"] == "Cypress / Setup"][0]

    def rerun_job(self, job_id):
        rerun_job_url = f"{self.github_root}/actions/jobs/{job_id}/rerun"
        print(f"Rerunning Cypress now that code is deployed: {rerun_job_url}")
        requests.post(rerun_job_url, headers=self.headers)

    def handle(self, *args, **kwargs):
        self.headers["Authorization"] = f"Bearer {config('GITHUB_TOKEN')}"
        org = "thinknimble"
        repo = "tn-spa-bootstrapper"
        branch = config("HEROKU_BRANCH")
        self.github_root = f"https://api.github.com/repos/{org}/{repo}"

        workflow_id = self.find_cypress_workflow_id(branch)
        job_id = self.find_job_id_for_cypress_step(workflow_id)
        self.rerun_job(job_id)
