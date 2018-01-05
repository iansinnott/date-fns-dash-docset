#!/usr/bin/env bash
set -eo pipefail

publish() {
	if [[ ! -d "$1" ]]; then
	 	echo "$1 is not a directory. Provide the local location of the Dash-User-Contributions repository as the first arg"
		return 99;
	fi

	local version=$(node -e 'process.stdout.write(require("./dist/docset.json").version)')

	echo "Tagging git..."
	git add . && git commit -m "Update: v$version"
	git tag "v$version" -m "v$version"
	git push && git push --tags

	echo "Publishing date-fns v$version..."

	local source_dir=$PWD
	local target_dir=$1
	local git_user=$(git config --global user.username)

	# Make sure my remote is up to date
	cd $target_dir
	git checkout master
	git pull
	git push $git_user master
	git checkout -b date-fns-$version

	# Ensure the dir is present and empty
	mkdir -p docsets/date-fns
	rm -rf docsets/date-fns/*.*

	# Copy files
	cp -R $source_dir/dist/*.* docsets/date-fns/

	# Commit and PR the changes
	git add . && git commit -m "date-fns v$version"
	git push -u $git_user date-fns-$version
	git pull-request -m "date-fns v$version"

	# Restor dir
	cd $source_dir
}

publish "$@"
