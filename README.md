Example:
==========
http://wysiwygjs.github.io/

wysiwyg.js
==========

'wysiwyg-js' is a (minified) 12k contenteditable-editor with no dependencies.
It does only:
* Transforms any HTML-element into contenteditable
* onselection-event: e.g. to open a toolbar
* onkeypress-event: e.g. to handle hotkeys
* onplaceholder-event: show/hide a placeholder

It works with:
* Internet Explorer 6+
* Firefox 3.5+
* Chrome 4+
* Safari 3.1+

There is also a 9k jquery-wrapper '$.wysiwyg()' to create
a full-featured editor, which depends on:
* jQuery
* FontAwesome (or PNG images)

If a &lt;textarea&gt; was used as 'element', the library:
* keeps the &lt;textarea&gt; in sync
* nicely falls back to the &lt;textarea&gt; if the browser does not support 'contenteditable'
* Old iOS and Android 2.3- degrade to &lt;textarea&gt;

wysiwyg.js-API:
==========
````
// create wysiwyg:
var wysiwygeditor = wysiwyg({
    element: document.getElmentById('editor-id'),
    onkeypress: function( code, character, shiftKey, altKey, ctrlKey, metaKey ) {
        },
    onselection: function( collapsed, rect, nodes, rightclick ) {
        },
    onplaceholder: function( visible ) {
        }
});

// properties:
wysiwygeditor.getElement();
wysiwygeditor.getHTML(); -> html
wysiwygeditor.setHTML( html );

// selection and popup:
wysiwygeditor.collapseSelection();
wysiwygeditor.openPopup(); -> popup-handle
wysiwygeditor.closePopup();

// exec commands:
wysiwygeditor.markup( styleWithCSS, insertBrOnReturn );
wysiwygeditor.removeFormat();
wysiwygeditor.bold();
wysiwygeditor.italic();
wysiwygeditor.underline();
wysiwygeditor.strikethrough();
wysiwygeditor.forecolor( color );
wysiwygeditor.highlight: function( color );
wysiwygeditor.font( name, size );
wysiwygeditor.align( 'justifyLeft'|'justifyCenter'|'justifyRight'|'justifyFull' );
wysiwygeditor.insertLink( url );
wysiwygeditor.insertImage( url );
wysiwygeditor.insertHTML( html );
wysiwygeditor.insertOrderedList();
wysiwygeditor.insertUnorderedList();
````

$.wysiwyg()-API:
==========
````
var $editor = $('#editor').wysiwyg({
    placeholder: 'Type your text here...',
    position: 'none'|'top'|'bottom',
    buttons = { ... },
    submit = { ... },
    smilies = { ... },
    dropfileclick: 'Click or drop image',
    styleWithCSS: false,
    insertBrOnReturn: false,
    onEnterSubmit = function()
})
.focus(function(){})
.blur(function(){})
.change(function(){});
$editor.wysiwyg('html');
$editor.wysiwyg('html','new html');
$editor.wysiwyg('removeFormat');
$editor.wysiwyg('bold');
$editor.wysiwyg('italic');
$editor.wysiwyg('underline');
$editor.wysiwyg('strikethrough');
$editor.wysiwyg('forecolor','#color');
$editor.wysiwyg('highlight','#color');
$editor.wysiwyg('insertLink','http://url.com/');
$editor.wysiwyg('insertImage','http://url.com/');
$editor.wysiwyg('insertHTML','new html');
$editor.wysiwyg('insertOrderedList');
$editor.wysiwyg('insertUnorderedList');
````
