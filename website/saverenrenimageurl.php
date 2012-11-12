<?php
    include("php/config.php");
    include("php/sqlHelper.php");
    include("php/sqlAction.php");
    include("php/imageObj.php");

    if(isset($_POST["url"])){
        $image = new Image();
        $image->note = $_POST["note"];
        $image->url = $_POST["url"];
        $image->width = $_POST["width"];
        $image->height = $_POST["height"];

        $id=SqlAction::createOneInfo("image",$image);
        echo "{code: 0}";
        exit(0);
    }

    echo "hello World!";
?>