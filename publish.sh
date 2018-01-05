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
	echo
	echo "Entering target dir: $target_dir"
	cd $target_dir

	echo
	echo "Making sure the repo is up to date"
	git checkout master
	git pull
	git push $git_user master
	git checkout -b date-fns-$version

	# Ensure the dir is present and empty
	mkdir -p docsets/date-fns
	rm -rf docsets/date-fns/*.*

	# Copy files
	echo
	echo "Copying files to publish"
	cp -R $source_dir/dist/*.* docsets/date-fns/

	# Commit and PR the changes
	echo
	echo "Git versioning"
	git add . && git commit -m "date-fns v$version"
	git push -u $git_user date-fns-$version

	if [[ ! -x $(which hub) ]]; then
		hub pull-request -m "date-fns v$version"
	else
		echo "Hub not found. Hub is needed for automatic pull requests."
	fi


	# Restor dir
	echo
	echo "Restoring previous directory: $source_dir"
	cd $source_dir
}

publish "$@"
