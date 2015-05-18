UGLIFYJS = uglifyjs
CLEANCSS = cleancss

build: compress-js compress-css

compress-js:
		$(UGLIFYJS) src/wysiwyg.js --mangle --compress > dist/wysiwyg.min.js
		$(UGLIFYJS) src/wysiwyg-editor.js --mangle --compress > dist/wysiwyg-editor.min.js

compress-css:
	 	$(CLEANCSS) src/wysiwyg-editor.css > dist/wysiwyg-editor.min.css
