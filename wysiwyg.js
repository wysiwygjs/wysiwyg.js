/*! wysiwyg.js | https://github.com/wysiwygjs/wysiwyg.js | Apache License (v2) */
(function(window, document, undefined)
{
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
                    return;
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
        element.addEventListener( type, handler, useCapture ? true : false );
    };
    var removeEvent = function( element, type, handler, useCapture )
    {
        element.removeEventListener( type, handler, useCapture ? true : false );
    };
    // prevent default
    var cancelEvent = function( e )
    {
        e.preventDefault();
        e.stopPropagation();
    };

    // http://stackoverflow.com/questions/2234979/how-to-check-in-javascript-if-one-element-is-a-child-of-another
    var isOrContainsNode = function( ancestor, descendant, within )
    {
        var node = within ? descendant.parentNode : descendant;
        while( node )
        {
            if( node === ancestor )
                return true;
            node = node.parentNode;
        }
        return false;
    };
    var isMediaNode = function( node )
    {
        var name = node.nodeName;
        return name == 'IMG' || name == 'PICTURE' || name == 'SVG' || name == 'VIDEO' || name == 'AUDIO' ||
               name == 'IFRAME' || name == 'MAP' || name == 'OBJECT' || name == 'EMBED';
    };

    // save/restore selection
    // http://stackoverflow.com/questions/13949059/persisting-the-changes-of-range-objects-after-selection-in-html/13950376#13950376
    var saveSelection = function( containerNode )
    {
        var sel = window.getSelection();
        if( sel.rangeCount > 0 )
            return sel.getRangeAt(0);
        return null;
    };
    var restoreSelection = function( containerNode, savedSel )
    {
        if( ! savedSel )
            return;
        var sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(savedSel);
    };

    // http://stackoverflow.com/questions/12603397/calculate-width-height-of-the-selected-text-javascript
    // http://stackoverflow.com/questions/6846230/coordinates-of-selected-text-in-browser-page
    var getSelectionRect = function()
    {
        var sel = window.getSelection();
        if( ! sel.rangeCount )
            return false;
        var range = sel.getRangeAt(0).cloneRange();
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
        return false;
    };

    var getSelectionCollapsed = function( containerNode )
    {
        var sel = window.getSelection();
        if( sel.isCollapsed )
            return true;
        return false;
    };

    // http://stackoverflow.com/questions/7781963/js-get-array-of-all-selected-nodes-in-contenteditable-div
    var getSelectedNodes = function( containerNode )
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
                node = nextNode( node, node == endNode ? endNode : containerNode );
            }
        }
        // Fallback
        if( nodes.length == 0 && isOrContainsNode(containerNode,sel.focusNode) && sel.focusNode != containerNode )
            nodes.push( sel.focusNode );
        return nodes;
    };

    // http://stackoverflow.com/questions/8513368/collapse-selection-to-start-of-selection-not-div
    var collapseSelectionEnd = function()
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
    };

    // http://stackoverflow.com/questions/15157435/get-last-character-before-caret-position-in-javascript
    // http://stackoverflow.com/questions/11247737/how-can-i-get-the-word-that-the-caret-is-upon-inside-a-contenteditable-div
    var expandSelectionCaret = function( containerNode, preceding, following )
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
    };

    // http://stackoverflow.com/questions/4652734/return-html-from-a-user-selected-text/4652824#4652824
    var getSelectionHtml = function( containerNode )
    {
        if( getSelectionCollapsed( containerNode ) )
            return null;
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
        return null;
    };

    var selectionInside = function( containerNode, force )
    {
        // selection inside editor?
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
        return true;
    };


    // http://stackoverflow.com/questions/6690752/insert-html-at-caret-in-a-contenteditable-div/6691294#6691294
    // http://stackoverflow.com/questions/4823691/insert-an-html-element-in-a-contenteditable-element
    // http://stackoverflow.com/questions/6139107/programatically-select-text-in-a-contenteditable-html-element
    var pasteHtmlAtCaret = function( containerNode, html )
    {
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
    };

    // Create editor
    var wysiwyg = function( element, options )
    {
        var toolbar = options.toolbar,
            buttons = options.buttons, selectionbuttons = options.selectionbuttons,
            suggester = options.suggester, interceptenter = options.interceptenter, hijackContextmenu = !!options.hijackmenu,
            node_container = typeof(element) == 'string' ? document.querySelector(element) : element,
            node_textarea = node_container.querySelector('textarea'),
            commands, hotkeys = {},
            toolbar_top = toolbar == 'top', toolbar_bottom = toolbar == 'bottom', toolbar_demand = toolbar == 'demand';

        // initialize editor
        var add_class = function( element, classname )
        {
            if( element.classList )
                element.classList.add( classname );
            else // IE9
                element.className += ' ' + classname;
        };
        var remove_class = function( element, classname )
        {
            if( element.classList )
                element.classList.remove( classname );
        }
        var node_contenteditable = node_container.querySelector('[contenteditable=true]');
        if( ! node_contenteditable )
        {
            node_contenteditable = document.createElement( 'div' );
            node_contenteditable.setAttribute( 'contentEditable', 'true' );
            var placeholder = node_textarea.placeholder;
            if( placeholder )
                node_contenteditable.setAttribute( 'data-placeholder', placeholder );
            node_container.insertBefore( node_contenteditable, node_container.firstChild );
        }

        // Simulate ':focus-within'
        var remove_focus_timeout = null;
        var add_class_focus = function()
        {
            if( remove_focus_timeout )
                clearTimeout( remove_focus_timeout );
            remove_focus_timeout = null;
            add_class( node_container, 'focus' );
            if( toolbar_demand )
                add_class( node_container, 'focused' );
        };
        var remove_class_focus = function()
        {
            if( remove_focus_timeout || document.activeElement == node_contenteditable )
                return ;
            remove_focus_timeout = setTimeout( function() {
                remove_focus_timeout = null;
                remove_class( node_container, 'focus' );
            }, 50 );
        };
        addEvent( node_contenteditable, 'focus', add_class_focus );
        addEvent( node_contenteditable, 'blur', remove_class_focus );
        // register form-reset
        if( node_textarea && node_textarea.form )
            addEvent( node_textarea.form, 'reset', remove_class_focus );

        // Insert-link popup
        var create_insertlink = function( popup, modify_a_href )
        {
            var textbox = document.createElement('input');
            textbox.placeholder = 'www.example.com';
            if( modify_a_href )
                textbox.value = modify_a_href.href;
            textbox.style.width = '20em';
            textbox.style.maxWidth = parseInt(node_container.offsetWidth *2/3) + 'px';
            textbox.autofocus = true;
            if( modify_a_href )
                addEvent( textbox, 'input', function( e )
                {
                    var url = textbox.value.trim();
                    if( url )
                        modify_a_href.href = url;
                });
            addEvent( textbox, 'keypress', function( e )
            {
                var key = e.which || e.keyCode;
                if( key != 13 )
                    return;
                var url = textbox.value.trim();
                if( modify_a_href )
                    ;
                else if( url )
                {
                    var url_scheme = url;
                    if( ! /^[a-z0-9]+:\/\//.test(url) )
                        url_scheme = "http://" + url;
                    if( commands.getSelectedHTML() )
                        commands.insertLink( url_scheme );
                    else
                    {
                        // Encode html entities - http://stackoverflow.com/questions/5499078/fastest-method-to-escape-html-tags-as-html-entities
                        var htmlencode = function( text ) {
                            return text.replace(/[&<>"]/g, function(tag)
                            {
                                var charsToReplace = { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' };
                                return charsToReplace[tag] || tag;
                            });
                        }
                        commands.insertHTML( '<a href="' + htmlencode(url_scheme) + '">' + htmlencode(url) + '</a>' );
                    }
                }
                commands.closePopup().collapseSelection();
                node_contenteditable.focus();
            });
            popup.appendChild( textbox );
            // set focus
            window.setTimeout( function()
            {
                textbox.focus();
                add_class_focus();
            }, 1 );
        };

        // Color-palette popup
        var create_colorpalette = function( popup, forecolor )
        {
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
            // create table
            var table = document.createElement('table');
            table.style.borderCollapse = 'collapse';
            for( var row=1; row < 15; ++row ) // should be '16' - but last line looks so dark
            {
                var tr = document.createElement('tr');
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
                    var td = document.createElement('td');
                    td.style.width = '0.5em';
                    td.style.height = '0.5em';
                    td.style.cursor = 'pointer';
                    td.style.backgroundColor = color;
                    td.title = color;
                    td.style.userSelect = 'none';
                    addEvent( td, 'click', function( e )
                        {
                            var color = this.title;
                            if( forecolor )
                                commands.forecolor( color ).closePopup().collapseSelection();
                            else
                                commands.highlight( color ).closePopup().collapseSelection();
                            cancelEvent( e );
                        });
                    tr.appendChild( td );
                }
                table.appendChild( tr );
            }
            popup.appendChild( table );
        };

        // read file as data-url
        var filecontents = function( file, callback )
        {
            // base64 a 2GB video is insane: 16MB should work for an average image
            if( file.size > 0x1000000 )
                return;

            // read file as data-url
            var normalize_dataurl = function( orientation )
            {
                var filereader = new FileReader();
                filereader.onload = function( e )
                {
                    if( ! orientation || orientation == 1 || orientation > 8 )
                        return callback( file.type, e.target.result );
                    // normalize
                    var img = new Image();
                    img.src = e.target.result;
                    img.onload = function()
                    {
                        var width = img.width;
                        var height = img.height;
                        if( width > height )
                        {
                            var max_width = 4096;
                            if( width > max_width )
                            {
                                height *= max_width / width;
                                width = max_width;
                            }
                        }
                        else
                        {
                            var max_height = 4096;
                            if( height > max_height )
                            {
                                width *= max_height / height;
                                height = max_height;
                            }
                        }
                        var canvas = document.createElement( 'canvas' );
                        var ctx = canvas.getContext( '2d' );
                        canvas.width = width;
                        canvas.height = height;
                        ctx.save();
                        if( orientation > 4 )
                        {
                            canvas.width = height;
                            canvas.height = width;
                        }
                        switch( orientation )
                        {
                            case 2: ctx.translate( width, 0 );
                                    ctx.scale( -1, 1 );
                                    break;
                            case 3: ctx.translate( width, height );
                                    ctx.rotate( Math.PI );
                                    break;
                            case 4: ctx.translate( 0, height );
                                    ctx.scale( 1, -1 );
                                    break;
                            case 5: ctx.rotate( 0.5 * Math.PI );
                                    ctx.scale( 1, -1 );
                                    break;
                            case 6: ctx.rotate( 0.5 * Math.PI );
                                    ctx.translate( 0, -height );
                                    break;
                            case 7: ctx.rotate( 0.5 * Math.PI );
                                    ctx.translate( width, -height );
                                    ctx.scale( -1, 1 );
                                    break;
                            case 8: ctx.rotate( -0.5 * Math.PI );
                                    ctx.translate( -width, 0 );
                                    break;
                        }
                        ctx.drawImage( img, 0, 0, width, height );
                        ctx.restore();
                        var dataURL = canvas.toDataURL( 'image/jpeg', 0.99 );
                        callback( file.type, dataURL );
                    }
                };
                filereader.readAsDataURL( file );
            }
            if( ! window.DataView )
                return normalize_dataurl();

            // get orientation - https://stackoverflow.com/questions/7584794/accessing-jpeg-exif-rotation-data-in-javascript-on-the-client-side
            var filereader = new FileReader();
            filereader.onload = function( e )
            {
                var contents = e.target.result;
                var view = new DataView( contents );
                // Not a JPEG at all?
                if( view.getUint16(0, false) != 0xFFD8 )
                    return normalize_dataurl();
                var length = view.byteLength,
                    offset = 2;
                while( offset < length )
                {
                    // Missing EXIF?
                    if( view.getUint16(offset+2, false) <= 8 )
                        return normalize_dataurl();
                    var marker = view.getUint16(offset, false);
                    offset += 2;
                    if( marker == 0xFFE1 )
                    {
                        if( view.getUint32(offset += 2, false) != 0x45786966 )
                            return normalize_dataurl();
                        var little = view.getUint16( offset += 6, false ) == 0x4949;
                        offset += view.getUint32( offset + 4, little );
                        var tags = view.getUint16( offset, little );
                        offset += 2;
                        for( var i=0; i < tags; ++i )
                        {
                            if( view.getUint16(offset + (i * 12), little) == 0x0112 )
                            {
                                var orientation = view.getUint16( offset + (i * 12) + 8, little );
                                return normalize_dataurl( orientation );
                            }
                        }
                    }
                    else if( (marker & 0xFF00) != 0xFF00 )
                        break;
                    else
                        offset += view.getUint16( offset, false );
                }
                return normalize_dataurl();
            };
            filereader.readAsArrayBuffer( file );
        };

        // open popup and apply position
        var popup_position = function( popup, left, top ) // left+top relative to container
        {
            // Test parents, el.getBoundingClientRect() does not work within 'position:fixed'
            var node = node_container,
                popup_parent = node.offsetParent;
            while( node )
            {
                var node_style = getComputedStyle( node );
                if( node_style['position'] != 'static' )
                    break;
                left += node.offsetLeft;
                top += node.offsetTop;
                popup_parent = node;
                node = node.offsetParent;
            }
            // Move popup as high as possible in the DOM tree
            popup_parent.appendChild( popup );
            // Trim to viewport
            var rect = popup_parent.getBoundingClientRect();
            var documentElement = document.documentElement;
            var viewport_width = Math.min( window.innerWidth, Math.max(documentElement.offsetWidth, documentElement.scrollWidth) );
            var viewport_height = window.innerHeight;
            var popup_width = popup.offsetWidth;    // accurate to integer
            var popup_height = popup.offsetHeight;
            if( rect.left + left < 1 )
                left = 1 - rect.left;
            else if( rect.left + left + popup_width > viewport_width - 1 )
                left = Math.max( 1 - rect.left, viewport_width - 1 - rect.left - popup_width );
            if( rect.top + top < 1 )
                top = 1 - rect.top;
            else if( rect.top + top + popup_height > viewport_height - 1 )
                top = Math.max( 1 - rect.top, viewport_height - 1 - rect.top - popup_height );
            // Set offset
            popup.style.left = parseInt(left) + 'px';
            popup.style.top = parseInt(top) + 'px';
        };
        // open popup and apply position
        var popup_type = null;
        var create_popup = function( down, type, create_content, argument )
        {
            // popup already open?
            var popup = commands.activePopup();
            if( popup && popup_type === type )
            {
                remove_class( popup, 'animate-down' );
                remove_class( popup, 'animate-up' );
            }
            else
            {
                // either run 'commands.closePopup().openPopup()' or remove children
                popup = commands.openPopup();
                add_class( popup, 'wysiwyg-popup' );
                add_class( popup, down ? 'animate-down' : 'animate-up' );
                popup_type = type;
            }
            // re-fill content
            while( popup.firstChild )
                popup.removeChild( popup.firstChild );
            create_content( popup, argument );
            return popup;
        };
        var open_popup_button = function( button, type, create_content, argument )
        {
            var popup = create_popup( toolbar_top ? true : false, type, create_content, argument );
            // Popup position - point to top/bottom-center of the button
            var container_offset = node_container.getBoundingClientRect();
            var button_offset = button.getBoundingClientRect();
            var left = button_offset.left - container_offset.left +
                        parseInt(button.offsetWidth / 2) - parseInt(popup.offsetWidth / 2);
            var top = button_offset.top - container_offset.top;
            if( toolbar_top )
                top += button.offsetHeight;
            else
                top -= popup.offsetHeight;
            popup_position( popup, left, top );
        };
        var popup_selection_position = function( popup, rect )
        {
            // Popup position - point to center of the selection
            var container_offset = node_container.getBoundingClientRect();
            var contenteditable_offset = node_contenteditable.getBoundingClientRect();
            var left = rect.left + parseInt(rect.width / 2) - parseInt(popup.offsetWidth / 2) + contenteditable_offset.left - container_offset.left;
            var top = rect.top + rect.height + contenteditable_offset.top - container_offset.top;
            popup_position( popup, left, top );
        };
        var open_popup_selection = function( rect, type, create_content, argument )
        {
            var popup = create_popup( true, type, create_content, argument );
            popup_selection_position( popup, rect );
        };

        // Fill buttons (on toolbar or on selection)
        var recent_selection_rect = null, recent_selection_link = null
        var fill_buttons = function( toolbar_container, selection_rect, buttons, hotkeys )
        {
            buttons.forEach( function(button)
            {
                // Custom button
                if( button instanceof HTMLElement )
                {
                    toolbar_container.appendChild( button );
                    // Simulate ':focus-within'
                    addEvent( button, 'focus', add_class_focus );
                    addEvent( button, 'blur', remove_class_focus );
                    return;
                }

                // Create a button
                var element = document.createElement( 'button' );
                add_class( element, 'btn' );
                if( 'icon' in button )
                {
                    var htmlparser = document.implementation.createHTMLDocument('');
                    htmlparser.body.innerHTML = button.icon;
                    for( var child=htmlparser.body.firstChild; child !== null; child=child.nextSibling )
                        element.appendChild( child );
                }
                if( 'attr' in button )
                {
                    for( var key in button.attr )
                        element.setAttribute( key, button.attr[key] );
                }
                // Simulate ':focus-within'
                addEvent( element, 'focus', add_class_focus );
                addEvent( element, 'blur', remove_class_focus );

                // Create handler
                var handler = null;
                if( 'click' in button )
                    handler = function()
                    {
                        button.click( commands, element );
                    };
                else if( 'popup' in button )
                    handler = function()
                    {
                        var fill_popup = function( popup )
                            {
                                button.popup( commands, popup, element );
                            };
                        if( selection_rect )
                            open_popup_selection( selection_rect, fill_popup.toString(), fill_popup );
                        else
                            open_popup_button( element, fill_popup.toString(), fill_popup );
                    };
                else if( 'browse' in button || 'dataurl' in button )
                    handler = function()
                    {
                        // remove popup
                        commands.closePopup().collapseSelection();
                        // open browse dialog
                        var input = document.createElement( 'input' );
                        input.type = 'file';
                        input.multiple = true;
                        input.style.display = 'none';
                        addEvent( input, 'change', function( e )
                            {
                                var remove_input = 'dataurl' in button;
                                if( ! e.target.files )
                                    remove_input = true;
                                else
                                {
                                    var files = evt.target.files;
                                    for( var i=0; i < files.length; ++i )
                                    {
                                        var file = files[i];
                                        if( 'browse' in button )
                                            button.browse( commands, input,file, element );
                                        else
                                            filecontents( file, function( type, dataurl ) {
                                                button.dataurl( commands, type, dataurl, element );
                                            });
                                    }
                                }
                                if( remove_input )
                                    input.parentNode.removeChild( input );
                                cancelEvent( e );
                            });
                        node_container.appendChild( input );
                        var evt = document.createEvent( 'MouseEvents' );
                        evt.initEvent( 'click', true, false );
                        input.dispatchEvent( evt );
                    };
                else if( 'action' in button )
                    handler = function()
                    {
                        switch( button.action )
                        {
                            case 'link':
                                if( selection_rect )
                                    open_popup_selection( selection_rect, 'link', create_insertlink, recent_selection_link );
                                else
                                    open_popup_button( element, 'link', create_insertlink, recent_selection_link );
                                break;
                            case 'bold':
                                commands.bold().closePopup().collapseSelection();
                                break;
                            case 'italic':
                                commands.italic().closePopup().collapseSelection();
                                break;
                            case 'underline':
                                commands.underline().closePopup().collapseSelection();
                                break;
                            case 'strikethrough':
                                commands.strikethrough().closePopup().collapseSelection();
                                break;
                            case 'colortext':
                                if( selection_rect )
                                    open_popup_selection( selection_rect, 'colortext', create_colorpalette, true );
                                else
                                    open_popup_button( element, 'colortext', create_colorpalette, true );
                                break;
                            case 'colorfill':
                                if( selection_rect )
                                    open_popup_selection( selection_rect, 'colorfill', create_colorpalette, false );
                                else
                                    open_popup_button( element, 'colorfill', create_colorpalette, false );
                                break;
                            case 'subscript':
                                commands.subscript().closePopup().collapseSelection();
                                break;
                            case 'superscript':
                                commands.superscript().closePopup().collapseSelection();
                                break;
                            case 'orderedlist':
                                commands.orderedList().closePopup().collapseSelection();
                                break;
                            case 'unorderedlist':
                                commands.unorderedList().closePopup().collapseSelection();
                                break;
                            case 'clearformat':
                                commands.removeFormat().closePopup().collapseSelection();
                                break;
                        }
                    };
                element.onclick = function( e )
                {
                    if( handler )
                        handler();
                    cancelEvent( e );
                };
                toolbar_container.appendChild( element );

                // Hotkey
                if( 'hotkey' in button && handler && hotkeys )
                    hotkeys[button.hotkey.toLowerCase()] = handler;
            });
        };

        // Handle suggester
        var typed_suggestion = null, suggestion_sequence = 1, first_suggestion_html = null;
        var finish_suggestion = function( insert_html )
        {
            // fire suggestion
            if( insert_html )
                commands.expandSelection( typed_suggestion.length, 0 ).insertHTML( insert_html );
            typed_suggestion = null;
            first_suggestion_html = null;
            suggestion_sequence += 1;
            commands.closePopup();
        };
        var suggester_keydown = function( key, character, shiftKey, altKey, ctrlKey, metaKey )
        {
            if( key == 13 && first_suggestion_html )
            {
                finish_suggestion( first_suggestion_html );
                return false;   // swallow enter
            }
            return true;
        };
        var ask_suggestions = function()
        {
            if( ! typed_suggestion )
                return;
            var current_sequence = suggestion_sequence;
            var open_suggester = function( suggestions )
            {
                if( ! recent_selection_rect || current_sequence != suggestion_sequence )
                    return;
                first_suggestion_html = null;
                // Empty suggestions means: stop suggestion handling
                if( ! suggestions )
                {
                    finish_suggestion();
                    return;
                }
                // Show suggester
                var fill_popup = function( popup )
                {
                    suggestions.forEach( function( suggestion )
                    {
                        var element = document.createElement('div');
                        add_class( element, 'suggestion' );
                        element.innerHTML = suggestion.label;
                        addEvent( element, 'click', function( e )
                            {
                                finish_suggestion( suggestion.insert );
                                cancelEvent( e );
                            });
                        popup.appendChild( element );

                        // Store suggestion to handle 'Enter'
                        if( first_suggestion_html === null )
                            first_suggestion_html = suggestion.insert;
                    });
                };
                open_popup_selection( recent_selection_rect, 'suggestion', fill_popup );
            };
            // Ask to start/continue a suggestion
            if( ! suggester(typed_suggestion, open_suggester) )
                finish_suggestion();
        };
        var debounced_suggestions = debounce( ask_suggestions, 100, true );
        var suggester_keypress = function( key, character, shiftKey, altKey, ctrlKey, metaKey )
        {
            // Special keys
            switch( key )
            {
                case  8: // backspace
                    if( typed_suggestion )
                        typed_suggestion = typed_suggestion.slice( 0, -1 );
                    if( typed_suggestion )  // if still text -> continue, else abort
                        break;
                    finish_suggestion();
                    return true;
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
                    if( typed_suggestion )
                        finish_suggestion();
                    return true;
                default:
                    if( ! typed_suggestion )
                        typed_suggestion = '';
                    typed_suggestion += character;
                    break;
            }
            // Throttle requests
            debounced_suggestions();
            return true;
        };

        // Create contenteditable
        var onKeyDown = function( key, character, shiftKey, altKey, ctrlKey, metaKey )
        {
            // submit form on enter-key
            if( interceptenter && key == 13 && ! shiftKey && ! altKey && ! ctrlKey && ! metaKey )
            {
                commands.sync();
                if( interceptenter() )
                {
                    commands.closePopup();
                    return false; // swallow enter
                }
            }
            // Exec hotkey (onkeydown because e.g. CTRL+B would oben the bookmarks)
            if( character && !shiftKey && !altKey && ctrlKey && !metaKey )
            {
                var hotkey = character.toLowerCase();
                if( hotkeys[hotkey] )
                {
                    hotkeys[hotkey]();
                    return false; // prevent default
                }
            }
            // Handle suggester
            if( suggester )
                return suggester_keydown( key, character, shiftKey, altKey, ctrlKey, metaKey );
        };
        var onKeyPress = function( key, character, shiftKey, altKey, ctrlKey, metaKey )
        {
            // Handle suggester
            if( suggester )
                return suggester_keypress( key, character, shiftKey, altKey, ctrlKey, metaKey );
        };
        //var onKeyUp = function( key, character, shiftKey, altKey, ctrlKey, metaKey )
        //{
        //};
        var onSelection = function( collapsed, rect, nodes, rightclick )
        {
            recent_selection_rect = collapsed ? rect || recent_selection_rect : null;
            recent_selection_link = null;
            // Fix type error - https://github.com/wysiwygjs/wysiwyg.js/issues/4
            if( ! rect )
            {
                finish_suggestion();
                return;
            }
            // Collapsed selection
            if( collapsed )
            {
                // Active suggestion: apply toolbar-position
                if( typed_suggestion !== null )
                {
                    var popup = commands.activePopup();
                    if( popup )
                    {
                        remove_class( popup, 'animate-down' );
                        remove_class( popup, 'animate-up' );
                        popup_selection_position( popup, rect );
                    }
                    return;
                }
            }
            // Click on a link opens the link-popup
            for( var i=0; i < nodes.length; ++i )
            {
                var node = nodes[i];
                var closest = node.closest ||   // latest
                    function( selector ) {      // IE + Edge - https://github.com/nefe/You-Dont-Need-jQuery
                        var node = this;
                        while( node )
                        {
                            var matchesSelector = node.matches || node.webkitMatchesSelector || node.mozMatchesSelector || node.msMatchesSelector;
                            if( matchesSelector && matchesSelector.call(node, selector) )
                                return node;
                            node = node.parentElement;
                        }
                        return null;
                    };
                recent_selection_link = closest.call( node, 'a' );
                if( recent_selection_link )
                    break;
            }
            // Show selection popup?
            var show_popup = true;
            // 'right-click' always opens the popup
            if( rightclick )
                ;
            // No selection-popup wanted?
            else if( ! selectionbuttons )
                show_popup = false;
            // Selected popup wanted, but nothing selected (=selection collapsed)
            else if( collapsed )
                show_popup = false;
            // Image selected -> skip toolbar-popup (better would be an 'image-popup')
            else nodes.forEach( function(node)
            {
                if( isMediaNode(node) )
                    show_popup = false;
            });
            if( ! show_popup )
            {
                finish_suggestion();
                return;
            }
            // fill buttons
            open_popup_selection( rect, 'selection', function( popup )
                {
                    var toolbar_element = document.createElement('div');
                    add_class( toolbar_element, 'toolbar' );
                    popup.appendChild( toolbar_element );
                    fill_buttons( toolbar_element, rect, selectionbuttons );
                });
        };
        var onOpenpopup = function()
        {
            add_class_focus();
        };
        var onClosepopup = function()
        {
            finish_suggestion();
            remove_class_focus();
        };

        // Sync Editor with Textarea
        var syncTextarea = null,
            debounced_syncTextarea = null,
            callUpdates;
        if( node_textarea )
        {
            // copy placeholder from the textarea to the contenteditor
            if( ! node_contenteditable.innerHTML && node_textarea.value )
                node_contenteditable.innerHTML = node_textarea.value;

            // sync html from the contenteditor to the textarea
            var previous_html = node_contenteditable.innerHTML;
            syncTextarea = function()
            {
                var new_html = node_contenteditable.innerHTML;
                if( new_html.match(/^<br[/ ]*>$/i) )
                {
                    node_contenteditable.innerHTML = '';
                    new_html = '';
                }
                if( new_html == previous_html )
                    return;
                // HTML changed
                node_textarea.value = new_html;
                previous_html = new_html;
            };

            // Focus/Blur events
            addEvent( node_contenteditable, 'focus', function()
            {
                // forward focus/blur to the textarea
                var event = document.createEvent( 'Event' );
                event.initEvent( 'focus', false, false );
                node_textarea.dispatchEvent( event );
            });
            addEvent( node_contenteditable, 'blur', function()
            {
                // sync textarea immediately
                syncTextarea();
                // forward focus/blur to the textarea
                var event = document.createEvent( 'Event' );
                event.initEvent( 'blur', false, false );
                node_textarea.dispatchEvent( event );
            });

            // debounce 'syncTextarea', because 'innerHTML' is quite burdensome
            // High timeout is save, because of "onblur" fires immediately
            debounced_syncTextarea = debounce( syncTextarea, 250, true );

            // Catch change events
            // http://stackoverflow.com/questions/1391278/contenteditable-change-events/1411296#1411296
            // http://stackoverflow.com/questions/8694054/onchange-event-with-contenteditable/8694125#8694125
            // https://github.com/mindmup/bootstrap-wysiwyg/pull/50/files
            // http://codebits.glennjones.net/editing/events-contenteditable.htm
            addEvent( node_contenteditable, 'input', debounced_syncTextarea );
            addEvent( node_contenteditable, 'propertychange', debounced_syncTextarea );
            addEvent( node_contenteditable, 'textInput', debounced_syncTextarea );
            addEvent( node_contenteditable, 'paste', debounced_syncTextarea );
            addEvent( node_contenteditable, 'cut', debounced_syncTextarea );
            addEvent( node_contenteditable, 'drop', debounced_syncTextarea );
            // MutationObserver should report everything
            if( window.MutationObserver )
            {
                var observer = new MutationObserver( debounced_syncTextarea );
                observer.observe( node_contenteditable, {attributes:true,childList:true,characterData:true,subtree:true});
            }

            // handle reset event
            var form = node_textarea.form;
            if( form )
            {
                addEvent( form, 'reset', function() {
                    node_contenteditable.innerHTML = '';
                    debounced_syncTextarea();
                    callUpdates( true );
                });
            }
        }

        // Handle selection
        var popup_saved_selection = null, // preserve selection during popup
            debounced_handleSelection = null;
        if( onSelection )
        {
            var handleSelection = function( clientX, clientY, rightclick )
            {
                // Detect collapsed selection
                var collapsed = getSelectionCollapsed( node_contenteditable );
                // List of all selected nodes
                var nodes = getSelectedNodes( node_contenteditable );
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
                    // So far 'rect' is relative to viewport, make it relative to the editor
                    var boundingrect = node_contenteditable.getBoundingClientRect();
                    rect.left -= parseInt(boundingrect.left);
                    rect.top -= parseInt(boundingrect.top);
                    // Trim rectangle to the editor
                    if( rect.left < 0 )
                        rect.left = 0;
                    if( rect.top < 0 )
                        rect.top = 0;
                    if( rect.width > node_contenteditable.offsetWidth )
                        rect.width = node_contenteditable.offsetWidth;
                    if( rect.height > node_contenteditable.offsetHeight )
                        rect.height = node_contenteditable.offsetHeight;
                }
                else if( nodes.length )
                {
                    // What else could we do? Offset of first element...
                    for( var i=0; i < nodes.length; ++i )
                    {
                        var node = nodes[i];
                        if( node.nodeType != Node.ELEMENT_NODE )
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
                onSelection( collapsed, rect, nodes, rightclick );
            };
            debounced_handleSelection = debounce( handleSelection, 1 );
        }

        // Open popup
        var node_popup = null;
        var popupClickClose = function( e )
        {
            var target = e.target || e.srcElement;
            if( target.nodeType == Node.TEXT_NODE ) // defeat Safari bug
                target = target.parentNode;
            // Click within popup?
            if( isOrContainsNode(node_popup,target) )
                return;
            // close popup
            popupClose();
        };
        var popupOpen = function()
        {
            // Already open?
            if( node_popup )
                return node_popup;

            // Global click closes popup
            addEvent( window, 'mousedown', popupClickClose, true );

            // Create popup element
            node_popup = document.createElement( 'DIV' );
            var parent = node_contenteditable.parentNode,
                next = node_contenteditable.nextSibling;
            if( next )
                parent.insertBefore( node_popup, next );
            else
                parent.appendChild( node_popup );
            if( onOpenpopup )
                onOpenpopup();
            return node_popup;
        };
        var popupClose = function()
        {
            if( ! node_popup )
                return;
            node_popup.parentNode.removeChild( node_popup );
            node_popup = null;
            removeEvent( window, 'mousedown', popupClickClose, true );
            if( onClosepopup )
                onClosepopup();
        };

        // Key events
        // http://sandbox.thewikies.com/html5-experiments/key-events.html
        var keyHandler = function( e, phase )
        {
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
                if( onKeyDown && onKeyDown(key, character, shiftKey, altKey, ctrlKey, metaKey) === false )
                    cancelEvent( e ); // dismiss key
            }
            else if( phase == 2 )
            {
                // Callback
                if( onKeyPress && onKeyPress(key, character, shiftKey, altKey, ctrlKey, metaKey) === false )
                    cancelEvent( e ); // dismiss key
            }
            //else if( phase == 3 )
            //{
            //    // Callback
            //    if( onKeyUp && onKeyUp(key, character, shiftKey, altKey, ctrlKey, metaKey) === false )
            //        cancelEvent( e ); // dismiss key
            //}

            // Keys can change the selection
            if( popup_saved_selection )
                popup_saved_selection = saveSelection( node_contenteditable );
            if( phase == 2 || phase == 3 )
            {
                if( debounced_handleSelection )
                    debounced_handleSelection( null, null, false );
            }
            // Most keys can cause text-changes
            if( phase == 2 && debounced_syncTextarea )
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
                        debounced_syncTextarea();
                        break;
                }
            }
        };
        addEvent( node_contenteditable, 'keydown', function( e )
        {
            keyHandler( e, 1 );
        });
        addEvent( node_contenteditable, 'keypress', function( e )
        {
            keyHandler( e, 2 );
        });
        addEvent( node_contenteditable, 'keyup', function( e )
        {
            keyHandler( e, 3 );
        });

        // Mouse events
        var mouseHandler = function( e, rightclick )
        {
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
            removeEvent( window, 'mouseup', mouseHandler );
            // Callback selection
            if( popup_saved_selection )
                popup_saved_selection = saveSelection( node_contenteditable );
            if( ! hijackContextmenu && rightclick )
                return;
            if( debounced_handleSelection )
                debounced_handleSelection( clientX, clientY, rightclick );
        };
        var mouse_down_target = null;
        addEvent( node_contenteditable, 'mousedown', function( e )
        {
            // catch event if 'mouseup' outside 'contenteditable'
            removeEvent( window, 'mouseup', mouseHandler );
            addEvent( window, 'mouseup', mouseHandler );
            // remember target
            mouse_down_target = e.target;
        });
        addEvent( node_contenteditable, 'mouseup', function( e )
        {
            // Select image (improve user experience on Webkit)
            var node = e.target;
            if( node && node.nodeType == Node.ELEMENT_NODE && node === mouse_down_target &&
                isMediaNode(node) && isOrContainsNode(node_contenteditable, node, true) )
            {
                var selection = window.getSelection();
                var range = document.createRange();
                range.setStartBefore( node );
                range.setEndAfter( node );
                selection.removeAllRanges();
                selection.addRange( range );
            }
            // handle click
            mouseHandler( e );
            // Trigger change
            if( debounced_syncTextarea )
                debounced_syncTextarea();
        });
        addEvent( node_contenteditable, 'dblclick', function( e )
        {
            mouseHandler( e );
        });
        addEvent( node_contenteditable, 'selectionchange',  function( e )
        {
            mouseHandler( e );
        });
        if( hijackContextmenu )
        {
            addEvent( node_contenteditable, 'contextmenu', function( e )
            {
                mouseHandler( e, true );
                cancelEvent( e );
            });
        }

        // exec command
        // https://developer.mozilla.org/en-US/docs/Web/API/document.execCommand
        // http://www.quirksmode.org/dom/execCommand.html
        var execCommand = function( command, param, force_selection )
        {
            // give selection to contenteditable element
            restoreSelection( node_contenteditable, popup_saved_selection );
            // tried to avoid forcing focus(), but ... - https://github.com/wysiwygjs/wysiwyg.js/issues/51
            node_contenteditable.focus();
            if( ! selectionInside(node_contenteditable, force_selection) ) // returns 'selection inside editor'
                return false;

            // Buggy, call within 'try/catch'
            try {
                if( document.queryCommandSupported && ! document.queryCommandSupported(command) )
                    return false;
                return document.execCommand( command, false, param );
            }
            catch( e ) {
            }
            return false;
        };

        // copy/paste images from clipboard
        addEvent( node_contenteditable, 'paste', function( e )
        {
            var clipboardData = e.clipboardData;
            if( ! clipboardData )
                return;
            var items = clipboardData.items;
            if( ! items || ! items.length )
                return;
            var item = items[0];
            if( ! item.type.match(/^image\//) )
                return;
            // Insert image from clipboard
            filecontents( item.getAsFile(), function( type, dataurl ) {
                execCommand( 'insertImage', dataurl );
            });
            cancelEvent( e ); // dismiss paste
        });

        // Command structure
        callUpdates = function( selection_destroyed )
        {
            // change-handler
            if( debounced_syncTextarea )
                debounced_syncTextarea();
            // handle saved selection
            if( selection_destroyed )
            {
                collapseSelectionEnd();
                popup_saved_selection = null; // selection destroyed
            }
            else if( popup_saved_selection )
                popup_saved_selection = saveSelection( node_contenteditable );
        };
        commands = {
            // properties
            sync: function()
            {
                // sync textarea immediately
                if( syncTextarea )
                    syncTextarea();
                return this;
            },
            getHTML: function()
            {
                return node_contenteditable.innerHTML;
            },
            setHTML: function( html )
            {
                node_contenteditable.innerHTML = html || '';
                callUpdates( true ); // selection destroyed
                return this;
            },
            getSelectedHTML: function()
            {
                restoreSelection( node_contenteditable, popup_saved_selection );
                if( ! selectionInside(node_contenteditable) )
                    return null;
                return getSelectionHtml( node_contenteditable );
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
                restoreSelection( node_contenteditable, popup_saved_selection );
                if( ! selectionInside(node_contenteditable) )
                    return this;
                expandSelectionCaret( node_contenteditable, preceding, following );
                popup_saved_selection = saveSelection( node_contenteditable ); // save new selection
                return this;
            },
            openPopup: function()
            {
                if( ! popup_saved_selection )
                    popup_saved_selection = saveSelection( node_contenteditable ); // save current selection
                return popupOpen();
            },
            activePopup: function()
            {
                return node_popup;
            },
            closePopup: function()
            {
                popupClose();
                return this;
            },
            // formats
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
                    restoreSelection( node_contenteditable, popup_saved_selection );
                    selectionInside( node_contenteditable, true );
                    pasteHtmlAtCaret( node_contenteditable, html );
                }
                callUpdates( true ); // selection destroyed
                return this;
            },
            orderedList: function()
            {
                execCommand( 'insertOrderedList' );
                callUpdates();
                return this;
            },
            unorderedList: function()
            {
                execCommand( 'insertUnorderedList' );
                callUpdates();
                return this;
            },
        };

        // Create toolbar
        if( buttons )
        {
            var toolbar_element = document.createElement('div');
            add_class( toolbar_element, 'toolbar' );
            if( toolbar_top )
            {
                add_class( toolbar_element, 'toolbar-top' );
                node_container.insertBefore( toolbar_element, node_container.firstChild );
            }
            else if( toolbar_bottom )
            {
                add_class( toolbar_element, 'toolbar-bottom' );
                node_container.appendChild( toolbar_element );
            }
            else
            {
                var toolbar_wrapper = document.createElement('div');
                add_class( toolbar_wrapper, 'toolbar-auto' );
                node_container.appendChild( toolbar_wrapper );
                toolbar_wrapper.appendChild( toolbar_element );
            }
            fill_buttons( toolbar_element, null, buttons, hotkeys );
        }

        return commands;
    };

    // https://www.matteoagosti.com/blog/2013/02/24/writing-javascript-modules-for-both-browser-and-node/
    if( typeof module !== 'undefined' && typeof module.exports !== 'undefined' )
        module.exports = wysiwyg;
    else
        window.wysiwyg = wysiwyg;
})(window, document);
