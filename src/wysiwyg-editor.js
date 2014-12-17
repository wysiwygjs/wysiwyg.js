(function(window, document, $, undefined){
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

    // Resize image
    var resize_image = function( $image, max_width, max_height )
    {
        var image_width, image_height;
        if( $image.is(':visible') )
        {
            image_width = $image.width();
            image_height = $image.height();
        }
        else
        {
            image_width = $image.attr('width');
            image_height = $image.attr('height');
            if( ! image_width || ! image_height )
                return 0;
            image_width = parseInt(image_width);
            image_height = parseInt(image_height);
        }
        if( image_width > max_width || image_height > max_height )
        {
            if( (image_width/image_height) > (max_width/max_height) )
            {
                image_height = parseInt(image_height / image_width * max_width);
                image_width = max_width;
            }
            else
            {
                image_width = parseInt(image_width / image_height * max_height);
                image_height = max_height;
            }
            $image.attr('width',image_width)
                  .attr('height',image_height);
        }
        return image_width;
    };

    // Create the Editor
    var create_editor = function( $textarea, classes, placeholder, toolbar_position, toolbar_buttons, toolbar_submit, toolbar_fontnames, toolbar_fontsizes, toolbar_smilies, label_dropfileclick,
                                  content_styleWithCSS, content_insertBrOnReturn, placeholder_url, clip_image, clip_smiley, onImageUpload, onKeyEnter )
    {
        // Content: Smilies
        var content_smilies = function(wysiwygeditor)
        {
            var $content = $('<div/>').addClass('wysiwyg-toolbar-smilies')
                                      .attr('unselectable','on');
            var smiley_sum_width = 0;
            $.each( toolbar_smilies, function(index,smiley){
                if( index != 0 )
                    $content.append(' ');
                var $image = $(smiley).attr('unselectable','on');
                if( clip_smiley )
                    smiley_sum_width += resize_image( $image, clip_smiley[0], clip_smiley[1] );
                // Append smiley
                var imagehtml = ' '+$('<div/>').append($image.clone()).html()+' ';
                $image
                    .css({ cursor: 'pointer' })
                    .click(function(event){
                        // do not close popup
                        wysiwygeditor.insertHTML( imagehtml );
                    })
                    .appendTo( $content );
            });
            if( smiley_sum_width )
                $content.css({ maxWidth: parseInt(smiley_sum_width*1.35/4)+'px' })
            return $content;
        };

        // Content: Insert link
        var wysiwygeditor_insertLink = function( wysiwygeditor, url )
        {
            if( ! url )
                return wysiwygeditor;
            var selectedhtml = wysiwygeditor.getSelectedHTML();
            if( selectedhtml )
                return wysiwygeditor.insertLink( url );
            var html = '<a href="' + url.replace(/"/,'&quot;') + '">' + url + '</a>';
            return wysiwygeditor.insertHTML( html );
        };
        var content_insertlink = function(wysiwygeditor)
        {
            var $button = toolbar_button( toolbar_submit );
            var $inputurl = $('<input type="text" value=""' + (placeholder_url ? ' placeholder="'+placeholder_url+'"' : '') + ' />').addClass('wysiwyg-input')
                                .keypress(function(event){
                                    if( event.which != 10 && event.which != 13 )
                                        return ;
                                    // Catch 'NS_ERROR_FAILURE' on Firefox 34
                                    try {
                                        wysiwygeditor_insertLink(wysiwygeditor,$inputurl.val()).closePopup().collapseSelection();
                                    }
                                    catch( e ) {
                                        wysiwygeditor.closePopup();
                                    }
                                });
            var $okaybutton = $button.click(function(event){
                                    wysiwygeditor_insertLink(wysiwygeditor,$inputurl.val()).closePopup().collapseSelection();
                                    event.stopPropagation();
                                    event.preventDefault();
                                    return false;
                                });
            var $content = $('<div/>').addClass('wysiwyg-toolbar-form')
                                      .attr('unselectable','on');
            $content.append($inputurl).append($okaybutton);
            return $content;
        };

        // Content: Insert image
        var content_insertimage = function(wysiwygeditor)
        {
            // Add image to editor
            var insert_image_wysiwyg = function( url, filename )
            {
                var html = '<img id="wysiwyg-insert-image" src="" alt=""' + (filename ? ' title="'+filename.replace(/"/,'&quot;')+'"' : '') + ' />';
                wysiwygeditor.insertHTML( html ).closePopup().collapseSelection();
                var $image = $('#wysiwyg-insert-image').removeAttr('id');
                if( clip_image )
                {
                    $image.css({maxWidth: clip_image[0]+'px',
                                maxHeight: clip_image[1]+'px'})
                          .load( function() {
                                $image.css({maxWidth: '',
                                            maxHeight: ''});
                                resize_image( $image, clip_image[0], clip_image[1] );
                            });
                }
                $image.attr('src', url);
            };
            // Create popup
            var $content = $('<div/>').addClass('wysiwyg-toolbar-form')
                                      .attr('unselectable','on');
            // Add image via 'Browse...'
            var $fileuploader = null;
            if( window.File && window.FileReader && window.FileList )
            {
                // File-API
                var loadImageFromFile = function( file )
                {
                    // Only process image files
                    if( ! file.type.match('image.*') )
                        return;
                    var reader = new FileReader();
                    reader.onload = function(event) {
                        var dataurl = event.target.result;
                        insert_image_wysiwyg( dataurl, file.name );
                    };
                    // Read in the image file as a data URL
                    reader.readAsDataURL( file );
                };
                $fileuploader = $('<input type="file" />')
                                    .attr('draggable','true')
                                    .css({position: 'absolute',
                                            left: 0,
                                            top: 0,
                                            width: '100%',
                                            height: '100%',
                                            opacity: 0,
                                            cursor: 'pointer'})
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
            else if( onImageUpload )
            {
                // Upload image to a server
                var $input = $('<input type="file" />')
                                        .css({position: 'absolute',
                                              left: 0,
                                              top: 0,
                                              width: '100%',
                                              height: '100%',
                                              opacity: 0,
                                              cursor: 'pointer'})
                                        .change(function(event){
                                            onImageUpload.call( this, insert_image_wysiwyg );
                                        });
                $fileuploader = $('<form/>').append($input);
            }
            if( $fileuploader )
                $('<div/>').addClass( 'wysiwyg-browse' )
                           .html( label_dropfileclick )
                           .append( $fileuploader )
                           .appendTo( $content );
            // Add image via 'URL'
            var $button = toolbar_button( toolbar_submit );
            var $inputurl = $('<input type="text" value=""' + (placeholder_url ? ' placeholder="'+placeholder_url+'"' : '') + ' />').addClass('wysiwyg-input')
                                .keypress(function(event){
                                    if( event.which == 10 || event.which == 13 )
                                        insert_image_wysiwyg( $inputurl.val() );
                                });
            var $okaybutton = $button.click(function(event){
                                    insert_image_wysiwyg( $inputurl.val() );
                                    event.stopPropagation();
                                    event.preventDefault();
                                    return false;
                                });
            $content.append( $('<div/>').append($inputurl).append($okaybutton) );
            return $content;
        };

        // Fontname + Fontsize
        var content_fontname = function(wysiwygeditor)
        {
            var $content = $('<div/>').addClass('wysiwyg-toolbar-list')
                                      .attr('unselectable','on');
            $.each( toolbar_fontnames, function( name, font ){
                var $link = $('<a/>').attr('href','#')
                                     .css( 'font-family', font )
                                     .html( name )
                                     .click(function(event){
                                        wysiwygeditor.fontName(font).closePopup().collapseSelection();
                                        event.stopPropagation();
                                        event.preventDefault();
                                        return false;
                                     });
                $content.append( $link );
            });
            return $content;
        };
        var content_fontsize = function(wysiwygeditor)
        {
            var $content = $('<div/>').addClass('wysiwyg-toolbar-list')
                                      .attr('unselectable','on');
            $.each( toolbar_fontsizes, function( name, size ){
                var $link = $('<a/>').attr('href','#')
                                     .css( 'font-size', (8 + (size * 3)) + 'px' )
                                     .html( name )
                                     .click(function(event){
                                        wysiwygeditor.fontSize(size).closePopup().collapseSelection();
                                        event.stopPropagation();
                                        event.preventDefault();
                                        return false;
                                     });
                $content.append( $link );
            });
            return $content;
        };

        // Content: Color palette
        var content_colorpalette = function( wysiwygeditor, forecolor )
        {
            var $content = $('<table/>')
                            .attr('cellpadding','0')
                            .attr('cellspacing','0')
                            .attr('unselectable','on');
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
                              .attr('title', color)
                              .attr('unselectable','on')
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
                case 'smilies':
                    if( ! popup_callback )
                        return null;
                    return function( target ) {
                        popup_callback( content_smilies(wysiwygeditor), target );
                    };
                case 'insertimage':
                    if( ! popup_callback )
                        return null;
                    return function( target ) {
                        popup_callback( content_insertimage(wysiwygeditor), target );
                    };
                case 'insertlink':
                    if( ! popup_callback )
                        return null;
                    return function( target ) {
                        popup_callback( content_insertlink(wysiwygeditor), target );
                    };
                case 'fontname':
                    if( ! popup_callback )
                        return null;
                    return function( target ) {
                        popup_callback( content_fontname(wysiwygeditor), target );
                    };
                case 'fontsize':
                    if( ! popup_callback )
                        return null;
                    return function( target ) {
                        popup_callback( content_fontsize(wysiwygeditor), target );
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
            return $('<a/>').addClass( 'wysiwyg-toolbar-icon' )
                            .attr('href','#')
                            .attr('title', button.title)
                            .attr('unselectable','on')
                            .append(button.image);
        };
        var add_buttons_to_toolbar = function( $toolbar, popup_callback, selection )
        {
            $.each( toolbar_buttons, function(key, value) {
                if( ! value )
                    return ;
                // Skip buttons on the toolbar
                if( ! selection && 'toolbar' in value && ! value.toolbar )
                    return ;
                // Skip buttons on selection
                if( selection && 'selection' in value && ! value.selection )
                    return ;
                var toolbar_handler = get_toolbar_handler( key, popup_callback );
                var $button;
                if( toolbar_handler )
                    $button = toolbar_button( value ).click( function(event) {
                        toolbar_handler( event.currentTarget );
                        // Give the focus back to the editor. Technically not necessary
                        if( get_toolbar_handler(key) ) // only if not a popup-handler
                            wysiwygeditor.getElement().focus()
                        event.stopPropagation();
                        event.preventDefault();
                        return false;
                    });
                else
                    $button = $(value.html);
                $toolbar.append( $button );
            });
        };
        var fixed_parent = function()
        {
            var parent_fixed = false;
            $(wysiwygeditor.getElement()).parents().each(function(index,element){
                if( $(element).css('position') == 'fixed' )
                {
                    parent_fixed = true;
                    return false;
                }
            });
            return parent_fixed;
        };
        var fixed_offset = function( $element )
        {
            //$.offset() does not work with Safari 3 and 'position:fixed'
            var offset = {
                left: 0,
                top: 0
            };
            var node = $element.get(0);
            while( node )
            {
                offset.left += node.offsetLeft;
                offset.top += node.offsetTop;
                node = node.offsetParent;
            }
            return offset;
        };


        // Transform the textarea to contenteditable
        var hotkeys = {};
        var create_wysiwyg = function( $textarea, $container, placeholder )
        {
            var option = {
                element: $textarea.get(0),
                onkeypress: function( code, character, shiftKey, altKey, ctrlKey, metaKey )
                    {
                        if( onKeyEnter && (code == 10 || code == 13) && !shiftKey && !altKey && !ctrlKey && !metaKey )
                            return onKeyEnter.call( wysiwygeditor.getElement() );
                        // Exec hotkey
                        if( character && !shiftKey && !altKey && ctrlKey && !metaKey )
                        {
                            var hotkey = character.toLowerCase();
                            if( ! hotkeys[hotkey] )
                                return ;
                            hotkeys[hotkey]();
                            return false; // prevent default
                        }
                    },
                onselection: function( collapsed, rect, nodes, rightclick )
                    {
                        var want_toolbar = true;
                        // No selection-toolbar wanted?
                        if( ! rightclick && toolbar_position != 'top-selection' && toolbar_position != 'bottom-selection' && toolbar_position != 'selection' )
                            want_toolbar = false;
                        // Selection properties
                        else if( rect === undefined || ! rightclick )
                        {
                            // Nothing selected?
                            if( collapsed || rect === undefined )
                                want_toolbar = false;
                            // Only one image?
                            else if( nodes.length == 1 && nodes.shift().nodeName == 'IMG' )
                                want_toolbar = false;
                        }
                        if( ! want_toolbar )
                        {
                            wysiwygeditor.closePopup();
                            return ;
                        }
                        // Apply position
                        var $toolbar;
                        var apply_toolbar_position = function()
                        {
                            var offset = fixed_offset($(wysiwygeditor.getElement()));
                            var toolbar_width = $toolbar.outerWidth();
                            // Point is the center of the selection
                            var left = offset.left + rect.left + parseInt(rect.width / 2) - parseInt(toolbar_width / 2);
                            var top = offset.top + rect.top + rect.height;
                            // Trim to viewport
                            var viewport_width = $(window).width();
                            if( left + toolbar_width > viewport_width - 1 )
                                left = viewport_width - toolbar_width - 1;
                            var scroll_left = fixed_parent() ? 0 : $(window).scrollLeft();
                            if( left < scroll_left + 1 )
                                left = scroll_left + 1;
                            $toolbar.css({ left: left + 'px',
                                           top: top + 'px',
                                           overflow: 'visible' });
                        };
                        // Open popup
                        var handle = wysiwygeditor.openPopup();
                        if( ! handle )
                            return ;
                        $toolbar = $(handle);
                        if( $toolbar.hasClass('wysiwyg-popup') && ! $toolbar.hasClass('wysiwyg-arrowtop') )
                            $toolbar = $(wysiwygeditor.closePopup().openPopup()); // wrong popup -> create a new one
                        if( ! $toolbar.hasClass('wysiwyg-popup') )
                        {
                            // add classes + buttons
                            $toolbar.addClass( 'wysiwyg-popup wysiwyg-arrowtop' )
                                    .css('position', fixed_parent() ? 'fixed' : 'absolute' );
                            add_buttons_to_toolbar( $toolbar, function( $content )
                            {
                                $toolbar.empty().append( $content );
                                $toolbar.find('input[type=text]:first').focus();
                                apply_toolbar_position();
                            }, true );
                        }
                        // Toolbar position
                        apply_toolbar_position();
                    },
                hijackcontextmenu: (toolbar_position == 'selection')
            };
            if( placeholder )
            {
                var $placeholder = $('<div/>').addClass( 'wysiwyg-placeholder' )
                                              .html( placeholder )
                                              .hide();
                $container.prepend( $placeholder );
                option.onplaceholder = function( visible ) {
                    if( visible )
                        $placeholder.show();
                    else
                        $placeholder.hide();
                };
            }

            var wysiwygeditor = wysiwyg( option );
            if( wysiwygeditor && (content_styleWithCSS !== undefined || content_insertBrOnReturn !== undefined) )
                wysiwygeditor.markup( content_styleWithCSS || false, content_insertBrOnReturn || false );
            return wysiwygeditor;
        }


        // Create a container
        var $container = $('<div/>').addClass('wysiwyg-container');
        if( classes )
            $container.addClass( classes );
        $textarea.wrap( $container );
        $container = $textarea.parent( '.wysiwyg-container' );

        // Create the editor-wrapper if placeholder
        var $wrapper = false;
        if( placeholder )
        {
            $wrapper = $('<div/>').addClass('wysiwyg-wrapper');
            $textarea.wrap( $wrapper );
            $wrapper = $textarea.parent( '.wysiwyg-wrapper' );
        }

        // Create the WYSIWYG Editor
        var wysiwygeditor = create_wysiwyg( $textarea, placeholder ? $wrapper : $container, placeholder );
        if( wysiwygeditor.legacy )
        {
            var $textarea = $(wysiwygeditor.getElement());
            $textarea.addClass( 'wysiwyg-textarea' );
            if( $textarea.is(':visible') ) // inside the DOM
                $textarea.width( $container.width() - ($textarea.outerWidth() - $textarea.width()) );
        }
        else
            $(wysiwygeditor.getElement()).addClass( 'wysiwyg-editor' );

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

        // Toolbar top or bottom
        if( toolbar_position != 'selection' )
        {
            var toolbar_top = toolbar_position == 'top' || toolbar_position == 'top-selection';
            var $toolbar = $('<div/>').addClass( toolbar_top ? 'wysiwyg-toolbar-top' : 'wysiwyg-toolbar-bottom' );
            add_buttons_to_toolbar( $toolbar, function( $content, target ){
                // Open a popup from the toolbar
                var handle = wysiwygeditor.openPopup();
                if( ! handle )
                    return ;
                var $toolbar = $(handle);
                if( $toolbar.hasClass('wysiwyg-popup') && $toolbar.hasClass('wysiwyg-arrowtop') )
                    $toolbar = $(wysiwygeditor.closePopup().openPopup()); // wrong popup -> create a new one
                if( ! $toolbar.hasClass('wysiwyg-popup') )
                {
                    // add classes + content
                    $toolbar.addClass( 'wysiwyg-popup' )
                            .css('position', fixed_parent() ? 'fixed' : 'absolute' );
                    $toolbar.append( $content );
                }
                // Popup position
                var $button = $(target);
                var offset = fixed_offset($button);
                var toolbar_width = $toolbar.outerWidth();
                // Point is the top/bottom-center of the button
                var left = offset.left + parseInt($button.width() / 2) - parseInt(toolbar_width / 2);
                var top = offset.top;
                if( toolbar_top )
                    top += $button.outerHeight();
                else
                    top -= $toolbar.height();
                // Trim to viewport
                var viewport_width = $(window).width();
                if( left + toolbar_width > viewport_width - 1 )
                    left = viewport_width - toolbar_width - 1;
                var scroll_left = fixed_parent() ? 0 : $(window).scrollLeft();
                if( left < scroll_left + 1 )
                    left = scroll_left + 1;
                $toolbar.css({ left: left + 'px',
                               top: top + 'px',
                               overflow: 'visible'
                             });
                $toolbar.find('input[type=text]:first').focus();
            });
            if( toolbar_top )
                $container.prepend( $toolbar );
            else
                $container.append( $toolbar );
        }

        // Export userdata
        return {
            wysiwygeditor: wysiwygeditor,
            commands: commands
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
                if( $that.data( 'wysiwyg') )
                    return ;

                // Two modes: toolbar on top and on bottom
                var classes = option.classes;
                var placeholder = option.placeholder || $that.attr('placeholder');
                var toolbar_position = (option.position && (option.position == 'top' || option.position == 'top-selection' || option.position == 'bottom' || option.position == 'bottom-selection' || option.position == 'selection')) ? option.position : 'top-selection';
                var toolbar_buttons = option.buttons;
                var toolbar_submit = option.submit;
                var toolbar_fontnames = option.fontnames || {};
                var toolbar_fontsizes = option.fontsizes || {};
                var toolbar_smilies = option.smilies;
                var label_dropfileclick = option.dropfileclick;
                var content_styleWithCSS = option.styleWithCSS;
                var content_insertBrOnReturn = option.insertBrOnReturn;
                var placeholder_url = option.placeholderUrl || null;
                var clip_image = option.clipImage || null;
                var clip_smiley = option.clipSmiley || null;
                var onImageUpload = option.onImageUpload;
                var onKeyEnter = option.onKeyEnter;

                // Create the WYSIWYG Editor
                var data = create_editor( $that, classes, placeholder, toolbar_position, toolbar_buttons, toolbar_submit, toolbar_fontnames, toolbar_fontsizes, toolbar_smilies, label_dropfileclick,
                                          content_styleWithCSS, content_insertBrOnReturn, placeholder_url, clip_image, clip_smiley, onImageUpload, onKeyEnter );
                $that.data( 'wysiwyg', data );
            });
        }
        else if( this.length == 1 )
        {
            var $that = $(this);
            var data = $that.data('wysiwyg');
            if( ! data )
                return false;
            if( option == 'html' )
            {
                if( typeof(param) != 'undefined' )
                    data.wysiwygeditor.setHTML( param );
                else
                    return data.wysiwygeditor.getHTML();
            }
            else if( option == 'forecolor' ) {
                data.wysiwygeditor.forecolor( param ).closePopup().collapseSelection();
            }
            else if( option == 'highlight' ) {
                data.wysiwygeditor.highlight( param ).closePopup().collapseSelection();
            }
            else if( option == 'format' ) {
                data.wysiwygeditor.format( param ).closePopup().collapseSelection();
            }
            else if( option == 'fontname' ) {
                data.wysiwygeditor.fontName( param ).closePopup().collapseSelection();
            }
            else if( option == 'fontsize' ) {
                data.wysiwygeditor.fontSize( param ).closePopup().collapseSelection();
            }
            else if( option == 'insertlink' ) {
                wysiwygeditor_insertLink(data.wysiwygeditor,param).closePopup().collapseSelection();
            }
            else if( option == 'insertimage' ) {
                data.wysiwygeditor.insertImage( param ).closePopup().collapseSelection();
            }
            else if( option == 'inserthtml' ) {
                data.wysiwygeditor.insertHTML( param ).closePopup().collapseSelection();
            }
            else if( data.commands[option] )
                data.commands[option]( param );
            return this;
        }
        return false;
    };
})(window, document, jQuery);
