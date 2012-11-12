<?php
/*
*MySql工具类
*Power by huaxinjiayou@gmail.com
*2012.3.14
* Modify on 2012.11.10
*每一个实例化的对象最后都得执行close函数
*/

class MySql{
    private $host,$name,$password,$database,$ut;//主机地址，用户名，密码，数据库，编码

    //连接函数
    private function connect(){
        $link=mysql_connect($this->host,$this->name,$this->password) or die($this->host.":".$this->name.":".$this->password.":"."数据库连接出现错误，请检查：<p>1、网络连接</p><p>2、数据库用户名和密码</p>");
        mysql_select_db($this->database,$link) or die("没有该数据库：".$this->database);
        mysql_query("SET NAMES '$this->ut'");
    }

    //关闭连接
    function close(){
        return mysql_close();
    }

    //错误函数
    function error($sql){
        echo $sql;
    }

    //构造函数
    function __construct($host,$name,$password,$database,$ut){
        $this->host=$host;
        $this->name=$name;
        $this->password=$password;
        $this->database=$database;
        $this->ut=$ut;
        $this->connect();
    }

    //$sql:查询语句
    function query($sql){
        if(!($query=mysql_query($sql))) $this->show("Error:".iconv('gb2312','utf-8',$sql));
        return $query;
    }
    
    //输出错误信息
    private function show($str){
        echo $str;
    }

    //增加数据
    //$table:数据表
    //$fields:字段名,字段名,字段名...
    //$value:值,值,值...
    function insert($table,$fields,$value){
        $this->query("insert into $table ($fields) value ($value)");
    }

    //获取最后一次增加的数据的id
    function getLastInsertId(){
        return mysql_insert_id();
    }

    //删除数据
    //$tableAndWhere:表和where条件，例如 article where id=1
    function delete($tableAndWhere){
        $this->query("delete from $tableAndWhere");
    }

    //修改数据
    //$table:数据表
    //$fieldsAndValue:字段=值,字段=值...
    //$where:where...，可省略
    function update($table,$fieldsAndValueAndWhere){
        $this->query("update $table set $fieldsAndValueAndWhere");
    }

    //取得前一次操作（update、insert、delete）所影响的行数，失败则返回-1
    function getAffectedRows(){
        return mysql_affected_rows();
    }

    //获得mysql_query()返回的查询结果，以进一步处理
    //$fields:查询字段
    //$tableAndWhere:表和where条件，例如 article where id=1
    //$limit:limit...，可省略
    function getQuery($fields,$tableAndWhere,$limit=""){
        return $this->query("select $fields from $tableAndWhere $limit");
    }

    //获取mysql_query()返回的查询的结构，以进一步处理
    //$fields:查询字段
    //$tableAndWhere:表和where条件，例如 article where id=1
    //$groupField:Group字段，例如 group by username
    //$orderField:排序字段，例如 order by id desc
    //$pageIndex:页码（从1开始）
    //$pageSize:一页条数
    function getPageQuery($fields,$tableAndWhere,$groupField,$orderField,$pageIndex,$pageSize){
        return $this->query("select $fields from $tableAndWhere group by $groupField order by $orderField desc limit " . (($pageIndex-1) * $pageSize) . ", $pageSize");
    }

    //用mysql_fetch_array查询数据
    //$fields:查询字段
    //$tableAndWhere:表和where条件，例如 article where id=1
    //$groupField:Group字段，例如 group by username
    //$orderField:排序字段，例如 order by id desc
    //$pageIndex:页码（从1开始）
    //$pageSize:一页条数
    function getPageQueryAsArrays($fields, $tableAndWhere, $groupField, $orderField, $pageIndex, $pageSize){
        $query = self :: getPageQuery($fields, $tableAndWhere, $groupField, $orderField, $pageIndex, $pageSize);
        $result = array();
        $count = 0;
        while ($row = mysql_fetch_array($query)) {
            $result[$count++] = $row;
        }
        return $result;
    }

    //用mysql_fetch_row查询数据
    //$fields:查询字段
    //$tableAndWhere:表和where条件，例如 article where id=1
    function selectAsRows($fields,$tableAndWhere){
        $query=$this->query("select $fields from $tableAndWhere");
        return mysql_fetch_row($query);
    }

    //用mysql_fetch_array查询数据
    //$fields:查询字段
    //$tableAndWhere:表和where条件，例如 article where id=1
    function selectAsArrays($fields,$tableAndWhere){
        $query=$this->query("select $fields from $tableAndWhere");
        $result=array();
        $count=0;
        while($row=mysql_fetch_array($query)){
            $result[$count]=$row;
            $count++;
        }
        return $result;
    }

    //获取查询结果的数目
    //$query:mysql_query()的返回结果
    function getRowsCount($fields,$tableAndWhere){
        $query=$this->query("select $fields from $tableAndWhere");
        return mysql_num_rows($query);
    }

    //获取结果集中字段的数目
    //$query:mysql_query()的返回结果
    function getFieldCount($query){
        return mysql_num_fields($query);
    }

    //获取结果集中的制定结果
    //$query:mysql_query()的返回结果
    //$index:序号，从0开始
    function getResult($query,$index){
        return mysql_result($query, $index);
    }

    //释放与结果集相关的内存，仅需要在考虑到返回很大的结果集时会占用多少内存时调用。在脚本结束后所有关联的内存都会被自动释放。
    //$query:mysql_query()的返回结果
    function freeResult($query){
        return mysql_free_result($query);
    }

    //string,获取 MySQL 服务器信息
    function getServerVesion(){
        return mysql_get_server_info();
    }

}

?>