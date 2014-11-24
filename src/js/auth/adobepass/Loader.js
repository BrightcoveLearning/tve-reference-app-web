/*global ae*/
/** @namespace */
var bcrefapp = window.bcrefapp || {};
/** @namespace */
bcrefapp.auth = bcrefapp.auth || {};
/** @namespace */
bcrefapp.auth.adobepass = bcrefapp.auth.adobepass || {};

/**
 * Dynamically Loads the AdobePass lib (AccessEnabler.swf or AccessEnabler.js)
 *
 * @class Loader
 * @memberOf bcrefapp.auth.adobepass
 * @param {String} [profile=_that.DEFAULT_PROFILE] AdobePass profile: "PRODUCTION" or "STAGING"
 * @param {Boolean} [debugEnabled=false] True: Load AccessEnabler False: Load AccessEnablerDebug
 *
 * @author Maximilian Nyman
 */
bcrefapp.auth.adobepass.Loader = function(profile, debugEnabled) {
    "use strict";

    /**
     * @typedef {Object} AccessEnabler
     * @property {Function} setProviderDialogURL
     * @property {Function} setRequestor
     * @property {Function} checkAuthentication
     * @property {Function} getAuthentication
     * @property {Function} getAuthorization
     * @property {Function} getSelectedProvider
     * @property {Function} setSelectedProvider
     * @property {Function} logout
     * @property {Function} bind
     * @property {int} width
     * @property {int} height
     */

    /**
     * @typedef {Object} CallbackDelegate
     * @property {Function} loaded
     * @property {Function} ready
     * @property {Object|Function} error
     */

    /**
     * @private
     * @type {Object}
     */
    var _that = {
        ACCESSENABLER_ID: "accessEnabler",
        TYPES: ["SWF", "JS"], /* "SWF" and/or "JS" in the order they should be loaded */
        //TYPES: ["JS", "SWF"], /* "SWF" and/or "JS" in the order they should be loaded */
        DEFAULT_PROFILE: "STAGING", /* "PRODUCTION" or "STAGING" */
        LIB_ENDPOINTS: {
            SWF:{
                PRODUCTION: "https://entitlement.auth.adobe.com/entitlement/AccessEnabler.swf",
                STAGING: "https://entitlement.auth-staging.adobe.com/entitlement/AccessEnabler.swf"
            },
            JS:{
                PRODUCTION: "https://entitlement.auth.adobe.com/entitlement/AccessEnabler.js",
                STAGING: "http://entitlement.auth-staging.adobe.com/entitlement/AccessEnabler.js"
            }
        },
        /** @type {AccessEnabler} */
        accessEnabler: null,
        /** @type {CallbackDelegate} */
        callbackDelegate: null,
        adobePassCallbacks: window,
        loadIndex: 0,
        swfFailed: false,
        jsFailed: false
    };
    _that.profile = profile ? profile : _that.DEFAULT_PROFILE;

    /**
     * Internal Callback Delegate, it will call the appropriate methods on the _that.callbackDelegate
     * @private
     * @property
     */
    var _internalDelegate = {
        /**
         * Callback for when AccessEnabler is ready to use
         * Calls the ready callback method on the _that.callbackDelegate
         * @private
         * @internal
         * @callback
         * @param {AccessEnabler} accessEnabler
         */
        ready: function(accessEnabler) {
            if( accessEnabler ) {
                if( _that.callbackDelegate && _that.callbackDelegate.ready ) { _that.callbackDelegate.ready( accessEnabler ); }
            }
            else {
                _internalDelegate.error( bcrefapp.auth.model.AuthError.Factory.loadErrorAuthLib("Unable to get AccessEnabler instance") );
            }
        },
        /**
         * Callback for when AccessEnabler is loaded
         * Calls the loaded callback method on the _that.callbackDelegate
         * @private
         * @internal
         * @callback
         */
        loaded: function() {
            if( _that.callbackDelegate && _that.callbackDelegate.loaded ) { _that.callbackDelegate.loaded(); }
        },
        /**
         * Callback for when loading the AccessEnabler had some errors
         * Calls the error callback method on the _that.callbackDelegate
         * @private
         * @internal
         * @callback
         * @param {bcrefapp.auth.model.AuthError} authError
         */
        error: function(authError) {
            /** @param {CallbackDelegate} callback */
            function processError(callback) {
                if( callback && callback.error ) {
                    // Check if the error callback has a processError method, and if so use it
                    if( callback.error.hasOwnProperty("processError") ) {
                        callback.error.processError( authError );
                    }
                    else {
                        // If the error callback doesn't have a processError method assume it is a Function
                        callback.error( authError );
                    }
                }
            }
            processError(_that.callbackDelegate);
        }
    };

    /**
     * Contains the loading logic for both AccessEnabler.swf and AccessEnabler.js
     * @private
     * @property
     */
    var _internalLoader = {
        /**
         * SWF
         * Attempts to load the AccessEnabler.swf
         * @internal
         * @private
         * @param {Function} [successFn] The callback method for success
         * @param {Function} [failFn] The callback method for failure
         */
        SWF: function(successFn, failFn) {

            /**
             * Ensures that the SWFLoader is loaded properly before attempting to load the AccessEnabler.swf
             */
            bcrefapp.helper.LoadHelper.loadSWFObject( function(success) {
                if( success ) {
                    var url = _that.LIB_ENDPOINTS.SWF[_that.profile];
                    url = debugEnabled ? url.replace( "/AccessEnabler.", "/AccessEnablerDebug." ) : url;
                    bcrefapp.helper.LoadHelper.loadSWF( url, function(success) {
                        showAccessEnabler();
                        if( success ) {
                            if( successFn ) { successFn(); }
                        }
                        else {
                            _that.swfFailed = true;
                            if( failFn ) { failFn(bcrefapp.auth.model.AuthError.Factory.loadErrorSWF(url)); }
                        }
                    }, getAccessEnablerId() );
                }
                else {
                    if( failFn ) { failFn(bcrefapp.auth.model.AuthError.Factory.loadErrorSWFObject()); }
                }
            });
        },
        /**
         * Attempts to load the AccessEnabler.js
         * @internal
         * @private
         * @param {Function} [successFn] The callback method for success
         * @param {Function} [failFn] The callback method for failure
         */
        JS: function(successFn, failFn) {
            if( _that.LIB_ENDPOINTS.JS.hasOwnProperty(_that.profile) ) {
                var url = _that.LIB_ENDPOINTS.JS[_that.profile];
                url = debugEnabled ? url.replace( "/AccessEnabler.", "/AccessEnablerDebug." ) : url;
                bcrefapp.helper.LoadHelper.loadJS( url, function( success ) {
                    if( success ) {
                        if( successFn ) { successFn(); }
                    }
                    else {
                        _that.jsFailed = true;
                        if( failFn ) { failFn( bcrefapp.auth.model.AuthError.Factory.loadErrorJS( url ) ); }
                    }
                } );
            }
            else {
                _that.jsFailed = true;
                if( failFn ) { failFn( bcrefapp.auth.model.AuthError.Factory.profileNotFound(_that.profile) ); }
            }
        }
    };

    /**
     * Workaround for the "Plug-in blocked for this website" issue which can prevent the SWF from being functional
     * This makes sure that the SWF is displayed properly by inflating the size, which would ensure any block messages will be visible for the user
     * If in fact the SWF is displayed properly, then the swfLoaded will be triggered where the SWF would be restored to its original size
     *
     * @private
     * @see hideAccessEnabler
     */
    function showAccessEnabler() {
        /** @type {AccessEnabler} */
        var accessEnabler = getAccessEnabler();
        if( accessEnabler ) {
            try { accessEnabler.setProviderDialogURL( "none" ); } catch( error ) { }
            accessEnabler.width = 500;
            accessEnabler.height = 500;
        }
    }
    /**
     * Workaround for the "Plug-in blocked for this website" issue which can prevent the SWF from being functional
     * This makes sure that the SWF gets hidden again after swfLoaded has been triggered
     *
     * @private
     * @see showAccessEnabler
     */
    function hideAccessEnabler() {
        var accessEnabler = getAccessEnabler();
        if( accessEnabler ) {
            accessEnabler.width = 1;
            accessEnabler.height = 1;
        }
    }


    /**
     * AccessEnabler Callbacks
     */

    /**
     * Initial callback from AccessEnabler.swf
     * @global
     * @callback
     */
    _that.adobePassCallbacks.swfLoaded = function() { hideAccessEnabler(); _that.accessEnabler.setProviderDialogURL("none"); _internalDelegate.ready( getAccessEnabler() ); };
    /**
     * Initial callback from AccessEnabler.js
     * @global
     * @callback
     */
    _that.adobePassCallbacks.entitlementLoaded = function() { _internalDelegate.ready( getAccessEnabler() ); };


    /**
     * Attempts to load the AccessEnabler.swf
     * Recursively calls itself if it fails to load the AccessEnabler.swf in an attempt to load the AccessEnabler.js
     *
     * @private
     * @param {int} [indx=0] The library type index
     * @param {bcrefapp.auth.model.AuthError[]} [loadErrors=null]
     */
    function loadNext(indx,loadErrors) {
        var index = indx ? indx : 0;
        if( index < _that.TYPES.length ) {
            var loadErrorArr = loadErrors ? loadErrors : [];
            var libType = _that.TYPES[index];
            if( _internalLoader.hasOwnProperty(libType) ) {
                _internalLoader[libType]( _internalDelegate.loaded, function( loadError ) {
                    loadErrorArr.push(loadError);
                    loadNext( index + 1, loadErrorArr );
                } );
            }
            else {
                loadErrorArr.push(bcrefapp.auth.model.AuthError.Factory.libTypeNotFound(libType));
                loadNext( index + 1, loadErrorArr );
            }
        }
        else {
            if( loadErrors ) {
                for( var i = 0, len = loadErrors.length; i < len; i++ ) {
                    _internalDelegate.error( loadErrors[i] );
                }
            }
            _internalDelegate.error( bcrefapp.auth.model.AuthError.Factory.loadError() );
        }
    }

    /**
     * Loads the AccessEnabler, with fallback from AccessEnabler.swf to AccessEnabler.js when needed
     * @public
     * @param {{ready:Function, loaded:Function, error:Object}} [callbackDelegate] Callback delegate that can declare zero or more of the callback methods 'ready', 'loaded', 'error'
     */
    function load(callbackDelegate) {
        _that.callbackDelegate = callbackDelegate;
        loadNext();
    }

    /**
     * Returns the AccessEnabler object
     * @public
     * @returns {AccessEnabler}
     */
    function getAccessEnabler() {
        if( !_that.accessEnabler ) {
            var aeSWF = document.getElementById(getAccessEnablerId());
            var aeJS = window.ae;
            // Do NOT change the order of this inline if-statement,
            // because window.ae could have been assigned elsewhere and is only safe when SWF failed
            _that.accessEnabler = aeSWF ? aeSWF : aeJS;
        }
        return _that.accessEnabler;
    }

    /**
     * Returns the AccessEnabler Id
     * @public
     * @returns {String}
     */
    function getAccessEnablerId() { return _that.ACCESSENABLER_ID; }


    return {
        load:load,
        getAccessEnabler:getAccessEnabler,
        getAccessEnablerId: getAccessEnablerId
    };

};

bcrefapp.auth.adobepass.Loader.PRODUCTION = "PRODUCTION";
bcrefapp.auth.adobepass.Loader.STAGING = "STAGING";