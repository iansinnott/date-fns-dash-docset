
all:

clean:
	rm -rf ./tmp/generated

# Grab the dashing binary. This way we don't need go installed
dashing.sh:
	curl -L https://github.com/technosophos/dashing/releases/download/0.3.0/dashing > ./dashing.sh
	chmod +x ./dashing.sh

# NOTE: I make links absolute so that the single index page can be loaded at any
# URL and still work. This is a spa with client side routing, so I need to
# deliver a successful bundle regardless of the route the server sees.
tmp/date-fns.org:
	# Mirror the site locally
	wget --mirror -p --convert-links -P ./tmp https://date-fns.org/
	# Make links to assets dir absolute. See NOTE
	sed -i '.bak' "s/'assets/'\/assets/" ./tmp/date-fns.org/index.html

tmp/generated:
	cp -R ./tmp/date-fns.org ./tmp/generated
	rm ./tmp/generated/index.html
	cat ./tmp/date-fns.org/index.html | ./process-html.js > ./tmp/generated/index.html

tmp/doc_index.html:
	./scrape-index-page.js > ./tmp/doc_index.html

routes: tmp/doc_index.html
	cat ./tmp/doc_index.html | ./extract-routes.js > ./tmp/routes.json

tmp/static: routes
	./gen-static.js
	# NOTE: I'm not copying over the assets becase the site actually works best
	# for docs without the JS. Now that all the static markup has been rendered
	# the JS isn't needed. Also, the JS actually causes an initial load event
	# which is entirely unecessary and depends on the internet.
	#cp -R ./tmp/generated/assets ./tmp/static/
	# Copy over the getting started page as index. There is a real index page
	# but I decided not to go for it since it seems to require JS more than the
	# others
	cp $$(ls -1 tmp/static/**/docs/Getting-Started/index.html | sort | tail -n 1) ./tmp/static/

outfile = build_log.txt

# Build the docset using dashing
tmp/static/date-fns.docset: tmp/static
	cp ./dashing.* ./tmp/static
	cp ./icon{,@2x}.png ./tmp/static
	(cd ./tmp/static; ./dashing.sh build > $(outfile))

dist/date-fns.tgz: tmp/static/date-fns.docset
	./make_dist.sh

.PHONY: tmp/static
