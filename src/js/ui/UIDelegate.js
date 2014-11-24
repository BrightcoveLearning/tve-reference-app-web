/*global window,console,jQuery*/
/** @namespace */
var bcrefapp = window.bcrefapp || {};
/** @namespace */
bcrefapp.example = bcrefapp.example || {};

/**
 * Creates the UI Delegate instance to manage all the UI interactions
 *
 * @instance
 * @name uiDelegate
 * @memberOf bcrefapp.example
 *
 * @author max.nyman@anvilcreative.com (Maximilian Nyman)
 */
bcrefapp.example.uiDelegate = (function() {
    'use strict';

    /**
     * JQuery
     * @private
     * @function
     */
    var $ = null;

    /**
     * @private
     * @type {Object}
     */
    var _that = {
        CLASS_NAMES: {
            WRAPPER: '.auth .authWrapper',
            LOADING: '.auth .loading',
            AUTHN: '.authN',
            NO_AUTHN: '.noAuthN',
            LOGO: '.auth .providerLogo',
            VIDEO_ITEMS_LIST: '.playlist',
            VIDEO_ITEM: '.playlist a',
            PROVIDER_LOGIN_WRAPPER: 'providerLoginWrapper',
            PROVIDER_LOGIN_HEADER: 'providerLoginWrapperHeader',
            CLOSE_BUTTON: "btClose"
        },
        authAPI: null,
        playerDelegate: null
    };

    /**
     * Initiates the UIDelegate and loads AdobePass
     * Called when the DOM is ready
     *
     * @private
     * @callback
     *
     * @see bcrefapp.auth.adobepass.Loader
     * @see bcrefapp.auth.adobepass.API
     * @see bcrefapp.example.PlayerDelegate
     */
    function init() {
        /** Creates an AdobePass Loader instance */
        var loader = new bcrefapp.auth.adobepass.Loader(bcrefapp.auth.adobepass.Loader.STAGING, false);
        /** Creates an AdobePass API instance */
        _that.authAPI = new bcrefapp.auth.adobepass.API();
        /** Creates a PlayerDelegate instance */
        _that.playerDelegate = new bcrefapp.example.PlayerDelegate(_that.authAPI);

        /** Loads AdobePass */
        loader.load({
            /**
             * Called when the AccessEnabler has been loaded and is ready to use
             * @callback
             * @param {Object} accessEnabler The AccessEnabler instance
             */
            ready: function(accessEnabler) {
                initAPI(accessEnabler);
            },
            /**
             * Called when the AccessEnabler has been loaded
             * but is not yet ready to use
             * @callback
             */
            loaded: function() {
                console.log('AccessEnabler Loaded, but not ready to use');
            },
            /**
             * Called if Loading AccessEnabler has error(s)
             * @callback
             * @param {bcrefapp.auth.model.AuthError} loadError
             */
            error: new bcrefapp.example.ErrorHandler()
        });
    }

    /**
     * Initiates the AdobePass API and UI Controls
     * Called when the AccessEnabler is ready to use
     *
     * @private
     * @callback
     * @param {Object} accessEnabler
     *
     * @see bcrefapp.auth.adobepass.API
     * @see bcrefapp.example.PlayerDelegate
     */
    function initAPI(accessEnabler) {
        console.log('AccessEnabler Ready');
        // Hides the loading spinner
        $(_that.CLASS_NAMES.LOADING).hide();

        /** Initiates AdobePass API */
        _that.authAPI.init(accessEnabler, {
            /**
             * Called when the AdobePass API is ready to use
             * @callback
             * @param {bcrefapp.auth.model.Provider[]} providers
             */
            apiReady: function(providers) {
                $(_that.CLASS_NAMES.WRAPPER).show();
                $(_that.CLASS_NAMES.VIDEO_ITEM).click(videoSelected);
            },
            /**
             * Called when the user is Authenticated
             * @callback
             * @param {bcrefapp.auth.model.Provider} provider
             */
            authenticated: function(provider) {
                console.log('Authenticated');
                $(_that.CLASS_NAMES.LOGO).attr('src', provider.getLogo());
                $(_that.CLASS_NAMES.LOGO).show();
                $(_that.CLASS_NAMES.NO_AUTHN).hide();
                $(_that.CLASS_NAMES.AUTHN).show();
                _that.playerDelegate.enable();
                $(_that.CLASS_NAMES.VIDEO_ITEMS_LIST).removeClass('locked');
            },
            /**
             * Called when the user is Not Authenticated
             * @callback
             * @param {String} errorMsg
             */
            notAuthenticated: function(errorMsg) {
                console.log('Not Authenticated', errorMsg);
                $(_that.CLASS_NAMES.LOGO).removeAttr('src');
                $(_that.CLASS_NAMES.LOGO).hide();
                $(_that.CLASS_NAMES.AUTHN).hide();
                $(_that.CLASS_NAMES.NO_AUTHN).show();
                $('.content').css('background-image', '');
                _that.playerDelegate.disable();
                if( !$(_that.CLASS_NAMES.VIDEO_ITEMS_LIST).hasClass('locked') ) {
                    $( _that.CLASS_NAMES.VIDEO_ITEMS_LIST).addClass('locked');
                }
            },
            /**
             * Called when authentication is requested, but the user is not Authenticated
             * @callback
             * @param {bcrefapp.auth.model.Provider[]} providers
             */
            displayProviders: function(providers) {
                /** Creates a ProviderSelectorDelegate instance */
                var providerSelectorDelegate = new bcrefapp.example.ProviderSelectorDelegate();
                /** Creates and injects the UI for the Provider Selector */
                providerSelectorDelegate.injectProviderSelector(providers, {
                    /**
                     * Called when the user selects a provider
                     * @callback
                     * @param {bcrefapp.auth.model.Provider} provider
                     */
                    selectedProvider: function(provider) {
                        _that.authAPI.setSelectedProvider(provider);
                        if( provider ) {
                            setTimeout( function() { $( _that.CLASS_NAMES.NO_AUTHN ).show(); }, 3000 );
                        }
                    },
                    /**
                     * Called when the user clicks close
                     * @callback
                     */
                    close: function() {
                        _that.authAPI.setSelectedProvider(null);
                    }
                });
            },
            renderIframe: function(provider, iframeId, width, height) {
                var wrapper = document.createElement("div");
                wrapper.className = _that.CLASS_NAMES.PROVIDER_LOGIN_WRAPPER;
                wrapper.style.top = ($(window).height()-height)/2 + "px";
                wrapper.style.left = ($(window).width()-width)/2 + "px";

                var header = document.createElement("div");
                header.className = _that.CLASS_NAMES.PROVIDER_LOGIN_HEADER;
                wrapper.appendChild(header);
                var btClose = document.createElement("button");
                btClose.className = _that.CLASS_NAMES.CLOSE_BUTTON;
                btClose.innerHTML = "&times;";
                btClose.onclick = function() {
                    _that.authAPI.setSelectedProvider(null);
                    document.body.removeChild(wrapper);
                };
                header.appendChild(btClose);
                var iframe = document.createElement("iframe");
                iframe.id = iframeId;
                iframe.name = iframeId;
                iframe.width = width;
                iframe.height = height;
                iframe.onload = function() { $(wrapper).show(); };
                wrapper.appendChild(iframe);
                document.body.appendChild(wrapper);
            },
            removeIframe: function(iframeId) {
                $("#" + iframeId ).parent().remove();
            },
            /**
             * Called when user is Authorized
             * @callback
             * @param {String} requestorId The current requestorId
             * @param {String} requestedResourceID The requested resourceId
             * @param {String} token Short Media Token
             */
            authorized: function(requestorId, requestedResourceId, token) {
                console.log( 'Authorized' );
            },
            /**
             * Called when user is not Authorized
             * @callback
             * @param {String} requestedResourceID The requested resourceId
             * @param {String} requestErrorCode The AdobePass error code
             * @param {String} requestErrorDetails The MVPD error message (if any)
             */
            notAuthorized: function(requestedResourceId, requestErrorCode, requestErrorDetails) {
                console.log( 'Not Authorized', requestedResourceId, requestErrorCode, requestErrorDetails );
            },
            /**
             * Called if AccessEnabler has error(s)
             * @callback
             * @param {bcrefapp.auth.model.AuthError} authError
             */
            error: new bcrefapp.example.ErrorHandler()
        });


        // Sign In Button Click Event
        $(_that.CLASS_NAMES.NO_AUTHN).click(function() {
            // Hides the Sign In Button
            $(_that.CLASS_NAMES.NO_AUTHN).hide();
            // Hides the Sign Out Button
            $(_that.CLASS_NAMES.AUTHN).hide();
            // Starts the Authentication flow
            _that.authAPI.startAuthentication();
        });

        // Sign In/Sign Out Button Click Events
        $(_that.CLASS_NAMES.AUTHN).click(function() {
            // Hides the Sign In Button
            $(_that.CLASS_NAMES.NO_AUTHN).hide();
            // Hides the Sign Out Button
            $(_that.CLASS_NAMES.AUTHN).hide();
            // Remove and hide the Provider logo
            $(_that.CLASS_NAMES.LOGO ).removeAttr('src');
            $(_that.CLASS_NAMES.LOGO ).hide();
            // Remove the Video Poster Background
            $('.content').css( 'background-image', '');
            // Disable the Player
            _that.playerDelegate.disable();
            // Starts the Logout flow
            _that.authAPI.logout();
        });
    }

    /**
     * Handles the Video Selected event
     *
     * @private
     * @param {Object} evt
     *
     * @see bcrefapp.example.PlayerDelegate
     */
    function videoSelected(evt) {
        // Pause current video (if any)
        _that.playerDelegate.pause();
        // Capture the video metadata
        var target = $(evt.currentTarget);
        var videoItem = {
            videoId: target.data('videoid'),
            isProtected: target.data('isprotected'),
            title: target.data('title'),
            video: target.data('video' ),
            resourceId: target.data('resourceid'),
            thumbnail: target.data('thumbnail'),
            poster: target.data('poster')
        };
        // Set the video poster as the background
        $('.content').css( 'background-image', 'url("' + videoItem.poster + '")');
        // Starts the video playback flow
        _that.playerDelegate.play(videoItem);
    }


    // Ensures JQuery is loaded and loads it otherwise
    bcrefapp.helper.LoadHelper.loadJQuery( function(success) {
        if( success ) { $=jQuery; $( document ).ready( init ); }
        else { console.error( 'JQuery not loaded'); }
    });

    return {};

}());