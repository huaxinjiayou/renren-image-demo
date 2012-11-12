<?php
/*
 * Created on 2012-3-17
 * Modify on 2012-11-10
 */

class SqlAction{
    
    //获取某张表全部信息
    static function getAllInfo($tableName){
        $sql=new MySql(MySqlConfig::$host,MySqlConfig::$name,MySqlConfig::$password,MySqlConfig::$datebase,MySqlConfig::$ut);
        $fields="*";
        $tableAndWhere="`$tableName`";
        $result=$sql->selectAsArrays($fields,$tableAndWhere);
        $sql->close();
        return $result;
    }
    
    //根据指定字段获取信息
    static function getSelectedInfo($tableName,$array){
        $sql=new MySql(MySqlConfig::$host,MySqlConfig::$name,MySqlConfig::$password,MySqlConfig::$datebase,MySqlConfig::$ut);
        $fields="*";
        $tableAndWhere="`$tableName` where ";
        $flag=false;
        foreach($array as $key=>$value){
            if($flag){
                $tableAndWhere.=" and ";
            }
            $tableAndWhere.="`$key`='".$value."'";
            $flag=true;
        }
        $result=$sql->selectAsArrays($fields,$tableAndWhere);
        $sql->close();
        return $result;
    }

    // 获取分页数据
    static function getPagedInfo($tableName, $array, $pageIndex, $perCount){
        $sql = new MySql(MySqlConfig::$host,MySqlConfig::$name,MySqlConfig::$password,MySqlConfig::$datebase,MySqlConfig::$ut);
        $fields = "*";
        $tableAndWhere = "`$tableName` where";
        $flag = false;
        foreach ($array as $key => $value) {
            if($flag){
                $tableAndWhere .= " and ";
            }
            $tableAndWhere .= "`$key` = '" . $value . "'";
            $flag = true;
        }
        $result = $sql -> getPageQueryAsArrays($fields, $tableAndWhere, "id", "id", $pageIndex, $perCount);
        $sql -> close();
        return $result;
    }
    
    //增加一条信息
    //$tableName:表名,$model:表实例
    static function createOneInfo($tableName,$model){
        $sql=new MySql(MySqlConfig::$host,MySqlConfig::$name,MySqlConfig::$password,MySqlConfig::$datebase,MySqlConfig::$ut);
        $flag=false;
        $fields="";
        $values="";
        foreach($model->tableFields as $key=>$value){
            if($value=="id") continue;
            if($flag){
                $fields.=",";
                $values.=",";
            }
            $fields.="`$value`";
            $values.=$value=="createTime"&&$model->$value=="now()"?$model->$value:$model->$value=="NULL"?$model->$value:"'".$model->$value."'";
            $flag=true;
        }
        $sql->insert("`$tableName`",$fields,$values);
        $id=$sql->getLastInsertId();
        $sql->close();
        return $id;
    }
    
    //删除指定的内容
    static function deleteSelectedInfo($tableName,$array){
        $sql=new MySql(MySqlConfig::$host,MySqlConfig::$name,MySqlConfig::$password,MySqlConfig::$datebase,MySqlConfig::$ut);
        $tableAndWhere="`$tableName` where ";
        $flag=false;
        foreach($array as $key=>$value){
            if($flag){
                $tableAndWhere.=" and ";
            }
            $tableAndWhere.="`$key`='".$value."'";
            $flag=true;
        }
        $sql->delete($tableAndWhere);
        $count=$sql->getAffectedRows();
        $sql->close();
        return $count;
    }
    
}
?>