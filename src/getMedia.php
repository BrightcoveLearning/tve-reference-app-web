<?php
/**
 * Created by IntelliJ IDEA.
 * User: Maximilian Nyman
 * Date: 21/06/2014
 * Time: 5:54 PM
 */

include_once("getPlaylist.php");
include_once("php/MediaItem.php");

/*
VALID_TOKEN	 All validations succeeded
INVALID_TOKEN_FORMAT	 Token format is invalid
INVALID_SIGNATURE	 Token authenticity could not be validated
TOKEN_EXPIRED	 Token TTL is not valid
INVALID_RESOURCE_ID	 Token not valid for given resource
ERROR_UNKNOWN	 Token has not been validated yet
*/

$requestorId = $_GET['requestorId'];
$resourceId = $_GET['resourceId'];
$shortMediaToken = $_GET['token'];
$mediaId = $_GET['mediaId'];

//Validate ShortMediaToken
function validateToken($requestorId, $resourceId, $shortMediaToken) {
    $resultStr = exec("./verify \"$requestorId\" \"$resourceId\" \"$shortMediaToken\"", $outputArray, $resultVal );
    $resultObj = new stdClass();
    $resultObj->requestorID = $requestorId;
    $resultObj->resourceID = $resourceId;
    $resultObj->isValid = ($resultStr==="VALID_TOKEN");
    $resultObj->result = $resultStr;
    return $resultObj;
}

class ResponseItem {
    public $isValid = false;
    public $validation;
    public $mediaId;
    public $renditions = array();

    function __construct($mediaId, $validation) {
        $this->mediaId = $mediaId;
        $this->validation = $validation;
        $this->isValid = $this->validation->isValid;
        if( $this->isValid ) {
            $this->getRenditions();
        }
    }

    function getRenditions() {
        $mediaItems = createMediaItems();
        foreach($mediaItems as $mediaItem) {
            if( $mediaItem->videoId == $this->mediaId ) {
                $rendition = array(
                    "type" => "video/mp4",
                    "src" => $mediaItem->getVideo()
                );
                array_push($this->renditions, $rendition);
                break;
            }
        }
    }

}
$isValid = validateToken($requestorId, $resourceId, $shortMediaToken);
$response = new ResponseItem($mediaId, $isValid);
header('Content-type: application/json');
echo json_encode($response);