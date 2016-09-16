#!/bin/sh
#
# Installation guideline:
# To use this hook you need at least 1.8.2 version of GIT installed
# cd ./.git/hooks
# ln -s ../../post-merge.sh post-merge && chmod +x post-merge
#

# List changed files
changed_files="$(git diff-tree -r --name-only --no-commit-id ORIG_HEAD HEAD)"

check_file() {
    echo "$changed_files" | grep --quiet "$1" && eval "$2"
}

# `npm install` and `npm prune` if the `package.json` file gets changed
check_file "package.json" "npm install && npm prune"
