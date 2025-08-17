## Code Review

Found a bug in this PR that needs to be fixed:

### File name mismatch
The workflow creates a file called `merged.txt` (lines 29, 32, 34 in summary.yml) but the artifact upload step is trying to upload `pr-summary.txt`:

```yaml
# Line 29, 32 create merged.txt
git diff ... > merged.txt

# But line 43 tries to upload pr-summary.txt
- name: Upload Artifact
  uses: actions/upload-artifact@v4
  with:
    name: pr-changes-summary
    path: pr-summary.txt  # This should be merged.txt or the file should be renamed
```

### Issues to address:

1. **File name mismatch**: Either rename the created file to `pr-summary.txt` or change the artifact path back to `merged.txt`

2. **Unused parameter**: The new `pr_number` input parameter is defined but never used in the workflow. Either implement logic to use it or remove it.

3. **Empty file**: The `expo-pr-build.yml` file is completely empty. Add a TODO comment or remove it until needed.

### Note on CI failures
The two failing CI checks are not related to your changes:
- **Setup**: Heroku app `tn-spa-bootstrapper-pr-407` doesn't exist (infrastructure issue)
- **extract-changes**: Google Drive storage quota exceeded (external service issue)

These would need to be addressed separately by the team.