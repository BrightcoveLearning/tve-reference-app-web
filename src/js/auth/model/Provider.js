/** @namespace */
var bcrefapp = window.bcrefapp || {};
/** @namespace */
bcrefapp.auth = bcrefapp.auth || {};
/** @namespace */
bcrefapp.auth.model = bcrefapp.auth.model || {};

/**
 * The Provider model
 *
 * @class Provider
 * @memberOf bcrefapp.auth.model
 * @param {String} providerId
 * @param {String} providerName
 * @param {String} providerLogo
 *
 * @author max.nyman@anvilcreative.com (Maximilian Nyman)
 */
bcrefapp.auth.model.Provider = function(providerId, providerName, providerLogo) {
    "use strict";
    this.id = providerId;
    this.name = providerName;
    this.logo = providerLogo;
};

/**
 * Returns the String representation of the Provider
 * @public
 * @returns {String} The String representation of the Provider object
 */
bcrefapp.auth.model.Provider.prototype.toString = function() {
    "use strict";
    return this.getName();
};
/**
 * Gets the Provider Id
 * @public
 * @returns {String} The Provider Id
 */
bcrefapp.auth.model.Provider.prototype.getId = function() {
    "use strict";
    return this.id;
};
/**
 * Sets the Provider Name
 * @public
 * @param {String} name
 */
bcrefapp.auth.model.Provider.prototype.setName = function( name ) {
    "use strict";
    this.name = name;
};
/**
 * Gets the Provider Name
 * @public
 * @returns {String} The Provider Name
 */
bcrefapp.auth.model.Provider.prototype.getName = function() {
    "use strict";
    return this.name;
};
/**
 * Sets the Provider Logo
 * @public
 * @param {String} logo
 */
bcrefapp.auth.model.Provider.prototype.setLogo = function( logo ) {
    "use strict";
    this.logo = logo;
};
/**
 * Gets the Provider Logo
 * @public
 * @returns {String} The Provider Logo
 */
bcrefapp.auth.model.Provider.prototype.getLogo = function() {
    "use strict";
    return this.logo;
};
