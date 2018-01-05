#!/usr/bin/env bash
set -euo pipefail

# Check if an update is needed by comparing latest built version to latest
# version from npm
update_needed() {
	local latest=$(npm info date-fns version)
	local current=$(node -e 'process.stdout.write(require("./dist/docset.json").version)')

	if [[ $latest == $current ]]; then
		echo "Nothing much to udpate. Latest version is v$latest"
		return 99;
	fi

	echo "Updating v$current -> v$latest"
	return 0
}

update_needed
