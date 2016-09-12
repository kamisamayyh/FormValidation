/**
 * Created by SoRa on 2016/9/12 0012.
 */
;(function($, window, document,undefined) {
    var Validate_layer = function(ele,opt){
        var message_config = {
            'required':{'rule':/\S/,'message-text':'不能为空！','type':'normal'},
            'max':{'rule':/^[-+]?\d*$/,'message-text':'数字不能过长！','type':'size'},
            'min':{'rule':/^[-+]?\d*$/,'message-text':'数字不能过短！','type':'size'},
            'email':{'rule':/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/,'message-text':'请输入正确邮箱格式！','type':'normal'},
            'string':{'rule':/^[a-zA-Z0-9_]+$/,'message-text':'请输入正常字符','type':'normal'},
            'double':{'rule':/^[-\+]?\d+(\.\d+)?$/,'message-text':'请输入正常小数',type:'normal'},
            'integer':{'rule':/^[-+]?\d*$/,'message-text':'请输入正常整数',type:'normal'},
            'letter':{'rule':/^[a-zA-Z]+$/,'message-text':'请输入英文',type:'normal'},
            'length-min':{'rule':'','message-text':'输入字符过短！','type':'length'},
            'length-max':{'rule':'','message-text':'输入字符过长！','type':'length'},
            'password':{'rule':'','message-text':'密码不一致！','type':'password'},//属性类容为重复输入的id或class
            'remote':{'message-text':'请输入正确格式！',type:"remote"}
        };
        this.$element = ele,
            this.defaults = {
                'layer': true,
                'scope': "form",//范围
                'trigger':{"dom":"form",'event-dom':"*[type='submit']",'event':'click'},//触发事件
                'layer-config':{'event':'msg','config':{}},//layer插件config
                'message':message_config,//信息初始化,
                set_message_config:{},
                set_message_obj:{},//json类型数据根据css选择器修改错误提示
                ajax_config:{},
                success_function:null,//成功之后执行函数
                error_function:null//表单验证失败函数
            },
            this.options = $.extend({},this.defaults,opt),
            this.scope = $(this.options['scope']),
            this.dom = $(this.options['trigger']['dom']),
            this.event_dom = $(this.options['trigger']['event-dom']),
            this.event = this.options['trigger']['event'],
            this.inputs = new Array();
    }
    Validate_layer.prototype = {
        set_inputs:function(){
            var inputs = this.scope.find('input');
            for(var i=0;i<inputs.length;i++){
                for(var j in this.options['message']){
                    if(inputs.eq(i).attr(j)){
                        this.inputs.push(inputs.eq(i));
                        break;
                    }
                }
            }
        },
        get_inputs:function(){
            return this.inputs;
        },
        set_message_func: function(options){
            for(var i in options){
                this.options['set_message_obj'][i] = options[i];
            }

        },
        injection_message: function(target,message,message_style){
            try{
                if ($(this.options['set_message_obj'][message_style]['target']).is(target)){
                    message['message-text'] =  this.options['set_message_obj'][message_style]['message-text'];
                }
                return [target,message];
            }catch (e){
                return [target,message];
            }
        },
        layer:function(message,dom){
            if(!this.options.layer)
                return;
            var func=eval("layer."+this.options['layer-config']['event']);
            var layer_config = this.options['layer-config']['config'];
            if(this.options['layer-config']['event'] == 'tips'){
                var timestamp=new Date().getTime();
                dom.addClass("time"+timestamp);
                var i = layer_config.indexOf(',');
                var c = layer_config.substring(i+1,layer_config.length);
                eval('new func("'+message['message-text']+'",".time'+timestamp+'",'+c+')');
                dom.removeClass("time"+timestamp);
            }
            else{
                var config = this.options['layer-config']['config'];
                eval('new func("'+message['message-text']+'",'+config+')');
            }
        },
        config_message: function(options){
            for(var i in options){
                this.options['message'][i]=options[i];
            }
        },
        $element_bind: function(){
            var $this = this;
            return this.$element.each(function(){
                switch ($this.event){
                    case 'click':
                        $this.event_dom.click(function(){
                            var is = $this.validate_click();
                            if(!is){
                                $this.options.success_function();
                                //$this.dom.submit();
                                return true;
                            }
                            else{
                                $this.options.error_function(is);
                                return false;
                            }
                        });
                        break;
                    case 'blur':
                        $this.event_dom.click(function(){
                            var is = $this.validate_click();
                            if(!is){
                                $this.options.success_function();
                                //$this.dom.submit();
                                return true;
                            }
                            else{
                                $this.options.error_function(is);
                                return false;
                            }
                        });//event_dom点击事件
                        var is = $this.validate_blur();//blur方式表单验证
                        if(!is){
                            return true;
                        }
                        else{
                            $this.options.error_function(is);
                            return false;
                        }
                }
            })
        },
        validate_layer :function(){
            var $this = this;
            this.set_message_func(this.options.set_message_obj);
            this.config_message(this.options.set_message_config);
            this.set_inputs();
            $(this.options['scope']).bind('DOMNodeInserted', function(e) {
                $this.set_message_func($this.options.set_message_obj);
                this.config_message(this.options.set_message_config);
                $this.set_inputs();
                $this.$element_bind();
            });
            return this.$element_bind();
        },
        method :function(type,dom,message){
            switch (message['type']){
                case 'normal':
                    if(!message['rule'].test($.trim(dom.val()))){
                        this.layer(message,dom);
                        dom.focus();
                        return true;
                    }
                    return false;
                    break;
                case 'size':
                    if(!message['rule'].test($.trim(dom.val()))){
                        this.layer(message,dom);
                        dom.focus();
                        return true;
                    }
                    else{
                        if(type=='max'&&parseInt($.trim(dom.val()))>parseInt(dom.attr(type))){
                            this.layer(message,dom);
                            dom.focus();
                            return true;
                        }
                        if(type=='min'&&parseInt($.trim(dom.val()))<parseInt(dom.attr(type))){
                            this.layer(message,dom);
                            dom.focus();
                            return true;
                        }
                    }
                    return false;
                    break;
                case 'length':
                    if(type=='length-max'&&dom.val().length>dom.attr(type)){
                        this.layer(message,dom);
                        dom.focus();
                        return true;
                    }
                    if(type=='length-min'&&dom.val().length<dom.attr(type)){
                        this.layer(message,dom);
                        dom.focus();
                        return true;
                    }
                    return false;
                    break;
                case 'password':
                    var re_dom =  $(dom.attr(type));
                    if(re_dom.val()!=dom.val()){
                        this.layer(message,re_dom);
                        re_dom.focus();
                        return true;
                    }
                    return false;
                    break;
                case  'remote':
                    return !this.validate_ajax_method(this.options.ajax_config,dom,type,message);
                    break;
                default:
                    break;
            }
        },
        for_each_input: function(func){
            var inputs = this.get_inputs();
            for(var i=0;i<inputs.length;i++){
                for(var j in this.options['message']){
                    if(inputs[i].attr(j)){
                        func(inputs[i],this.options['message'][j],j);
                    }
                }
            }
        },
        validate_blur: function(){
            var $this = this;
            var flag = false;
            this.for_each_input(function(input,message,message_type){
                input.blur(function(){
                    var return_value = $this.injection_message($(this),message,message_type);
                    if($this.method(message_type,return_value[0],return_value[1]))//一次
                        flag = $(this);
                    return;
                });
            });
            return flag;
        },
        validate_click: function() {
            var $this = this;
            var flag = false;
            this.for_each_input(function(input,message,message_type){
                var return_value = $this.injection_message(input,message,message_type);
                if($this.method(message_type,return_value[0],return_value[1])){
                    flag = input;
                    return;
                }
            });
            return flag;
        },
        validate_ajax_method: function(options,dom,message_type,message){
            var $this = this;
            var flag = false;
            $.ajax({
                url:dom.attr(message_type),
                async:false,
                type:'POST',
                data:dom.val(),
                success:function(data){
                    try{
                        var re_value = options['success'](dom,data);
                        flag = re_value[0];
                        if(!flag){
                            message['message-text'] = re_value[1];
                            $this.layer(message,dom);
                            dom.focus();
                        }
                    }catch (e){ }
                    return flag;
                },
                error:function(XMLHttpRequest, textStatus, errorThrown){
                    message['message-text'] = textStatus;
                    $this.layer(message,dom);
                    try{
                        options['error'](XMLHttpRequest, textStatus, errorThrown);
                    }catch (e){}
                }
            })
        }
    }
    $.fn.my_validate_layer = function(opt){
        var validate_layer = new Validate_layer(this,opt);
        return validate_layer.validate_layer();
    }
})(jQuery, window, document);