<?php
include_once("getPlaylist.php");
$mediaItems = createMediaItems();
header('Content-type: application/json');
echo json_encode($mediaItems);