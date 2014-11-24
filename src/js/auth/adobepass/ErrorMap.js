/** @namespace */
var bcrefapp = window.bcrefapp || {};
/** @namespace */
bcrefapp.auth = bcrefapp.auth || {};
/** @namespace */
bcrefapp.auth.adobepass = bcrefapp.auth.adobepass || {};

/** @typedef {String} ErrorCode */
/**
 * @typedef {Object} ErrorItem
 * @property {Boolean} isFatal
 * @property {String} category
 * @property {String} message
 * @property {String} details
 */
/** @typedef {Object.<ErrorCode,ErrorItem>} ErrorMap */

/** @type {ErrorMap} */
bcrefapp.auth.adobepass.ErrorMap = {
    "SEC403":  { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_CONFIG, message:"Domain Security error",                   details:"Current Domain is not whitelisted" },
    "SEC420":  { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_CONFIG, message:"HTTP Security error",                     details:"Potential man-in-the-middle attack" },
    "CFG400":  { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_CONFIG, message:"Invalid RequestorId",                     details:"The RequestorId <%requestorId%> is not valid" },
    "CFG404":  { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_CONFIG, message:"Adobe Pass server not found",             details:"Check network/DNS settings" },
    "CFG410":  { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_CONFIG, message:"AccessEnabler out of date",               details:"Old AccessEnabler cached locally, please clear cache" },
    "CFG5xx":  { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_CONFIG, message:"Adobe Pass internal server error",        details:"Temporary server issues, please try again later" },
    "N110":    { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_AUTHN,  message:"Authentication token Expired",            details:"Token expired - Force logout" },
    "N120":    { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_AUTHN,  message:"Multiple authentication detected",        details:"There's already an authentication in process" },
    "N500":    { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_AUTHN,  message:"Internal error",                          details:"Internal error" },
    "Z100":    { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_AUTHZ,  message:"Authorization failed",                    details:"No subscription" },
    "Z110":    { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_AUTHZ,  message:"Authorization failed",                    details:"Possible fraud/DOS attack detected" },
    "Z113":    { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_AUTHZ,  message:"Authorization failed",                    details:"MVPD disabled" },
    "Z120":    { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_AUTHZ,  message:"Authorization failed",                    details:"MVPD connection issues" },
    "Z130":    { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_AUTHZ,  message:"Authorization failed",                    details:"Invalid resource" },
    "Z500":    { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_AUTHZ,  message:"Authorization failed",                    details:"Internal error" },
    "P100":    { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_AUTHZ,  message:"Pre-authorization failed",                details:"Possible too many resourceIds" },
    "DRM3301": { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_DRM,    message:"Flash Access bug",                        details:"Reset DRM subsystem and retry" },
    "DRM3305": { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_DRM,    message:"License Server connection",               details:"Check network settings" },
    "DRM3307": { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_DRM,    message:"Sandbox issue",                           details:"Enable unsandboxed access and/or reset DRM subsystem and retry" },
    "DRM3313": { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_DRM,    message:"Disk error",                              details:"Clear space on local disk and/or verify directory is writable and/or reset DRM subsystem and retry" },
    "DRM3321": { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_DRM,    message:"Sandbox issue",                           details:"Enable unsandboxed access and/or reset DRM subsystem and retry" },
    "DRM3322": { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_DRM,    message:"Device binding failed",                   details:"Reset the DRM subsystem and/or reload the page and retry" },
    "DRM3346": { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_DRM,    message:"Device binding failed",                   details:"Reset the DRM subsystem and/or reload the page and retry" },
    "DRM3365": { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_DRM,    message:"Incognito/Private settings",              details:"Exit Incognito / Private mode and load the page in normal mode" },
    "DRM3368": { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_DRM,    message:"Sandbox issue",                           details:"Enable unsandboxed access and/or reset DRM subsystem and retry" },
    "DRMxxxx": { isFatal:true,  category:bcrefapp.auth.model.AuthError.CAT_DRM,    message:"DRM subsystem",                           details:"Please consult the AS3 Runtime errors table and the Flash Access error table (http://help.adobe.com/en_US/FlashPlatform/reference/actionscript/3/runtimeErrors.html)" },
    "SEC412":  { isFatal:false, category:bcrefapp.auth.model.AuthError.CAT_CONFIG, message:"DeviceID mismatch",                       details:"Login again" },
    "CFG010":  { isFatal:false, category:bcrefapp.auth.model.AuthError.CAT_CONFIG, message:"Config zipped",                           details:"Uncompress data" },
    "CFG100":  { isFatal:false, category:bcrefapp.auth.model.AuthError.CAT_CONFIG, message:"Date/Time/Timezone issue",                details:"Set the correct Date/Time" },
    "N010":    { isFatal:false, category:bcrefapp.auth.model.AuthError.CAT_AUTHN,  message:"Authenticate-all active",                 details:"Degradation rules are active due to MVPD issues" },
    "N111":    { isFatal:false, category:bcrefapp.auth.model.AuthError.CAT_AUTHN,  message:"TempPass Expired",                        details:"Login with regular MVPD" },
    "Z010":    { isFatal:false, category:bcrefapp.auth.model.AuthError.CAT_AUTHN,  message:"Authenticate/Authorization-all active",   details:"Degradation rules are active due to MVPD issues" },
    "LS010":   { isFatal:false, category:bcrefapp.auth.model.AuthError.CAT_LSO,    message:"LSO issues",                              details:"Enable LSO (LocalStorage) and/or increase storage space" },
    "LS011":   { isFatal:false, category:bcrefapp.auth.model.AuthError.CAT_LSO,    message:"LSO and WebStorage issues",               details:"Increase storage space and logout to clear storage" },
    "N000":    { isFatal:false, category:bcrefapp.auth.model.AuthError.CAT_AUTHN,  message:"INFO",                                    details:"Not authenticated" },
    "N001":    { isFatal:false, category:bcrefapp.auth.model.AuthError.CAT_AUTHN,  message:"INFO",                                    details:"Passive background authentication in progress" },
    "N005":    { isFatal:false, category:bcrefapp.auth.model.AuthError.CAT_AUTHN,  message:"INFO",                                    details:"MVPD Picker cancelled" },
    "N011":    { isFatal:false, category:bcrefapp.auth.model.AuthError.CAT_AUTHN,  message:"INFO",                                    details:"TempPass Authenticated" }
};