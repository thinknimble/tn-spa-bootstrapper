# TN SPA Bootstrapper — Development Commands

# Set default recipe to list commands
default:
    @just --list

# Manage git worktrees for parallel development.
# Usage: just worktree add <branch>    — create worktree
#        just worktree remove <branch> — remove worktree
worktree action branch:
    #!/usr/bin/env bash
    set -e

    BRANCH="{{ branch }}"
    dir_name=$(echo "$BRANCH" | sed -E 's,^(feature|bugfix|hotfix|fix|chore|release)/,,' | tr '[:upper:]' '[:lower:]' | tr '/_' '-' | sed 's/[^a-z0-9-]//g')
    worktree_path="../tn-spa-bootstrapper-${dir_name}"

    if [ "{{ action }}" = "add" ]; then
      echo "Creating worktree for branch '$BRANCH' at $worktree_path..."
      if git show-ref --verify --quiet "refs/heads/$BRANCH" || git show-ref --verify --quiet "refs/remotes/origin/$BRANCH"; then
        git worktree add "$worktree_path" "$BRANCH"
      else
        git worktree add -b "$BRANCH" "$worktree_path"
      fi

      echo ""
      echo "Worktree ready at: $worktree_path"
      echo "  cd $worktree_path"
      echo ""

    elif [ "{{ action }}" = "remove" ]; then
      if [ ! -d "$worktree_path" ]; then
        echo "Error: worktree not found at $worktree_path"
        exit 1
      fi

      echo "Removing worktree..."
      git worktree remove "$worktree_path" --force

      echo ""
      echo "Worktree '$BRANCH' removed."
      echo "Note: branch not deleted. To delete: git branch -d $BRANCH"
      echo ""

    else
      echo "Usage: just worktree add <branch> | just worktree remove <branch>"
      exit 1
    fi
