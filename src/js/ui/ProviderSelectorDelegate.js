/** @namespace */
var bcrefapp = window.bcrefapp || {};
/** @namespace */
bcrefapp.example = bcrefapp.example || {};

/**
 * The Provider Selector Delegate to manage the rendering and interaction
 *
 * @class ProviderSelectorDelegate
 * @memberOf bcrefapp.example
 *
 * @author max.nyman@anvilcreative.com (Maximilian Nyman)
 */
bcrefapp.example.ProviderSelectorDelegate = function() {
    "use strict";

    /**
     * @private
     * @type {Object}
     */
    var _that = {
        CLASS_NAMES: {
            PROVIDER_SELECTOR: "providerSelector",
            PROVIDER_LIST_HEADER: "providerListHeader",
            PROVIDER_LIST_CONTAINER: "providerListContainer",
            PROVIDER_LIST: "providerList",
            CLOSE_BUTTON: "btClose"
        },
        whitelist: ["Adobe_Iframe", "Adobe_Redirect"],
        providerSelector: null,
        selectorCallbacks: null
    };

    /**
     * Event Handler for when a provider is selected
     * @private
     * @param {bcrefapp.auth.model.Provider} provider
     */
    function selectProvider(provider) {
        document.body.removeChild(_that.providerSelector);
        _that.providerSelector = null;

        if( provider ) {
            if( _that.selectorCallbacks && _that.selectorCallbacks.selectedProvider ) {
                // Fires the selectedProvider callback
                _that.selectorCallbacks.selectedProvider( provider );
            }
        }
    }

    /**
     * Event Handler for when close button is clicked
     * @private
     */
    function close() {
        // Set the selected provider to NULL
        selectProvider(null);

        if( _that.selectorCallbacks && _that.selectorCallbacks.close ) {
            // Fires the close callback
            _that.selectorCallbacks.close();
        }
    }

    /**
     * Injects the Provider Selector UI
     *
     * @public
     * @param {bcrefapp.auth.model.Provider[]} providers
     * @param {Object} selectorCallbacks
     */
    function injectProviderSelector(providers, selectorCallbacks) {
        _that.selectorCallbacks = selectorCallbacks;
        _that.providerSelector = document.createElement("div");
        _that.providerSelector.className = _that.CLASS_NAMES.PROVIDER_SELECTOR;
        var header = document.createElement("div");
        header.className = _that.CLASS_NAMES.PROVIDER_LIST_HEADER;
        _that.providerSelector.appendChild(header);
        var btClose = document.createElement("button");
        btClose.className = _that.CLASS_NAMES.CLOSE_BUTTON;
        btClose.innerHTML = "&times;";
        btClose.onclick = function() { close(); };
        header.appendChild(btClose);

        var providerListContainer = document.createElement("div");
        providerListContainer.className = _that.CLASS_NAMES.PROVIDER_LIST_CONTAINER;
        providerListContainer.innerHTML = "<h4>Select your current TV provider:</h4>";
        _that.providerSelector.appendChild(providerListContainer);
        var providerList = document.createElement("div");
        providerList.className = _that.CLASS_NAMES.PROVIDER_LIST;
        providerListContainer.appendChild(providerList);

        document.body.appendChild(_that.providerSelector);
        renderProviders(providerList, providers);
    }

    /**
     * Renders the array of providers
     *
     * @private
     * @param {HTMLElement} providerList
     * @param {bcrefapp.auth.model.Provider[]} providers
     */
    function renderProviders(providerList, providers) {
        for( var i = 0, len = providers.length; i < len; i++ ) {
            if( _that.whitelist.indexOf(providers[i].getId()) >= 0 ) {
                providerList.appendChild( renderProvider( providers[i] ) );
            }
        }
    }

    /**
     * Renders a single provider
     *
     * @private
     * @param {bcrefapp.auth.model.Provider} provider
     * @returns {HTMLElement}
     */
    function renderProvider(provider) {
        var a = document.createElement("a");
        a.id = provider.getId();
        a.href = "#";
        a.onclick = function() { selectProvider(provider); };
        var div = document.createElement("div");
        var img = document.createElement("img");
        img.src = provider.getLogo();
        img.alt = provider.getName();
        var span = document.createElement("span");
        span.innerHTML = provider.getName();
        div.appendChild(img);
        div.appendChild(span);
        a.appendChild(div);
        return a;
    }

    return {
        injectProviderSelector:injectProviderSelector
    };

};
