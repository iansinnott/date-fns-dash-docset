
all:

clean:
	rm -rf ./tmp/generated

tmp/date-fns.org:
	wget --mirror -p --convert-links -P ./tmp https://date-fns.org/

tmp/generated:
	cp -R ./tmp/date-fns.org ./tmp/generated
	rm ./tmp/generated/index.html
	cat ./tmp/date-fns.org/index.html | ./process-html.js > ./tmp/generated/index.html

tmp/doc_index.html:
	./scrape-index-page.js > ./tmp/doc_index.html

routes:
	cat ./tmp/doc_index.html | ./extract-routes.js
