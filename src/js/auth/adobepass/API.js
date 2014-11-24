/*global console,ActiveXObject,DOMParser*/
/** @namespace */
var bcrefapp = window.bcrefapp || {};
/** @namespace */
bcrefapp.auth = bcrefapp.auth || {};
/** @namespace */
bcrefapp.auth.adobepass = bcrefapp.auth.adobepass || {};

/**
 * Abstraction Layer for Adobe Pass and AccessEnabler
 *
 * @class API
 * @memberOf bcrefapp.auth.adobepass
 *
 * @author Maximilian Nyman
 */
bcrefapp.auth.adobepass.API = function() {
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
     * @typedef {Object} AuthNCallbackDelegate
     * @property {Function} authenticationStatus
     * @property {Function} authenticated
     * @property {Function} notAuthenticated
     * @property {Function} displayProviders
     * @property {Function} renderIframe
     * @property {Function} removeIframe
     * @property {Object|Function} error
     */

    /**
     * @typedef {Object} AuthZCallbackDelegate
     * @property {Function} authorized
     * @property {Function} notAuthorized
     * @property {Object|Function} error
     */

    /**
     * @typedef {Object} CatchAllCallbackDelegate
     * @property {Function} apiReady
     * @property {Function} selectedProvider
     * @property {Function} authenticationStatus
     * @property {Function} authenticated
     * @property {Function} notAuthenticated
     * @property {Function} displayProviders
     * @property {Function} renderIframe
     * @property {Function} removeIframe
     * @property {Function} authorized
     * @property {Function} notAuthorized
     * @property {Object|Function} error
     */

    /**
     * @private
     * @type {Object}
     */
    var _that = {
        REQUESTOR_ID: "BRIGHTCOVE",
        REQUESTOR_CONFIG: {
            callSetConfig: true,
            backgroundLogin: true,
            backgroundLogout: true
        },
        IFRAME_ID: "mvpdframe",
        BACKGROUND_WINDOW_ID: "mvpdwindow",
        /** @type {AccessEnabler} */
        accessEnabler: null,
        adobePassCallbacks: window,
        /** @type {CatchAllCallbackDelegate} */
        callbackDelegate: null,
        /** @type {AuthNCallbackDelegate} */
        authNCallbackDelegate: null,
        /** @type {AuthZCallbackDelegate} */
        authZCallbackDelegate: null,
        apiReady: false,
        /** @type {bcrefapp.auth.model.Provider} */
        selectedProvider: null,
        /** @type {bcrefapp.auth.model.Provider[]} */
        providers: null,
        isAuthenticated: false
    };

    /**
     * Internal Callback Delegate, it will call the appropriate methods on the _that.callbackDelegate
     * @private
     * @property
     */
    var _internalDelegate = {
        /**
         * Callback for AccessEnabler.setConfig
         * Part of the initiation of the API
         * @private
         * @internal
         * @callback
         * @param {XML} config
         */
        setRequestorComplete: function(config) {
            if( !config ) {
                _internalDelegate.error( bcrefapp.auth.model.AuthError.Factory.configRetrieve() );
            }
            else {
                _that.accessEnabler.getSelectedProvider();
            }
        },
        /**
         * Callback for AccessEnabler.selectedProvider
         * If the API is ready, calls the ready selectedProvider method on the _that.callbackDelegate
         * Otherwise the initiating will continue by invoking accessEnabler.checkAuthentication
         * @private
         * @internal
         * @callback
         * @param {bcrefapp.auth.model.Provider} provider
         */
        selectedProvider: function(provider) {
            _that.selectedProvider = provider;
            if( _that.apiReady ) {
                if( _that.callbackDelegate && _that.callbackDelegate.selectedProvider ) { _that.callbackDelegate.selectedProvider( provider ); }
            }
            else {
                _that.accessEnabler.checkAuthentication();
            }
        },
        /**
         * Callback for when the API is initiated and ready to use
         * Calls the apiReady method on the _that.callbackDelegate
         * @private
         * @internal
         * @callback
         * @param {bcrefapp.auth.model.Provider[]} providers
         */
        apiReady: function(providers) {
            _that.apiReady = true;
            if( _that.callbackDelegate && _that.callbackDelegate.apiReady ) { _that.callbackDelegate.apiReady(providers); }
        },
        /**
         * Callback for AccessEnabler.authenticationStatus
         * Calls the authenticationStatus method on the _that.callbackDelegate and _that.authNCallbackDelegate
         * @private
         * @internal
         * @callback
         * @param {Boolean} isAuthenticated
         */
        authenticationStatus: function(isAuthenticated) {
            if( _that.callbackDelegate && _that.callbackDelegate.authenticationStatus ) { _that.callbackDelegate.authenticationStatus(isAuthenticated); }
            if( _that.authNCallbackDelegate && _that.authNCallbackDelegate.authenticationStatus ) { _that.authNCallbackDelegate.authenticationStatus(isAuthenticated); }
        },
        /**
         * Callback for when the user is authenticated
         * Calls the authenticated method on the _that.callbackDelegate and _that.authNCallbackDelegate
         * @private
         * @internal
         * @callback
         * @param {bcrefapp.auth.model.Provider} provider
         */
        authenticated: function(provider) {
            if( _that.callbackDelegate && _that.callbackDelegate.authenticated ) { _that.callbackDelegate.authenticated(provider); }
            if( _that.authNCallbackDelegate && _that.authNCallbackDelegate.authenticated ) { _that.authNCallbackDelegate.authenticated(provider); }
        },
        /**
         * Callback for when the user is not authenticated
         * Calls the notAuthenticated method on the _that.callbackDelegate and _that.authNCallbackDelegate
         * @private
         * @internal
         * @callback
         * @param {String} errorCode
         */
        notAuthenticated: function(errorCode) {
            if( _that.callbackDelegate && _that.callbackDelegate.notAuthenticated ) { _that.callbackDelegate.notAuthenticated(errorCode); }
            if( _that.authNCallbackDelegate && _that.authNCallbackDelegate.notAuthenticated ) { _that.authNCallbackDelegate.notAuthenticated(errorCode); }
        },
        /**
         * Callback for AccessEnabler.displayProviders
         * Serializes the objects into an array of bcrefapp.auth.model.Provider which is passed on to the callbacks
         * Calls the displayProviders method on the _that.callbackDelegate and _that.authNCallbackDelegate
         * @private
         * @internal
         * @callback
         * @param {Object[]} providers
         */
        displayProviders: function(providers) {
            var serializeProviders = [];
            for( var i = 0, len = providers.length; i < len; i++ ) {
                serializeProviders.push( createProvider(providers[i]) );
            }

            if( _that.callbackDelegate && _that.callbackDelegate.displayProviders ) { _that.callbackDelegate.displayProviders(serializeProviders); }
            if( _that.authNCallbackDelegate && _that.authNCallbackDelegate.displayProviders ) { _that.authNCallbackDelegate.displayProviders(serializeProviders); }
        },
        /**
         * Callback for AccessEnabler.createIFrame
         * @private
         * @internal
         * @callback
         * @param {int} width
         * @param {int} height
         */
        renderIframe: function(width, height) {
            if( _that.callbackDelegate && _that.callbackDelegate.renderIframe ) { _that.callbackDelegate.renderIframe(_that.selectedProvider, _that.IFRAME_ID, width, height); }
            if( _that.authNCallbackDelegate && _that.authNCallbackDelegate.renderIframe ) { _that.authNCallbackDelegate.renderIframe(_that.selectedProvider, _that.IFRAME_ID, width, height); }
        },
        /**
         * Callback for AccessEnabler.destroyIFrame
         * @private
         * @internal
         * @callback
         */
        removeIframe: function() {
            if( _that.callbackDelegate && _that.callbackDelegate.removeIframe ) { _that.callbackDelegate.removeIframe(_that.IFRAME_ID); }
            if( _that.authNCallbackDelegate && _that.authNCallbackDelegate.removeIframe ) { _that.authNCallbackDelegate.removeIframe(_that.IFRAME_ID); }
        },
        /**
         * Callback for AccessEnabler.setToken
         * Calls the authorized method on the _that.callbackDelegate and _that.authZCallbackDelegate
         * @private
         * @internal
         * @callback
         * @param {String} requestedResourceID
         * @param {String} token
         */
        authorized: function(requestedResourceID, token) {
            if( _that.callbackDelegate && _that.callbackDelegate.authorized ) { _that.callbackDelegate.authorized(_that.REQUESTOR_ID, requestedResourceID, token); }
            if( _that.authZCallbackDelegate && _that.authZCallbackDelegate.authorized ) { _that.authZCallbackDelegate.authorized(_that.REQUESTOR_ID, requestedResourceID, token); }
        },
        /**
         * Callback for AccessEnabler.tokenRequestFailed
         * Calls the notAuthorized method on the _that.callbackDelegate and _that.authZCallbackDelegate
         * @private
         * @internal
         * @callback
         * @param {String} requestedResourceID
         * @param {String} requestErrorCode
         * @param {String} requestErrorDetails
         */
        notAuthorized: function(requestedResourceID, requestErrorCode, requestErrorDetails) {
            if( _that.callbackDelegate && _that.callbackDelegate.notAuthorized ) { _that.callbackDelegate.notAuthorized(requestedResourceID, requestErrorCode, requestErrorDetails); }
            if( _that.authZCallbackDelegate && _that.authZCallbackDelegate.notAuthorized ) { _that.authZCallbackDelegate.notAuthorized(requestedResourceID, requestErrorCode, requestErrorDetails); }
        },
        /**
         * Callback for AccessEnabler.sendTrackingData
         * @private
         * @internal
         * @callback
         * @param {String} trackingEventType
         * @param {String} trackingData
         */
        sendTrackingData: function(trackingEventType, trackingData) {
        },
        /**
         * Callback for when an error is found
         * Invokes the processError method or the error method itself on the _that.callbackDelegate, _that.authNCallbackDelegate and _that.authZCallbackDelegate
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
            processError(_that.authNCallbackDelegate);
            processError(_that.authZCallbackDelegate);
        }
    };

    /**
     * Serializes a provider object into a bcrefapp.auth.model.Provider
     *
     * @private
     * @param {{ID:String, displayName:String, logoURL:String}} provider
     * @returns {bcrefapp.auth.model.Provider}
     */
    function createProvider(provider) {
        return provider ? new bcrefapp.auth.model.Provider(provider.ID, provider.displayName, provider.logoURL) : null;
    }

    /**
     * Parsing the config XML and extracting and serializing bcrefapp.auth.model.Provider[]
     * Also checking if the current domain is whitelisted for the requestorId
     *
     * @private
     * @param {XML} configXML
     * @returns {Boolean}
     */
    function parseXML(configXML) {
        try {
            if (window.DOMParser) {
                var parser = new DOMParser();
                _that.xmlDoc = parser.parseFromString(configXML,"text/xml");
            }
            else { // Internet Explorer
                _that.xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
                _that.xmlDoc.async = false;
                _that.xmlDoc.loadXML(configXML);
            }
            if( _that.xmlDoc.documentElement.nodeName !== "config" ) {
                _internalDelegate.error( bcrefapp.auth.model.AuthError.Factory.configParse() );
                return false;
            }

            getRequestorProviders();
            var domainValid = validateDomain();
            if( domainValid !== true ) { _internalDelegate.error(domainValid); }
            return (domainValid === true);
        }
        catch(exception) {
            console.error( exception );
        }

        return false;
    }

    /**
     * Parses the XML providers from the config and serializes into bcrefapp.auth.model.Provider
     * to be stored into the lookup _that.providers
     *
     * @private
     */
    function getRequestorProviders() {
        if( !_that.providers && _that.xmlDoc ) {
            try {
                var providers = _that.xmlDoc.getElementsByTagName("requestor")[0].getElementsByTagName("mvpds")[0].getElementsByTagName("mvpd");
                if( !providers || providers.length === 0 ) { _internalDelegate.error( bcrefapp.auth.model.AuthError.Factory.configProviders() ); }

                _that.providers = {};
                for( var i = 0; i < providers.length; i++ ) {
                    var providerId = providers[i].getElementsByTagName("id")[0].childNodes[0].nodeValue;
                    var providerName = providers[i].getElementsByTagName("displayName")[0].childNodes[0].nodeValue;
                    var providerLogo = providers[i].getElementsByTagName("logoUrl")[0].childNodes[0].nodeValue;
                    _that.providers[providerId] = new bcrefapp.auth.model.Provider( providerId, providerName, providerLogo );
                }
            }
            catch(exception) {
                _internalDelegate.error( bcrefapp.auth.model.AuthError.Factory.configProviders() );
            }
        }
    }

    /**
     * Determine if the current domain is part of the whitelisted domains from the config XML
     * @private
     * @returns {Boolean|bcrefapp.auth.model.AuthError}
     */
    function validateDomain() {
        var currDomain = document.location.hostname.toLowerCase();
        var domains = getRequestorDomains();
        if( !domains ) { return bcrefapp.auth.model.AuthError.Factory.domainWhitelist(currDomain, domains); }
        var isValid = domains.some( function(domainName) {
            var dn = domainName.toLowerCase();
            var pat=new RegExp(dn + "$");
            var match = currDomain.match(pat);
            return (match && match.length > 0) ? match[0]===dn : false;
        });
        return isValid ? isValid : bcrefapp.auth.model.AuthError.Factory.domainWhitelist(currDomain, domains);
    }

    /**
     * Extracts the whitelisted domains from the config XML
     * @private
     * @returns {String[]}
     */
    function getRequestorDomains() {
        if( !_that.domains && _that.xmlDoc ) {
            try {
                var domainNames = _that.xmlDoc.getElementsByTagName("requestor")[0].getElementsByTagName("domains")[0].getElementsByTagName("domain");
                _that.domains = [];
                for( var i = 0, len = domainNames.length; i < len; i++ ) {
                    _that.domains.push( domainNames[i].childNodes[0].nodeValue );
                }
            }
            catch(exception) {}
        }
        return _that.domains;
    }


    /**
     * AccessEnabler Callbacks
     */

    /**
     * AccessEnabler callback after setRequestor
     * @global
     * @callback
     * @param {XML} configXML
     */
    _that.adobePassCallbacks.setConfig = function(configXML) {
        var isDomainValid = parseXML(configXML);
        if( isDomainValid ) {
            _internalDelegate.setRequestorComplete( configXML );
        }
    };
    /**
     * AccessEnabler callback after getSelectedProvider
     * @global
     * @callback
     * @param {{MVPD:String}} provider
     */
    _that.adobePassCallbacks.selectedProvider = function(provider) { _that.selectedProvider = provider ? _that.providers[provider.MVPD] : null; _internalDelegate.selectedProvider(_that.selectedProvider); };
    /**
     * AccessEnabler callback after checkAuthentication, getAuthentication (if authenticated) or getAuthorization (if authenticated)
     * @global
     * @callback
     * @param {int} isAuthenticated
     * @param {String} [errorCode]
     */
    _that.adobePassCallbacks.setAuthenticationStatus = function(isAuthenticated, errorCode) {
        _that.isAuthenticated = !!isAuthenticated;
        if( !_that.apiReady ) { _internalDelegate.apiReady(_that.providers); }
        _internalDelegate.authenticationStatus( _that.isAuthenticated );
        if( _that.isAuthenticated ) {
            _internalDelegate.authenticated(getSelectedProvider());
        }
        else {
            _internalDelegate.notAuthenticated(errorCode);
        }
    };
    /**
     * AccessEnabler callback after getAuthentication or getAuthorization (if NOT authenticated)
     * @global
     * @callback
     * @param {Object[]} providers
     */
    _that.adobePassCallbacks.displayProviderDialog = function(providers) { _internalDelegate.displayProviders(providers); };
    /**
     * AccessEnabler callback after a provider has been selected that should open in an Iframe
     * @global
     * @callback
     * @param {int} width
     * @param {int} height
     */
    _that.adobePassCallbacks.createIFrame = function(width, height) { _internalDelegate.renderIframe(width,height); };
    /**
     * AccessEnabler callback after authentication is complete and the authentication iframe should be removed
     * @global
     * @callback
     */
    _that.adobePassCallbacks.destroyIFrame = function() { _internalDelegate.removeIframe(); };
    /**
     * AccessEnabler callback after getAuthorization and successfully authorized
     * @global
     * @callback
     * @param {String} requestedResourceID
     * @param {String} token Short Media Token
     */
    _that.adobePassCallbacks.setToken = function(requestedResourceID, token) {
        if( !_that.isAuthenticated ) {
            _that.isAuthenticated = true;
            //_internalDelegate.authenticationStatus( _that.isAuthenticated );
            _internalDelegate.authenticated(getSelectedProvider());
        }
        _internalDelegate.authorized(requestedResourceID, token);
    };
    /**
     * AccessEnabler callback after getAuthorization and NOT successfully authorized
     * @global
     * @callback
     * @param {String} requestedResourceID
     * @param {String} requestErrorCode
     * @param {String} requestErrorDetails
     */
    _that.adobePassCallbacks.tokenRequestFailed = function(requestedResourceID, requestErrorCode, requestErrorDetails) { _internalDelegate.notAuthorized(requestedResourceID, requestErrorCode, requestErrorDetails); };
    _that.adobePassCallbacks.sendTrackingData = function(trackingEventType, trackingData) { _internalDelegate.sendTrackingData(trackingEventType, trackingData); };

    /**
     * AccessEnabler error handler
     * @global
     * @callback
     * @param {{errorId:String, level:String}} errorObj
     */
    _that.adobePassCallbacks.aeErrorHandler = function(errorObj) {
        if( errorObj ) {
            var level = errorObj.hasOwnProperty("level") ? errorObj.level.toLowerCase() : "error";
            switch(level) {
                case "error":
                    _internalDelegate.error( bcrefapp.auth.model.AuthError.Factory.createFromErrorCode(errorObj.errorId, bcrefapp.auth.adobepass.ErrorMap, {requestorId:_that.REQUESTOR_ID}) );
                    break;
                case "warning":
                    _internalDelegate.error( bcrefapp.auth.model.AuthError.Factory.createFromErrorCode(errorObj.errorId, bcrefapp.auth.adobepass.ErrorMap, {requestorId:_that.REQUESTOR_ID}) );
                    break;
                case "info":
                    _internalDelegate.error( bcrefapp.auth.model.AuthError.Factory.createFromErrorCode(errorObj.errorId, bcrefapp.auth.adobepass.ErrorMap, {requestorId:_that.REQUESTOR_ID}) );
                    break;
                default:
            }
        }
    };

    /**
     * Starts the initiation of the API - Triggers apiReady callback
     * @public
     * @param {AccessEnabler} accessEnabler
     * @param {CatchAllCallbackDelegate} callbackDelegate
     */
    function init(accessEnabler, callbackDelegate) {
        _that.accessEnabler = accessEnabler;
        try {
            if( _that.accessEnabler.bind ) {
                _that.accessEnabler.bind('errorEvent', 'aeErrorHandler');
            }
        } catch (e) {}
        _that.callbackDelegate = callbackDelegate;
        _that.accessEnabler.setRequestor(_that.REQUESTOR_ID, null, _that.REQUESTOR_CONFIG);
    }
    /**
     * Gets the last selected provider - Triggers selectedProvider callback
     * @public
     */
    function getSelectedProvider() {
        if(_that.apiReady) {
            return _that.selectedProvider ? _that.selectedProvider : (_that.accessEnabler ? _that.accessEnabler.getSelectedProvider() : null);
        }
    }
    /**
     * Checks if the user is currently authenticated - Triggers authenticated or notAuthenticated callbacks
     * @public
     * @param {AuthNCallbackDelegate} [authNCallbackDelegate]
     */
    function checkAuthentication(authNCallbackDelegate) {
        _that.authNCallbackDelegate = authNCallbackDelegate;
        if(_that.apiReady) {
            _that.accessEnabler.checkAuthentication();
        }
        else {
            _internalDelegate.error( bcrefapp.auth.model.AuthError.Factory.apiNotReady() );
        }
    }
    /**
     * Starts the authentication flow - Triggers authenticated or displayProvider callbacks
     * @public
     * @param {AuthNCallbackDelegate} [authNCallbackDelegate]
     */
    function startAuthentication(authNCallbackDelegate) {
        _that.authNCallbackDelegate = authNCallbackDelegate;
        if(_that.apiReady) {
            _that.accessEnabler.getAuthentication();
        }
        else {
            _internalDelegate.error( bcrefapp.auth.model.AuthError.Factory.apiNotReady() );
        }
    }
    /**
     * Logs out the user - Triggers notAuthenticated callbacks
     * @public
     * @param {AuthNCallbackDelegate} [authNCallbackDelegate]
     */
    function logout(authNCallbackDelegate) {
        _that.authNCallbackDelegate = authNCallbackDelegate;
        if(_that.apiReady) {
            _that.accessEnabler.logout();
        }
        else {
            _internalDelegate.error( bcrefapp.auth.model.AuthError.Factory.apiNotReady() );
        }
    }
    /**
     * Sets the selected provider from the selector UI - Triggers authenticated callback once the user has authenticated with the MVPD
     * @public
     * @param {bcrefapp.auth.model.Provider} provider
     */
    function setSelectedProvider(provider) {
        if(_that.apiReady) {
            _that.selectedProvider = provider;
            _that.accessEnabler.setSelectedProvider(provider ? provider.getId() : null);
        }
        else {
            _internalDelegate.error( bcrefapp.auth.model.AuthError.Factory.apiNotReady() );
        }
    }
    /**
     * Starts the authorization flow - Triggers authorized or notAuthorized callbacks
     * @public
     * @param {String} resourceId
     * @param {AuthZCallbackDelegate} [authZCallbackDelegate]
     */
    function authorize(resourceId, authZCallbackDelegate) {
        _that.authZCallbackDelegate = authZCallbackDelegate;
        if(_that.apiReady) {
            _that.accessEnabler.getAuthorization(resourceId);
        }
        else {
            _internalDelegate.error( bcrefapp.auth.model.AuthError.Factory.apiNotReady() );
        }
    }

    return {
        init:init,
        getSelectedProvider:getSelectedProvider,
        checkAuthentication:checkAuthentication,
        startAuthentication:startAuthentication,
        logout:logout,
        setSelectedProvider:setSelectedProvider,
        authorize:authorize
    };
};