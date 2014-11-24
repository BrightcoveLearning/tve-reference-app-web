<?php
/**
 * Created by IntelliJ IDEA.
 * User: Maximilian Nyman
 * Date: 22/06/2014
 * Time: 1:50 AM
 */

class MediaItem {
    private $_videoBaseUrl = "http://cdn.movie-list.com/flvideo/";
    private $_thumbnailBaseUrl = "http://www.movie-list.com/img/posters/";
    private $_posterBaseUrl = "http://www.movie-list.com/img/posters/big/zoom/";
    private $_videoUrl;
    public $videoId;
    public $video;
    public $thumbnail;
    public $poster;
    public $title;
    public $isProtected = false;
    public $resourceId = "DummyResourceId";

    function __construct($videoId, $isProtected, $videoFile, $imageName, $title) {
        $this->videoId = $videoId;
        $this->isProtected = $isProtected;
        $this->_videoUrl = $this->_videoBaseUrl . $videoFile;
        $this->video = $this->isProtected ? "" : $this->_videoUrl;
        $this->thumbnail = $this->_thumbnailBaseUrl . $imageName . ".jpg";
        $this->poster = $this->_posterBaseUrl . $imageName . ".jpg";
        $this->title = $title;
    }

    function getVideo() { return $this->_videoUrl; }
} 