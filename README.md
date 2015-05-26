Example:
==========
**http://wysiwygjs.github.io/**

API changed:
==========

* Mar 30, 2015: camelcase wysiwyg.js: onkeypress-&gt;onKeyDown, onselection-&gt;onSelection, onplaceholder-&gt;onPlaceholder, hijackcontextmenu-&gt;hijackContextmenu'
* Mar 11, 2015: dropfileClick-&gt;selectImage

wysiwyg.js
==========

'wysiwyg.js' is a (uglified) 12k contenteditable-editor with no dependencies.
It does only:
* Transforms any HTML-element into contenteditable
* onselection-event: e.g. to open a toolbar
* onkeypress-event: e.g. to handle hotkeys
* onplaceholder-event: show/hide a placeholder
* handle popups
* .bold(), .forecolor(), .inserthtml(), ... functions

It works with:
* Internet Explorer 6+
* Firefox 3.5+
* Chrome 4+
* Safari 3.1+

If a &lt;textarea&gt; was used as 'element', the library:
* keeps the &lt;textarea&gt; in sync
* falls back to the &lt;textarea&gt; if the browser does not support 'contenteditable'
* Old iOS and Android 2.3- also degrade to &lt;textarea&gt;

There is also a (uglified) 10k jQuery-plugin '$.wysiwyg()' - plus (minified) 2k CSS -
to create a featured editor which depends on:
* wysiwyg.js
* jQuery
* FontAwesome (or JPG/PNG/GIF/SVG images)

The toolbar is easy to extend - e.g. smiley, fontname and fontsize buttons below.
It is used on a website with 300M page impressions a month.

$.wysiwyg()-API:
==========

````javascript
// create editor:
$(element).wysiwyg({
    classes: 'some-more-classes',
    toolbar: 'selection'|'top'|'top-selection'|'bottom'|'bottom-selection',
    buttons: {
        buttonname: {
            title: 'tooltip text',
            // How should the button look like?
            image: '\u1234' | '&lt;img src="path/to/image.jpg"&gt;',
            html: '&lt;raw html&gt;',
            // What should the button do?
            popup: function( $popup, $button ) { ... },
            click: function( $button ) { ... },
            // Where should the button be placed?
            showstatic: true, // on the static toolbar
            showselection: true // on selection toolbar
        },
        // build-in:
        insertimage: { ... },
        insertvideo: { ... },
        insertlink: { ... },
        bold: { ... },
        italic: { ... },
        underline: { ... },
        strikethrough: { ... },
        forecolor: { ... },
        highlight: { ... },
        alignleft: { ... },
        aligncenter: { ... },
        alignright: { ... },
        alignjustify: { ... },
        subscript: { ... },
        superscript: { ... },
        indent: { ... },
        outdent: { ... },
        orderedList: { ... },
        unorderedList: { ... },
        removeformat: { ... }
    },
    submit: { ... },
    selectImage: 'Click or drop image',
    placeholderUrl: 'www.example.com',
    placeholderEmbed: '&lt;embed/&gt;',
    maxImageSize: [600,200],
    onKeyDown: function( key, character, shiftKey, altKey, ctrlKey, metaKey ) { ... },
    onKeyPress: function( key, character, shiftKey, altKey, ctrlKey, metaKey ) { ... },
    onKeyUp: function( key, character, shiftKey, altKey, ctrlKey, metaKey ) { ... },
    onAutocomplete: function( tyed, key, character, shiftKey, altKey, ctrlKey, metaKey ) { ... },
    onImageUpload: function( insert_image ) { ... },
    forceImageUpload: false,
    videoFromUrl: function( url ) { ... }
});

// surrounding div:
$(element).wysiwyg('container');

// accessing 'wysiwyg.js':
$(element).wysiwyg('shell').bold();
$(element).wysiwyg('shell').forecolor( '#ff0000' );
$(element).wysiwyg('shell').insertHTML( '&lt;b&gt;some text&lt;/b&gt;' );
````

wysiwyg.js-API:
==========

````javascript
// create wysiwyg:
var wysiwygeditor = wysiwyg({
    element: 'editor-id' || document.getElementById('editor-id'),
    onKeyDown: function( key, character, shiftKey, altKey, ctrlKey, metaKey ) {
        },
    onKeyPress: function( key, character, shiftKey, altKey, ctrlKey, metaKey ) {
        },
    onKeyUp: function( key, character, shiftKey, altKey, ctrlKey, metaKey ) {
        },
    onSelection: function( collapsed, rect, nodes, rightclick ) {
        },
    onPlaceholder: function( visible ) {
        },
    onClosepopup: function() {
        },
    hijackContextmenu: false
});

// properties:
wysiwygeditor.getElement();
wysiwygeditor.getHTML(); -> 'html'
wysiwygeditor.setHTML( html );
wysiwygeditor.getSelectedHTML(); -> 'html'|false
wysiwygeditor.sync();
wysiwygeditor.readOnly(); // -> query
wysiwygeditor.readOnly( true|false );

// selection and popup:
wysiwygeditor.collapseSelection();
wysiwygeditor.expandSelection( preceding, following );
wysiwygeditor.openPopup(); -> popup-handle
wysiwygeditor.closePopup();

// exec commands:
wysiwygeditor.removeFormat();
wysiwygeditor.bold();
wysiwygeditor.italic();
wysiwygeditor.underline();
wysiwygeditor.strikethrough();
wysiwygeditor.forecolor( color );
wysiwygeditor.highlight( color );
wysiwygeditor.fontName( fontname );
wysiwygeditor.fontSize( fontsize );
wysiwygeditor.subscript();
wysiwygeditor.superscript();
wysiwygeditor.align( 'left'|'center'|'right'|'justify' );
wysiwygeditor.format( tagname );
wysiwygeditor.indent( outdent );
wysiwygeditor.insertLink( url );
wysiwygeditor.insertImage( url );
wysiwygeditor.insertHTML( html );
wysiwygeditor.insertList( ordered );
````
