<?php
/*
 * Created on 2012-11-10
 */
    include("php/config.php");
    include("php/sqlHelper.php");
    include("php/sqlAction.php");
    include("php/imageObj.php");

    if(isset($_GET["page"])){
        $pageIndex = $_GET["page"];
        $perCount = 32;

        $imageList = SqlAction::getPagedInfo("image", array("isdelete" => "0", "isshow" => "1" ), $pageIndex, $perCount);

        if(count($imageList) == 0){
            echo '{"code": 1}';
            exit(0);
        }

        $str = '{"code": 0, "data": [';
        $flag = false;
        foreach ($imageList as $key => $value) {
            if($flag){
                $str .= ',';
            }
            $flag = true;

            $str .= '{"id": '  . $value["id"]     . ','
                . '"url": "'   . $value["url"]    . '",'
                . '"width": '  . $value["width"]  . ','
                . '"height": ' . $value["height"] . ','
                . '"like": '   . $value["like"]   . '}';
        }

        $str .= ']}';

        echo $str;
        exit(0);
    }
?>