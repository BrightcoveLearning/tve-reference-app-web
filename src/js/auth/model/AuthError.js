/** @namespace */
var bcrefapp = window.bcrefapp || {};
/** @namespace */
bcrefapp.auth = bcrefapp.auth || {};
/** @namespace */
bcrefapp.auth.model = bcrefapp.auth.model || {};

/**
 * The Auth Error object - Defines an error for the Auth Library
 *
 * @class AuthError
 * @memberOf bcrefapp.auth.model
 * @param {String} errorCode
 * @param {String} errorMsg
 * @param {String} [errorDetails]
 * @param {Boolean} [fatal=false]
 * @param {String} [category] Provide a category for the error
 *
 * @author max.nyman@anvilcreative.com (Maximilian Nyman)
 */
bcrefapp.auth.model.AuthError = function(errorCode, errorMsg, errorDetails, fatal, category) {
    "use strict";
    /**
     * Gets the Error Code
     * @public
     * @returns {String} The Error Code
     */
    function getCode() { return errorCode; }
    /**
     * Gets the Error Message
     * @public
     * @returns {String} The Error Message
     */
    function getMsg() { return errorMsg; }
    /**
     * Gets the Error Details
     * @public
     * @returns {String} The Error Details
     */
    function getDetails() { return errorDetails; }
    /**
     * Checks if Fatal Error
     * @public
     * @returns {Boolean}
     */
    function isFatal() { return !!fatal; }
    /**
     * Gets the Error Category
     * @public
     * @returns {String} The Error Category
     */
    function getCategory() { return category ? category : "GENERIC"; }

    /**
     * Returns the String representation of the AuthError
     * @public
     * @returns {String} The String representation of the AuthError object
     */
    function toString() {
        var str = "[" + getCategory()  + "] " + getMsg();
        str += (getDetails() ? ": " + getDetails() : "");
        return str;
    }

    return {
        getErrorCode:getCode,
        getErrorMsg:getMsg,
        getErrorDetails:getDetails,
        isFatal:isFatal,
        getErrorCategory:getCategory,
        toString:toString
    };
};



/**
 * Static factory methods
 * @public
 * @static
 * @returns {Object.<String, Function>}
 */
bcrefapp.auth.model.AuthError.Factory = (function() {
    "use strict";

    bcrefapp.auth.model.AuthError.CAT_GENERIC = "GENERIC";
    bcrefapp.auth.model.AuthError.CAT_LOADER = "LOADER";
    bcrefapp.auth.model.AuthError.CAT_INIT = "INIT";
    bcrefapp.auth.model.AuthError.CAT_CONFIG = "CONFIG";
    bcrefapp.auth.model.AuthError.CAT_AUTHN = "AUTHN";
    bcrefapp.auth.model.AuthError.CAT_AUTHZ = "AUTHZ";
    bcrefapp.auth.model.AuthError.CAT_DRM = "DRM";
    bcrefapp.auth.model.AuthError.CAT_LSO = "LSO";

    /** @typedef {String} ErrorCode */
    /**
     * @typedef {Object} ErrorItem
     * @property {String} message
     * @property {String} details
     * @property {Boolean} isFatal
     * @property {String} category
     */
    /** @typedef {Object.<ErrorCode,ErrorItem>} ErrorMap */

    /** @type {ErrorMap} */
    var _errorMap = {
            "libTypeNotFound":      { isFatal:false, category:bcrefapp.auth.model.AuthError.CAT_LOADER, message:"Library Type <%libType%> Not Found",      details:"Library Type <%libType%> was not Found" },
            "profileNotFound":      { isFatal:false, category:bcrefapp.auth.model.AuthError.CAT_LOADER, message:"Profile <%profile%> Not Found",           details:"The Profile <%profile%> was not Found" },
            "loadErrorAuthLib":     { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_LOADER, message:"Loading Auth Library failed",             details:"%details%" },
            "loadErrorSWFObject":   { isFatal:false, category:bcrefapp.auth.model.AuthError.CAT_LOADER, message:"SWFObject Failed Loading",                details:"Unable to Load SWFObject Failed Loading" },
            "loadErrorSWF":         { isFatal:false, category:bcrefapp.auth.model.AuthError.CAT_LOADER, message:"Failed loading SWF Library",              details:"Unable to Load SWF Library <%url%>" },
            "loadErrorJS":          { isFatal:false, category:bcrefapp.auth.model.AuthError.CAT_LOADER, message:"Failed loading JS Library",               details:"Unable to Load JS Library <%url%>" },
            "loadError":            { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_LOADER, message:"Loading failed",                          details:"Auth Library not loaded" },
            "apiNotReady":          { isFatal:false, category:bcrefapp.auth.model.AuthError.CAT_INIT,   message:"API is not ready",                        details:"API has not been initialized or is not done initializing" },
            "configRetrieve":       { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_CONFIG, message:"Failed getting Config",                   details:"Failed getting Config" },
            "configParse":          { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_CONFIG, message:"Failed to parse Config",                  details:"Failed to parse the Config XML" },
            "configProviders":      { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_CONFIG, message:"Failed to extract providers from Config", details:"Failed to extract providers from Config" },
            "domainWhitelist":      { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_CONFIG, message:"Domain <%currDomain%> Not Whitelisted",   details:"The current Domain <%currDomain%> is not found in the Whitelist [%whitelist%]" }
        },
        /** @type {ErrorItem} */
        _genericErrorItem = {
            "message": "Generic Error: %errorCode%",
            "details": "No error mapping was found for <%errorCode%>",
            "isFatal": false,
            "category": bcrefapp.auth.model.AuthError.CAT_GENERIC
        };

    /**
     * Create AuthError
     * @public
     * @param {String|Object} code
     * @param {String} msg
     * @param {String} [details]
     * @param {Boolean} [isFatal=false]
     * @param {String} [category]
     * @return {bcrefapp.auth.model.AuthError}
     */
    function create(code, msg, details, isFatal, category) {
        return new bcrefapp.auth.model.AuthError( code, msg, details, !!isFatal, category );
    }
    /**
     * Create AuthError from errorCode by doing a lookup into the errorMap
     * @public
     * @param {String} errorCode
     * @param {ErrorMap} [errorMap]
     * @param {Object.<String, String>} [substituteMap]
     * @return {bcrefapp.auth.model.AuthError}
     */
    function createFromErrorCode(errorCode, errorMap, substituteMap) {
        /** @type {ErrorItem} */
        var errorData;

        // Checks if the passed in errorMap has the appropriate mapping
        if( errorMap && errorMap.hasOwnProperty(errorCode) ) {
            errorData = errorMap[errorCode];
        }
        // Checks if the local private errorMap has the appropriate mapping
        if( !errorData && _errorMap && _errorMap.hasOwnProperty(errorCode) ) {
            errorData = _errorMap[errorCode];
        }
        // No error data found for errorCode, defaults to a generic error
        if( !errorData ) { errorData = _genericErrorItem; }

        // Substitutes the key-value pairs for errorCode
        var regExp = new RegExp( '%errorCode%', "mg" );
        errorData.message = errorData.message.replace( regExp, errorCode );
        errorData.details = errorData.details.replace( regExp, errorCode );

        // Substitutes the key-value pairs from the substituteMap
        if( substituteMap ) {
            for( var key in substituteMap ) {
                if( substituteMap.hasOwnProperty(key) ) {
                    regExp = new RegExp( '%' + key + '%', "mg" );
                    errorData.message = errorData.message.replace( regExp, substituteMap[key] );
                    errorData.details = errorData.details.replace( regExp, substituteMap[key] );
                }
            }
        }
        return new bcrefapp.auth.model.AuthError(errorCode, errorData.message, errorData.details, errorData.isFatal, errorData.category);
    }

    /**
     * Imports an errorMap to be used by the createFromErrorCode method
     * @public
     * @param {ErrorMap} errorMap
     */
    function importErrorMap(errorMap) {
        for( var errorCode in errorMap ) {
            if( errorMap.hasOwnProperty(errorCode) ) { _errorMap[errorCode] = errorMap[errorCode]; }
        }
    }

    return {
        importErrorMap: importErrorMap,
        create: create,
        createFromErrorCode: createFromErrorCode,
        libTypeNotFound:function(libType) { return createFromErrorCode("libTypeNotFound", _errorMap, {libType:libType} ); },
        profileNotFound:function(profile) { return createFromErrorCode("profileNotFound", _errorMap, {profile:profile} ); },
        loadErrorAuthLib:function(details) { return createFromErrorCode("loadErrorAuthLib", _errorMap, {details:details} ); },
        loadErrorSWFObject:function() { return createFromErrorCode("loadErrorSWFObject", _errorMap ); },
        loadErrorSWF:function(url) { return createFromErrorCode("loadErrorSWF", _errorMap, {url:url} ); },
        loadErrorJS:function(url) { return createFromErrorCode("loadErrorJS", _errorMap, {url:url} ); },
        loadError:function() { return createFromErrorCode("loadError", _errorMap ); },
        apiNotReady:function() { return createFromErrorCode("apiNotReady", _errorMap ); },
        configRetrieve:function() { return createFromErrorCode("configRetrieve", _errorMap ); },
        configParse:function() { return createFromErrorCode("configParse", _errorMap ); },
        configProviders:function() { return createFromErrorCode("configProviders", _errorMap ); },
        domainWhitelist:function(currDomain, whitelist) { return createFromErrorCode("domainWhitelist", _errorMap, {currDomain:currDomain,whitelist:whitelist} ); }
    };
}());