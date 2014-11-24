<ul><?php
    include_once("getPlaylist.php");
    $mediaItems = createMediaItems();
    foreach($mediaItems as $mediaItem) {?>
        <li<?php if( $mediaItem->isProtected ) { echo ' class="protected"'; } ?>><a href="#"
               data-videoid="<?php echo $mediaItem->videoId;?>"
               data-isprotected="<?php echo $mediaItem->isProtected;?>"
               data-video="<?php echo $mediaItem->video;?>"
               data-title="<?php echo $mediaItem->title;?>"
               data-poster="<?php echo $mediaItem->poster;?>"
               data-thumbnail="<?php echo $mediaItem->thumbnail;?>"
               data-resourceid="<?php echo $mediaItem->resourceId;?>"
               >
            <h5><?php echo str_replace( ":", ":<br>", $mediaItem->title);?></h5>
            <img src="<?php echo $mediaItem->thumbnail;?>"/>
        </a></li>
<?php } ?></ul>