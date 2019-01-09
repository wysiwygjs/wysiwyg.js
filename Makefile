UGLIFYJS = ./node_modules/.bin/uglifyjs
CLEANCSS = ./node_modules/clean-css-cli/bin/cleancss

build: compress-js compress-css

compress-js:
	$(UGLIFYJS) wysiwyg.js --mangle --compress --unsafe --comments '/^\/*!/' > dist/wysiwyg.min.js

compress-css:
	$(CLEANCSS) wysiwyg.css > dist/wysiwyg.min.css

