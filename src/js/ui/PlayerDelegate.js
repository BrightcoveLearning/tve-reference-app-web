/*global jQuery,videojs,console,alert*/
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
bcrefapp.example.PlayerDelegate = function(authZAPI) {
    "use strict";

    /**
     * JQuery
     * @private
     * @function
     */
    var $ = jQuery;

    /**
     * @private
     * @type {Object}
     */
    var _that = {
        CLASS_NAMES: {
            PLAYER_WRAPPER:".playerWrapper",
            VIDEO:"video-js",
            AUTHORIZING:"authorizing",
            VIDEO_PLAYBACK:"videoPlayback"
        },
        PLAYER_INFO: {
            VIDEO_ID: "bcPlayer",
            ACCOUNT_ID: "3605639424001",
            PLAYER_ID: "e3cc70ab-4a4f-42bb-be5c-795e479b1647",
            JS: [
                "http://players.brightcove.com/3605639424001/e3cc70ab-4a4f-42bb-be5c-795e479b1647_default/index.js"
            ]
        },
        playerContainer: null,
        player: null,
        currentVideoItem: null
    };

    /**
     * Renders the Player Wrapper UI
     * @private
     */
    function renderPlayerWrapper() {
        _that.playerContainer = document.createElement("video");
        _that.playerContainer.id = _that.PLAYER_INFO.VIDEO_ID;
        _that.playerContainer.setAttribute( "data-account", _that.PLAYER_INFO.ACCOUNT_ID );
        _that.playerContainer.setAttribute( "data-player", _that.PLAYER_INFO.PLAYER_ID );
        _that.playerContainer.setAttribute( "data-embed", "default" );
        _that.playerContainer.setAttribute( "data-id", "" );
        _that.playerContainer.setAttribute( "class", _that.CLASS_NAMES.VIDEO );
        _that.playerContainer.setAttribute( "controls", "" );
        $(_that.CLASS_NAMES.PLAYER_WRAPPER).append(_that.playerContainer);

        bcrefapp.helper.LoadHelper.loadJS(_that.PLAYER_INFO.JS[0],
            function(success) {
                if( success ) {
                }
            }
        );
    }


    /**
     * Renders the Player
     * @private
     */
    function renderPlayer(renditions) {
        if( !_that.player ) {
            _that.player = videojs( _that.PLAYER_INFO.VIDEO_ID );
        }
        _that.player.src( renditions );
        _that.player.poster( "" );
        $(_that.CLASS_NAMES.PLAYER_WRAPPER ).addClass(_that.CLASS_NAMES.VIDEO_PLAYBACK);
    }

    /**
     * Starts the playback flow
     * if(isProtected) AuthZ -> Validate -> Play
     * else Play
     *
     * @public
     * @param {{videoId:String, isProtected:Boolean, title:String, video:String, resourceId:String}} videoItem
     */
    function play(videoItem) {
        console.log("rendered");
        _that.currentVideoItem = videoItem;
        if( videoItem.isProtected ) {
            console.log("Protected - Authorizing...");
            $(_that.CLASS_NAMES.PLAYER_WRAPPER ).addClass(_that.CLASS_NAMES.AUTHORIZING);
            authZAPI.authorize( videoItem.resourceId, {
                /**
                 * Called when user is Authorized
                 * @callback
                 * @param {String} requestorId The current requestorId
                 * @param {String} requestedResourceId The requested resourceId
                 * @param {String} token Short Media Token
                 */
                authorized: function( requestorId, requestedResourceId, token ) {
                    console.log("Authorized");
                    var args = {
                        requestorId: requestorId,
                        resourceId: requestedResourceId,
                        token: token,
                        mediaId: videoItem.videoId
                    };
                    console.log("Validating Token");
                    // Validates the token and returns the JSON object with the renditions
                    $.getJSON( "getMedia.php", args,
                        /**
                         * @internal
                         * @callback
                         * @param {{isValid:Boolean, mediaId:String, validation:Object, renditions:Array}} data
                         */
                        function(data) {
                            if( data.isValid ) {
                                console.log("Token Validated - Start Playback");
                                if( _that.currentVideoItem && _that.currentVideoItem.videoId === data.mediaId ) {
                                    renderPlayer(data.renditions);
                                    $(_that.CLASS_NAMES.PLAYER_WRAPPER ).removeClass(_that.CLASS_NAMES.AUTHORIZING);
                                    _that.player.play();
                                }
                            }
                            else {
                                alert("Invalid ShortMediaToken!");
                                console.error("Invalid Token! Cannot play video");
                            }
                        }
                    );
                },
                /**
                 * Called when user is not Authorized
                 * @callback
                 * @param {String} requestedResourceId The requested resourceId
                 * @param {String} requestErrorCode The AdobePass error code
                 * @param {String} requestErrorDetails The MVPD error message (if any)
                 */
                notAuthorized: function( requestedResourceId, requestErrorCode, requestErrorDetails ) {
                    console.log( "Not Authorized", requestedResourceId, requestErrorCode, requestErrorDetails );
                },
                /**
                 * Called if AccessEnabler has an error
                 * @callback
                 * @param {Object} err
                 */
                error: function( err ) {
                    console.log( err );
                }
            } );
        }
        else {
            console.log("Not Protected - Start Playback");
            renderPlayer({src:_that.currentVideoItem.video, type:"video/mp4"});
            _that.player.play();
        }
    }

    /**
     * Pause the playback
     * @public
     */
    function pause() { if( _that.player ) { _that.player.pause(); } }

    /**
     * Enables player controls
     * @public
     */
    function enable() { if( _that.player ) { _that.player.controls = true; } }

    /**
     * Disables player controls, pause the video and removes the current video
     * @public
     */
    function disable() {
        if( _that.player ) {
            _that.currentVideoItem = null;
            _that.player.pause();
            _that.player.controls = false;
            _that.player.src("");
        }
    }

    // Renders the player UI
    renderPlayerWrapper();

    return {
        play:play,
        pause:pause,
        enable:enable,
        disable:disable
    };

};