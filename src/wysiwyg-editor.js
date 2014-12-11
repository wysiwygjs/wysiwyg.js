(function(window, document, $, undefined){
    'use strict';

    // Color chart
    /*
    var colors = [
        '000000', '444444', '666666', '999999', 'CCCCCC', 'EEEEEE', 'F3F3F3', 'FFFFFF', null,
        'FF0000', 'FF9900', 'FFFF00', '00FF00', '00FFFF', '0000FF', '9900FF', 'FF00FF', null,
        'F4CCCC', 'FCE5CD', 'FFF2CC', 'D9EAD3', 'D0E0E3', 'CFE2F3', 'D9D2E9', 'EAD1DC', null,
        'EA9999', 'F9CB9C', 'FFE599', 'B6D7A8', 'A2C4C9', '9FC5E8', 'B4A7D6', 'D5A6BD', null,
        'E06666', 'F6B26B', 'FFD966', '93C47D', '76A5AF', '6FA8DC', '8E7CC3', 'C27BA0', null,
        'CC0000', 'E69138', 'F1C232', '6AA84F', '45818E', '3D85C6', '674EA7', 'A64D79', null,
        '990000', 'B45F06', 'BF9000', '38771D', '134F5C', '0B5394', '351C75', '741B47', null,
        '660000', '783F04', '7F6000', '274E13', '0C343D', '073763', '201211', '4C1130'
    ];
    */
    var colors = [
        'F8E0E0', 'F8E6E0', 'F8ECE0', 'F7F2E0', 'F7F8E0', 'F1F8E0', 'ECF8E0', 'E6F8E0', 'E0F8E0', 'E0F8E6', 'E0F8EC', 'E0F8F1', 'E0F8F7', 'E0F2F7', 'E0ECF8', 'E0E6F8', 'E0E0F8', 'E6E0F8', 'ECE0F8', 'F2E0F7', 'F8E0F7', 'F8E0F1', 'F8E0EC', 'F8E0E6', 'FFFFFF', null,
        'F6CECE', 'F6D8CE', 'F6E3CE', 'F5ECCE', 'F5F6CE', 'ECF6CE', 'E3F6CE', 'D8F6CE', 'CEF6CE', 'CEF6D8', 'CEF6E3', 'CEF6EC', 'CEF6F5', 'CEECF5', 'CEE3F6', 'CED8F6', 'CECEF6', 'D8CEF6', 'E3CEF6', 'ECCEF5', 'F6CEF5', 'F6CEEC', 'F6CEE3', 'F6CED8', 'F2F2F2', null,
        'F5A9A9', 'F5BCA9', 'F5D0A9', 'F3E2A9', 'F2F5A9', 'E1F5A9', 'D0F5A9', 'BCF5A9', 'A9F5A9', 'A9F5BC', 'A9F5D0', 'A9F5E1', 'A9F5F2', 'A9E2F3', 'A9D0F5', 'A9BCF5', 'A9A9F5', 'BCA9F5', 'D0A9F5', 'E2A9F3', 'F5A9F2', 'F5A9E1', 'F5A9D0', 'F5A9BC', 'E6E6E6', null,
        'F78181', 'F79F81', 'F7BE81', 'F5DA81', 'F3F781', 'D8F781', 'BEF781', '9FF781', '81F781', '81F79F', '81F7BE', '81F7D8', '81F7F3', '81DAF5', '81BEF7', '819FF7', '8181F7', '9F81F7', 'BE81F7', 'DA81F5', 'F781F3', 'F781D8', 'F781BE', 'F7819F', 'D8D8D8', null,
        'FA5858', 'FA8258', 'FAAC58', 'F7D358', 'F4FA58', 'D0FA58', 'ACFA58', '82FA58', '58FA58', '58FA82', '58FAAC', '58FAD0', '58FAF4', '58D3F7', '58ACFA', '5882FA', '5858FA', '8258FA', 'AC58FA', 'D358F7', 'FA58F4', 'FA58D0', 'FA58AC', 'FA5882', 'BDBDBD', null,
        'FE2E2E', 'FE642E', 'FE9A2E', 'FACC2E', 'F7FE2E', 'C8FE2E', '9AFE2E', '64FE2E', '2EFE2E', '2EFE64', '2EFE9A', '2EFEC8', '2EFEF7', '2ECCFA', '2E9AFE', '2E64FE', '2E2EFE', '642EFE', '9A2EFE', 'CC2EFA', 'FE2EF7', 'FE2EC8', 'FE2E9A', 'FE2E64', 'A4A4A4', null,
        'FF0000', 'FF4000', 'FF8000', 'FFBF00', 'FFFF00', 'BFFF00', '80FF00', '40FF00', '00FF00', '00FF40', '00FF80', '00FFBF', '00FFFF', '00BFFF', '0080FF', '0040FF', '0000FF', '4000FF', '8000FF', 'BF00FF', 'FF00FF', 'FF00BF', 'FF0080', 'FF0040', '848484', null,
        'DF0101', 'DF3A01', 'DF7401', 'DBA901', 'D7DF01', 'A5DF00', '74DF00', '3ADF00', '01DF01', '01DF3A', '01DF74', '01DFA5', '01DFD7', '01A9DB', '0174DF', '013ADF', '0101DF', '3A01DF', '7401DF', 'A901DB', 'DF01D7', 'DF01A5', 'DF0174', 'DF013A', '6E6E6E', null,
        'B40404', 'B43104', 'B45F04', 'B18904', 'AEB404', '86B404', '5FB404', '31B404', '04B404', '04B431', '04B45F', '04B486', '04B4AE', '0489B1', '045FB4', '0431B4', '0404B4', '3104B4', '5F04B4', '8904B1', 'B404AE', 'B40486', 'B4045F', 'B40431', '585858', null,
        '8A0808', '8A2908', '8A4B08', '886A08', '868A08', '688A08', '4B8A08', '298A08', '088A08', '088A29', '088A4B', '088A68', '088A85', '086A87', '084B8A', '08298A', '08088A', '29088A', '4B088A', '6A0888', '8A0886', '8A0868', '8A084B', '8A0829', '424242', null,
        '610B0B', '61210B', '61380B', '5F4C0B', '5E610B', '4B610B', '38610B', '21610B', '0B610B', '0B6121', '0B6138', '0B614B', '0B615E', '0B4C5F', '0B3861', '0B2161', '0B0B61', '210B61', '380B61', '4C0B5F', '610B5E', '610B4B', '610B38', '610B21', '2E2E2E', null,
        '3B0B0B', '3B170B', '3B240B', '3A2F0B', '393B0B', '2E3B0B', '243B0B', '173B0B', '0B3B0B', '0B3B17', '0B3B24', '0B3B2E', '0B3B39', '0B2F3A', '0B243B', '0B173B', '0B0B3B', '170B3B', '240B3B', '2F0B3A', '3B0B39', '3B0B2E', '3B0B24', '3B0B17', '1C1C1C', null,
        '2A0A0A', '2A120A', '2A1B0A', '29220A', '292A0A', '222A0A', '1B2A0A', '122A0A', '0A2A0A', '0A2A12', '0A2A1B', '0A2A22', '0A2A29', '0A2229', '0A1B2A', '0A122A', '0A0A2A', '120A2A', '1B0A2A', '220A29', '2A0A29', '2A0A22', '2A0A1B', '2A0A12', '000000'
    ];

    // Resize image
    var resize_image = function( $image, image_width, image_height, max_width, max_height )
    {
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
    };

    // Create the Editor
    var create_editor = function( $textarea, classes, placeholder, toolbar_position, toolbar_buttons, toolbar_submit, toolbar_smilies, label_dropfileclick,
                                  content_styleWithCSS, content_insertBrOnReturn, placeholder_url, clip_image, clip_smiley, onImageUpload, onEnterSubmit )
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
                var $image = $(smiley).attr('unselectable','on');
                var image_width = $image.attr('width'),
                    image_height = $image.attr('height');
                if( clip_smiley && image_width && image_height )
                    resize_image( $image, parseInt(image_width), parseInt(image_height), clip_smiley[0], clip_smiley[1] );
                // Append smiley
                var imagehtml = ' '+$('<div/>').append($image.clone()).html()+' ';
                $image
                    .css({ cursor: 'pointer' })
                    .click(function(event){
                        // do not close popup
                        wysiwygeditor.insertHTML( imagehtml );
                    })
                    .appendTo( $content );
                if( image_width )
                    smiley_sum_width += parseInt(image_width);
            });
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
                                    if( event.which == 10 || event.which == 13 )
                                        wysiwygeditor_insertLink(wysiwygeditor,$inputurl.val()).closePopup().collapseSelection();
                                });
            var $okaybutton = $button.click(function(event){
                                    wysiwygeditor_insertLink(wysiwygeditor,$inputurl.val()).closePopup().collapseSelection();
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
                                var image_width = $image.width();
                                var image_height = $image.height();
                                resize_image( $image, image_width, image_height, clip_image[0], clip_image[1] );
                            });
                }
                $image.attr('src', url);
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

        // Content: Color palette
        var content_colorpalette = function( wysiwygeditor, forecolor )
        {
            var $content = $('<div/>').addClass('wysiwyg-toolbar-feature')
                                      .attr('unselectable','on');
            $.each( colors, function(index,color){
                if( ! color )
                {
                    $content.append('<br/>');
                    return;
                }
                $('<a/>').addClass('wysiwyg-color')
                        .attr('href','#')
                        .attr('title', '#'+color)
                        .attr('unselectable','on')
                        .css({backgroundColor: '#'+color})
                        .click(function(){
                            if( forecolor )
                                wysiwygeditor.forecolor( '#'+color ).closePopup().collapseSelection();
                            else
                                wysiwygeditor.highlight( '#'+color ).closePopup().collapseSelection();
                            return false;
                        })
                        .appendTo( $content );
            });
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
            var node = $(wysiwygeditor.getElement());
            while( node.length )
            {
                if( node.css('position') == 'fixed' )
                    return true;
                node = node.parent();
            }
            return false;
        };


        // Transform the textarea to contenteditable
        var hotkeys = {};
        var create_wysiwyg = function( $textarea, $container, placeholder )
        {
            var option = {
                element: $textarea.get(0),
                onkeypress: function( code, character, shiftKey, altKey, ctrlKey, metaKey )
                    {
                        if( onEnterSubmit && (code == 10 || code == 13) && !altKey && !ctrlKey && !metaKey )
                            return onEnterSubmit();
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
                            // Bug in Safari 3.1: $.offset() returns {left:0,top:0}
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
                        var handle = wysiwygeditor.openPopup();
                        if( ! handle )
                            return ;
                        $toolbar = $(handle);
                        if( $toolbar.hasClass('wysiwyg-popup') && ! $toolbar.hasClass('wysiwyg-arrowtop') )
                            $toolbar = $(wysiwygeditor.closePopup().openPopup()); // wrong popup -> create a new one
                        if( ! $toolbar.hasClass('wysiwyg-popup') )
                        {
                            // add classes + buttons
                            if( fixed_parent() )
                                $toolbar.css({position:'fixed'});
                            $toolbar.addClass( 'wysiwyg-popup wysiwyg-arrowtop' );
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
                    if( fixed_parent() )
                        $toolbar.css({position:'fixed'});
                    $toolbar.addClass( 'wysiwyg-popup' );
                    $toolbar.append( $content );
                }
                // Popup position
                var $button = $(target);
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
                var toolbar_smilies = option.smilies;
                var label_dropfileclick = option.dropfileclick;
                var content_styleWithCSS = option.styleWithCSS;
                var content_insertBrOnReturn = option.insertBrOnReturn;
                var placeholder_url = option.placeholderUrl || null;
                var clip_image = option.clipImage || null;
                var clip_smiley = option.clipSmiley || null;
                var onImageUpload = option.onImageUpload;
                var onEnterSubmit = option.onEnterSubmit;

                // Create the WYSIWYG Editor
                var data = create_editor( $that, classes, placeholder, toolbar_position, toolbar_buttons, toolbar_submit, toolbar_smilies, label_dropfileclick,
                                          content_styleWithCSS, content_insertBrOnReturn, placeholder_url, clip_image, clip_smiley, onImageUpload, onEnterSubmit );
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
                data.wysiwygeditor.format( param ).closePopup().collapseSelection()
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
