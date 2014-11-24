<?php
/**
 * Created by IntelliJ IDEA.
 * User: Maximilian Nyman
 * Date: 21/06/2014
 * Time: 5:57 PM
 */

include_once("php/MediaItem.php");

function createMediaItems() {
    $mediaItems = array();
    array_push( $mediaItems, new MediaItem("7A4A90159E09", true, "dawnoftheplanetoftheapes.mp4", "dawnoftheplanetoftheapes", "Dawn of the Planet of the Apes") );
    array_push( $mediaItems, new MediaItem("995F5F11041D", true, "12yearsaslave.mp4", "12yearsaslave", "12 Years A Slave") );
    array_push( $mediaItems, new MediaItem("8CD914B81E19", true, "300riseofanempire.mp4", "300riseofanempire", "300: Rise of an Empire") );
    array_push( $mediaItems, new MediaItem("68B92E270B34", false, "2guns.mp4", "2guns", "2 Guns") );
    array_push( $mediaItems, new MediaItem("DADA2EB60412", true, "3daystokill.mp4", "3daystokill", "3 Days to Kill") );
    array_push( $mediaItems, new MediaItem("044D49DD9690", true, "6souls.mp4", "6souls", "6 Souls") );
    array_push( $mediaItems, new MediaItem("EED795315818", true, "abouttime.mp4", "abouttime", "About Time") );
    array_push( $mediaItems, new MediaItem("E2331F1D4FAE", true, "americanhustle.mp4", "americanhustle", "American Hustle") );
    array_push( $mediaItems, new MediaItem("209E17BA18AF", false, "anchorman2e.mp4", "anchorman2", "Anchorman 2") );
    array_push( $mediaItems, new MediaItem("B1D9AE363ABC", false, "badgrandpa.mp4", "badgrandpa", "Bad Grandpa") );
    array_push( $mediaItems, new MediaItem("B609E8C73BCB", true, "bookthief.mp4", "bookthief", "Book Theif") );
    array_push( $mediaItems, new MediaItem("276DF8B3B076", false, "captainamerica2.mp4", "captainamerica2", "Captain America 2") );
    array_push( $mediaItems, new MediaItem("93306C2B03A5", true, "captainphillips.mp4", "captainphillips", "Captain Phillips") );
    array_push( $mediaItems, new MediaItem("487BCCB43364", true, "croods.mp4", "croods", "Croods") );
    array_push( $mediaItems, new MediaItem("A88DBA68BDF0", true, "despicableme2c.mp4", "despicableme2", "Despicable Me 2") );
    array_push( $mediaItems, new MediaItem("E762501B9517", true, "elysium.mp4", "elysium", "Elysium") );
    array_push( $mediaItems, new MediaItem("9666D1108AF5", true, "epic.mp4", "epic", "Epic") );
    array_push( $mediaItems, new MediaItem("B2102C1D2117", true, "frozen2013b.mp4", "frozen2013", "Frozen") );
    array_push( $mediaItems, new MediaItem("A2EA2C693254", true, "gravity.mp4", "gravity", "Gravity") );
    array_push( $mediaItems, new MediaItem("8F8B20394DDB", true, "heat.mp4", "heat", "Heat") );
    array_push( $mediaItems, new MediaItem("A790FEEE8907", true, "hobbit2.mp4", "hobbit2", "The Hobbit: The Desolation of Smaug") );
    array_push( $mediaItems, new MediaItem("D75AA908E112", true, "howtotrainyourdragon2c.mp4", "howtotrainyourdragon2", "How to Train Your Dragon 2") );
    array_push( $mediaItems, new MediaItem("02F68F7E724D", true, "hungergames2b.mp4", "hungergames2", "Hungergames 2") );
    array_push( $mediaItems, new MediaItem("A02EEE85D706", true, "internship.mp4", "internship", "Internship") );
    array_push( $mediaItems, new MediaItem("02ABC7D3A9B8", true, "ironman3.mp4", "ironman3", "Iron Man 3") );
    array_push( $mediaItems, new MediaItem("7F30744E216D", true, "legomovie.mp4", "legomovie", "The Lego Movie") );
    array_push( $mediaItems, new MediaItem("0A4765ED5B6F", true, "maleficentc.mp4", "maleficent", "Maleficent") );
    array_push( $mediaItems, new MediaItem("B33FD856D170", true, "manofsteel.mp4", "manofsteel", "Man of Steel") );
    array_push( $mediaItems, new MediaItem("8CC0131137C5", true, "matrixreloaded.mp4", "matrixreloaded", "Matrix Reloaded") );
    array_push( $mediaItems, new MediaItem("6EF318D1D947", true, "monstersuniversityd.mp4", "monstersuniversity", "Monsters University") );
    array_push( $mediaItems, new MediaItem("6BD06A6DF277", true, "muppets2.mp4", "muppets2", "Muppets 2") );
    array_push( $mediaItems, new MediaItem("3683D017B115", true, "robocop2013b.mp4", "robocop2013", "Robocop") );
    array_push( $mediaItems, new MediaItem("A6C4BFFCA5CF", true, "startrekintodarknesse.mp4", "startrekintodarkness", "Star Trek Into the Darkness") );
    array_push( $mediaItems, new MediaItem("495693ED9C42", true, "thor2b.mp4", "thor2", "Thor 2") );
    array_push( $mediaItems, new MediaItem("D34A237D90DA", true, "wolverine.mp4", "wolverine", "Wolverine") );
    array_push( $mediaItems, new MediaItem("7307652124D9", true, "xmendaysoffuturepastb.mp4", "xmendaysoffuturepast", "X-Men: Days of Future Past") );
    array_push( $mediaItems, new MediaItem("91FF9FB7897B", true, "yesmanb.mp4", "yesman", "Yes Man") );
    array_push( $mediaItems, new MediaItem("1292510B546A", true, "red2b.mp4", "red2", "Red 2") );
    return $mediaItems;
}
