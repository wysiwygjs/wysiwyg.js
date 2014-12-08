// Wrap the Editor into a jQuery Module
(function(window, document, $, undefined){
    'use strict';

    // Global variables
    var colors = [
        '#000000', '#444444', '#666666', '#999999', '#CCCCCC', '#EEEEEE', '#F3F3F3', '#FFFFFF', null,
        '#FF0000', '#FF9900', '#FFFF00', '#00FF00', '#00FFFF', '#0000FF', '#9900FF', '#FF00FF', null,
        '#F4CCCC', '#FCE5CD', '#FFF2CC', '#D9EAD3', '#D0E0E3', '#CFE2F3', '#D9D2E9', '#EAD1DC', null,
        '#EA9999', '#F9CB9C', '#FFE599', '#B6D7A8', '#A2C4C9', '#9FC5E8', '#B4A7D6', '#D5A6BD', null,
        '#E06666', '#F6B26B', '#FFD966', '#93C47D', '#76A5AF', '#6FA8DC', '#8E7CC3', '#C27BA0', null,
        '#CC0000', '#E69138', '#F1C232', '#6AA84F', '#45818E', '#3D85C6', '#674EA7', '#A64D79', null,
        '#990000', '#B45F06', '#BF9000', '#38771D', '#134F5C', '#0B5394', '#351C75', '#741B47', null,
        '#660000', '#783F04', '#7F6000', '#274E13', '#0C343D', '#073763', '#201211', '#4C1130'
    ];
    var smiley_max_width = 64,
        smiley_max_height = 24;
    var placeholder_url = 'http://example.com/';

    // Create the Editor
    var create_editor = function( $textarea, placeholder, toolbar_position, toolbar_buttons, toolbar_submit, toolbar_smilies, label_dropfileclick,
                                  content_styleWithCSS, content_insertBrOnReturn, onImageUpload, onEnterSubmit )
    {
        // Content: Smilies
        var content_smilies = function(wysiwygeditor)
        {
            var $content = $('<div/>').addClass('wysiwyg-toolbar-feature wysiwyg-toolbar-smilies')
                                      .attr('unselectable','on');
            var smiley_sum_width = 0;
            $.each( toolbar_smilies, function(index,smiley){
                if( index != 0 )
                    $content.append(' ');
                var $image = $(smiley);
                var image_width = parseInt($image.attr('width')),
                    image_height = parseInt($image.attr('height'));
                // Shrink smiley
                if( image_width > smiley_max_width || image_height > smiley_max_height )
                {
                    if( (image_width/image_height) > (smiley_max_width/smiley_max_height) )
                    {
                        image_height = parseInt(image_height / image_width * smiley_max_width);
                        image_width = smiley_max_width;
                    }
                    else
                    {
                        image_width = parseInt(image_width / image_height * smiley_max_height);
                        image_height = smiley_max_height;
                    }
                    $image.attr('width',image_width)
                          .attr('height',image_height)
                          .attr('unselectable','on');
                }
                // Append smiley
                var imagehtml = ' '+$('<div/>').append($image.clone()).html()+' ';
                $image
                    .css({ cursor: 'pointer' })
                    .click(function(event){
                        // do not close popup
                        wysiwygeditor.insertHTML( imagehtml );
                    })
                    .appendTo( $content );
                smiley_sum_width += image_width;
            });
            $content.css({ maxWidth: parseInt(smiley_sum_width*1.35/4)+'px' })
            return $content;
        };

        // Content: Insert link
        var content_insertlink = function(wysiwygeditor)
        {
            var $button = toolbar_button( toolbar_submit );
            var $inputurl = $('<input type="text" value="" placeholder="'+placeholder_url+'" />').addClass('wysiwyg-input')
                                .keypress(function(event){
                                    if( event.which == 10 || event.which == 13 )
                                        wysiwygeditor.insertLink( $inputurl.val() ).closePopup().collapseSelection();
                                });
            var $okaybutton = $button.click(function(event){
                                    wysiwygeditor.insertLink( $inputurl.val() ).closePopup().collapseSelection();
                                    event.stopPropagation();
                                    event.preventDefault();
                                    return false;
                                });
            var $content = $('<div/>').addClass('wysiwyg-toolbar-feature')
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
                var html = '<img id="wysiwyg-insert-image" src="" alt=""' + (filename ? ' title="'+filename.replace(/"/,'')+'"' : '') + ' />';
                wysiwygeditor.insertHTML( html ).closePopup().collapseSelection();
                $('#wysiwyg-insert-image')
                        .removeAttr('id')
                        .css({maxWidth: '200px',
                              maxHeight: '200px'})
                        .load( function() {
                            var $image = $(this);
                            $image.css({maxWidth: '',
                                        maxHeight: ''});
                            var width = $image.width();
                            var height = $image.height();
                            if( width > 200 || height > 200 )
                            {
                                if( width > height ) {
                                    height = parseInt(200 / width * height);
                                    width = 200;
                                }
                                else {
                                    width = parseInt(200 / height * width);
                                    height = 200;
                                }
                                $image.attr( 'width', width )
                                      .attr( 'height', height );
                            }
                        })
                        .attr('src', url);
            };
            // Create popup
            var $content = $('<div/>').addClass('wysiwyg-toolbar-feature')
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
                    var filename = file.name.replace(/'/,"\\'");
                    reader.onload = function(event) {
                        var dataurl = event.target.result;
                        insert_image_wysiwyg( dataurl, filename );
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
            var $inputurl = $('<input type="text" value="" placeholder="'+placeholder_url+'" />').addClass('wysiwyg-input')
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

        // Content: Color palette
        var content_colorpalette = function( wysiwygeditor, forecolor )
        {
            var $content = $('<div/>').addClass('wysiwyg-toolbar-feature')
                                      .attr('unselectable','on');
            $.each( colors, function(index,color){
                if(!color)
                {
                    $content.append('<br/>');
                    return;
                }
                $('<a/>').addClass('wysiwyg-color')
                        .attr('href','#')
                        .attr('title', color)
                        .attr('unselectable','on')
                        .css({backgroundColor: color})
                        .click(function(){
                            if( forecolor )
                                wysiwygeditor.forecolor( color ).closePopup().collapseSelection();
                            else
                                wysiwygeditor.highlight( color ).closePopup().collapseSelection();
                            return false;
                        })
                        .appendTo( $content );
            });
            return $content;
        };

        // Create the toolbar
        var toolbar_button = function( button ) {
            return $('<a/>').addClass( 'wysiwyg-toolbar-icon' )
                            .attr('href','#')
                            .attr('title', button.title)
                            .attr('unselectable','on')
                            .append(button.image);
        };
        var add_buttons_to_toolbar = function( $toolbar, popup_callback, secondary )
        {
            $.each( toolbar_buttons, function(key, value) {
                if( ! value )
                    return ;
                // Skip some buttons in the hover-toolbar
                if( value.secondary && secondary )
                    return ;
                var $html, onclick;
                switch( key )
                {
                    case 'smilies':
                        onclick = function(event){
                                        popup_callback.call( event.currentTarget, content_smilies(wysiwygeditor) )
                                        event.stopPropagation();
                                        event.preventDefault();
                                        return false;
                                    };
                        break;
                    case 'insertimage':
                        onclick = function(event){
                                        popup_callback.call( event.currentTarget, content_insertimage(wysiwygeditor) );
                                        event.stopPropagation();
                                        event.preventDefault();
                                        return false;
                                    };
                        break;
                    case 'insertlink':
                        onclick = function(event){
                                        popup_callback.call( event.currentTarget, content_insertlink(wysiwygeditor) );
                                        event.stopPropagation();
                                        event.preventDefault();
                                        return false;
                                    };
                        break;
                    case 'bold':
                        onclick = function(event){
                                        wysiwygeditor.bold(); // .closePopup().collapseSelection()
                                        event.stopPropagation();
                                        event.preventDefault();
                                        return false;
                                    };
                        break;
                    case 'italic':
                        onclick = function(event){
                                        wysiwygeditor.italic(); // .closePopup().collapseSelection()
                                        event.stopPropagation();
                                        event.preventDefault();
                                        return false;
                                    };
                        break;
                    case 'underline':
                        onclick = function(event){
                                        wysiwygeditor.underline(); // .closePopup().collapseSelection()
                                        event.stopPropagation();
                                        event.preventDefault();
                                        return false;
                                    };
                        break;
                    case 'strikethrough':
                        onclick = function(event){
                                        wysiwygeditor.strikethrough(); // .closePopup().collapseSelection()
                                        event.stopPropagation();
                                        event.preventDefault();
                                        return false;
                                    };
                        break;
                    case 'forecolor':
                        onclick = function(event){
                                        popup_callback.call( event.currentTarget, content_colorpalette(wysiwygeditor,true) );
                                        event.stopPropagation();
                                        event.preventDefault();
                                        return false;
                                    };
                        break;
                    case 'highlight':
                        onclick = function(event){
                                        popup_callback.call( event.currentTarget, content_colorpalette(wysiwygeditor,false) );
                                        event.stopPropagation();
                                        event.preventDefault();
                                        return false;
                                    };
                        break;
                    case 'orderedList':
                        onclick = function(event){
                                        wysiwygeditor.insertOrderedList().closePopup().collapseSelection();
                                        event.stopPropagation();
                                        event.preventDefault();
                                        return false;
                                    };
                        break;
                    case 'unorderedList':
                        onclick = function(event){
                                        wysiwygeditor.insertUnorderedList().closePopup().collapseSelection();
                                        event.stopPropagation();
                                        event.preventDefault();
                                        return false;
                                    };
                        break;
                    case 'removeformat':
                        onclick = function(event){
                                        wysiwygeditor.removeFormat().closePopup().collapseSelection();
                                        event.stopPropagation();
                                        event.preventDefault();
                                        return false;
                                    };
                        break;
                    default:
                        $html = $(value.html);
                        break;
                }
                var $button = $html || toolbar_button( value );
                if( onclick )
                    $button.click( onclick );
                $toolbar.append( $button );
            });
        };


        // Transform the textarea to contenteditable
        var create_wysiwyg = function( $textarea, $container, placeholder )
        {
            var option = {
                element: $textarea.get(0),
                onkeypress: function( code, character, shiftKey, altKey, ctrlKey, metaKey )
                    {
                        if( onEnterSubmit && (code == 10 || code == 13) && !altKey && !ctrlKey && !metaKey )
                            return onEnterSubmit();
                        if( character && ctrlKey )
                        switch( character.toLowerCase() )
                        {
                            case 'b': wysiwygeditor.bold(); // .closePopup().collapseSelection()
                                      return false;
                            case 'i': wysiwygeditor.italic(); // .closePopup().collapseSelection()
                                      return false;
                            case 'u': wysiwygeditor.underline(); // .closePopup().collapseSelection()
                                      return false;
                            case 's': wysiwygeditor.strikethrough(); // .closePopup().collapseSelection()
                                      return false;
                        }
                    }
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
            if( toolbar_position == 'top-selection' || toolbar_position == 'bottom-selection' || toolbar_position == 'selection' )
            {
                option.onselection = function( collapsed, rect, nodes, rightclick )
                    {
                        // Selection properties
                        if( rect === undefined || ! rightclick )
                        {
                            // Nothing selected?
                            if( collapsed || rect === undefined )
                            {
                                wysiwygeditor.closePopup().collapseSelection();
                                return ;
                            }
                            // Only one image?
                            if( nodes.length == 1 && nodes.shift().nodeName == 'IMG' )
                            {
                                wysiwygeditor.closePopup();
                                return ;
                            }
                        }
                        // Apply position
                        var $toolbar;
                        var apply_toolbar_position = function()
                        {
                            var offset = $(wysiwygeditor.getElement()).offset();
                            // Point is the center of the selection
                            var x = rect.left + parseInt(rect.width / 2);
                            var y = rect.top + rect.height;
                            var left = x - ($toolbar.width() / 2);
                            var top = y;
                            $toolbar.css({ left: Math.max(offset.left + left, 0)+'px',
                                           top: Math.max(offset.top + top, 0)+'px',
                                           overflow: 'visible' });
                        };
                        // Open popup
                        $toolbar = $(wysiwygeditor.openPopup());
                        if( $toolbar.hasClass('wysiwyg-popup') && ! $toolbar.hasClass('wysiwyg-arrowtop') )
                            $toolbar = $(wysiwygeditor.closePopup().openPopup()); // wrong popup -> create a new one
                        if( ! $toolbar.hasClass('wysiwyg-popup') )
                        {
                            // add Classes
                            $toolbar.addClass( 'wysiwyg-popup wysiwyg-arrowtop' );
                            // add Buttons
                            var simplify_selection_toolbar = toolbar_position == 'top-selection' || toolbar_position == 'bottom-selection';
                            add_buttons_to_toolbar( $toolbar, function( $content )
                            {
                                $toolbar.empty().append( $content );
                                $toolbar.find('input[type=text]:first').focus();
                                apply_toolbar_position();
                            }, simplify_selection_toolbar );
                        }
                        // Toolbar position
                        apply_toolbar_position();
                    };
            }

            var wysiwygeditor = wysiwyg( option );
            if( wysiwygeditor && (content_styleWithCSS !== undefined || content_insertBrOnReturn !== undefined) )
                wysiwygeditor.markup( content_styleWithCSS || false, content_insertBrOnReturn || false );
            return wysiwygeditor;
        }


        // Create a container
        var $container = $('<div/>').addClass('wysiwyg-container');
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
        $textarea.data( 'wysiwyg', wysiwygeditor );
        if( wysiwygeditor.legacy )
        {
            var $textarea = $(wysiwygeditor.getElement());
            $textarea.addClass( 'wysiwyg-textarea' );
            if( $textarea.is(':visible') ) // inside the DOM
                $textarea.width( $container.width() - ($textarea.outerWidth() - $textarea.width()) );
        }
        else
            $(wysiwygeditor.getElement()).addClass( 'wysiwyg-editor' );

        // Toolbar top or bottom
        if( toolbar_position != 'selection' )
        {
            var toolbar_top = toolbar_position == 'top' || toolbar_position == 'top-selection';
            var $toolbar = $('<div/>').addClass( toolbar_top ? 'wysiwyg-toolbar-top' : 'wysiwyg-toolbar-bottom' );
            add_buttons_to_toolbar( $toolbar, function( $content ){
                // Open a popup from the toolbar
                var handle = wysiwygeditor.openPopup();
                var $toolbar = $(handle).addClass( 'wysiwyg-popup' );
                $toolbar.append( $content );
                // Popup position
                var $button = $(this);
                var offset = $button.offset();
                var left = Math.max( offset.left - ($toolbar.width() / 2), 0 ) + ($button.width() / 2);
                var top = offset.top;
                if( toolbar_top )
                    top += $button.height();
                else
                    top -= $toolbar.height();
                $toolbar.css({ left: left+'px',
                               top: top+'px',
                               overflow: 'visible'
                             });
                $toolbar.find('input[type=text]:first').focus();
            });
            if( toolbar_top )
                $container.prepend( $toolbar );
            else
                $container.append( $toolbar );
        }
    };

    // JQuery Interface
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
                var placeholder = option.placeholder || $that.attr('placeholder');
                var toolbar_position = (option.position && (option.position == 'top' || option.position == 'top-selection' || option.position == 'bottom' || option.position == 'bottom-selection' || option.position == 'selection')) ? option.position : 'top-selection';
                var toolbar_buttons = option.buttons;
                var toolbar_submit = option.submit;
                var toolbar_smilies = option.smilies;
                var label_dropfileclick = option.dropfileclick;
                var content_styleWithCSS = option.styleWithCSS;
                var content_insertBrOnReturn = option.insertBrOnReturn;
                var onImageUpload = option.onImageUpload;
                var onEnterSubmit = option.onEnterSubmit;

                // Create the WYSIWYG Editor
                create_editor( $that, placeholder, toolbar_position, toolbar_buttons, toolbar_submit, toolbar_smilies, label_dropfileclick,
                               content_styleWithCSS, content_insertBrOnReturn, onImageUpload, onEnterSubmit );
            });
        }
        else if( this.length == 1 )
        {
            var $textarea = $(this);
            var wysiwygeditor = $textarea.data('wysiwyg');
            if( ! wysiwygeditor )
                return false;
            if( option == 'html' )
            {
                if( typeof(param) != 'undefined' )
                    wysiwygeditor.setHTML( param );
                else
                    return wysiwygeditor.getHTML();
            }
            else if( option == 'removeFormat' ) {
                wysiwygeditor.removeFormat().closePopup().collapseSelection();
            }
            else if( option == 'bold' ) {
                wysiwygeditor.bold(); // .closePopup().collapseSelection()
            }
            else if( option == 'italic' ) {
                wysiwygeditor.italic(); // .closePopup().collapseSelection()
            }
            else if( option == 'underline' ) {
                wysiwygeditor.underline(); // .closePopup().collapseSelection()
            }
            else if( option == 'strikethrough' ) {
                wysiwygeditor.strikethrough(); // .closePopup().collapseSelection()
            }
            else if( option == 'forecolor' ) {
                wysiwygeditor.forecolor( param ).closePopup().collapseSelection();
            }
            else if( option == 'highlight' ) {
                wysiwygeditor.highlight( param ).closePopup().collapseSelection();
            }
            else if( option == 'insertLink' ) {
                wysiwygeditor.insertLink( param ).closePopup().collapseSelection();
            }
            else if( option == 'insertImage' ) {
                wysiwygeditor.insertImage( param ).closePopup().collapseSelection();
            }
            else if( option == 'insertHTML' ) {
                wysiwygeditor.insertHTML( param ).closePopup().collapseSelection();
            }
            else if( option == 'insertOrderedList' ) {
                wysiwygeditor.insertOrderedList().closePopup().collapseSelection();
            }
            else if( option == 'insertUnorderedList' ) {
                wysiwygeditor.insertUnorderedList().closePopup().collapseSelection();
            }
            else
                return false;
            return this;
        }
        return false;
    };
})(window, document, jQuery);
