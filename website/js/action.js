(function(){
    var URL = "http://localhost:8080/loadimage.php?page=";
    var LIMIT = 200;
    var WIDTH = 240;
    var MARGIN = 15;
    var LEFT = [0, 240 + 15, 480 + 30, 720 + 45];

    var Flow = function(){
        this.pageIndex = 1;
        this.over = false;
        this.ajaxing = false;

        this.position = [0, 0, 0, 0];

        this.init();
    };

    Flow.prototype = {
        contructor: Flow,

        init: function(){
            this.addEvent();
        },

        addEvent: function(){
            var self = this;

            $(document).ready(function(){
                self.content = $("#content");

                self.getData(self.pageIndex, self.showData);

                //滚轮事件
                $(window).bind("scroll", function(){
                    var func = arguments.callee;

                    var dh = $(document).height();
                    var wh = $(this).height();
                    var st = $(this).scrollTop();

                    if(dh - st - wh > LIMIT || self.ajaxing){
                        return;
                    }


                    if(dh - st - wh < LIMIT){
                        self.getData(self.pageIndex, function(result){
                            this.ajaxing = true;
                            this.showData(result);

                            // 全部加载完成，取消事件
                            if(this.over){
                                $(window).unbind("scroll", func);
                            }
                        });
                    }

                });

            });
        },

        getData: function(page, cb){
            var self = this;

            $.get(URL + this.pageIndex, function(result){
                result = $.parseJSON(result);
                if(result.code == 1){
                    self.over = true;
                    result = [];
                } else{
                    result = result.data;
                }
                cb && cb.call(self, result);
                
                self.pageIndex++;
            });
        },

        getSpecial: function(){
            var min = max = 0;
            var position = this.position;
            for(var i = 1; i < position.length; i++){
                if(position[i] > position[i - 1]){
                    max = i;
                } else{
                    min = i;
                }
            }
            return {min: min, max: max};
        },

        getHeight: function(width, height){
            return Math.floor(WIDTH * height / width);
        },

        showData: function(result){
            var self = this;

            if(result.length == 0){
                return;
            }

            var str = "";
            var height = index = 0;
            $.each(result, function(i, v){
                height = self.getHeight(v.width, v.height);
                index = self.getSpecial().min;

                str += '<div class="item" style="left:' + LEFT[index] + 'px;top:' + self.position[index] + 'px;"><a href="' + v.url + '"><img onerror="imageError(this)" height="' + height + 'px" src="' + v.url + '" /></a></div>';

                self.position[index] += height + MARGIN + 2;
            });

            index = this.getSpecial().max;
            this.content.height(this.position[index] + (this.over ? 50 : 200));

            var str = $(str);
            this.content.append(str);

            str.fadeIn(1000, function(){
                self.ajaxing = false;

                $("a", str).fancybox({
                    'transitionIn'  : 'elastic',
                    'transitionOut' : 'elastic'
                });
            });
        }

    }


    var flow = new Flow();

    window.imageError = function(self){
        var self = $(self);
        var parent = self.parent();
        parent.height(self.height());
        parent.width(self.width());
        self.hide();
    }
})();