(function(factory) {
        window.wysiwyg = factory(window, document);
})(function(window, document){
    'use strict';

    // http://stackoverflow.com/questions/97962/debounce-clicks-when-submitting-a-web-form
    var debounce = function( callback, wait, cancelprevious )
    {
        var timeout;
        return function()
        {
            if( timeout )
            {
                if( ! cancelprevious )
                    return ;
                clearTimeout( timeout );
            }
            var context = this,
                args = arguments;
            timeout = setTimeout(
                function()
                {
                    timeout = null;
                    callback.apply( context, args );
                }, wait );
        };
    };

    // http://stackoverflow.com/questions/12949590/how-to-detach-event-in-ie-6-7-8-9-using-javascript
    var addEvent = function( element, type, handler, useCapture )
    {
        if( element.addEventListener ) {
            element.addEventListener( type, handler, useCapture ? true : false );
        }
        else if( element.attachEvent ) {
            element.attachEvent( 'on' + type, handler );
        }
        else if( element != window )
            element['on' + type] = handler;
    };
    var removeEvent = function( element, type, handler, useCapture )
    {
        if( element.removeEventListener ) {
            element.removeEventListener( type, handler, useCapture ? true : false );
        }
        else if( element.detachEvent) {
            element.detachEvent( 'on' + type, handler );
        }
        else if( element != window )
            element['on' + type] = null;
    };
    // http://www.cristinawithout.com/content/function-trigger-events-javascript
    var fireEvent = function( element, type, bubbles, cancelable )
    {
        if( document.createEvent ) {
            var event = document.createEvent('Event');
            event.initEvent( type, bubbles !== undefined ? bubbles : true, cancelable !== undefined ? cancelable : false );
            element.dispatchEvent(event);
        }
        else if( document.createEventObject ) { //IE
            var event = document.createEventObject();
            element.fireEvent( 'on' + type, event );
        }
        else if( typeof(element['on' + type]) == 'function' )
            element['on' + type]();
    };
    // prevent default
    var cancelEvent = function( e )
    {
        if( e.preventDefault )
            e.preventDefault();
        else
            e.returnValue = false;
        if( e.stopPropagation )
            e.stopPropagation();
        else
            e.cancelBubble = true;
        return false;
    };

    // http://stackoverflow.com/questions/13377887/javascript-node-undefined-in-ie8-and-under
    var Node_ELEMENT_NODE = typeof(Node) != 'undefined' ? Node.ELEMENT_NODE : 1;
    var Node_TEXT_NODE = typeof(Node) != 'undefined' ? Node.TEXT_NODE : 3;

    // http://stackoverflow.com/questions/2234979/how-to-check-in-javascript-if-one-element-is-a-child-of-another
    var isOrContainsNode = function( ancestor, descendant )
    {
        var node = descendant;
        while( node )
        {
            if( node === ancestor )
                return true;
            node = node.parentNode;
        }
        return false;
    };

    // http://stackoverflow.com/questions/667951/how-to-get-nodes-lying-inside-a-range-with-javascript
    var nextNode = function( node, container )
    {
        if( node.firstChild )
            return node.firstChild;
        while( node )
        {
            if( node == container ) // do not walk out of the container
                return null;
            if( node.nextSibling )
                return node.nextSibling;
            node = node.parentNode;
        }
        return null;
    };

    // save/restore selection
    // http://stackoverflow.com/questions/13949059/persisting-the-changes-of-range-objects-after-selection-in-html/13950376#13950376
    var saveSelection = function( containerNode )
    {
        if( window.getSelection )
        {
            var sel = window.getSelection();
            if( sel.rangeCount > 0 )
                return sel.getRangeAt(0);
        }
        else if( document.selection )
        {
            var sel = document.selection;
            return sel.createRange();
        }
        return null;
    };
    var restoreSelection = function( containerNode, savedSel )
    {
        if( ! savedSel )
            return;
        if( window.getSelection )
        {
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(savedSel);
        }
        else if( document.selection )
        {
            savedSel.select();
        }
    };

    // http://stackoverflow.com/questions/12603397/calculate-width-height-of-the-selected-text-javascript
    // http://stackoverflow.com/questions/6846230/coordinates-of-selected-text-in-browser-page
    var getSelectionRect = function()
    {
        if( window.getSelection )
        {
            var sel = window.getSelection();
            if( ! sel.rangeCount )
                return false;
            var range = sel.getRangeAt(0).cloneRange();
            if( range.getBoundingClientRect ) // Missing for Firefox 3.5+3.6
            {
                var rect = range.getBoundingClientRect();
                // Safari 5.1 returns null, IE9 returns 0/0/0/0 if image selected
                if( rect && rect.left && rect.top && rect.right && rect.bottom )
                    return {
                        // Modern browsers return floating-point numbers
                        left: parseInt(rect.left),
                        top: parseInt(rect.top),
                        width: parseInt(rect.right - rect.left),
                        height: parseInt(rect.bottom - rect.top)
                    };
                // on Webkit 'range.getBoundingClientRect()' sometimes return 0/0/0/0 - but 'range.getClientRects()' works
                var rects = range.getClientRects ? range.getClientRects() : [];
                for( var i=0; i < rects.length; ++i )
                {
                    var rect = rects[i];
                    if( rect.left && rect.top && rect.right && rect.bottom )
                        return {
                            // Modern browsers return floating-point numbers
                            left: parseInt(rect.left),
                            top: parseInt(rect.top),
                            width: parseInt(rect.right - rect.left),
                            height: parseInt(rect.bottom - rect.top)
                        };
                }
            }
            /*
            // Fall back to inserting a temporary element (only for Firefox 3.5 and 3.6)
            var span = document.createElement('span');
            if( span.getBoundingClientRect )
            {
                // Ensure span has dimensions and position by
                // adding a zero-width space character
                span.appendChild( document.createTextNode('\u200b') );
                range.insertNode( span );
                var rect = span.getBoundingClientRect();
                var spanParent = span.parentNode;
                spanParent.removeChild( span );
                // Glue any broken text nodes back together
                spanParent.normalize();
                return {
                    left: parseInt(rect.left),
                    top: parseInt(rect.top),
                    width: parseInt(rect.right - rect.left),
                    height: parseInt(rect.bottom - rect.top)
                };
            }
            */
        }
        else if( document.selection )
        {
            var sel = document.selection;
            if( sel.type != 'Control' )
            {
                var range = sel.createRange();
                // IE8 return 0/0/0/0 if caret right before newline
                if( range.boundingLeft || range.boundingTop || range.boundingWidth || range.boundingHeight )
                    return {
                        left: range.boundingLeft,
                        top: range.boundingTop,
                        width: range.boundingWidth,
                        height: range.boundingHeight
                    };
            }
        }
        return false;
    };

    var getSelectionCollapsed = function( containerNode )
    {
        if( window.getSelection )
        {
            var sel = window.getSelection();
            if( sel.isCollapsed )
                return true;
            return false;
        }
        else if( document.selection )
        {
            var sel = document.selection;
            if( sel.type == 'Text' )
            {
                var range = document.selection.createRange();
                var textrange = document.body.createTextRange();
                textrange.moveToElementText(containerNode);
                textrange.setEndPoint('EndToStart', range);
                return range.htmlText.length == 0;
            }
            if( sel.type == 'Control' ) // e.g. an image selected
                return false;
            // sel.type == 'None' -> collapsed selection
        }
        return true;
    };

    // http://stackoverflow.com/questions/7781963/js-get-array-of-all-selected-nodes-in-contenteditable-div
    var getSelectedNodes = function( containerNode )
    {
        if( window.getSelection )
        {
            var sel = window.getSelection();
            if( ! sel.rangeCount )
                return [];
            var nodes = [];
            for( var i=0; i < sel.rangeCount; ++i )
            {
                var range = sel.getRangeAt(i),
                    node = range.startContainer,
                    endNode = range.endContainer;
                while( node )
                {
                    // add this node?
                    if( node != containerNode )
                    {
                        var node_inside_selection = false;
                        if( sel.containsNode )
                            node_inside_selection = sel.containsNode( node, true );
                        else // IE11
                        {
                            // http://stackoverflow.com/questions/5884210/how-to-find-if-a-htmlelement-is-enclosed-in-selected-text
                            var noderange = document.createRange();
                            noderange.selectNodeContents( node );
                            for( var i=0; i < sel.rangeCount; ++i )
                            {
                                var range = sel.getRangeAt(i);
                                // start after or end before -> skip node
                                if( range.compareBoundaryPoints(range.END_TO_START,noderange) >= 0 &&
                                    range.compareBoundaryPoints(range.START_TO_END,noderange) <= 0 )
                                {
                                    node_inside_selection = true;
                                    break;
                                }
                            }
                        }
                        if( node_inside_selection )
                            nodes.push( node );
                    }
                    node = nextNode( node, node == endNode ? endNode : containerNode );
                }
            }
            // Fallback
            if( nodes.length == 0 && isOrContainsNode(containerNode,sel.focusNode) && sel.focusNode != containerNode )
                nodes.push( sel.focusNode );
            return nodes;
        }
        else if( document.selection )
        {
            var sel = document.selection;
            if( sel.type == 'Text' )
            {
                var nodes = [];
                var ranges = sel.createRangeCollection();
                for( var i=0; i < ranges.length; ++i )
                {
                    var range = ranges[i],
                        parentNode = range.parentElement(),
                        node = parentNode;
                    while( node )
                    {
                        // No clue how to detect whether a TextNode is within the selection...
                        // ElementNode is easy: http://stackoverflow.com/questions/5884210/how-to-find-if-a-htmlelement-is-enclosed-in-selected-text
                        var noderange = range.duplicate();
                        noderange.moveToElementText( node.nodeType != Node_ELEMENT_NODE ? node.parentNode : node );
                        // start after or end before -> skip node
                        if( noderange.compareEndPoints('EndToStart',range) >= 0 &&
                            noderange.compareEndPoints('StartToEnd',range) <= 0 )
                        {
                            // no "Array.indexOf()" in IE8
                            var in_array = false;
                            for( var j=0; j < nodes.length; ++j )
                            {
                                if( nodes[j] !== node )
                                    continue;
                                in_array = true;
                                break;
                            }
                            if( ! in_array )
                                nodes.push( node );
                        }
                        node = nextNode( node, parentNode );
                    }
                }
                // Fallback
                if( nodes.length == 0 && isOrContainsNode(containerNode,document.activeElement) && document.activeElement != containerNode )
                    nodes.push( document.activeElement );
                return nodes;
            }
            if( sel.type == 'Control' ) // e.g. an image selected
            {
                var nodes = [];
                // http://msdn.microsoft.com/en-us/library/ie/hh826021%28v=vs.85%29.aspx
                var range = sel.createRange();
                for( var i=0; i < range.length; ++i )
                    nodes.push( range(i) );
                return nodes;
            }
        }
        return [];
    };

    // http://stackoverflow.com/questions/8513368/collapse-selection-to-start-of-selection-not-div
    var collapseSelectionEnd = function()
    {
        if( window.getSelection )
        {
            var sel = window.getSelection();
            if( ! sel.isCollapsed )
            {
                // Form-submits via Enter throw 'NS_ERROR_FAILURE' on Firefox 34
                try {
                    sel.collapseToEnd();
                }
                catch( e ) {
                }
            }
        }
        else if( document.selection )
        {
            var sel = document.selection;
            if( sel.type != 'Control' )
            {
                var range = sel.createRange();
                range.collapse(false);
                range.select();
            }
        }
    };

    // http://stackoverflow.com/questions/15157435/get-last-character-before-caret-position-in-javascript
    // http://stackoverflow.com/questions/11247737/how-can-i-get-the-word-that-the-caret-is-upon-inside-a-contenteditable-div
    var expandSelectionCaret = function( containerNode, preceding, following )
    {
        if( window.getSelection )
        {
            var sel = window.getSelection();
            if( sel.modify )
            {
                for( var i=0; i < preceding; ++i )
                    sel.modify('extend', 'backward', 'character');
                for( var i=0; i < following; ++i )
                    sel.modify('extend', 'forward', 'character');
            }
            else
            {
                // not so easy if the steps would cover multiple nodes ...
                var range = sel.getRangeAt(0);
                range.setStart( range.startContainer, range.startOffset - preceding );
                range.setEnd( range.endContainer, range.endOffset + following );
                sel.removeAllRanges();
                sel.addRange(range);
            }
        }
        else if( document.selection )
        {
            var sel = document.selection;
            if( sel.type != 'Control' )
            {
                var range = sel.createRange();
                range.collapse(true);
                range.moveStart('character', -preceding);
                range.moveEnd('character', following);
                range.select();
            }
        }
    };

    // http://stackoverflow.com/questions/4652734/return-html-from-a-user-selected-text/4652824#4652824
    var getSelectionHtml = function( containerNode )
    {
        if( getSelectionCollapsed( containerNode ) )
            return null;
        if( window.getSelection )
        {
            var sel = window.getSelection();
            if( sel.rangeCount )
            {
                var container = document.createElement('div'),
                    len = sel.rangeCount;
                for( var i=0; i < len; ++i )
                {
                    var contents = sel.getRangeAt(i).cloneContents();
                    container.appendChild(contents);
                }
                return container.innerHTML;
            }
        }
        else if( document.selection )
        {
            var sel = document.selection;
            if( sel.type == 'Text' )
            {
                var range = sel.createRange();
                return range.htmlText;
            }
        }
        return null;
    };

    var selectionInside = function( containerNode, force )
    {
        // selection inside editor?
        if( window.getSelection )
        {
            var sel = window.getSelection();
            if( isOrContainsNode(containerNode,sel.anchorNode) && isOrContainsNode(containerNode,sel.focusNode) )
                return true;
            // selection at least partly outside editor
            if( ! force )
                return false;
            // force selection to editor
            var range = document.createRange();
            range.selectNodeContents( containerNode );
            range.collapse( false );
            sel.removeAllRanges();
            sel.addRange(range);
        }
        else if( document.selection )
        {
            var sel = document.selection;
            if( sel.type == 'Control' ) // e.g. an image selected
            {
                // http://msdn.microsoft.com/en-us/library/ie/hh826021%28v=vs.85%29.aspx
                var range = sel.createRange();
                if( range.length != 0 && isOrContainsNode(containerNode,range(0)) ) // test only the first element
                    return true;
            }
            else //if( sel.type == 'Text' || sel.type == 'None' )
            {
                // Range of container
                // http://stackoverflow.com/questions/12243898/how-to-select-all-text-in-contenteditable-div
                var rangeContainer = document.body.createTextRange();
                rangeContainer.moveToElementText(containerNode);
                // Compare with selection range
                var range = sel.createRange();
                if( rangeContainer.inRange(range) )
                    return true;
            }
            // selection at least partly outside editor
            if( ! force )
                return false;
            // force selection to editor
            // http://stackoverflow.com/questions/12243898/how-to-select-all-text-in-contenteditable-div
            var range = document.body.createTextRange();
            range.moveToElementText(containerNode);
            range.setEndPoint('StartToEnd',range); // collapse
            range.select();
        }
        return true;
    };

    /*
    var clipSelectionTo = function( containerNode )
    {
        if( window.getSelection && containerNode.compareDocumentPosition )
        {
            var sel = window.getSelection();
            var left_node = sel.anchorNode,
                left_offset = sel.anchorOffset,
                right_node = sel.focusNode,
                right_offset = sel.focusOffset;
            // http://stackoverflow.com/questions/10710733/dom-determine-if-the-anchornode-or-focusnode-is-on-the-left-side
            if( (left_node == right_node && left_offset > right_offset) ||
                (left_node.compareDocumentPosition(right_node) & Node.DOCUMENT_POSITION_PRECEDING) )
            {
                // Right-to-left selection
                left_node = sel.focusNode;
                left_offset = sel.focusOffset;
                right_node = sel.anchorNode,
                right_offset = sel.anchorOffset;
            }
            // Speed up: selection inside editor
            var left_inside = isOrContainsNode(containerNode,left_node),
                right_inside = isOrContainsNode(containerNode,right_node);
            if( left_inside && right_inside )
                return true;
            // Selection before/after container?
            if( ! left_inside && containerNode.compareDocumentPosition(left_node) & Node.DOCUMENT_POSITION_FOLLOWING )
                return false; // selection after
            if( ! right_inside && containerNode.compareDocumentPosition(right_node) & Node.DOCUMENT_POSITION_PRECEDING )
                return false; // selection before
            // Selection partly before/after container
            // http://stackoverflow.com/questions/12243898/how-to-select-all-text-in-contenteditable-div
            var range = document.createRange();
            range.selectNodeContents( containerNode );
            if( left_inside )
                range.setStart( left_node, left_offset );
            if( right_inside )
                range.setEnd( right_node, right_offset );
            sel.removeAllRanges();
            sel.addRange(range);
            return true;
        }
        else if( document.selection )
        {
            var sel = document.selection;
            if( sel.type == 'Text' )
            {
                // Range of container
                // http://stackoverflow.com/questions/12243898/how-to-select-all-text-in-contenteditable-div
                var rangeContainer = document.body.createTextRange();
                rangeContainer.moveToElementText(containerNode);
                // Compare with selection range
                var range = sel.createRange();
                if( rangeContainer.inRange(range) )
                    return true;
                // Selection before/after container?
                if( rangeContainer.compareEndPoints('StartToEnd',range) > 0 )
                    return false;
                if( rangeContainer.compareEndPoints('EndToStart',range) < 0 )
                    return false;
                // Selection partly before/after container
                if( rangeContainer.compareEndPoints('StartToStart',range) > 0 )
                    range.setEndPoint('StartToStart',rangeContainer);
                if( rangeContainer.compareEndPoints('EndToEnd',range) < 0 )
                    range.setEndPoint('EndToEnd',rangeContainer);
                // select range
                range.select();
                return true;
            }
        }
        return true;
    };
    */

    // http://stackoverflow.com/questions/6690752/insert-html-at-caret-in-a-contenteditable-div/6691294#6691294
    // http://stackoverflow.com/questions/4823691/insert-an-html-element-in-a-contenteditable-element
    // http://stackoverflow.com/questions/6139107/programatically-select-text-in-a-contenteditable-html-element
    var pasteHtmlAtCaret = function( containerNode, html )
    {
        if( window.getSelection )
        {
            // IE9 and non-IE
            var sel = window.getSelection();
            if( sel.getRangeAt && sel.rangeCount )
            {
                var range = sel.getRangeAt(0);
                // Range.createContextualFragment() would be useful here but is
                // only relatively recently standardized and is not supported in
                // some browsers (IE9, for one)
                var el = document.createElement('div');
                el.innerHTML = html;
                var frag = document.createDocumentFragment(), node, lastNode;
                while ( (node = el.firstChild) ) {
                    lastNode = frag.appendChild(node);
                }
                if( isOrContainsNode(containerNode, range.commonAncestorContainer) )
                {
                    range.deleteContents();
                    range.insertNode(frag);
                }
                else {
                    containerNode.appendChild(frag);
                }
                // Preserve the selection
                if( lastNode )
                {
                    range = range.cloneRange();
                    range.setStartAfter(lastNode);
                    range.collapse(true);
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
            }
        }
        else if( document.selection )
        {
            // IE <= 8
            var sel = document.selection;
            if( sel.type != 'Control' )
            {
                var originalRange = sel.createRange();
                originalRange.collapse(true);
                var range = sel.createRange();
                if( isOrContainsNode(containerNode, range.parentElement()) )
                    range.pasteHTML( html );
                else // simply append to Editor
                {
                    var textRange = document.body.createTextRange();
                    textRange.moveToElementText(containerNode);
                    textRange.collapse(false);
                    textRange.select();
                    textRange.pasteHTML( html );
                }
                // Preserve the selection
                range = sel.createRange();
                range.setEndPoint('StartToEnd', originalRange);
                range.select();
            }
        }
    };

    // Interface: Create wysiwyg
    var wysiwyg = function( option )
    {
        // Options
        option = option || {};
        var option_element = option.element || null;
        if( typeof(option_element) == 'string' )
            option_element = document.getElementById( option_element );
        var option_contenteditable = option.contenteditable || null;
        if( typeof(option_contenteditable) == 'string' )
            option_contenteditable = document.getElementById( option_contenteditable );
        var option_onkeydown = option.onKeyDown || null;
        var option_onkeypress = option.onKeyPress || null;
        var option_onkeyup = option.onKeyUp || null;
        var option_onselection = option.onSelection || null;
        var option_onplaceholder = option.onPlaceholder || null;
        var option_onopenpopup = option.onOpenpopup || null;
        var option_onclosepopup = option.onClosepopup || null;
        var option_hijackcontextmenu = option.hijackContextmenu || false;
        var option_readonly = option.readOnly || false;

        // Keep textarea if browser can't handle content-editable
        var is_textarea = option_element.nodeName == 'TEXTAREA' || option_element.nodeName == 'INPUT';
        if( is_textarea )
        {
            // http://stackoverflow.com/questions/1882205/how-do-i-detect-support-for-contenteditable-via-javascript
            var canContentEditable = 'contentEditable' in document.body;
            if( canContentEditable )
            {
                // Sniffer useragent...
                var webkit = navigator.userAgent.match(/(?:iPad|iPhone|Android).* AppleWebKit\/([^ ]+)/);
                if( webkit && 420 <= parseInt(webkit[1]) && parseInt(webkit[1]) < 534 ) // iPhone 1 was Webkit/420
                    canContentEditable = false;
            }
            if( ! canContentEditable )
            {
                // Keep textarea
                var node_textarea = option_element;
                // Add a 'newline' after each '<br>'
                var newlineAfterBR = function( html ) {
                    return html.replace(/<br[ \/]*>\n?/gi,'<br>\n');
                };
                node_textarea.value = newlineAfterBR( node_textarea.value );
                // Command structure
                var dummy_this = function() {
                    return this;
                };
                var dummy_null = function() {
                    return null;
                };
                return {
                    legacy: true,
                    // properties
                    getElement: function()
                    {
                        return node_textarea;
                    },
                    getHTML: function()
                    {
                        return node_textarea.value;
                    },
                    setHTML: function( html )
                    {
                        node_textarea.value = newlineAfterBR( html );
                        return this;
                    },
                    getSelectedHTML: dummy_null,
                    sync: dummy_this,
                    readOnly: function( readonly )
                    {
                        // query read-only
                        if( readonly === undefined )
                            return node_textarea.hasAttribute ? node_textarea.hasAttribute('readonly') : 
                                                                !!node_textarea.getAttribute('readonly'); // IE7
                        // set read-only
                        if( readonly )
                            node_textarea.setAttribute( 'readonly', 'readonly' );
                        else
                            node_textarea.removeAttribute( 'readonly' );
                        return this;
                    },
                    // selection and popup
                    collapseSelection: dummy_this,
                    expandSelection: dummy_this,
                    openPopup: dummy_null,
                    closePopup: dummy_this,
                    // exec commands
                    removeFormat: dummy_this,
                    bold: dummy_this,
                    italic: dummy_this,
                    underline: dummy_this,
                    strikethrough: dummy_this,
                    forecolor: dummy_this,
                    highlight: dummy_this,
                    fontName: dummy_this,
                    fontSize: dummy_this,
                    subscript: dummy_this,
                    superscript: dummy_this,
                    align: dummy_this,
                    format: dummy_this,
                    indent: dummy_this,
                    insertLink: dummy_this,
                    insertImage: dummy_this,
                    insertHTML: dummy_this,
                    insertList: dummy_this
                };
            }
        }

        // create content-editable
        var node_textarea = null,
            node_wysiwyg = null;
        if( is_textarea )
        {
            // Textarea
            node_textarea = option_element;
            node_textarea.style.display = 'none';

            // Contenteditable
            if( option_contenteditable )
                node_wysiwyg = option_contenteditable;
            else
            {
                node_wysiwyg = document.createElement( 'DIV' );
                node_wysiwyg.innerHTML = node_textarea.value || '';
                var parent = node_textarea.parentNode,
                    next = node_textarea.nextSibling;
                if( next )
                    parent.insertBefore( node_wysiwyg, next );
                else
                    parent.appendChild( node_wysiwyg );
            }
        }
        else
            node_wysiwyg = option_element;
        // If not read-only
        if( ! option_readonly )
            node_wysiwyg.setAttribute( 'contentEditable', 'true' ); // IE7 is case sensitive

        // IE8 uses 'document' instead of 'window'
        // http://tanalin.com/en/articles/ie-version-js/ - http://stackoverflow.com/questions/10964966/detect-ie-version-prior-to-v9-in-javascript
        var window_ie8 = (document.all && (! document.documentMode || document.documentMode <= 8)) ? document : window;

        // Sync Editor with Textarea
        var syncTextarea = null,
            callUpdates;
        if( is_textarea )
        {
            var previous_html = node_wysiwyg.innerHTML;
            syncTextarea = function()
            {
                var new_html = node_wysiwyg.innerHTML;
                if( new_html == previous_html )
                    return ;
                // HTML changed
                node_textarea.value = new_html;
                previous_html = new_html;
                // Event Handler
                fireEvent( node_textarea, 'change', false );
            };

            // handle reset event
            var form = node_textarea.form;
            if( form )
            {
                addEvent( form, 'reset', function() {
                    node_wysiwyg.innerHTML = '';
                    syncTextarea();
                    callUpdates( true );
                });
            }
        }

        // Show placeholder
        var showPlaceholder;
        if( option_onplaceholder )
        {
            var placeholder_visible = false;
            showPlaceholder = function()
            {
                // Test if wysiwyg has content
                var wysiwyg_empty = true;
                var node = node_wysiwyg;
                while( node )
                {
                    node = nextNode( node, node_wysiwyg );
                    // Test if node contains something visible
                    if( ! node )
                        ;
                    else if( node.nodeType == Node_ELEMENT_NODE )
                    {
                        if( node.nodeName == 'IMG' )
                        {
                            wysiwyg_empty = false;
                            break;
                        }
                    }
                    else if( node.nodeType == Node_TEXT_NODE )
                    {
                        var text = node.nodeValue;
                        if( text && text.search(/[^\s]/) != -1 )
                        {
                            wysiwyg_empty = false;
                            break;
                        }
                    }
                }
                if( placeholder_visible != wysiwyg_empty )
                {
                    option_onplaceholder( wysiwyg_empty );
                    placeholder_visible = wysiwyg_empty;
                }
            };
            showPlaceholder();
        }

        // Handle selection
        var popup_saved_selection = null, // preserve selection during popup
            handleSelection = null,
            debounced_handleSelection = null;
        if( option_onselection )
        {
            handleSelection = function( clientX, clientY, rightclick )
            {
                // Detect collapsed selection
                var collapsed = getSelectionCollapsed( node_wysiwyg );
                // List of all selected nodes
                var nodes = getSelectedNodes( node_wysiwyg );
                // Rectangle of the selection
                var rect = (clientX === null || clientY === null) ? null :
                            {
                                left: clientX,
                                top: clientY,
                                width: 0,
                                height: 0
                            };
                var selectionRect = getSelectionRect();
                if( selectionRect )
                    rect = selectionRect;
                if( rect )
                {
                    // So far 'rect' is relative to viewport
                    if( node_wysiwyg.getBoundingClientRect )
                    {
                        // Make it relative to the editor via 'getBoundingClientRect()'
                        var boundingrect = node_wysiwyg.getBoundingClientRect();
                        rect.left -= parseInt(boundingrect.left);
                        rect.top -= parseInt(boundingrect.top);
                    }
                    else
                    {
                        var node = node_wysiwyg,
                            offsetLeft = 0,
                            offsetTop = 0,
                            fixed = false;
                        do {
                            offsetLeft += node.offsetLeft ? parseInt(node.offsetLeft) : 0;
                            offsetTop += node.offsetTop ? parseInt(node.offsetTop) : 0;
                            if( node.style.position == 'fixed' )
                                fixed = true;
                        }
                        while( node = node.offsetParent );
                        rect.left -= offsetLeft - (fixed ? 0 : window.pageXOffset);
                        rect.top -= offsetTop - (fixed ? 0 : window.pageYOffset);
                    }
                    // Trim rectangle to the editor
                    if( rect.left < 0 )
                        rect.left = 0;
                    if( rect.top < 0 )
                        rect.top = 0;
                    if( rect.width > node_wysiwyg.offsetWidth )
                        rect.width = node_wysiwyg.offsetWidth;
                    if( rect.height > node_wysiwyg.offsetHeight )
                        rect.height = node_wysiwyg.offsetHeight;
                }
                else if( nodes.length )
                {
                    // What else could we do? Offset of first element...
                    for( var i=0; i < nodes.length; ++i )
                    {
                        var node = nodes[i];
                        if( node.nodeType != Node_ELEMENT_NODE )
                            continue;
                        rect = {
                                left: node.offsetLeft,
                                top: node.offsetTop,
                                width: node.offsetWidth,
                                height: node.offsetHeight
                            };
                        break;
                    }
                }
                // Callback
                option_onselection( collapsed, rect, nodes, rightclick );
            };
            debounced_handleSelection = debounce( handleSelection, 1 );
        }

        // Open popup
        var node_popup = null;
        var popupClickClose = function( e )
        {
            // http://www.quirksmode.org/js/events_properties.html
            if( !e )
                var e = window.event;
            var target = e.target || e.srcElement;
            if( target.nodeType == Node_TEXT_NODE ) // defeat Safari bug
                target = target.parentNode;
            // Click within popup?
            if( isOrContainsNode(node_popup,target) )
                return ;
            // close popup
            popupClose();
        };
        var popupOpen = function()
        {
            // Already open?
            if( node_popup )
                return node_popup;

            // Global click closes popup
            addEvent( window_ie8, 'mousedown', popupClickClose, true );

            // Create popup element
            node_popup = document.createElement( 'DIV' );
            var parent = node_wysiwyg.parentNode,
                next = node_wysiwyg.nextSibling;
            if( next )
                parent.insertBefore( node_popup, next );
            else
                parent.appendChild( node_popup );
            if( option_onopenpopup )
                option_onopenpopup();
            return node_popup;
        };
        var popupClose = function()
        {
            if( ! node_popup )
                return ;
            node_popup.parentNode.removeChild( node_popup );
            node_popup = null;
            removeEvent( window_ie8, 'mousedown', popupClickClose, true );
            if( option_onclosepopup )
                option_onclosepopup();
        };

        // Focus/Blur events
        addEvent( node_wysiwyg, 'focus', function()
        {
            // forward focus/blur to the textarea
            if( node_textarea )
                fireEvent( node_textarea, 'focus', false );
        });
        addEvent( node_wysiwyg, 'blur', function()
        {
            // sync textarea immediately
            if( syncTextarea )
                syncTextarea();
            // forward focus/blur to the textarea
            if( node_textarea )
                fireEvent( node_textarea, 'blur', false );
        });

        // Change events
        var debounced_changeHandler = null;
        if( showPlaceholder || syncTextarea )
        {
            // debounce 'syncTextarea' a second time, because 'innerHTML' is quite burdensome
            var debounced_syncTextarea = syncTextarea ? debounce( syncTextarea, 250, true ) : null; // high timeout is save, because of "onblur" fires immediately
            var changeHandler = function( e )
            {
                if( showPlaceholder )
                    showPlaceholder();
                if( debounced_syncTextarea )
                    debounced_syncTextarea();
            };
            debounced_changeHandler = debounce( changeHandler, 1 );

            // Catch change events
            // http://stackoverflow.com/questions/1391278/contenteditable-change-events/1411296#1411296
            // http://stackoverflow.com/questions/8694054/onchange-event-with-contenteditable/8694125#8694125
            // https://github.com/mindmup/bootstrap-wysiwyg/pull/50/files
            // http://codebits.glennjones.net/editing/events-contenteditable.htm
            addEvent( node_wysiwyg, 'input', debounced_changeHandler );
            addEvent( node_wysiwyg, 'DOMNodeInserted', debounced_changeHandler );
            addEvent( node_wysiwyg, 'DOMNodeRemoved', debounced_changeHandler );
            addEvent( node_wysiwyg, 'DOMSubtreeModified', debounced_changeHandler );
            addEvent( node_wysiwyg, 'DOMCharacterDataModified', debounced_changeHandler ); // polyfill input in IE 9-10
            addEvent( node_wysiwyg, 'propertychange', debounced_changeHandler );
            addEvent( node_wysiwyg, 'textInput', debounced_changeHandler );
            addEvent( node_wysiwyg, 'paste', debounced_changeHandler );
            addEvent( node_wysiwyg, 'cut', debounced_changeHandler );
            addEvent( node_wysiwyg, 'drop', debounced_changeHandler );
        }

        // Key events
        // http://sandbox.thewikies.com/html5-experiments/key-events.html
        var keyHandler = function( e, phase )
        {
            // http://www.quirksmode.org/js/events_properties.html
            if( !e )
                var e = window.event;
            // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
            // http://stackoverflow.com/questions/1444477/keycode-and-charcode
            // http://stackoverflow.com/questions/4285627/javascript-keycode-vs-charcode-utter-confusion
            // http://unixpapa.com/js/key.html
            var key = e.which || e.keyCode,
                character = String.fromCharCode(key || e.charCode),
                shiftKey = e.shiftKey || false,
                altKey = e.altKey || false,
                ctrlKey = e.ctrlKey || false,
                metaKey = e.metaKey || false;
             if( phase == 1 )
            {
                // Callback
                if( option_onkeydown && option_onkeydown(key, character, shiftKey, altKey, ctrlKey, metaKey) === false )
                    return cancelEvent( e ); // dismiss key
            }
            else if( phase == 2 )
            {
                // Callback
                if( option_onkeypress && option_onkeypress(key, character, shiftKey, altKey, ctrlKey, metaKey) === false )
                    return cancelEvent( e ); // dismiss key
            }
            else if( phase == 3 )
            {
                // Callback
                if( option_onkeyup && option_onkeyup(key, character, shiftKey, altKey, ctrlKey, metaKey) === false )
                    return cancelEvent( e ); // dismiss key
            }

            // Keys can change the selection
            if( phase == 2 || phase == 3 )
            {
                popup_saved_selection = null;
                if( debounced_handleSelection )
                    debounced_handleSelection( null, null, false );
            }
            // Most keys can cause text-changes
            if( phase == 2 && debounced_changeHandler )
            {
                switch( key )
                {
                    case 33: // pageUp
                    case 34: // pageDown
                    case 35: // end
                    case 36: // home
                    case 37: // left
                    case 38: // up
                    case 39: // right
                    case 40: // down
                        // cursors do not
                        break;
                    default:
                        // call change handler
                        debounced_changeHandler();
                        break;
                }
            }
        };
        addEvent( node_wysiwyg, 'keydown', function( e )
        {
            return keyHandler( e, 1 );
        });
        addEvent( node_wysiwyg, 'keypress', function( e )
        {
            return keyHandler( e, 2 );
        });
        addEvent( node_wysiwyg, 'keyup', function( e )
        {
            return keyHandler( e, 3 );
        });

        // Mouse events
        var mouseHandler = function( e, rightclick )
        {
            // http://www.quirksmode.org/js/events_properties.html
            if( !e )
                var e = window.event;
            // mouse position
            var clientX = null,
                clientY = null;
            if( e.clientX && e.clientY )
            {
                clientX = e.clientX;
                clientY = e.clientY;
            }
            else if( e.pageX && e.pageY )
            {
                clientX = e.pageX - window.pageXOffset;
                clientY = e.pageY - window.pageYOffset;
            }
            // mouse button
            if( e.which && e.which == 3 )
                rightclick = true;
            else if( e.button && e.button == 2 )
                rightclick = true;

            // remove event handler
            removeEvent( window_ie8, 'mouseup', mouseHandler );
            // Callback selection
            popup_saved_selection = null;
            if( ! option_hijackcontextmenu && rightclick )
                return ;
            if( debounced_handleSelection )
                debounced_handleSelection( clientX, clientY, rightclick );
        };
        addEvent( node_wysiwyg, 'mousedown', function( e )
        {
            // catch event if 'mouseup' outside 'node_wysiwyg'
            removeEvent( window_ie8, 'mouseup', mouseHandler );
            addEvent( window_ie8, 'mouseup', mouseHandler );
        });
        addEvent( node_wysiwyg, 'mouseup', function( e )
        {
            mouseHandler( e );
            // Trigger change
            if( debounced_changeHandler )
                debounced_changeHandler();
        });
        addEvent( node_wysiwyg, 'dblclick', function( e )
        {
            mouseHandler( e );
        });
        addEvent( node_wysiwyg, 'selectionchange',  function( e )
        {
            mouseHandler( e );
        });
        if( option_hijackcontextmenu )
        {
            addEvent( node_wysiwyg, 'contextmenu', function( e )
            {
                mouseHandler( e, true );
                return cancelEvent( e );
            });
        }


        // exec command
        // https://developer.mozilla.org/en-US/docs/Web/API/document.execCommand
        // http://www.quirksmode.org/dom/execCommand.html
        var execCommand = function( command, param, force_selection )
        {
            // give selection to contenteditable element
            restoreSelection( node_wysiwyg, popup_saved_selection );
            // tried to avoid forcing focus(), but ... - https://github.com/wysiwygjs/wysiwyg.js/issues/51
            node_wysiwyg.focus();
            if( ! selectionInside(node_wysiwyg, force_selection) ) // returns 'selection inside editor'
                return false;
            
            // for webkit, mozilla, opera
            if( window.getSelection )
            {
                // Buggy, call within 'try/catch'
                try {
                    if( document.queryCommandSupported && ! document.queryCommandSupported(command) )
                        return false;
                    return document.execCommand( command, false, param );
                }
                catch( e ) {
                }
            }
            // for IE
            else if( document.selection )
            {
                var sel = document.selection;
                if( sel.type != 'None' )
                {
                    var range = sel.createRange();
                    // Buggy, call within 'try/catch'
                    try {
                        if( ! range.queryCommandEnabled(command) )
                            return false;
                        return range.execCommand( command, false, param );
                    }
                    catch( e ) {
                    }
                }
            }
            return false;
        };

        // Workaround IE11 - https://github.com/wysiwygjs/wysiwyg.js/issues/14
        var trailingDiv = null;
        var IEtrailingDIV = function()
        {
            // Detect IE - http://stackoverflow.com/questions/17907445/how-to-detect-ie11
            if( document.all || !!window.MSInputMethodContext )
            {
                trailingDiv = document.createElement( 'DIV' );
                node_wysiwyg.appendChild( trailingDiv );
            }
        };
        // Command structure
        callUpdates = function( selection_destroyed )
        {
            // Remove IE11 workaround
            if( trailingDiv )
            {
                node_wysiwyg.removeChild( trailingDiv );
                trailingDiv = null;
            }
            // change-handler
            if( debounced_changeHandler )
                debounced_changeHandler();
            // handle saved selection
            if( selection_destroyed )
            {
                collapseSelectionEnd();
                popup_saved_selection = null; // selection destroyed
            }
            else if( popup_saved_selection )
                popup_saved_selection = saveSelection( node_wysiwyg );
        };
        return {
            // properties
            getElement: function()
            {
                return node_wysiwyg;
            },
            getHTML: function()
            {
                return node_wysiwyg.innerHTML;
            },
            setHTML: function( html )
            {
                node_wysiwyg.innerHTML = html || '<br>';
                callUpdates( true ); // selection destroyed
                return this;
            },
            getSelectedHTML: function()
            {
                restoreSelection( node_wysiwyg, popup_saved_selection );
                if( ! selectionInside(node_wysiwyg) )
                    return null;
                return getSelectionHtml( node_wysiwyg );
            },
            sync: function()
            {
                if( syncTextarea )
                    syncTextarea();
                return this;
            },
            readOnly: function( readonly )
            {
                // query read-only
                if( readonly === undefined )
                    return node_wysiwyg.hasAttribute ? !node_wysiwyg.hasAttribute('contentEditable') : 
                                                       !node_wysiwyg.getAttribute('contentEditable'); // IE7
                // set read-only
                if( readonly )
                    node_wysiwyg.removeAttribute( 'contentEditable' );
                else
                    node_wysiwyg.setAttribute( 'contentEditable', 'true' ); // IE7 is case sensitive
                return this;
            },
            // selection and popup
            collapseSelection: function()
            {
                collapseSelectionEnd();
                popup_saved_selection = null; // selection destroyed
                return this;
            },
            expandSelection: function( preceding, following )
            {
                restoreSelection( node_wysiwyg, popup_saved_selection );
                if( ! selectionInside(node_wysiwyg) )
                    return this;
                expandSelectionCaret( node_wysiwyg, preceding, following );
                popup_saved_selection = saveSelection( node_wysiwyg ); // save new selection
                return this;
            },
            openPopup: function()
            {
                if( ! popup_saved_selection )
                    popup_saved_selection = saveSelection( node_wysiwyg ); // save current selection
                return popupOpen();
            },
            closePopup: function()
            {
                popupClose();
                return this;
            },
            removeFormat: function()
            {
                execCommand( 'removeFormat' );
                execCommand( 'unlink' );
                callUpdates();
                return this;
            },
            bold: function()
            {
                execCommand( 'bold' );
                callUpdates();
                return this;
            },
            italic: function()
            {
                execCommand( 'italic' );
                callUpdates();
                return this;
            },
            underline: function()
            {
                execCommand( 'underline' );
                callUpdates();
                return this;
            },
            strikethrough: function()
            {
                execCommand( 'strikeThrough' );
                callUpdates();
                return this;
            },
            forecolor: function( color )
            {
                execCommand( 'foreColor', color );
                callUpdates();
                return this;
            },
            highlight: function( color )
            {
                // http://stackoverflow.com/questions/2756931/highlight-the-text-of-the-dom-range-element
                if( ! execCommand('hiliteColor',color) ) // some browsers apply 'backColor' to the whole block
                    execCommand( 'backColor', color );
                callUpdates();
                return this;
            },
            fontName: function( name )
            {
                execCommand( 'fontName', name );
                callUpdates();
                return this;
            },
            fontSize: function( size )
            {
                execCommand( 'fontSize', size );
                callUpdates();
                return this;
            },
            subscript: function()
            {
                execCommand( 'subscript' );
                callUpdates();
                return this;
            },
            superscript: function()
            {
                execCommand( 'superscript' );
                callUpdates();
                return this;
            },
            align: function( align )
            {
                IEtrailingDIV();
                if( align == 'left' )
                    execCommand( 'justifyLeft' );
                else if( align == 'center' )
                    execCommand( 'justifyCenter' );
                else if( align == 'right' )
                    execCommand( 'justifyRight' );
                else if( align == 'justify' )
                    execCommand( 'justifyFull' );
                callUpdates();
                return this;
            },
            format: function( tagname )
            {
                IEtrailingDIV();
                execCommand( 'formatBlock', tagname );
                callUpdates();
                return this;
            },
            indent: function( outdent )
            {
                IEtrailingDIV();
                execCommand( outdent ? 'outdent' : 'indent' );
                callUpdates();
                return this;
            },
            insertLink: function( url )
            {
                execCommand( 'createLink', url );
                callUpdates( true ); // selection destroyed
                return this;
            },
            insertImage: function( url )
            {
                execCommand( 'insertImage', url, true );
                callUpdates( true ); // selection destroyed
                return this;
            },
            insertHTML: function( html )
            {
                if( ! execCommand('insertHTML', html, true) )
                {
                    // IE 11 still does not support 'insertHTML'
                    restoreSelection( node_wysiwyg, popup_saved_selection );
                    selectionInside( node_wysiwyg, true );
                    pasteHtmlAtCaret( node_wysiwyg, html );
                }
                callUpdates( true ); // selection destroyed
                return this;
            },
            insertList: function( ordered )
            {
                IEtrailingDIV();
                execCommand( ordered ? 'insertOrderedList' : 'insertUnorderedList' );
                callUpdates();
                return this;
            }
        };
    };

    return wysiwyg;
});
﻿(function(factory) {
        return factory(window, document, jQuery);
})(function(window, document, $){
    'use strict';

    // http://stackoverflow.com/questions/17242144/javascript-convert-hsb-hsv-color-to-rgb-accurately
    var HSVtoRGB = function( h, s, v )
    {
        var r, g, b, i, f, p, q, t;
        i = Math.floor(h * 6);
        f = h * 6 - i;
        p = v * (1 - s);
        q = v * (1 - f * s);
        t = v * (1 - (1 - f) * s);
        switch (i % 6)
        {
            case 0: r = v, g = t, b = p; break;
            case 1: r = q, g = v, b = p; break;
            case 2: r = p, g = v, b = t; break;
            case 3: r = p, g = q, b = v; break;
            case 4: r = t, g = p, b = v; break;
            case 5: r = v, g = p, b = q; break;
        }
        var hr = Math.floor(r * 255).toString(16);
        var hg = Math.floor(g * 255).toString(16);
        var hb = Math.floor(b * 255).toString(16);
        return '#' + (hr.length < 2 ? '0' : '') + hr +
                     (hg.length < 2 ? '0' : '') + hg +
                     (hb.length < 2 ? '0' : '') + hb;
    };

    // Encode htmlentities() - http://stackoverflow.com/questions/5499078/fastest-method-to-escape-html-tags-as-html-entities
    var html_encode = function( string )
    {
        return string.replace(/[&<>"]/g, function(tag)
        {
            var charsToReplace = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            };
            return charsToReplace[tag] || tag;
        });
    };

    // Create the Editor
    var create_editor = function( $textarea, classes, placeholder, toolbar_position, toolbar_buttons, toolbar_submit, label_selectImage,
                                  placeholder_url, placeholder_embed, max_imagesize, filter_imageType, on_imageupload, force_imageupload, video_from_url,
                                  on_keydown, on_keypress, on_keyup, on_autocomplete )
    {
        // Content: Insert link
        var wysiwygeditor_insertLink = function( wysiwygeditor, url )
        {
            if( ! url )
                ;
            else if( wysiwygeditor.getSelectedHTML() )
                wysiwygeditor.insertLink( url );
            else
                wysiwygeditor.insertHTML( '<a href="' + html_encode(url) + '">' + html_encode(url) + '</a>' );
            wysiwygeditor.closePopup().collapseSelection();
        };
        var content_insertlink = function(wysiwygeditor, $modify_link)
        {
            var $inputurl = $('<input type="text" value="">').val( $modify_link ? $modify_link.attr('href') : '' )  // prop('href') does not reflect real value
                                .addClass('wysiwyg-input')
                                .keypress(function(event){
                                    if( event.which != 10 && event.which != 13 )
                                        return ;
                                    if( $modify_link )
                                    {
                                        $modify_link.prop( 'href', $inputurl.val() );
                                        wysiwygeditor.closePopup().collapseSelection();
                                    }
                                    else
                                        wysiwygeditor_insertLink( wysiwygeditor,$inputurl.val() );
                                });
            if( placeholder_url )
                $inputurl.prop( 'placeholder', placeholder_url );
            var $okaybutton = $();
            if( toolbar_submit )
                $okaybutton = toolbar_button(toolbar_submit).click(function(event){
                                    if( $modify_link )
                                    {
                                        $modify_link.prop( 'href', $inputurl.val() );
                                        wysiwygeditor.closePopup().collapseSelection();
                                    }
                                    else
                                        wysiwygeditor_insertLink( wysiwygeditor, $inputurl.val() );
                                    event.stopPropagation();
                                    event.preventDefault();
                                    return false;
                                });
            var $content = $('<div/>').addClass('wysiwyg-toolbar-form')
                                      .prop('unselectable','on');
            $content.append($inputurl).append($okaybutton);
            return $content;
        };

        // Content: Insert image
        var content_insertimage = function(wysiwygeditor)
        {
            // Add image to editor
            var insert_image_wysiwyg = function( url, filename )
            {
                var html = '<img id="wysiwyg-insert-image" src="" alt=""' + (filename ? ' title="'+html_encode(filename)+'"' : '') + '>';
                wysiwygeditor.insertHTML( html ).closePopup().collapseSelection();
                var $image = $('#wysiwyg-insert-image').removeAttr('id');
                if( max_imagesize )
                {
                    $image.css({maxWidth: max_imagesize[0]+'px',
                                maxHeight: max_imagesize[1]+'px'})
                          .load( function() {
                                $image.css({maxWidth: '',
                                            maxHeight: ''});
                                // Resize $image to fit "clip-image"
                                var image_width = $image.width(),
                                    image_height = $image.height();
                                if( image_width > max_imagesize[0] || image_height > max_imagesize[1] )
                                {
                                    if( (image_width/image_height) > (max_imagesize[0]/max_imagesize[1]) )
                                    {
                                        image_height = parseInt(image_height / image_width * max_imagesize[0]);
                                        image_width = max_imagesize[0];
                                    }
                                    else
                                    {
                                        image_width = parseInt(image_width / image_height * max_imagesize[1]);
                                        image_height = max_imagesize[1];
                                    }
                                    $image.prop('width',image_width)
                                          .prop('height',image_height);
                                }
                            });
                }
                $image.prop('src', url);
            };
            // Create popup
            var $content = $('<div/>').addClass('wysiwyg-toolbar-form')
                                      .prop('unselectable','on');
            // Add image via 'Browse...'
            var $fileuploader = null,
                $fileuploader_input = $('<input type="file">')
                                        .css({position: 'absolute',
                                              left: 0,
                                              top: 0,
                                              width: '100%',
                                              height: '100%',
                                              opacity: 0,
                                              cursor: 'pointer'});
            if( ! force_imageupload && window.File && window.FileReader && window.FileList )
            {
                // File-API
                var loadImageFromFile = function( file )
                {
                    // Only process image files
                    if( typeof(filter_imageType) === 'function' && ! filter_imageType(file) )
                        return;
                    else if( ! file.type.match(filter_imageType) )
                        return;
                    var reader = new FileReader();
                    reader.onload = function(event) {
                        var dataurl = event.target.result;
                        insert_image_wysiwyg( dataurl, file.name );
                    };
                    // Read in the image file as a data URL
                    reader.readAsDataURL( file );
                };
                $fileuploader = $fileuploader_input
                                    .prop('draggable','true')
                                    .change(function(event){
                                        var files = event.target.files; // FileList object
                                        for(var i=0; i < files.length; ++i)
                                            loadImageFromFile( files[i] );
                                    })
                                    .on('dragover',function(event){
                                        event.originalEvent.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
                                        event.stopPropagation();
                                        event.preventDefault();
                                        return false;
                                    })
                                    .on('drop', function(event){
                                        var files = event.originalEvent.dataTransfer.files; // FileList object.
                                        for(var i=0; i < files.length; ++i)
                                            loadImageFromFile( files[i] );
                                        event.stopPropagation();
                                        event.preventDefault();
                                        return false;
                                    });
            }
            else if( on_imageupload )
            {
                // Upload image to a server
                var $input = $fileuploader_input
                                    .change(function(event){
                                        on_imageupload.call( this, insert_image_wysiwyg );
                                    });
                $fileuploader = $('<form/>').append($input);
            }
            if( $fileuploader )
                $('<div/>').addClass( 'wysiwyg-browse' )
                           .html( label_selectImage )
                           .append( $fileuploader )
                           .appendTo( $content );
            // Add image via 'URL'
            var $inputurl = $('<input type="text" value="">').addClass('wysiwyg-input')
                                .keypress(function(event){
                                    if( event.which == 10 || event.which == 13 )
                                        insert_image_wysiwyg( $inputurl.val() );
                                });
            if( placeholder_url )
                $inputurl.prop( 'placeholder', placeholder_url );
            var $okaybutton = $();
            if( toolbar_submit )
                $okaybutton = toolbar_button(toolbar_submit).click(function(event){
                                    insert_image_wysiwyg( $inputurl.val() );
                                    event.stopPropagation();
                                    event.preventDefault();
                                    return false;
                                });
            $content.append( $('<div/>').append($inputurl).append($okaybutton) );
            return $content;
        };

        // Content: Insert video
        var content_insertvideo = function(wysiwygeditor)
        {
            // Add video to editor
            var insert_video_wysiwyg = function( url, html )
            {
                url = $.trim(url||'');
                html = $.trim(html||'');
                var website_url = false;
                if( url.length && ! html.length )
                    website_url = url;
                else if( html.indexOf('<') == -1 && html.indexOf('>') == -1 &&
                         html.match(/^(?:https?:\/)?\/?(?:[^:\/\s]+)(?:(?:\/\w+)*\/)(?:[\w\-\.]+[^#?\s]+)(?:.*)?(?:#[\w\-]+)?$/) )
                    website_url = html;
                if( website_url && video_from_url )
                    html = video_from_url( website_url ) || '';
                if( ! html.length && website_url )
                    html = '<video src="' + html_encode(website_url) + '">';
                wysiwygeditor.insertHTML( html ).closePopup().collapseSelection();
            };
            // Create popup
            var $content = $('<div/>').addClass('wysiwyg-toolbar-form')
                                      .prop('unselectable','on');
            // Add video via '<embed/>'
            var $textareaembed = $('<textarea>').addClass('wysiwyg-input wysiwyg-inputtextarea');
            if( placeholder_embed )
                $textareaembed.prop( 'placeholder', placeholder_embed );
            $('<div/>').addClass( 'wysiwyg-embedcode' )
                       .append( $textareaembed )
                       .appendTo( $content );
            // Add video via 'URL'
            var $inputurl = $('<input type="text" value="">').addClass('wysiwyg-input')
                                .keypress(function(event){
                                    if( event.which == 10 || event.which == 13 )
                                        insert_video_wysiwyg( $inputurl.val() );
                                });
            if( placeholder_url )
                $inputurl.prop( 'placeholder', placeholder_url );
            var $okaybutton = $();
            if( toolbar_submit )
                $okaybutton = toolbar_button(toolbar_submit).click(function(event){
                                    insert_video_wysiwyg( $inputurl.val(), $textareaembed.val() );
                                    event.stopPropagation();
                                    event.preventDefault();
                                    return false;
                                });
            $content.append( $('<div/>').append($inputurl).append($okaybutton) );
            return $content;
        };

        // Content: Color palette
        var content_colorpalette = function( wysiwygeditor, forecolor )
        {
            var $content = $('<table/>')
                            .prop('cellpadding','0')
                            .prop('cellspacing','0')
                            .prop('unselectable','on');
            for( var row=1; row < 15; ++row ) // should be '16' - but last line looks so dark
            {
                var $rows = $('<tr/>');
                for( var col=0; col < 25; ++col ) // last column is grayscale
                {
                    var color;
                    if( col == 24 )
                    {
                        var gray = Math.floor(255 / 13 * (14 - row)).toString(16);
                        var hexg = (gray.length < 2 ? '0' : '') + gray;
                        color = '#' + hexg + hexg + hexg;
                    }
                    else
                    {
                        var hue        = col / 24;
                        var saturation = row <= 8 ? row     /8 : 1;
                        var value      = row  > 8 ? (16-row)/8 : 1;
                        color = HSVtoRGB( hue, saturation, value );
                    }
                    $('<td/>').addClass('wysiwyg-toolbar-color')
                              .prop('title', color)
                              .prop('unselectable','on')
                              .css({backgroundColor: color})
                              .click(function(){
                                  var color = this.title;
                                  if( forecolor )
                                      wysiwygeditor.forecolor( color ).closePopup().collapseSelection();
                                  else
                                      wysiwygeditor.highlight( color ).closePopup().collapseSelection();
                                  return false;
                              })
                              .appendTo( $rows );
                }
                $content.append( $rows );
            }
            return $content;
        };

        // Handlers
        var get_toolbar_handler = function( name, popup_callback )
        {
            switch( name )
            {
                case 'insertimage':
                    if( ! popup_callback )
                        return null;
                    return function( target ) {
                        popup_callback( content_insertimage(wysiwygeditor), target );
                    };
                case 'insertvideo':
                    if( ! popup_callback )
                        return null;
                    return function( target ) {
                        popup_callback( content_insertvideo(wysiwygeditor), target );
                    };
                case 'insertlink':
                    if( ! popup_callback )
                        return null;
                    return function( target ) {
                        popup_callback( content_insertlink(wysiwygeditor), target );
                    };
                case 'bold':
                    return function() {
                        wysiwygeditor.bold(); // .closePopup().collapseSelection()
                    };
                case 'italic':
                    return function() {
                        wysiwygeditor.italic(); // .closePopup().collapseSelection()
                    };
                case 'underline':
                    return function() {
                        wysiwygeditor.underline(); // .closePopup().collapseSelection()
                    };
                case 'strikethrough':
                    return function() {
                        wysiwygeditor.strikethrough(); // .closePopup().collapseSelection()
                    };
                case 'forecolor':
                    if( ! popup_callback )
                        return null;
                    return function( target ) {
                        popup_callback( content_colorpalette(wysiwygeditor,true), target );
                    };
                case 'highlight':
                    if( ! popup_callback )
                        return null;
                    return function( target ) {
                        popup_callback( content_colorpalette(wysiwygeditor,false), target );
                    };
                case 'alignleft':
                    return function() {
                        wysiwygeditor.align('left'); // .closePopup().collapseSelection()
                    };
                case 'aligncenter':
                    return function() {
                        wysiwygeditor.align('center'); // .closePopup().collapseSelection()
                    };
                case 'alignright':
                    return function() {
                        wysiwygeditor.align('right'); // .closePopup().collapseSelection()
                    };
                case 'alignjustify':
                    return function() {
                        wysiwygeditor.align('justify'); // .closePopup().collapseSelection()
                    };
                case 'subscript':
                    return function() {
                        wysiwygeditor.subscript(); // .closePopup().collapseSelection()
                    };
                case 'superscript':
                    return function() {
                        wysiwygeditor.superscript(); // .closePopup().collapseSelection()
                    };
                case 'indent':
                    return function() {
                        wysiwygeditor.indent(); // .closePopup().collapseSelection()
                    };
                case 'outdent':
                    return function() {
                        wysiwygeditor.indent(true); // .closePopup().collapseSelection()
                    };
                case 'orderedList':
                    return function() {
                        wysiwygeditor.insertList(true); // .closePopup().collapseSelection()
                    };
                case 'unorderedList':
                    return function() {
                        wysiwygeditor.insertList(); // .closePopup().collapseSelection()
                    };
                case 'removeformat':
                    return function() {
                        wysiwygeditor.removeFormat().closePopup().collapseSelection();
                    };
            }
            return null;
        }

        // Create the toolbar
        var toolbar_button = function( button ) {
            var $element = $('<a/>').addClass( 'wysiwyg-toolbar-icon' )
                                    .prop('href','#')
                                    .prop('unselectable','on')
                                    .append(button.image);
            // pass other properties as "prop()"
            $.each( button, function( name, value )
            {
                switch( name )
                {
                    // classes
                    case 'class':
                        $element.addClass( value );
                        break;
                    // special meaning
                    case 'image':
                    case 'html':
                    case 'popup':
                    case 'click':
                    case 'showstatic':
                    case 'showselection':
                        break;
                    default: // button.title, ...
                        $element.attr( name, value );
                        break;
                }
            });
            return $element;
        };
        var add_buttons_to_toolbar = function( $toolbar, selection, popup_open_callback, popup_position_callback )
        {
            $.each( toolbar_buttons, function(key, value) {
                if( ! value )
                    return ;
                // Skip buttons on the toolbar
                if( selection === false && 'showstatic' in value && ! value.showstatic )
                    return ;
                // Skip buttons on selection
                if( selection === true && 'showselection' in value && ! value.showselection )
                    return ;
                // Click handler
                var toolbar_handler;
                if( 'click' in value )
                    toolbar_handler = function( target ) {
                        value.click( $(target) );
                    };
                else if( 'popup' in value )
                    toolbar_handler = function( target ) {
                        var $popup = popup_open_callback();
                        var overwrite_offset = value.popup( $popup, $(target) );
                        popup_position_callback( $popup, target, overwrite_offset );
                    };
                else
                    toolbar_handler = get_toolbar_handler( key, function( $content, target ) {
                        var $popup = popup_open_callback();
                        $popup.append( $content );
                        popup_position_callback( $popup, target );
                        $popup.find('input[type=text]:first').focus();
                    });
                // Create the toolbar button
                var $button;
                if( toolbar_handler )
                    $button = toolbar_button( value ).click( function(event) {
                        toolbar_handler( event.currentTarget );
                        // Give the focus back to the editor. Technically not necessary
                        if( get_toolbar_handler(key) ) // only if not a popup-handler
                            wysiwygeditor.getElement().focus();
                        event.stopPropagation();
                        event.preventDefault();
                        return false;
                    });
                else if( value.html )
                    $button = $(value.html);
                if( $button )
                    $toolbar.append( $button );
            });
        };
        var popup_position = function( $popup, $container, left, top )  // left+top relative to $container
        {
            // Test parents
            var container_node = $container.get(0),
                offsetparent = container_node.offsetParent,
                offsetparent_left = 0,
                offsetparent_top = 0,
                offsetparent_break = false,
                offsetparent_window_left = 0,     //$.offset() does not work with Safari 3 and 'position:fixed'
                offsetparent_window_top = 0,
                offsetparent_fixed = false,
                offsetparent_overflow = false,
                popup_width = $popup.width(),
                node = offsetparent;
            while( node )
            {
                offsetparent_window_left += node.offsetLeft;
                offsetparent_window_top += node.offsetTop;
                var $node = $(node),
                    node_position = $node.css('position');
                if( node_position != 'static' )
                    offsetparent_break = true;
                else if( ! offsetparent_break )
                {
                    offsetparent_left += node.offsetLeft;
                    offsetparent_top += node.offsetTop;
                }
                if( node_position == 'fixed' )
                    offsetparent_fixed = true;
                if( $node.css('overflow') != 'visible' )
                    offsetparent_overflow = true;
                node = node.offsetParent;
            }
            // Move $popup as high as possible in the DOM tree: offsetParent of $container
            var $offsetparent = $(offsetparent || document.body);
            $offsetparent.append( $popup );
            left += offsetparent_left + container_node.offsetLeft; // $container.position() does not work with Safari 3
            top += offsetparent_top + container_node.offsetTop;
            // Trim to offset-parent
            if( offsetparent_fixed || offsetparent_overflow )
            {
                if( left + popup_width > $offsetparent.width() - 1 )
                    left = $offsetparent.width() - popup_width - 1;
                if( left < 1 )
                    left = 1;
            }
            // Trim to viewport
            var viewport_width = $(window).width();
            if( offsetparent_window_left + left + popup_width > viewport_width - 1 )
                left = viewport_width - offsetparent_window_left - popup_width - 1;
            var scroll_left = offsetparent_fixed ? 0 : $(window).scrollLeft();
            if( offsetparent_window_left + left < scroll_left + 1 )
                left = scroll_left - offsetparent_window_left + 1;
            // Set offset
            $popup.css({ left: parseInt(left) + 'px',
                         top: parseInt(top) + 'px' });
        };


        // Transform the textarea to contenteditable
        var hotkeys = {},
            autocomplete = null;
        var create_wysiwyg = function( $textarea, $editor, $container, $placeholder )
        {
            var handle_autocomplete = function( keypress, key, character, shiftKey, altKey, ctrlKey, metaKey )
            {
                if( ! on_autocomplete )
                    return ;
                var typed = autocomplete || '';
                switch( key )
                {
                    case  8: // backspace
                        typed = typed.substring( 0, typed.length - 1 );
                        // fall through
                    case 13: // enter
                    case 27: // escape
                    case 33: // pageUp
                    case 34: // pageDown
                    case 35: // end
                    case 36: // home
                    case 37: // left
                    case 38: // up
                    case 39: // right
                    case 40: // down
                        if( keypress )
                            return ;
                        character = false;
                        break;
                    default:
                        if( ! keypress )
                            return ;
                        typed += character;
                        break;
                }
                var rc = on_autocomplete( typed, key, character, shiftKey, altKey, ctrlKey, metaKey );
                if( typeof(rc) == 'object' && rc.length )
                {
                    // Show autocomplete
                    var $popup = $(wysiwygeditor.openPopup());
                    $popup.hide().addClass( 'wysiwyg-popup wysiwyg-popuphover' ) // show later
                          .empty().append( rc );
                    autocomplete = typed;
                }
                else
                {
                    // Hide autocomplete
                    wysiwygeditor.closePopup();
                    autocomplete = null;
                    return rc; // swallow key if 'false'
                }
            };

            // Options to wysiwyg.js
            var option = {
                element: $textarea.get(0),
                contenteditable: $editor ? $editor.get(0) : null,
                onKeyDown: function( key, character, shiftKey, altKey, ctrlKey, metaKey )
                    {
                        // Ask master
                        if( on_keydown && on_keydown(key, character, shiftKey, altKey, ctrlKey, metaKey) === false )
                            return false; // swallow key
                        // Exec hotkey (onkeydown because e.g. CTRL+B would oben the bookmarks)
                        if( character && !shiftKey && !altKey && ctrlKey && !metaKey )
                        {
                            var hotkey = character.toLowerCase();
                            if( ! hotkeys[hotkey] )
                                return ;
                            hotkeys[hotkey]();
                            return false; // prevent default
                        }
                        // Handle autocomplete
                        return handle_autocomplete( false, key, character, shiftKey, altKey, ctrlKey, metaKey );
                    },
                onKeyPress: function( key, character, shiftKey, altKey, ctrlKey, metaKey )
                    {
                        // Ask master
                        if( on_keypress && on_keypress(key, character, shiftKey, altKey, ctrlKey, metaKey) === false )
                            return false; // swallow key
                        // Handle autocomplete
                        return handle_autocomplete( true, key, character, shiftKey, altKey, ctrlKey, metaKey );
                    },
                onKeyUp: function( key, character, shiftKey, altKey, ctrlKey, metaKey )
                    {
                        // Ask master
                        if( on_keyup && on_keyup(key, character, shiftKey, altKey, ctrlKey, metaKey) === false )
                            return false; // swallow key
                    },
                onSelection: function( collapsed, rect, nodes, rightclick )
                    {
                        var show_popup = true,
                            $special_popup = null;
                        // Click on a link opens the link-popup
                        if( collapsed )
                            $.each( nodes, function(index, node) {
                                var $link = $(node).closest('a');
                                if( $link.length != 0 ) { // only clicks on text-nodes
                                    $special_popup = content_insertlink( wysiwygeditor, $link )
                                    return false; // break
                                }
                            });
                        // Read-Only?
                        if( wysiwygeditor.readOnly() )
                            show_popup = false;
                        // Fix type error - https://github.com/wysiwygjs/wysiwyg.js/issues/4
                        else if( ! rect )
                            show_popup = false;
                        // Force a special popup?
                        else if( $special_popup )
                            ;
                        // A right-click always opens the popup
                        else if( rightclick )
                            ;
                        // Autocomplete popup?
                        else if( autocomplete )
                            ;
                        // No selection-popup wanted?
                        else if( $.inArray('selection',toolbar_position.split('-')) == -1 )
                            show_popup = false;
                        // Selected popup wanted, but nothing selected (=selection collapsed)
                        else if( collapsed )
                            show_popup = false;
                        // Only one image? Better: Display a special image-popup
                        else if( nodes.length == 1 && nodes[0].nodeName == 'IMG' ) // nodes is not a sparse array
                            show_popup = false;
                        if( ! show_popup )
                        {
                            wysiwygeditor.closePopup();
                            return ;
                        }
                        // Popup position
                        var $popup;
                        var apply_popup_position = function()
                        {
                            var popup_width = $popup.outerWidth();
                            // Point is the center of the selection - relative to $parent not the element
                            var $parent = $textarea.parent(),
                                container_offset = $parent.offset(),
                                editor_offset = $(wysiwygeditor.getElement()).offset();
                            var left = rect.left + parseInt(rect.width / 2) - parseInt(popup_width / 2) + editor_offset.left - container_offset.left;
                            var top = rect.top + rect.height + editor_offset.top - container_offset.top;
                            popup_position( $popup, $parent, left, top );
                        };
                        // Open popup
                        $popup = $(wysiwygeditor.openPopup());
                        // if wrong popup -> close and open a new one
                        if( ! $popup.hasClass('wysiwyg-popuphover') || (!$popup.data('wysiwygjs-special')) != (!$special_popup) )
                            $popup = $(wysiwygeditor.closePopup().openPopup());
                        if( autocomplete )
                            $popup.show();
                        else if( ! $popup.hasClass('wysiwyg-popup') )
                        {
                            // add classes + buttons
                            $popup.addClass( 'wysiwyg-popup wysiwyg-popuphover' );
                            if( $special_popup )
                                $popup.empty().append( $special_popup ).data('wysiwygjs-special',true);
                            else
                                add_buttons_to_toolbar( $popup, true,
                                    function() {
                                        return $popup.empty();
                                    },
                                    apply_popup_position );
                        }
                        // Apply position
                        apply_popup_position();
                    },
                onOpenpopup: function() {
                        add_class_active();
                    },
                onClosepopup: function() {
                        autocomplete = null;
                        remove_class_active();
                    },
                hijackContextmenu: (toolbar_position == 'selection'),
                readOnly: !!$textarea.prop( 'readonly' )
            };
            if( $placeholder )
            {
                option.onPlaceholder = function( visible ) {
                    if( visible )
                        $placeholder.show();
                    else
                        $placeholder.hide();
                };
            }

            var wysiwygeditor = wysiwyg( option );
            return wysiwygeditor;
        }


        // Create a container if it does not exist yet
        var $container = $textarea.closest( '.wysiwyg-container' );
        if( $container.length == 0 )
        {
            $container = $('<div/>').addClass('wysiwyg-container');
            if( classes )
                $container.addClass( classes );
            $textarea.wrap( $container );
            $container = $textarea.closest( '.wysiwyg-container' );
        }

        // Create the placeholder if it does not exist yet and we want one
        var $wrapper = $textarea.closest( '.wysiwyg-wrapper' );
        if( placeholder && $wrapper.length == 0 )
        {
            $wrapper = $('<div/>').addClass('wysiwyg-wrapper');
            $textarea.wrap( $wrapper );
            $wrapper = $textarea.closest( '.wysiwyg-wrapper' );
        }
        var $placeholder = null;
        if( $wrapper.length != 0 )
            $placeholder = $wrapper.find( '.wysiwyg-placeholder' );
        if( placeholder && (! $placeholder || $placeholder.length == 0) )
        {
            $placeholder = $('<div/>').addClass( 'wysiwyg-placeholder' )
                                      .html( placeholder )
                                      .hide();
            $wrapper.prepend( $placeholder );
        }

        // Create the WYSIWYG Editor
        var $editor = $container.find( '.wysiwyg-editor' );
        if( $editor.length == 0 )
            $editor = null;
        var wysiwygeditor = create_wysiwyg( $textarea, $editor, $container, $placeholder );
        if( wysiwygeditor.legacy )
        {
            if( $editor )
                $editor.hide();
            if( $placeholder )
                $placeholder.hide();
            var $textarea = $(wysiwygeditor.getElement());
            $textarea.show().addClass( 'wysiwyg-textarea' );
            if( $textarea.is(':visible') ) // inside the DOM
                $textarea.width( $container.width() - ($textarea.outerWidth() - $textarea.width()) );
        }
        else
        {
            if( ! $editor )
                $(wysiwygeditor.getElement()).addClass( 'wysiwyg-editor' );

            // Clicking the placeholder -> focus editor - fixes IE6-IE8
            $wrapper.click(function(){
                wysiwygeditor.getElement().focus();
            });

            // Support ':active'-class
            var remove_active_timeout = null,
                initialize_toolbar = null;
            var add_class_active = function() {
                if( remove_active_timeout )
                    clearTimeout( remove_active_timeout );
                remove_active_timeout = null;
                if( initialize_toolbar )
                {
                    initialize_toolbar();
                    initialize_toolbar = null;
                }
                $container.addClass( 'wysiwyg-active' );
                $container.find( '.wysiwyg-toolbar-focus' ).slideDown(200);
            };
            var remove_class_active = function() {
                if( remove_active_timeout || document.activeElement == wysiwygeditor.getElement() )
                    return ;
                remove_active_timeout = setTimeout( function() {
                    remove_active_timeout = null;
                    $container.removeClass( 'wysiwyg-active' );
                    if( $.trim(wysiwygeditor.getHTML().replace(/<br\s*[\/]?>/gi,'')).length == 0 )
                        $container.find( '.wysiwyg-toolbar-focus' ).slideUp(200);
                }, 100 );
            };
            $(wysiwygeditor.getElement()).focus( add_class_active ).blur( remove_class_active );
            $textarea.closest( 'form' ).on( 'reset', remove_class_active );

            // Hotkey+Commands-List
            var commands = {};
            $.each( toolbar_buttons, function(key, value) {
                if( ! value || ! value.hotkey )
                    return ;
                var toolbar_handler = get_toolbar_handler( key );
                if( ! toolbar_handler )
                    return ;
                hotkeys[value.hotkey.toLowerCase()] = toolbar_handler;
                commands[key] = toolbar_handler;
            });

            // Toolbar on top or bottom
            if( ! $.isEmptyObject(toolbar_buttons) && toolbar_position != 'selection' )
            {
                var toolbar_top = $.inArray( 'top', toolbar_position.split('-') ) != -1;
                var toolbar_focus = $.inArray( 'focus', toolbar_position.split('-') ) != -1;
                // Callback to create toolbar on demand
                var create_toolbar = function()
                {
                    var $toolbar = $('<div/>').addClass( 'wysiwyg-toolbar' ).addClass( toolbar_top ? 'wysiwyg-toolbar-top' : 'wysiwyg-toolbar-bottom' );
                    if( toolbar_focus )
                        $toolbar.hide().addClass( 'wysiwyg-toolbar-focus' );
                    // Add buttons to the toolbar
                    add_buttons_to_toolbar( $toolbar, false,
                        function() {
                            // Open a popup from the toolbar
                            var $popup = $(wysiwygeditor.openPopup());
                            // if wrong popup -> create a new one
                            if( $popup.hasClass('wysiwyg-popup') && $popup.hasClass('wysiwyg-popuphover') )
                                $popup = $(wysiwygeditor.closePopup().openPopup());
                            if( ! $popup.hasClass('wysiwyg-popup') )
                                // add classes + content
                                $popup.addClass( 'wysiwyg-popup' );
                            return $popup;
                        },
                        function( $popup, target, overwrite_offset ) {
                            // Popup position
                            var $button = $(target);
                            var popup_width = $popup.outerWidth();
                            // Point is the top/bottom-center of the button
                            var left = $button.offset().left - $container.offset().left + parseInt($button.width() / 2) - parseInt(popup_width / 2);
                            var top = $button.offset().top - $container.offset().top;
                            if( toolbar_top )
                                top += $button.outerHeight();
                            else
                                top -= $popup.outerHeight();
                            if( overwrite_offset )
                            {
                                left = overwrite_offset.left;
                                top = overwrite_offset.top;
                            }
                            popup_position( $popup, $container, left, top );
                        });
                    if( toolbar_top )
                        $container.prepend( $toolbar );
                    else
                        $container.append( $toolbar );
                };
                if( ! toolbar_focus )
                    create_toolbar();
                else
                    initialize_toolbar = create_toolbar;
            }
        }

        // Export userdata
        return {
            wysiwygeditor: wysiwygeditor,
            $container: $container
        };
    };

    // jQuery Interface
    $.fn.wysiwyg = function( option, param )
    {
        if( ! option || typeof(option) === 'object' )
        {
            option = $.extend( {}, option );
            return this.each(function() {
                var $that = $(this);
                // Already an editor
                if( $that.data( 'wysiwygjs') )
                    return ;

                // Two modes: toolbar on top and on bottom
                var classes = option['class'],
                    placeholder = option.placeholder || $that.prop('placeholder'),
                    toolbar_position = option.toolbar || 'top',
                    toolbar_buttons = option.buttons || {},
                    toolbar_submit = option.submit,
                    label_selectImage = option.selectImage,
                    placeholder_url = option.placeholderUrl || null,
                    placeholder_embed = option.placeholderEmbed || null,
                    max_imagesize = option.maxImageSize || null,
                    filter_imageType = option.filterImageType || '^image/',
                    on_imageupload = option.onImageUpload || null,
                    force_imageupload = option.forceImageUpload && on_imageupload,
                    video_from_url = option.videoFromUrl || null,
                    on_keydown = option.onKeyDown || null,
                    on_keypress = option.onKeyPress || null,
                    on_keyup = option.onKeyUp || null,
                    on_autocomplete = option.onAutocomplete || null;

                // Create the WYSIWYG Editor
                var data = create_editor( $that, classes, placeholder, toolbar_position, toolbar_buttons, toolbar_submit, label_selectImage,
                                          placeholder_url, placeholder_embed, max_imagesize, filter_imageType, on_imageupload, force_imageupload, video_from_url,
                                          on_keydown, on_keypress, on_keyup, on_autocomplete );
                $that.data( 'wysiwygjs', data );
            });
        }
        else if( this.length == 1 )
        {
            var data = this.data('wysiwygjs');
            if( ! data )
                return this;
            if( option == 'container' )
                return data.$container;
            if( option == 'shell' )
                return data.wysiwygeditor;
        }
        return this;
    };
});
