# Run `make clean build` to rebuild

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
tmp/static: tmp/generated routes
	node ./serve-as-spa.js ./tmp/generated/index.html &
	./gen-static.js
	kill $$(ps -eo pid,command | grep 'serve-as-spa' | sort | cut -d' ' -f1 | head -n 1)
	# Copy over the getting started page as index. There is a real index page
	# but I decided not to go for it since it seems to require JS more than the
	# others and because it's more of a marketing page, which isn't necessary
	# for anyone already using the lib
	cp $$(ls -1 tmp/static/**/docs/Getting-Started/index.html | sort | tail -n 1) ./tmp/static/

tmp/generated: tmp/date-fns.org
	cp -R ./tmp/date-fns.org ./tmp/generated
	rm ./tmp/generated/index.html
	cat ./tmp/date-fns.org/index.html | ./process-html.js > ./tmp/generated/index.html

routes:
	mkdir -p tmp
	./scrape-index-page.js | ./extract-routes.js > ./tmp/routes.json

# NOTE: I make links absolute so that the single index page can be loaded at any
# URL and still work. This is a spa with client side routing, so I need to
# deliver a successful bundle regardless of the route the server sees.
tmp/date-fns.org:
	mkdir -p tmp
	# Mirror the site locally
	wget --mirror -p --convert-links -P ./tmp https://date-fns.org/
	# Make links to assets dir absolute. See NOTE
	sed -i '.bak' "s/'assets/'\/assets/" ./tmp/date-fns.org/index.html

.PHONY: tmp/static routes
