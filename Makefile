UGLIFYJS = ./node_modules/.bin/uglifyjs
CLEANCSS = ./node_modules/.bin/cleancss

build: compress-js compress-css

compress-js:
	$(UGLIFYJS) src/wysiwyg.js --mangle --compress --unsafe > dist/wysiwyg.min.js
	$(UGLIFYJS) src/wysiwyg-editor.js --mangle --compress --unsafe > dist/wysiwyg-editor.min.js

compress-css:
	$(CLEANCSS) src/wysiwyg-editor.css > dist/wysiwyg-editor.min.css

standalone:
	head -n1 src/wysiwyg.js >dist/standalone.js
	head -n10 src/wysiwyg.js | tail -n1 >>dist/standalone.js
	tail -n +12 src/wysiwyg.js >>dist/standalone.js
	head -n1 src/wysiwyg-editor.js >>dist/standalone.js
	head -n10 src/wysiwyg-editor.js | tail -n1 >>dist/standalone.js
	tail -n +12 src/wysiwyg-editor.js >>dist/standalone.js
	$(UGLIFYJS) dist/standalone.js --mangle --compress --unsafe > dist/standalone.min.js
