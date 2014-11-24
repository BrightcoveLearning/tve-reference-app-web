/*global jQuery,swfobject,console*/
/** @namespace */
var bcrefapp = window.bcrefapp || {};
/** @namespace */
bcrefapp.helper = bcrefapp.helper || {};

/**
 * Helper instance for dynamic loading of JS and SWF files
 *
 * @static
 * @class LoadHelper
 * @memberOf bcrefapp.helper
 *
 * @author max.nyman@anvilcreative.com (Maximilian Nyman)
 */
bcrefapp.helper.LoadHelper = (function() {
    "use strict";

    /**
     * @private
     * @type {Object}
     */
    var _that = {
        MIN_FLASHPLAYER: "11.1.0",
        EXPRESS_INSTALL: "",
        ENDPOINTS: {
            // Array with endpoints, if the first one fails then the next one will be used and so on and so forth
            JQUERY: ["//ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js", "/vendor/jquery-1.11.1.min.js"],
            SWFOBJECT: ["//ajax.googleapis.com/ajax/libs/swfobject/2.2/swfobject.js", "/vendor/swfobject.js"]
        },
        ERROR: {
            LOAD_ERROR_JQUERY: "jQuery Failed Loading",
            LOAD_ERROR_SWFOBJECT: "SWFObject Failed Loading",
            ENDPOINT_ERROR_JQUERY: "No Endpoints defined for jQuery",
            ENDPOINT_ERROR_SWFOBJECT: "No Endpoints defined for SWFObject"
        },
        recallSelfCount: -1,
        jQueryFailedLoading: false,
        swfObjectFailedLoading: false
    };

    /**
     * Convenience method to check if jQuery has been loaded
     * @public
     * @returns {Boolean}
     */
    function isjQueryLoaded() { return !!window.jQuery; }

    /**
     * Convenience method to check if SWFObject has been loaded
     * @public
     * @returns {Boolean}
     */
    function isSWFObjectLoaded() { return !!window.swfobject; }

    /**
     * Helper method to dynamically load Javascript at runtime
     *
     * @public
     * @param {String} src The path to the Javascript to load
     * @param {Function} callbackFn The callback method to execute when loading is complete or failed. Two arguments will passed to the callbackFn - {Boolean} success, {String} src
     * @param {HTMLElement} [parent=<head></head>] The parent DOM element to which to append the generated Script Object. The default element is the <head> element
     * @returns {String}
     */
    function loadJS(src, callbackFn, parent) {
        /**
         * Generate an identifier which is then returned back
         */
        var id = randomString(8, "aA");
        /**
         * Get the parent element. If one has not been specified, then the <head> element will be used
         */
        var parentElem = parent ? parent : document.getElementsByTagName("head")[0];
        /**
         * Create the Script Object and assign the id and src attribute
         */
        var oScript = document.createElement( "script" );
        oScript.id = id;
        oScript.setAttribute( "src", src );

        /**
         * Define EventHandlers for "load" and "error"
         */
        var loadedFn = function() {
            if( callbackFn ) {
                callbackFn(true, src);
            }
        };
        var errorFn = function() {
            parentElem.removeChild(oScript);
            oScript = null;
            if( callbackFn ) {
                callbackFn(false, src);
            }
        };

        /**
         * Register EventHandlers to the Script Object
         */
        if( oScript.addEventListener ) {
            oScript.addEventListener( "load", loadedFn, false );
            oScript.addEventListener( "error", errorFn, false );
        }
        else if( oScript.readyState ) {
            oScript.onreadystatechange = function() {
                if( oScript.readyState === 4 ) {
                    if( oScript.status < 400 ) { loadedFn(); }
                    else { errorFn(); }
                }
            };
        }

        /**
         * Append the Script Object to the DOM
         */
        parentElem.appendChild(oScript);

        //Return the id. This could be used to remove the <script></script> element from the DOM
        return id;
    }

    /**
     * Helper method to dynamically load SWF at runtime
     * NOTE: Unfortunately there is no way to detect if the SWF can run properly when loaded, only that the SWF has been added to the DOM
     *
     * @public
     * @param {String} src The path to the SWF to load
     * @param {Function} callbackFn The callback method to execute when loading is complete or failed. Two arguments will passed to the callbackFn - {Boolean} success, {String} src
     * @param {String|HTMLElement} [placeholder=null] The id of or the DOM element itself which will be replaced by the SWF
     * @returns {String}
     */
    function loadSWF(src, callbackFn, placeholder) {
        /**
         * Get the placeholder element. If one has not been specified, then one will be created and added to the DOM
         */
        var placeholderId = (placeholder && (typeof placeholder === 'string' || placeholder instanceof String)) ? placeholder : randomString(8, "aA");
        var placeholderElem = (placeholder && (typeof placeholder === 'string' || placeholder instanceof String)) ? document.getElementById(placeholderId) : placeholder;
        if( !placeholderElem ) {
            placeholderElem = document.createElement("div");
            document.body.appendChild(placeholderElem);
        }
        if( !placeholderElem.id ) { placeholderElem.id = placeholderId; }
        placeholderId = placeholderElem.id;

        /**
         * Checking if SWFObject failed loading, in which case the load is terminated and an error is thrown and the callbackFn is called
         */
        if( _that.swfObjectFailedLoading ) {
            console.error("loadSWF() cannot load <" + src + " because SWFObject couldn't be loaded");
            if( callbackFn ) { callbackFn(false, src); }
        }

        /**
         * A convenience method for re-calling itself, and protecting against a crashing the browse with too many recursive calls
         */
        var recallSelfFn = function() {
            if( _that.recallSelfCount === -1 ) { _that.recallSelfCount = 3; }
            if( _that.recallSelfCount > 0 ) {
                _that.recallSelfCount--;
                loadSWF(src, callbackFn, placeholderElem);
            }
        };

        /**
         * Checking if SWFObject has been loaded, and if it hasn't it will be dynamically loaded
         */
        if( !isSWFObjectLoaded() ) {
            loadSWFObject(recallSelfFn);
        }
        /**
         * Checking the DOM is NOT ready by checking the non-existence of the <body> element, in which case load event handlers will be registered
         */
        else if( !document.body ) {
            if ( window.attachEvent ) { window.attachEvent( "onload", recallSelfFn ); }
            else { window.addEventListener( "load", recallSelfFn, false ); }
        }
        else {
            _that.recallSelfCount = -1; // Reset the recall counter
            internalLoadSWF( src, placeholderId, callbackFn );

        }
        return placeholderId;
    }

    /**
     * internalLoadSWF
     * Helper method to dynamically load SWF at runtime
     *
     * NOTE: Unfortunately there is no way to detect if the SWF can run properly when loaded, only that the SWF has been added to the DOM
     *
     * @private
     * @param {String} src The path to the SWF to load
     * @param {String} id The Id of the DOM placeholder element
     * @param {Function} callbackFn The callback method to execute when loading is complete or failed. Two arguments will passed to the callbackFn - {Boolean} success, {String} src
     */
    function internalLoadSWF(src, id, callbackFn) {
        /**
         * Callback method to SWFObject
         */
        var swfLoadStatus = function swfLoadStatus(status) {
            if( status.success ) {
                if( callbackFn ) { callbackFn(true, src); }
            }
            else {
                if( callbackFn ) { callbackFn(false, src); }
            }
        };

        /**
         * Embed SWF using SWFObject
         */
        var flashvars = {};
        var params = {};
        params.menu = "false";
        params.quality = "low";
        params.AllowScriptAccess = "always";
        params.swliveconnect = "true";
        params.wmode = "transparent";
        params.align = "middle";
        var attributes = {
            id:id,
            name:id,
            style: "position: absolute; z-index: 100; display: inline-block; visibility: visible; left: 0; top: 0;"
        };
        swfobject.embedSWF( src, id, 1, 1, _that.MIN_FLASHPLAYER, _that.EXPRESS_INSTALL, flashvars, params, attributes, swfLoadStatus );
    }

    /**
     * Helper method to check and dynamically load jQuery it not already loaded
     *
     * @public
     * @param {Function} callbackFn The callback method to execute when loading is complete or failed. The true/false passed to the callbackFn will indicate success/failure
     */
    function loadJQuery(callbackFn) {
        /**
         * Check if jQuery is already loaded, and if so execute the callbackFn
         */
        if( isjQueryLoaded() ) {
            if( callbackFn ) { callbackFn( true, jQuery ); }
        }
        else if( _that.ENDPOINTS && _that.ENDPOINTS.JQUERY && _that.ENDPOINTS.JQUERY.length > 0 ) {
            /**
             * Callback method for success/failed loading of jQuery
             */
            var jQueryLoadedCallback = function(status) {
                if( status && isjQueryLoaded() ) {
                    // SUCCESSFUL
                    delete _that.currentJQueryIndex;
                    if( callbackFn ) { callbackFn( true, jQuery ); }
                }
                else {
                    // FAILED, re-call itself to fallback to the next endpoint or terminate
                    loadJQuery(callbackFn);
                }
            };

            /**
             * Initiate the _that.currentJQueryIndex if not already defined
             */
            _that.currentJQueryIndex = _that.currentJQueryIndex ? _that.currentJQueryIndex : 0;
            /**
             * Checks if there are more endpoints to try
             */
            if( _that.currentJQueryIndex < _that.ENDPOINTS.JQUERY.length ) {
                // Attempt to load next endpoint
                loadJS( _that.ENDPOINTS.JQUERY[_that.currentJQueryIndex++], jQueryLoadedCallback );
            }
            else {
                // FAILED, no more endpoints to try
                _that.jQueryFailedLoading = true;
                console.error( _that.ERROR.LOAD_ERROR_JQUERY );
                if( callbackFn ) { callbackFn(false); }
            }
        }
        else {
            // jQuery not loaded and _that.ENDPOINTS.JQUERY is empty or non-existent
            console.error( _that.ERROR.ENDPOINT_ERROR_JQUERY );
            if( callbackFn ) { callbackFn(false); }
        }
    }

    /**
     * Helper method to check and dynamically load SWFObject it not already loaded
     * @public
     * @param {Function} callbackFn The callback method to execute when loading is complete or failed. The true/false passed to the callbackFn will indicate success/failure
     */
    function loadSWFObject(callbackFn) {
        /**
         * Check if SWFObject is already loaded, and if so execute the callbackFn
         */
        if( isSWFObjectLoaded() ) {
            if( callbackFn ) { callbackFn( true ); }
        }
        else if( _that.ENDPOINTS && _that.ENDPOINTS.SWFOBJECT && _that.ENDPOINTS.SWFOBJECT.length > 0 ) {
            /**
             * Callback method for success/failed loading of SWFObject
             */
            var swfObjectCallback = function(status) {
                if( status && isSWFObjectLoaded() ) {
                    // SUCCESSFUL
                    delete _that.currentSWFObjectIndex;
                    if( callbackFn ) { callbackFn( true ); }
                }
                else {
                    loadSWFObject(callbackFn);
                }
            };

            /**
             * Initiate the _that.currentSWFObjectIndex if not already defined
             */
            _that.currentSWFObjectIndex = _that.currentSWFObjectIndex ? _that.currentSWFObjectIndex : 0;
            /**
             * Checks if there are more endpoints to try
             */
            if( _that.currentSWFObjectIndex < _that.ENDPOINTS.SWFOBJECT.length ) {
                // Attempt to load next endpoint
                loadJS( _that.ENDPOINTS.SWFOBJECT[_that.currentSWFObjectIndex++], swfObjectCallback );
            }
            else {
                // FAILED, no more endpoints to try
                _that.swfObjectFailedLoading = true;
                console.error( _that.ERROR.LOAD_ERROR_SWFOBJECT );
                if( callbackFn ) { callbackFn(false); }
            }
        }
        else {
            // SWFObject not loaded and _that.ENDPOINTS.SWFOBJECT is empty or non-existent
            console.error( _that.ERROR.ENDPOINT_ERROR_SWFOBJECT );
            if( callbackFn ) { callbackFn(false); }
        }
    }

    /**
     * Helper method to generate a random string with the defined length and characters
     *
     * @private
     * @param {int} length The length of the generated string
     * @param {String} chars The type of characters to use for the generated string
     * @returns {String}
     */
    function randomString(length, chars) {
        var mask = '';
        if (chars.indexOf('a') > -1) { mask += 'abcdefghijklmnopqrstuvwxyz'; }
        if (chars.indexOf('A') > -1) { mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'; }
        if (chars.indexOf('#') > -1) { mask += '0123456789'; }
        if (chars.indexOf('!') > -1) { mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\'; }
        var result = '';
        for (var i = length; i > 0; --i) { result += mask[Math.round(Math.random() * (mask.length - 1))]; }
        return result;
    }

    /**
     * Dumps the installed and required Flash versions to the console
     * @private
     */
    function logFlashPlayerVersion() {
        if( isSWFObjectLoaded() ) {
            var version = swfobject.getFlashPlayerVersion();
            console.info( "Installed Flash Player Version:", version.major + "." + version.minor + "." + version.release );
            console.info( "Minimum Required Flash Player Version:", _that.MIN_FLASHPLAYER );
        }
    }

    return {
        isSWFObjectLoaded:isSWFObjectLoaded,
        isJQueryLoaded:isjQueryLoaded,
        loadJS:loadJS,
        loadSWF:loadSWF,
        loadJQuery:loadJQuery,
        loadSWFObject:loadSWFObject,
        logFlashPlayerVersion:logFlashPlayerVersion
    };

}());