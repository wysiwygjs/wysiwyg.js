Example:
==========
**http://wysiwygjs.github.io/**

wysiwyg.js
==========

'wysiwyg.js' is a (minified) 12k contenteditable-editor with no dependencies.
It does only:
* Transforms any HTML-element into contenteditable
* onselection-event: e.g. to open a toolbar
* onkeypress-event: e.g. to handle hotkeys
* onplaceholder-event: show/hide a placeholder
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

There is also a (minified) 10k jQuery-plugin '$.wysiwyg()' - plus (minified) 2k CSS -
to create a full-featured editor which depends on:
* wysiwyg.js
* jQuery
* FontAwesome (or JPG/PNG/GIF/SVG images)

The toolbar is easy to extend - e.g. smiley, fontname and fontsize buttons below.
It is used on a website with 300M page impressions a month.

wysiwyg.js-API:
==========
````
// create wysiwyg:
var wysiwygeditor = wysiwyg({
    element: document.getElementById('editor-id'),
    onkeypress: function( code, character, shiftKey, altKey, ctrlKey, metaKey ) {
        },
    onselection: function( collapsed, rect, nodes, rightclick ) {
        },
    onplaceholder: function( visible ) {
        },
    hijackcontextmenu: false
});

// properties:
wysiwygeditor.getElement();
wysiwygeditor.getHTML(); -> 'html'
wysiwygeditor.setHTML( html );
wysiwygeditor.getSelectedHTML(); -> 'html'|false
wysiwygeditor.sync();

// selection and popup:
wysiwygeditor.collapseSelection();
wysiwygeditor.openPopup(); -> popup-handle
wysiwygeditor.closePopup();

// exec commands:
wysiwygeditor.removeFormat();
wysiwygeditor.bold();
wysiwygeditor.italic();
wysiwygeditor.underline();
wysiwygeditor.strikethrough();
wysiwygeditor.forecolor( '#color' );
wysiwygeditor.highlight( '#color' );
wysiwygeditor.fontName( fontname );
wysiwygeditor.fontSize( fontsize );
wysiwygeditor.subscript();
wysiwygeditor.superscript();
wysiwygeditor.align( 'left'|'center'|'right'|'justify' );
wysiwygeditor.format( tagname );
wysiwygeditor.insertLink( 'http://url.com/' );
wysiwygeditor.insertImage( 'http://url.com/' );
wysiwygeditor.insertHTML( 'html' );
wysiwygeditor.insertList( ordered );
````

$.wysiwyg()-API:
==========
````
var $editor = $('#editor').wysiwyg({
    classes: 'some-more-classes',
    toolbar: 'selection'|'top'|'top-selection'|'bottom'|'bottom-selection',
    buttons = { ... },
    submit = { ... },
    placeholder: 'Type your text here...',
    dropfileclick: 'Click or drop image',
    placeholderUrl: 'www.example.com',
    maxImageSize: [width,height],
    onImageUpload: function( insert_image ){},
    onKeyEnter: function(){}
})
Properties:
    $editor.wysiwyg('container'); -> $(container-div)
    $editor.wysiwyg('shell'); -> wysiwyg.js API
Events:
    .focus(function(){})
    .blur(function(){})
    .change(function(){});
````
