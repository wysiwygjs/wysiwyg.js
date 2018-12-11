UGLIFYJS = ./node_modules/.bin/uglifyjs
CLEANCSS = ./node_modules/.bin/cleancss

build: compress-js compress-css

compress-js:
	$(UGLIFYJS) wysiwyg.js --mangle --compress --unsafe > dist/wysiwyg.min.js

compress-css:
	$(CLEANCSS) wysiwyg.css > dist/wysiwyg.min.css

