
all:

clean:

tmp/date-fns.org:
	wget --mirror -p --convert-links -P ./tmp https://date-fns.org/

tmp/generated:
	cp -R ./tmp/date-fns.org ./tmp/generated
	rm ./tmp/generated/index.html
	cat ./tmp/date-fns.org/index.html | ./process-html.js > ./tmp/generated/index.html
