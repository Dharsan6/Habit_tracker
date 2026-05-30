#!/usr/bin/env bash
set -euo pipefail

echo "Fetching origin..."
git fetch origin

echo
echo "=== Remote commits not in local ==="
git log --oneline --graph --decorate HEAD..origin/main || true

echo
echo "=== Files changed on remote ==="
git diff --name-status HEAD..origin/main || true

read -r -p "Proceed with rebase of local onto origin/main? (y/N): " ans
if [[ "$ans" != "y" ]]; then
  echo "Aborting as requested. No changes made."
  exit 0
fi

# Attempt rebase
if git pull --rebase origin main; then
  echo "Rebase/pull successful. Pushing to origin/main..."
  git push -u origin main
  echo "Pushed successfully."
  exit 0
else
  echo "\nRebase failed due to conflicts. Follow these steps to resolve:\n"
  echo "1) run 'git status' to see conflicted files"
  echo "2) edit files to resolve conflicts"
  echo "3) run 'git add <resolved-files>'"
  echo "4) run 'git rebase --continue' to finish rebase"
  echo "If you want to abort the rebase: 'git rebase --abort'"
  exit 1
fi
