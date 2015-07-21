var CoursePress = CoursePress || {};

(function ( $ ) {


    CoursePress.event_queue = CoursePress.event_queue || []; //array

    CoursePress.editor = CoursePress.editor || {};

    CoursePress.editor.init_mode = getUserSetting( 'editor' );

    CoursePress.editor.create = function ( target, id, content, append ) {

        if ( undefined === tinyMCEPreInit ) {
            return false;
        }

        if ( undefined === append ) {
            append = true;
        } else {
            append = false;
        }

        id = id.replace( /\#/g, '' );

        var editor = _coursepress._dummy_editor;
        editor = editor.replace( /EDITORID/g, id );
        editor = editor.replace( /CONTENT/g, content );

        if ( append ) {
            $( target ).append( editor );
        } else {
            $( target ).replaceWith( editor );
        }

        var options = JSON.parse( JSON.stringify( tinyMCEPreInit.mceInit[ 'EDITORID' ] ) );
        if ( undefined !== options ) {
            options.body_class = options.body_class.replace( /EDITORID/g, id );
            options.selector = options.selector.replace( /EDITORID/g, id );
            options.init_instance_callback = 'CoursePress.editor.on_init'; // code to execute after editor is created
            tinyMCE.init( options );
            tinyMCEPreInit.mceInit[ id ] = options;
        }

        var options = JSON.parse( JSON.stringify( tinyMCEPreInit.qtInit[ 'EDITORID' ] ) );
        if ( undefined !== options ) {
            options.id = id;
            quicktags( options );
            tinyMCEPreInit.qtInit[ id ] = options;
        }
        QTags._buttonsInit();

        return true;
    }

    CoursePress.editor.content = function ( id, content ) {

        var mode = 'get';
        if ( undefined !== content ) {
            mode = 'set'
        }

        if ( undefined === tinyMCE ) {
            if ( 'set' === mode ) {
                $( id ).val( content );
            }
            return $( id ).val();
        } else {
            if ( 'set' === mode ) {
                tinyMCE.get( id ).setContent( content );
            }
            return tinyMCE.get( id ).getContent();
        }

    }

    CoursePress.editor.on_init = function ( instance ) {

        // Fix up QT focus by "clicking" the button to fire switchEditors magic
        // Caveat, it all depends what the initial editor mode and will render all dynamic editors using current mode
        // initially.
        var mode = CoursePress.editor.init_mode;
        var qt_button_id = "#" + instance.id + '-html';

        if ( 'html' === mode ) {
            $( qt_button_id ).click();
        }
    }

    // Add utility functions
    CoursePress.utility = CoursePress.utility || {};
    CoursePress.utility.merge_distinct = function ( array1, array2 ) {
        var merged = array1;

        $.each( array2, function ( key, value ) {
            if ( $.isArray( value ) && $.isArray( merged [ key ] ) ) {
                merged[ key ] = CoursePress.utility.merge_distinct( merged[ key ], value );
            } else {
                merged[ key ] = value;
            }
        } );
        return merged;
    }

    CoursePress.utility.update_object_by_path = function ( object, path, value ) {
        var stack = path.split( '/' );

        if( path === 'meta_course_category' ) {
            //console.log('MOO MOO MOO');
            //console.log( value );
        }

        while ( stack.length > 1 ) {
            var key = stack.shift();
            //console.log( key );
            if( object[ key ] ) {
                object = object[ key ];
            } else {
                object[key] = {};
                object = object[ key ];
            }
        }
        object[ stack.shift() ] = value;
    }

    CoursePress.utility.in_array = function ( value, array ) {
        return array.indexOf( value ) > -1;
    }

    CoursePress.utility.is_valid_url = function ( str ) {
        if ( str.indexOf( "http://" ) > -1 || str.indexOf( "https://" ) > -1 ) {
            return true;
        } else {
            return false;
        }
    }

    CoursePress.utility.valid_media_extension = function ( filename, type ) {
        type = $( type ).hasClass( 'image_url' ) ? 'image_url' : '';
        type = $( type ).hasClass( 'audio_url' ) ? 'audio_url' : type;
        type = $( type ).hasClass( 'video_url' ) ? 'video_url' : type;
        console.log( type );
        var extension = filename.split( '.' ).pop();
        var audio_extensions = _coursepress.allowed_audio_extensions;
        var video_extensions = _coursepress.allowed_video_extensions;
        var image_extensions = _coursepress.allowed_image_extensions;

        if ( type == 'featured_url' ) {
            type = 'image_url';
        }

        if ( type == 'course_video_url' ) {
            type = 'video_url';
        }

        if ( type == 'audio_url' ) {
            if ( CoursePress.utility.in_array( extension, audio_extensions ) ) {
                return true;
            } else {
                if ( CoursePress.utility.is_valid_url( filename ) && extension.length > 5 ) {
                    return true;
                } else {
                    if ( filename.length == 0 ) {
                        return true;
                    }
                    return false;
                }
            }
        }

        if ( type == 'video_url' ) {
            if ( CoursePress.utility.in_array( extension, video_extensions ) ) {
                return true;
            } else {
                if ( CoursePress.utility.is_valid_url( filename ) && extension.length > 5 ) {
                    return true;
                } else {
                    if ( filename.length == 0 ) {
                        return true;
                    }
                    return false;
                }
            }
        }

        if ( type == 'image_url' ) {
            if ( CoursePress.utility.in_array( extension, image_extensions ) ) {
                return true;
            } else {
                if ( CoursePress.utility.is_valid_url( filename ) && extension.length > 5 ) {
                    return true;
                } else {
                    if ( filename.length == 0 ) {
                        return true;
                    }
                    return false;
                }
            }
        }
    }

    // Webkit MD5 method
    CoursePress.utility.md5=function(s){function L(k,d){return(k<<d)|(k>>>(32-d))}function K(G,k){var I,d,F,H,x;F=(G&2147483648);H=(k&2147483648);I=(G&1073741824);d=(k&1073741824);x=(G&1073741823)+(k&1073741823);if(I&d){return(x^2147483648^F^H)}if(I|d){if(x&1073741824){return(x^3221225472^F^H)}else{return(x^1073741824^F^H)}}else{return(x^F^H)}}function r(d,F,k){return(d&F)|((~d)&k)}function q(d,F,k){return(d&k)|(F&(~k))}function p(d,F,k){return(d^F^k)}function n(d,F,k){return(F^(d|(~k)))}function u(G,F,aa,Z,k,H,I){G=K(G,K(K(r(F,aa,Z),k),I));return K(L(G,H),F)}function f(G,F,aa,Z,k,H,I){G=K(G,K(K(q(F,aa,Z),k),I));return K(L(G,H),F)}function D(G,F,aa,Z,k,H,I){G=K(G,K(K(p(F,aa,Z),k),I));return K(L(G,H),F)}function t(G,F,aa,Z,k,H,I){G=K(G,K(K(n(F,aa,Z),k),I));return K(L(G,H),F)}function e(G){var Z;var F=G.length;var x=F+8;var k=(x-(x%64))/64;var I=(k+1)*16;var aa=Array(I-1);var d=0;var H=0;while(H<F){Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=(aa[Z]|(G.charCodeAt(H)<<d));H++}Z=(H-(H%4))/4;d=(H%4)*8;aa[Z]=aa[Z]|(128<<d);aa[I-2]=F<<3;aa[I-1]=F>>>29;return aa}function B(x){var k="",F="",G,d;for(d=0;d<=3;d++){G=(x>>>(d*8))&255;F="0"+G.toString(16);k=k+F.substr(F.length-2,2)}return k}function J(k){k=k.replace(/rn/g,"n");var d="";for(var F=0;F<k.length;F++){var x=k.charCodeAt(F);if(x<128){d+=String.fromCharCode(x)}else{if((x>127)&&(x<2048)){d+=String.fromCharCode((x>>6)|192);d+=String.fromCharCode((x&63)|128)}else{d+=String.fromCharCode((x>>12)|224);d+=String.fromCharCode(((x>>6)&63)|128);d+=String.fromCharCode((x&63)|128)}}}return d}var C=Array();var P,h,E,v,g,Y,X,W,V;var S=7,Q=12,N=17,M=22;var A=5,z=9,y=14,w=20;var o=4,m=11,l=16,j=23;var U=6,T=10,R=15,O=21;s=J(s);C=e(s);Y=1732584193;X=4023233417;W=2562383102;V=271733878;for(P=0;P<C.length;P+=16){h=Y;E=X;v=W;g=V;Y=u(Y,X,W,V,C[P+0],S,3614090360);V=u(V,Y,X,W,C[P+1],Q,3905402710);W=u(W,V,Y,X,C[P+2],N,606105819);X=u(X,W,V,Y,C[P+3],M,3250441966);Y=u(Y,X,W,V,C[P+4],S,4118548399);V=u(V,Y,X,W,C[P+5],Q,1200080426);W=u(W,V,Y,X,C[P+6],N,2821735955);X=u(X,W,V,Y,C[P+7],M,4249261313);Y=u(Y,X,W,V,C[P+8],S,1770035416);V=u(V,Y,X,W,C[P+9],Q,2336552879);W=u(W,V,Y,X,C[P+10],N,4294925233);X=u(X,W,V,Y,C[P+11],M,2304563134);Y=u(Y,X,W,V,C[P+12],S,1804603682);V=u(V,Y,X,W,C[P+13],Q,4254626195);W=u(W,V,Y,X,C[P+14],N,2792965006);X=u(X,W,V,Y,C[P+15],M,1236535329);Y=f(Y,X,W,V,C[P+1],A,4129170786);V=f(V,Y,X,W,C[P+6],z,3225465664);W=f(W,V,Y,X,C[P+11],y,643717713);X=f(X,W,V,Y,C[P+0],w,3921069994);Y=f(Y,X,W,V,C[P+5],A,3593408605);V=f(V,Y,X,W,C[P+10],z,38016083);W=f(W,V,Y,X,C[P+15],y,3634488961);X=f(X,W,V,Y,C[P+4],w,3889429448);Y=f(Y,X,W,V,C[P+9],A,568446438);V=f(V,Y,X,W,C[P+14],z,3275163606);W=f(W,V,Y,X,C[P+3],y,4107603335);X=f(X,W,V,Y,C[P+8],w,1163531501);Y=f(Y,X,W,V,C[P+13],A,2850285829);V=f(V,Y,X,W,C[P+2],z,4243563512);W=f(W,V,Y,X,C[P+7],y,1735328473);X=f(X,W,V,Y,C[P+12],w,2368359562);Y=D(Y,X,W,V,C[P+5],o,4294588738);V=D(V,Y,X,W,C[P+8],m,2272392833);W=D(W,V,Y,X,C[P+11],l,1839030562);X=D(X,W,V,Y,C[P+14],j,4259657740);Y=D(Y,X,W,V,C[P+1],o,2763975236);V=D(V,Y,X,W,C[P+4],m,1272893353);W=D(W,V,Y,X,C[P+7],l,4139469664);X=D(X,W,V,Y,C[P+10],j,3200236656);Y=D(Y,X,W,V,C[P+13],o,681279174);V=D(V,Y,X,W,C[P+0],m,3936430074);W=D(W,V,Y,X,C[P+3],l,3572445317);X=D(X,W,V,Y,C[P+6],j,76029189);Y=D(Y,X,W,V,C[P+9],o,3654602809);V=D(V,Y,X,W,C[P+12],m,3873151461);W=D(W,V,Y,X,C[P+15],l,530742520);X=D(X,W,V,Y,C[P+2],j,3299628645);Y=t(Y,X,W,V,C[P+0],U,4096336452);V=t(V,Y,X,W,C[P+7],T,1126891415);W=t(W,V,Y,X,C[P+14],R,2878612391);X=t(X,W,V,Y,C[P+5],O,4237533241);Y=t(Y,X,W,V,C[P+12],U,1700485571);V=t(V,Y,X,W,C[P+3],T,2399980690);W=t(W,V,Y,X,C[P+10],R,4293915773);X=t(X,W,V,Y,C[P+1],O,2240044497);Y=t(Y,X,W,V,C[P+8],U,1873313359);V=t(V,Y,X,W,C[P+15],T,4264355552);W=t(W,V,Y,X,C[P+6],R,2734768916);X=t(X,W,V,Y,C[P+13],O,1309151649);Y=t(Y,X,W,V,C[P+4],U,4149444226);V=t(V,Y,X,W,C[P+11],T,3174756917);W=t(W,V,Y,X,C[P+2],R,718787259);X=t(X,W,V,Y,C[P+9],O,3951481745);Y=K(Y,h);X=K(X,E);W=K(W,v);V=K(V,g)}var i=B(Y)+B(X)+B(W)+B(V);return i.toLowerCase()};

    CoursePress.utility.get_gravatar = function (email, size, default_image, allowed_rating, force_default)
    {
        email = typeof email !== 'undefined' ? email : 'john.doe@example.com';
        size = (size >= 1 && size <= 2048) ? size : 80;
        default_image = typeof default_image !== 'undefined' ? default_image : 'mm';
        allowed_rating = typeof allowed_rating !== 'undefined' ? allowed_rating : 'x';
        force_default = force_default === true ? 'y' : 'n';

        return ("https://secure.gravatar.com/avatar/" + CoursePress.utility.md5(email.toLowerCase().trim()) + "?size=" + size + "&default=" + encodeURIComponent(default_image) + "&rating=" + allowed_rating + (force_default === 'y' ? "&forcedefault=" + force_default : ''));
    }

    CoursePress.utility.get_gravatar_image = function( email, size, alt, default_image, allowed_rating, force_default ) {
        var url = CoursePress.utility.get_gravatar( email, size, default_image, allowed_rating, force_default );

        alt = typeof alt !== 'undefined' ? alt : '';

        return '<img class="avatar avatar-' + size + ' photo" width="' + size + '" height="' + size + '" srcset="' + url + ' 2x" src="' + url + '" alt="' + alt + '">';
    }

    CoursePress.UI = CoursePress.UI || {};

    // Add UI extensions
    $.fn.extend( {
            browse_media_field: function ( options ) {
                return this.each( function ( options ) {

                    $( this ).on( 'click', function () {

                        var text_selector = $( this ).attr( 'name' ).replace( '-button', '' );
                        var target_url_field = $( this ).parents( 'div' ).find( '#' + text_selector );

                        wp.media.string.props = function ( props, attachment ) {
                            $( target_url_field ).val( props.url );

                            if ( CoursePress.utility.valid_media_extension( attachment.url, target_url_field ) ) {//extension is allowed
                                $( target_url_field ).removeClass( 'invalid_extension_field' );
                                $( target_url_field ).parent().find( '.invalid_extension_message' ).hide();
                            } else {//extension is not allowed
                                $( target_url_field ).addClass( 'invalid_extension_field' );
                                $( target_url_field ).parent().find( '.invalid_extension_message' ).show();
                            }
                        }

                        wp.media.editor.send.attachment = function ( props, attachment ) {
                            $( target_url_field ).val( attachment.url );
                            if ( CoursePress.utility.valid_media_extension( attachment.url, target_url_field ) ) {//extension is allowed
                                $( target_url_field ).removeClass( 'invalid_extension_field' );
                                $( target_url_field ).parent().find( '.invalid_extension_message' ).hide();
                            } else {//extension is not allowed
                                $( target_url_field ).addClass( 'invalid_extension_field' );
                                $( target_url_field ).parent().find( '.invalid_extension_message' ).show();
                            }
                        };
                        console.log( wp );
                        wp.media.editor.open( target_url_field );
                        return false;

                    } );

                } );
            }
        }
    );

    $( '.certificate_background_button' ).on( 'click', function () {
        var target_url_field = $( this ).prevAll( ".certificate_background_url:first" );
        wp.media.string.props = function ( props, attachment ) {
            $( target_url_field ).val( props.url );

            if ( CoursePress.utility.valid_media_extension( attachment.url, target_url_field ) ) {//extension is allowed
                $( target_url_field ).removeClass( 'invalid_extension_field' );
                $( target_url_field ).parent().find( '.invalid_extension_message' ).hide();
            } else {//extension is not allowed
                $( target_url_field ).addClass( 'invalid_extension_field' );
                $( target_url_field ).parent().find( '.invalid_extension_message' ).show();
            }
        }

        wp.media.editor.send.attachment = function ( props, attachment ) {
            $( target_url_field ).val( attachment.url );
            if ( CoursePress.utility.valid_media_extension( attachment.url, target_url_field ) ) {//extension is allowed
                $( target_url_field ).removeClass( 'invalid_extension_field' );
                $( target_url_field ).parent().find( '.invalid_extension_message' ).hide();
            } else {//extension is not allowed
                $( target_url_field ).addClass( 'invalid_extension_field' );
                $( target_url_field ).parent().find( '.invalid_extension_message' ).show();
            }
        };

        wp.media.editor.open( this );
        return false;
    } );


})( jQuery );