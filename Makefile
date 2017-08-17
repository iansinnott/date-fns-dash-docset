
all:

clean:
	rm -rf ./tmp/generated

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

.PHONY: tmp/static
