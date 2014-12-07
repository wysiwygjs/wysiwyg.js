(function(window, document, navigator, undefined){
    'use strict';

    // http://stackoverflow.com/questions/97962/debounce-clicks-when-submitting-a-web-form
    var debounce = function( callback, wait )
    {
        var timeout;
        return function()
        {
            if( timeout )
                return ;
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
    var addEvent = function( element, type, handler )
    {
        if( element.addEventListener ) {
            element.addEventListener( type, handler, false );
        } else if( element.attachEvent ) {
            element.attachEvent( 'on' + type, handler );
        } else if( element != window ) {
            element['on' + type] = handler;
        }
    };
    var removeEvent = function( element, type, handler ) {
        if( element.removeEventListener ) {
            element.removeEventListener( type, handler, false );
        } else if( element.detachEvent) {
            element.detachEvent( 'on' + type, handler );
        } else if( element != window ) {
            element['on' + type] = null;
        }
    }
    // http://www.cristinawithout.com/content/function-trigger-events-javascript
    var fireEvent = function( obj, evt, bubbles, cancelable )
    {
        if( document.createEvent ) {
            var event = document.createEvent('Event');
            event.initEvent( evt, bubbles !== undefined ? bubbles : true, cancelable !== undefined ? cancelable : false );
            obj.dispatchEvent(event);
        }
        else if( document.createEventObject ) { //IE
            var event = document.createEventObject();
            obj.fireEvent( 'on' + evt, event );
        }
    };

    // http://stackoverflow.com/questions/13377887/javascript-node-undefined-in-ie8-and-under
    var Node = Node || {
        ELEMENT_NODE: 1,
        TEXT_NODE: 3
    };

    // http://stackoverflow.com/questions/2234979/how-to-check-in-javascript-if-one-element-is-a-child-of-another
    var isOrContainsNode = function( ancestor, descendant )
    {
        var node = descendant;
        while (node) {
            if (node === ancestor)
                return true;
            node = node.parentNode;
        }
        return false;
    };

    // http://stackoverflow.com/questions/667951/how-to-get-nodes-lying-inside-a-range-with-javascript
    var nextNode = function( node )
    {
        if (node.firstChild)
            return node.firstChild;
        while( node )
        {
            if( node.nextSibling )
                return node.nextSibling;
            node = node.parentNode;
        }
        return null;
    };

    // save/restore selection
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
        if( window.getSelection && document.createRange )
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
    /*
    // http://stackoverflow.com/questions/13949059/persisting-the-changes-of-range-objects-after-selection-in-html/13950376#13950376
    var saveSelection = function( containerNode )
    {
        if( window.getSelection && document.createRange )
        {
            var range = window.getSelection().getRangeAt(0);
            var preSelectionRange = range.cloneRange();
            preSelectionRange.selectNodeContents(containerNode);
            preSelectionRange.setEnd(range.startContainer, range.startOffset);
            var start = preSelectionRange.toString().length;
            return {
                range: range,
                start: start,
                end: start + range.toString().length
            };
        }
        else if( document.selection )
        {
            var selectedTextRange = document.selection.createRange();
            var preSelectionTextRange = document.body.createTextRange();
            preSelectionTextRange.moveToElementText(containerNode);
            preSelectionTextRange.setEndPoint('EndToStart', selectedTextRange);
            var start = preSelectionTextRange.text.length;
            return {
                start: start,
                end: start + selectedTextRange.text.length
            }
        }
        return null;
    };
    var restoreSelection = function( containerNode, savedSel )
    {
        if( ! savedSel )
            return;
        if( window.getSelection && document.createRange )
        {
            var range;
            // Range inside container?
            if( savedSel.range )
            {
                var node = savedSel.range.startContainer;
                var endNode = savedSel.range.endContainer;
                // Iterate nodes until we hit the end container
                while( node )
                {
                    if( isOrContainsNode(containerNode,node) )
                    {
                        range = savedSel.range;
                        break;
                    }
                    if( node == endNode )
                        break;
                    node = nextNode(node);
                }
            }
            // Restore from char-based index
            if( ! range )
            {
                range = document.createRange();
                range.setStart(containerNode, 0);
                range.collapse(true);
                var nodeStack = [containerNode],
                    node,
                    foundStart = false,
                    stop = false,
                    charIndex = 0;
                while( !stop && (node = nodeStack.pop()) )
                {
                    if( node.nodeType == Node.TEXT_NODE )
                    {
                        var nextCharIndex = charIndex + node.length;
                        if (!foundStart && savedSel.start >= charIndex && savedSel.start <= nextCharIndex) {
                            range.setStart(node, savedSel.start - charIndex);
                            foundStart = true;
                        }
                        if (foundStart && savedSel.end >= charIndex && savedSel.end <= nextCharIndex) {
                            range.setEnd(node, savedSel.end - charIndex);
                            stop = true;
                        }
                        charIndex = nextCharIndex;
                    }
                    else
                    {
                        var i = node.childNodes.length;
                        while (i--) {
                            nodeStack.push(node.childNodes[i]);
                        }
                    }
                }
            }
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
        else if( document.selection )
        {
            var textRange = document.body.createTextRange();
            textRange.moveToElementText(containerNode);
            textRange.collapse(true);
            textRange.moveEnd('character', savedSel.end);
            textRange.moveStart('character', savedSel.start);
            textRange.select();
        }
    };
    */

    // http://stackoverflow.com/questions/12603397/calculate-width-height-of-the-selected-text-javascript
    // http://stackoverflow.com/questions/6846230/coordinates-of-selected-text-in-browser-page
    var getSelectionRect = function()
    {
        if( window.getSelection && document.createRange )
        {
            var sel = window.getSelection();
            if( ! sel.rangeCount )
                return false;
            var range = sel.getRangeAt(0).cloneRange();
            if( range.getBoundingClientRect ) // Missing for Firefox 3.5+3.6
            {
                var rect = range.getBoundingClientRect();
                return {
                    left: rect.left + window.pageXOffset,
                    top: rect.top + window.pageYOffset,
                    width: rect.right - rect.left,
                    height: rect.bottom - rect.top
                };
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
                    left: rect.left + window.pageXOffset,
                    top: rect.top + window.pageYOffset,
                    width: rect.right - rect.left,
                    height: rect.bottom - rect.top
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
                // http://javascript.info/tutorial/coordinates
                // http://www.softcomplex.com/docs/get_window_size_and_scrollbar_position.html
                // http://www.howtocreate.co.uk/tutorials/javascript/browserwindow
                return {
                    left: range.boundingLeft + (document.documentElement ? document.documentElement.scrollLeft : document.body.scrollLeft),
                    top: range.boundingTop + (document.documentElement ? document.documentElement.scrollTop : document.body.scrollTop),
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
        var sel = saveSelection( containerNode );
        return (! sel || sel.start == sel.end);
    };

    // http://stackoverflow.com/questions/7781963/js-get-array-of-all-selected-nodes-in-contenteditable-div
    var getSelectedNodes = function( containerNode )
    {
        if( window.getSelection )
        {
            var sel = window.getSelection();
            var nodes = [];
            for( var i=0; i < sel.rangeCount; ++i )
            {
                var range = sel.getRangeAt(i);
                var node = range.startContainer;
                var endNode = range.endContainer;
                while( node )
                {
                    if( node != containerNode )
                    {
                        if( ! sel.containsNode || sel.containsNode(node,true) )
                            nodes.push( node );
                    }
                    if( node == endNode )
                        break;
                    node = nextNode(node);
                }
            }
            if( nodes.length == 0 && range.focusNode )
                nodes.push( range.focusNode );
            return nodes;
        }
        return [];
    };

    // http://stackoverflow.com/questions/8513368/collapse-selection-to-start-of-selection-not-div
    var collapseSelectionEnd = function()
    {
        if( window.getSelection )
        {
            var sel = window.getSelection();
            if( sel.isCollapsed )
                return false;
            sel.collapseToEnd();
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
    window.wysiwyg = function( option )
    {
        // Options
        option = option || {};
        var option_element = option.element || null;
        var option_onkeypress = option.onkeypress || null;
        var option_onselection = option.onselection || null;
        var option_onplaceholder = option.onplaceholder || null;

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
                if( webkit && parseInt(webkit[1]) < 534 )
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
                var dummy = function() {
                    return this;
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
                    // selection and popup
                    collapseSelection: dummy,
                    openPopup: dummy,
                    closePopup: dummy,
                    // exec commands
                    markup: dummy,
                    removeFormat: dummy,
                    bold: dummy,
                    italic: dummy,
                    underline: dummy,
                    strikethrough: dummy,
                    forecolor: dummy,
                    highlight: dummy,
                    font: dummy,
                    align: dummy,
                    insertLink: dummy,
                    insertImage: dummy,
                    insertHTML: dummy,
                    insertOrderedList: dummy,
                    insertUnorderedList: dummy
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
            node_wysiwyg = document.createElement( 'DIV' );
            node_wysiwyg.innerHTML = node_textarea.value;
            node_textarea.parentNode.insertBefore( node_wysiwyg, node_textarea.nextSibling );
        }
        else
            node_wysiwyg = option_element;
        node_wysiwyg.setAttribute( 'contentEditable', 'true' ); // IE7 is case sensitive

        // IE8 uses 'document' instead of 'window'
        // http://tanalin.com/en/articles/ie-version-js/
        var window_legacy = (document.all && !document.addEventListener) ? document : window;

        // Gespeicherte Selection
        var saved_selection = null;

        // Sync Editor with Textarea
        var syncTextarea = null;
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
                    // node = nextNode(node)
                    if( node.hasChildNodes() )
                        node = node.firstChild;
                    else
                    {
                        while( node && node != node_wysiwyg && !node.nextSibling )
                            node = node.parentNode;
                        if( node )
                            node = (node == node_wysiwyg) ? null : node.nextSibling;
                    }
                    // Test if node contains something visible
                    if( ! node )
                        ;
                    else if( node.nodeType == Node.ELEMENT_NODE )
                    {
                        if( node.nodeName == 'IMG' )
                        {
                            wysiwyg_empty = false;
                            break;
                        }
                    }
                    else if( node.nodeType == Node.TEXT_NODE )
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
        var handleSelection = null,
            debounced_handleSelection = null;
        if( option_onselection )
        {
            handleSelection = function( x, y, rightclick )
            {
                // getBoundingClientRect() is viewport, so we better walk the tree
                var wysiwygLeft = 0,
                    wysiwygTop = 0,
                    wysiwygWidth = node_wysiwyg.offsetWidth,
                    wysiwygHeight = node_wysiwyg.offsetHeight;
                var iterator = node_wysiwyg;
                do {
                    if( !isNaN(iterator.offsetLeft) )
                        wysiwygLeft += iterator.offsetLeft;
                    if( !isNaN(iterator.offsetTop) )
                        wysiwygTop += iterator.offsetTop;
                }
                while( iterator = iterator.offsetParent );
                // Rectangle of the selection
                var rect = {
                    left: x,
                    top: y,
                    width: 0,
                    height: 0
                };
                // Detect collapsed selection
                var collapsed = getSelectionCollapsed( node_wysiwyg );
                // Rectangle of the selection
                if( ! collapsed )
                {
                    var selectionRect = getSelectionRect();
                    if( selectionRect )
                        rect = selectionRect;
                }
                else if( rect.x === false || rect.y === false )
                    return ;
                // Trim rectangle to the editor
                if( rect.left < wysiwygLeft )
                {
                    rect.width -= (wysiwygLeft - rect.left);
                    rect.left = wysiwygLeft;
                }
                if( (rect.left + rect.width) > (wysiwygLeft + wysiwygWidth) )
                {
                    if( rect.left > (wysiwygLeft + wysiwygWidth) )
                    {
                        rect.left = wysiwygLeft;
                        rect.width = 0;
                    }
                    else
                        rect.width = (wysiwygLeft + wysiwygWidth) - rect.left;
                }
                if( rect.top < wysiwygTop )
                {
                    rect.height -= (wysiwygTop - rect.top);
                    rect.top = wysiwygTop;
                }
                if( (rect.top + rect.height) > (wysiwygTop + wysiwygHeight) )
                {
                    if( rect.top > (wysiwygTop + wysiwygHeight) )
                    {
                        rect.top = wysiwygTop;
                        rect.height = 0;
                    }
                    else
                        rect.height = (wysiwygTop + wysiwygHeight) - rect.top;
                }
                // List of all selected nodes
                var nodes = getSelectedNodes( node_wysiwyg );
                // Callback
                rect.left -= wysiwygLeft;
                rect.top -= wysiwygTop;
                option_onselection( collapsed, rect, nodes, rightclick );
            };
            debounced_handleSelection = debounce( handleSelection, 1 );
        }

        // Open popup
        var node_popup = null;
        var popupClickClose = function(e){
            // http://www.quirksmode.org/js/events_properties.html
            if( !e )
                var e = window.event;
            var target;
            if( e.target )
                target = e.target;
            else if( e.srcElement )
                target = e.srcElement;
            if( target.nodeType == Node.TEXT_NODE ) // defeat Safari bug
                target = target.parentNode;
            // Click within popup?
            if( isOrContainsNode(node_popup,target) )
                return ;
            popupClose();
        };
        var popupOpen = function()
        {
            // Save selection
            saved_selection = saveSelection( node_wysiwyg );

            // Already open?
            if( node_popup )
                return node_popup;

            // Global click closes popup
            addEvent( window_legacy, 'mousedown', popupClickClose );

            // Create popup element
            node_popup = document.createElement( 'DIV' );
            node_popup.style.position = 'absolute';
            document.body.appendChild( node_popup );
            return node_popup;
        };
        var popupClose = function()
        {
            if( ! node_popup )
                return ;
            node_popup.parentNode.removeChild( node_popup );
            node_popup = null;
            removeEvent( window_legacy, 'mousedown', popupClickClose );
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
            // sync textarea
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
            var debounced_syncTextarea = syncTextarea ? debounce( syncTextarea, 50 ) : null;
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
            var code = 0;
            if( e.keyCode )
                code = e.keyCode;
            else if( e.which )
                code = e.which;
            // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent
            var character = e.charCode;

            // Callback
            if( phase == 1 && option_onkeypress )
            {
                var rv = option_onkeypress( code, character?String(String):String.fromCharCode(code), e.shiftKey||false, e.altKey||false, e.ctrlKey||false, e.metaKey||false );
                if( rv === false ) // dismiss key
                {
                    // prevent default
                    if( e.preventDefault )
                        e.preventDefault();
                    if( e.stopPropagation )
                        e.stopPropagation();
                    else
                        e.cancelBubble = true;
                    return false;
                }
            }
            // Keys can change the selection
            if( phase == 2 || phase == 3 )
                debounced_handleSelection( false, false, false );
            // Most keys can cause changes
            if( phase == 2 && debounced_changeHandler )
            {
                switch( code )
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
        addEvent( node_wysiwyg, 'keydown', function(e)
        {
            return keyHandler( e, 1 );
        });
        addEvent( node_wysiwyg, 'keypress', function(e)
        {
            return keyHandler( e, 2 );
        });
        addEvent( node_wysiwyg, 'keyup', function(e)
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
            var posx = 0;
            var posy = 0;
            if( e.pageX || e.pageY )
            {
                posx = e.pageX;
                posy = e.pageY;
            }
            else if( e.clientX || e.clientY )
            {
                posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }
            // mouse button
            if( e.which && e.which == 3 )
                rightclick = true;
            else if( e.button && e.button == 2 )
                rightclick = true;

            // remove event handler
            removeEvent( window_legacy, 'mouseup', mouseHandler );
            // Callback selection
            debounced_handleSelection( posx, posy, rightclick );
        };
        addEvent( node_wysiwyg, 'mousedown', function(e)
        {
            // catch event if 'mouseup' outside 'node_wysiwyg'
            removeEvent( window_legacy, 'mouseup', mouseHandler );
            addEvent( window_legacy, 'mouseup', mouseHandler );
        });
        addEvent( node_wysiwyg, 'mouseup', function(e)
        {
            mouseHandler( e );
            // Trigger change
            if( debounced_changeHandler )
                debounced_changeHandler();
        });
        addEvent( node_wysiwyg, 'dblclick', function(e)
        {
            mouseHandler( e );
        });
        addEvent( node_wysiwyg, 'selectionchange',  function(e)
        {
            mouseHandler( e );
        });
        addEvent( node_wysiwyg, 'contextmenu', function(e)
        {
            mouseHandler( e, true );
            // prevent default
            if( e.preventDefault )
                e.preventDefault();
            if( e.stopPropagation )
                e.stopPropagation();
            else
                e.cancelBubble = true;
            return false;
        });


        // exec command
        // https://developer.mozilla.org/en-US/docs/Web/API/document.execCommand
        // http://www.quirksmode.org/dom/execCommand.html
        var execCommand = function( command, param, focus )
        {
            // give focus to editor
            if( focus !== false )
                node_wysiwyg.focus();
            // for webkit, mozilla, opera
            if( window.getSelection )
            {
                var sel = window.getSelection();
                var range;
                if( sel.anchorNode && sel.getRangeAt )
                    range = sel.getRangeAt(0);
                if( range )
                {
                    sel.removeAllRanges();
                    sel.addRange(range);
                }
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

        // Command structure
        var callUpdates = function( selectionPreserved )
        {
            if( showPlaceholder )
                showPlaceholder();
            if( syncTextarea )
                syncTextarea();
            // handle saved selection
            if( selectionPreserved )
                saved_selection = getSelectionCollapsed( node_wysiwyg ) ? null : saveSelection( node_wysiwyg );
            else 
            {
                collapseSelectionEnd();
                saved_selection = null;
            }
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
                node_wysiwyg.innerHTML = html;
                callUpdates( false ); // selection destroyed
                return this;
            },
            // selection and popup
            collapseSelection: function()
            {
                collapseSelectionEnd();
                saved_selection = null; // selection destroyed
                return this;
            },
            openPopup: function()
            {
                return popupOpen();
            },
            closePopup: function()
            {
                popupClose();
                return this;
            },
            // exec commands
            markup: function( styleWithCSS, insertBrOnReturn )
            {
                execCommand( 'styleWithCSS', styleWithCSS, false ); // ignore 'useCSS'
                execCommand( 'insertBrOnReturn', insertBrOnReturn, false );
                //execCommand( 'enableInlineTableEditing', enableInlineTableEditing, false );
                //execCommand( 'enableObjectResizing', enableObjectResizing, false );
                return this;
            },
            removeFormat: function()
            {
                restoreSelection( node_wysiwyg, saved_selection );
                execCommand( 'removeFormat' );
                execCommand( 'unlink' );
                callUpdates( true );
                return this;
            },
            bold: function()
            {
                restoreSelection( node_wysiwyg, saved_selection );
                execCommand( 'bold' );
                callUpdates( true );
                return this;
            },
            italic: function()
            {
                restoreSelection( node_wysiwyg, saved_selection );
                execCommand( 'italic' );
                callUpdates( true );
                return this;
            },
            underline: function()
            {
                restoreSelection( node_wysiwyg, saved_selection );
                execCommand( 'underline' );
                callUpdates( true );
                return this;
            },
            strikethrough: function()
            {
                restoreSelection( node_wysiwyg, saved_selection );
                execCommand( 'strikeThrough' );
                callUpdates( true );
                return this;
            },
            forecolor: function( color )
            {
                restoreSelection( node_wysiwyg, saved_selection );
                execCommand( 'foreColor', color );
                callUpdates( true );
                return this;
            },
            highlight: function( color )
            {
                restoreSelection( node_wysiwyg, saved_selection );
                // http://stackoverflow.com/questions/2756931/highlight-the-text-of-the-dom-range-element
                if( ! execCommand('hiliteColor',color) ) // some browsers apply 'backColor' to the whole block
                    execCommand( 'backColor', color );
                callUpdates( true );
                return this;
            },
            font: function( name, size )
            {
                restoreSelection( node_wysiwyg, saved_selection );
                execCommand( 'fontName', name );
                execCommand( 'fontSize', size );
                callUpdates( true );
                return this;
            },
            align: function( align )
            {
                restoreSelection( node_wysiwyg, saved_selection );
                if( align == 'left' )
                    execCommand( 'justifyLeft' );
                else if( align == 'center' )
                    execCommand( 'justifyCenter' );
                else if( align == 'right' )
                    execCommand( 'justifyRight' );
                else if( align == 'justify' )
                    execCommand( 'justifyFull' );
                callUpdates( true );
                return this;
            },
            insertLink: function( url )
            {
                // http://stackoverflow.com/questions/5605401/insert-link-in-contenteditable-element
                restoreSelection( node_wysiwyg, saved_selection );
                execCommand( 'createLink', url );
                callUpdates( true );
                return this;
            },
            insertImage: function( url )
            {
                restoreSelection( node_wysiwyg, saved_selection );
                execCommand( 'insertImage', url );
                callUpdates( false ); // selection destroyed
                return this;
            },
            insertHTML: function( html )
            {
                restoreSelection( node_wysiwyg, saved_selection );
                if( ! execCommand('insertHTML', html) )
                {
                    // IE 11 still does not support 'insertHTML'
                    restoreSelection( node_wysiwyg, saved_selection );
                    pasteHtmlAtCaret( node_wysiwyg, html );
                }
                callUpdates( false ); // selection destroyed
                return this;
            },
            insertOrderedList: function()
            {
                restoreSelection( node_wysiwyg, saved_selection );
                execCommand( 'insertOrderedList' );
                callUpdates( false ); // selection destroyed
                return this;
            },
            insertUnorderedList: function()
            {
                restoreSelection( node_wysiwyg, saved_selection );
                execCommand( 'insertUnorderedList' );
                callUpdates( false ); // selection destroyed
                return this;
            }
        };
    };
})(window, document, navigator);
