# Run `make clean build` to rebuild

SERVER_PORT = 3111

all: build

clean:
	rm -rf ./tmp
	rm -rf ./dist/*

build: dist/date-fns.tgz

dist/date-fns.tgz: tmp/static/date-fns.docset
	./make_dist.sh

# Build the docset using dashing
tmp/static/date-fns.docset: dashing.sh tmp/static
	cp ./dashing.* ./tmp/static
	cp ./icon{,@2x}.png ./tmp/static
	(cd ./tmp/static; ./dashing.sh build > build_log.txt)

# Grab the dashing binary. This way we don't need go installed
dashing.sh:
	curl -L https://github.com/technosophos/dashing/releases/download/0.3.0/dashing > ./dashing.sh
	chmod +x ./dashing.sh

# NOTE: This runs the static server as a background process
# NOTE: I'm doing this all at once (with ;\ ) because I was having trouble with
# sequencing. Make was not picking up the files created in the gen-static script
# in the final cp command. This probably simply has to do with my understanding
# of make, but it was very confusing and running everything this way solves it
tmp/static: tmp/generated routes
	@echo "Serving on port: $(SERVER_PORT)";\
	PORT=$(SERVER_PORT) ./gen-static.js;\
	cp $$(find $$(find . -iname '*Getting-Started*') -iname index.html) ./tmp/static/

tmp/generated: tmp/date-fns.org
	cp -R ./tmp/date-fns.org ./tmp/generated
	rm ./tmp/generated/index.html
	cat ./tmp/date-fns.org/index.html | ./process-html.js > ./tmp/generated/index.html

tmp:
	mkdir -p tmp

node_modules:
	yarn

routes: tmp node_modules
	./scrape-index-page.js | ./extract-routes.js > ./tmp/routes.json

# NOTE: I make links absolute so that the single index page can be loaded at any
# URL and still work. This is a spa with client side routing, so I need to
# deliver a successful bundle regardless of the route the server sees.
tmp/date-fns.org: tmp
	# Mirror the site locally
	wget --mirror -p --convert-links -P ./tmp https://date-fns.org/
	# Make links to assets dir absolute. See NOTE
	sed -i '.bak' "s/'assets/'\/assets/" ./tmp/date-fns.org/index.html



# node_modules is phony since we need it to update, even if the dir already
# exists
.PHONY: tmp/static routes node_modules
