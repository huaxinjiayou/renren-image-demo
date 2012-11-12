<?php
/*
 * Created on 2012-11-10
 */
 class Image{
    private $id;
    private $note;
    private $url;
    private $width;
    private $height;
    private $type;
    private $isdelete;
    private $isshow;
    private $like;
    private $createTime;
    
    //该表的所有字段
    public $tableFields = array("id", "note", "url", "width", "height", "type", "isdelete", "isshow", "like", "createTime");

    function __construct($id = "", $note = "", $url = "", $width = 0, $height = 0, $type = 0, $isdelete = 0, $isshow = 1, $like = 0, $createTime = "now()"){
        $this->id = $id;
        $this->note = $note;
        $this->url = $url;
        $this->width = $width;
        $this->height = $height;
        $this->type = $type;
        $this->isdelete = $isdelete;
        $this->isshow = $isshow;
        $this->like = $like;
        $this->createTime = $createTime;
    }

    function __get($name){
        return $this->$name;
    }
    function __set($name, $value){
        $this->$name = $value;
    }
}
?>