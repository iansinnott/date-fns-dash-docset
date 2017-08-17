#!/usr/bin/env bash
set -euo pipefail
IFS=$'\n\t'

VERSION=$(node -e 'process.stdout.write(require("./node_modules/date-fns/package.json").version)')

# Hm, initially I had the command below but that always packaged in such a way
# that the archive would extract to a dir with the name `tmp/static`. So it would end
# up being `tmp/static/date-fns.tgz`. That broke Dash's CI
echo "Packaging date-fns.tgz..."
(cd ./tmp/static; tar --exclude='.DS_Store' -cvzf date-fns.tgz date-fns.docset)
mkdir -p dist
mv ./tmp/static/date-fns.tgz ./dist

echo "Updating docset.json with current version..."
cat ./docset.template.json | sed "s/\$VERSION_SUPPLIED_BY_SCRIPT_DO_NOT_MODIFY/$VERSION/" > ./dist/docset.json

#
echo "Trimming the readme and copying it over..."
cat ./README.md | node ./trim-readme.js > ./dist/README.md

# Copy images
echo "Copying images..."
cp ./icon{,@2x}.png ./dist

echo "Done."
