/*global console,alert*/
/** @namespace */
var bcrefapp = window.bcrefapp || {};
/** @namespace */
bcrefapp.example = bcrefapp.example || {};

/**
 * Example Error Handler
 *
 * @class ErrorHandler
 * @memberOf bcrefapp.example
 *
 * @author Maximilian Nyman
 */
bcrefapp.example.ErrorHandler = function() {
    "use strict";


    /**
     * Process the current error
     * @public
     * @param {bcrefapp.auth.model.AuthError} authError
     */
    function processError(authError) {
        if( authError.isFatal() ) {
            console.error( "ERROR:", authError.getErrorCode(), "\n", "[" + authError.getErrorCategory() + "]", authError.getErrorMsg(), "\n", authError.getErrorDetails() );
            alert("ERROR: " + authError.getErrorCode() + "\n" + "[" + authError.getErrorCategory() + "]\n" + authError.getErrorMsg() + "\n\n" + authError.getErrorDetails() );
        }
        else {
            console.warn( "ERROR:", authError.getErrorCode(), "\n", "[" + authError.getErrorCategory() + "]", authError.getErrorMsg(), "\n", authError.getErrorDetails() );
        }
    }

    return {
        processError:processError
    };

};
