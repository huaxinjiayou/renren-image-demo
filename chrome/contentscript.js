(function(){
    var USERID = 495495992; // 用户id
    var DURATION = 10 * 60 * 1000; // 数据过期时间
    var MAXCOUNT = 50; // 每个相册照片上限，貌似是1000张，值不宜过大：ajax请求数据会很大
    var albumId = 834421344; // 默认相册id，备胎
    var minWidth = minHeight = 150; // 最小尺寸
    var icoWidth = 78, icoHeight = 25; // 图标尺寸

    // 一些链接
    var urls = {
        // 保存照片到人人
        saveImageToRenren: {
            url: "http://widget.renren.com/dialog/forward/post",
            method: "post",
            data: {
                title: "",
                content: "", 
                type: "photo",
                api_key: "7f96c3fbe7a8400d96e2147780d1734f",
                appId: 182707,
                from: "",
                originType: "photo",
                url: "",
                image: "",
                albumId: "",
                _rtk: ""
            }
        },

        // 判断是否登录
        login2Renren: {
            url: "http://notify.renren.com/wpi/getfullrecentfriends.do?time=",
            method: "get"
        },

        // 获取requestToken和_rtk
        getPostInfo: {
            url: "http://renren.com?time=",
            method: "get"
        },

        // 获取全部相册信息
        getAllAlbums: {
            url: "http://photo.renren.com/photo/" + USERID + "/album/common/ajax",
            method: "get"
        },

        // 获取相册下的照片id
        getAllImageIdsByAlbum: {
            url: "http://photo.renren.com/photo/" + USERID + "/album-<albumId>/ajax",
            data: {
                curpage: 0
            },
            method: "post"
        },
        
        // 获取相册下所有照片信息
        getAllImagesInfoByAlbum: {
            url: "http://photo.renren.com/photo/" + USERID + "/photo-<photoId>/layer",
            method: "get"
        },

        // 创建新相册
        createNewAlbum: {
            url: "http://widget.renren.com/dialog/forward/createAlbum",
            method: "post",
            data: {
                albumName: "",
                authority:-1,
                passowrd: ""
            }
        },
        
        // 保存照片到本地
        savePhoto2Local: {
            url: "http://localhost:8080/saverenrenimageurl.php",
            method: "post",
            data: {
                note: "",
                url: "",
                width: "",
                height: ""
            }
        }
    };

    var SaveMessageToRenren = function(userId){
        this.userId = userId;
        this.albumId = albumId;

        this.requestToken = this._rtk = null; // 保存需要用的两个字段
        this.btn = this.image = null; // 保存按钮，目标图片

        this.init();
    };

    SaveMessageToRenren.prototype = {
        constructor: SaveMessageToRenren,

        init: function(){
            var self = this;
            this.createBtn();

            // 删除就有数据
            this.delData("requestToken");
            this.delData("_rtk");

            // 获取参数
            this.sureArgReady(function(){
                this.addEvent();
            });
        },

        // 创建按钮
        createBtn: function(){
            var btn = document.createElement("a");
            var bsyl = "width:" + icoWidth + "px;height:" + icoHeight + "px;position:absolute;z-index:9999;background:no-repeat transparent;display:none;padding:0;margin:0;border:0;";
            btn.setAttribute("href", "javascript:;");
            btn.setAttribute('title', "保存图片到人人网");
            btn.setAttribute('style', bsyl);
            btn.style.cssText = bsyl;
            (document.body || document.getElementsByTagName('body')[0]).appendChild(btn);
            this.btn = btn;
        },


        // 增加事件
        addEvent: function(){
            var self = this;

            document.addEventListener("mouseover", function(e){
                var el = e.target;

                if(el.nodeName.toLowerCase() != "img"){
                    return;
                }

                var width = el.offsetWidth;
                var height = el.offsetHeight;
                if(width < minWidth && height < minHeight){
                    return;
                }

                self.image = el;
                var bound = el.getBoundingClientRect();
                self.show(bound.right, bound.bottom);

                // 绑定事件
                el.addEventListener("mouseout", function(e){
                    self.btn.style.display = "none";
                    this.removeEventListener("mouseout", arguments.callee);
                });

            }, false);

            this.btn.addEventListener("mouseover", function(){
                this.style.display = "inline-block";
            }, false);

            this.btn.addEventListener("mouseout", function(){
                this.style.display = "none";
            });

            this.btn.addEventListener("click", function(){
                self.saveImage(self.image.src, self.savePhoto2Local);
            });
        },

        // 显示按钮
        show: function(x, y){
            var sp = {
                x : window.pageXOffset || (document.documentElement || document.body).scrollLeft,
                y : window.pageYOffset || (document.documentElement || document.body).scrollTop
            };

            x = x - 5 - icoWidth;
            y = y - 5 - icoHeight;

            var btn = this.btn;
            btn.style.left = x + sp.x + "px";
            btn.style.top = y + sp.y + "px";
            btn.style.backgroundImage = "url(" + chrome.extension.getURL('icon-show.png') + ")";
            btn.style.display = "inline-block";
        },

        // 错误提示
        error: function(name){
            return function(){
                alert(name + "，请求失败：未登录或者网络问题");
            }
        },

        // 时间信息
        getDateValue: function(){
            var date = new Date();
            var year = date.getFullYear(),
                month = date.getMonth() + 1,
                day = date.getDate(),
                hour = date.getHours(),
                minute = date.getMinutes(),
                second = date.getSeconds();
            return {
                str: [year, month, day, hour, minute, second].join("_"),
                num: date.valueOf()
            };
        },

        setData: function(name, value, hasTime){
            localStorage[name] = value;
            if(hasTime){
                localStorage[name + "_timer"] = this.getDateValue().num;
            }
        },

        getData: function(name){
            if(localStorage[name + "_timer"]){
                var timeLast = localStorage[name + "_timer"];
                var timeNow = this.getDateValue().num;
                if(timeNow - timeLast > DURATION){
                    return null;
                }
            }
            return localStorage[name];
        },

        // 删除数据
        delData: function(name){
            if(localStorage[name]){
                localStorage.removeItem(name);
            }
            if(localStorage[name + "_timer"]){
                localStorage.removeItem(name + "_timer");
            }
        },

        // 将对象变成ajax数据格式
        object2Str: function(obj){
            var str = [];
            for(var name in obj){
                if(obj.hasOwnProperty){
                    str.push(name + "=" + obj[name]);
                }
            }
            return str.join("&");
        },

        // 拓展属性
        extend: function(obj, objNew){
            for(var name in objNew){
                if(objNew.hasOwnProperty(name)){
                    obj[name] = objNew[name];
                }
            }
        },

        // ajax请求
        ajax: function(o){
            var xhr = new XMLHttpRequest();

            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    var result, error = false;
                    if ((xhr.status >= 200 && xhr.status < 300) || (xhr.status == 0)) {
                        result = xhr.responseText;
                        o.success && o.success(result);
                    } else {
                        o.error && o.error();
                    }
                }
            };

            xhr.open(o.method || 'GET', o.url, true);

            if (o.method.toLowerCase() == 'post') {
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            }

            if(typeof o.data == "object"){
                o.data = this.object2Str(o.data);
            }

            xhr.send(o.data || null);
        },

        // 进一步封装ajax请求
        ajaxWithObj: function(name, data, success, error){
            var self = this;
            var info = urls[name];

            info.data && data && this.extend(info.data, data);

            self.ajax({
                url: info.url,
                method: info.method,
                data: info.data,
                success: function(result){
                    success && success.call(self, result);
                },
                error: function(){
                    error && error.call(self);
                }
            })
        },

        // 登录人人网
        login2Renren: function(success){
            var self = this;

            urls["login2Renren"].url += this.getDateValue().num;

            setTimeout(function(){
                // 当前函数
                var func = arguments.callee;

                self.ajaxWithObj("login2Renren", null, function(result){
                    if(result.indexOf('failure') != -1){
                        if(!self.getData("hasNoted")){ // 没有提醒过
                            self.setData("hasNoted", "1", true);

                            alert('请登录人人网并选择记住登录状态！');

                            // 打开新tab登录
                            chrome.extension.sendRequest({type : 'opentag'}, function(response) {
                            });
                        }

                        setTimeout(func, 2500); // 定时发送请求
                    } else{
                        success.call(self);
                    }
                }, function(){
                    if(!self.getData("hasNoted")){
                        self.setData("hasNoted", "1", true);
                        self.error("登录人人网");    
                    }
                    
                    setTimeout(func, 2500); // 定时发送请求
                });
            }, 0);
        },

        // 获取相关参数
        sureArgReady: function(cb){
            var timeNow = this.getDateValue().num;

            // 有缓存 && 缓存没过期
            if(this.getData("requestToken") && this.getData("_rtk")){
                this.requestToken = this.getData("requestToken");
                this._rtk = this.getData("_rtk");
                this.getAllAlbums(cb);
                return;
            }


            this.login2Renren(function(){
                var self = this;

                urls["getPostInfo"].url += this.getDateValue().num;

                self.ajaxWithObj("getPostInfo", null, function(result){
                    self.requestToken = /get_check:'(.*?)'/.exec(result)[1];
                    self._rtk = /get_check_x:'(.*?)'/.exec(result)[1];

                    self.setData("requestToken", self.requestToken, true);
                    self.setData("_rtk", self._rtk, true);
                    self.getAllAlbums(cb);
                }, this.error("获取requestionToken和_rtk信息"));

            });
        },

        // 保存照片到人人
        saveImage: function(imageSrc, cb){
            this.sureArgReady(function(){
                var self = this;
                var data = {
                    title: this.getDateValue().str,
                    image: imageSrc,
                    albumId: this.albumId,
                    _rtk: this._rtk
                };

                this.ajaxWithObj("saveImageToRenren", data, function(result){
                    if(result != "{}"){
                        (self.error("保存照片到人人"))();
                        return;
                    }
                    cb && cb.call(self, result);
                }, this.error("保存照片到人人"));
            });

        },

        // 保存照片到本地
        savePhoto2Local: function(){
            var self = this;

            this.getAllImagesInfoByAlbum(function(photos){
                var photo = photos[0];
                var data = {
                    url: photo.large,
                    height: photo.largeHeight,
                    width: photo.largeWidth
                }
                self.ajaxWithObj("savePhoto2Local", data, function(result){
                    console.log(result);
                    alert("OK");
                }, this.error("保存照片到本地"));
            });
        },

        // 获取全部相册
        getAllAlbums: function(cb){
            var self = this;

            this.ajaxWithObj("getAllAlbums", null, function(result){
                result = JSON.parse(result);
                if(result.code != 0){
                    (self.error("获取相册信息"))();
                    return;
                }

                result = result.list;
                if(result.length == 0 || result[0].photoCount >= MAXCOUNT){ // 超过限制，则新建相册
                    self.createNewAlbum(cb);
                } else{ // 如果照片不到500张
                    self.albumId = result[0].id;
                    cb && cb.call(self, result);
                }
            }, this.error("获取相册信息"));
        },

        // 创建新相册
        createNewAlbum: function(cb){
            var self = this;
            this.ajaxWithObj("createNewAlbum", {albumName: this.getDateValue().str}, function(result){
                var result = /albumId.*?(\d+)/.exec(result);
                if(!result || result.length != 2){
                    (self.error("创建新相册"))();
                    return;
                }

                self.albumId = result[1];
                cb && cb.call(self, result);
            }, this.error("创建新相册"));
        },

        // 获取全部图片id
        getAllImageIdsByAlbum: function(cb){
            var self = this;

            var url = urls["getAllImageIdsByAlbum"].url;
            urls["getAllImageIdsByAlbum"].url = urls["getAllImageIdsByAlbum"].url.replace("<albumId>", this.albumId);

            this.ajaxWithObj("getAllImageIdsByAlbum", null, function(result){
                result = JSON.parse(result);
                if(!result.data){
                    (self.error("获取种子照片id"))();
                    return;
                }
                result = result.data;
                cb && cb.call(self, result);
            }, this.error("获取种子照片id"));

            urls["getAllImageIdsByAlbum"].url = url;
        },

        // 获取相册下所有照片信息
        getAllImagesInfoByAlbum: function(cb){
            this.getAllImageIdsByAlbum(function(ids){
                var self = this;

                var url = urls["getAllImagesInfoByAlbum"].url;
                urls["getAllImagesInfoByAlbum"].url = urls["getAllImagesInfoByAlbum"].url.replace("<photoId>", ids[0].id);

                this.ajaxWithObj("getAllImagesInfoByAlbum", null, function(result){
                    result = JSON.parse(result);
                    if(!result.list || result.list.length == 0){
                        (this.error("获取相册下所有照片信息"))();
                        return;
                    }
                    cb && cb.call(self, result.list);

                }, this.error("获取相册下所有照片信息"));

                // 还原链接
                urls["getAllImagesInfoByAlbum"].url = url;

            });
        }

    };


    var saveImage = new SaveMessageToRenren(USERID);

})();
