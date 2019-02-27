UGLIFYJS = ./node_modules/.bin/uglifyjs
SCSS     = scss
CLEANCSS = ./node_modules/clean-css-cli/bin/cleancss

build: compress-js compress-css

compress-js:
	$(UGLIFYJS) wysiwyg.js --mangle --compress --unsafe --comments '/^\/*!/' > dist/wysiwyg.min.js

compress-css:
	$(SCSS) --sourcemap=none --no-cache wysiwyg.scss dist/wysiwyg.css
	$(CLEANCSS) dist/wysiwyg.css > dist/wysiwyg.min.css

