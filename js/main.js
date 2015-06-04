/**
 * @fileOverview
 * @name main.js
 * @author spike yang 
 * @license MIT
 */
function bPointWithinRect(x0,y0,x,y,w,h){
    if( !( x0 <x || x0 >(x + w) || y0 > (y + h) || y0 < y )){
        return true;
    }else{
        return false;
    }
}

function strPrintTime(){
    var d= new Date();
    return d.getMinutes()+ ':' + d.getSeconds() + ':' + d.getMilliseconds();
}

function base2DLoop(){
    var ctx;


}

function base3DLoop(){
    var ctxGL;
    

}

function Widget(opt){
    var pressed = false;
    this.name = opt.name;
    this.x = opt.x || 0;
    this.y = opt.y || 0;
    this.width = opt.width ||0;
    this.height = opt.height ||0 ;
    this.img = opt.img || null;
    this.imgPressed = opt.imgPressed || null;
    this.parent = opt.parent || null;

    Widget.prototype.getPressed= function(){
        return pressed; };
    Widget.prototype.setPressed = function(){
        pressed = true; };
    Widget.prototype.resetPressed = function(){
        pressed = false;
    };
}

/**
 * 
 * @param {} function
 * @returns {} 
 */


function splashLoop(opt){
    var ctx;

    ctx = opt.context || null;

    console.log('In splashLoop configuration');

    //var img1 = w.getImage('btn_back_white');
    var img2 = w.getImage('splash_screen');
    var imgParam = w.getCutImage(img2);

    return{
        loop:function(td){

            //console.log(td);
            
            ctx.fillStyle = 'yellow';
            ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);

            ctx.drawImage(img2,
                          imgParam.x,
                          imgParam.y,
                          imgParam.width,
                          imgParam.height,
                          0,0,ctx.canvas.width,ctx.canvas.height);

            
            ctx.fillStyle = 'white';
            ctx.font = '40px serif';
            ctx.textAlign = 'center';
            ctx.fillText('Boxshell', ctx.canvas.width/2, ctx.canvas.height/2);
            ctx.font= '20px serif';
            ctx.fillText('2015',ctx.canvas.width/2,ctx.canvas.height/2 + 40);
        },
        // setContext:function(context){
        //     ctx = context;
        // },
        houseKeeping: function(){
            console.log('housekeeping of splashloop');
            ctx.fillStyle = 'black';
            ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);            
        }
    };
}


/**
 * 
 * @param {} function
 * @returns {} 
 */
function plane2DLoop(opt){
    var ctx;
    var name = "plane2DLoop";
    var SPACING = 5;
    var imgBeautiful = w.getImage('beautiful');
    
    
    ctx = opt.context || null;

    console.log('In plane2DLoop configuration');
    

    var widgetList = [];

    var widgetBack = new Widget(
        {
            name:'back',
            x:ctx.canvas.width - 20 - SPACING,
            y:SPACING,
            width:20,
            height:20,
            img : w.getImage('btn_back_black'),
            imgPressed: w.getImage('btn_back_white'),
            parent:w
        }
    );


    widgetBack.mousedownCallback = function(event){
        console.log("widgetBack clicked");
        event.preventDefault();
        //console.log(this.x + ' ' + this.y + ' ' + this.width + ' ' + this.height);
        if(widgetBack.getPressed()) { return; }
        if(bPointWithinRect(event.pageX, event.pageY,widgetBack.x,widgetBack.y,widgetBack.width,widgetBack.height)){
            widgetBack.setPressed();
            window.setTimeout(w.toWebview, 300);
        }


    };
    widgetBack.touchstartCallback = function(event){
        console.log("widgetBack touched");
        //console.log(this.x + ' ' + this.y + ' ' + this.width + ' ' + this.height);
        if(widgetBack.getPressed()) { return; }
        if(bPointWithinRect(event.touches[0].pageX, event.touches[0].pageY,widgetBack.x,widgetBack.y,widgetBack.width,widgetBack.height)){
            widgetBack.setPressed();
            window.setTimeout(w.toWebview, 300);
        }
    };    
    
    widgetBack.draw = function(context){
        if(!widgetBack.getPressed()){
            context.drawImage(widgetBack.img, 0,0,widgetBack.img.width,widgetBack.img.height,widgetBack.x , widgetBack.y, widgetBack.width, widgetBack.height);
        }else{
            context.drawImage(widgetBack.imgPressed, 0,0, widgetBack.imgPressed.width, widgetBack.imgPressed.height,widgetBack.x , widgetBack.y,widgetBack.width, widgetBack.height);
        }
    };

    widgetList.push(widgetBack);

    w.getInterface().register( 'mousedown',widgetBack, widgetBack.mousedownCallback );
    w.getInterface().register( 'touchstart',widgetBack, widgetBack.touchstartCallback );

    var imgBeautifulParam = w.getCutImage(imgBeautiful);
    
    return{
        loop:function(td){

            //console.log(td);
            
            //ctx.fillStyle = 'blue';
            //ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);

            ctx.drawImage(imgBeautiful,
                          imgBeautifulParam.x,
                          imgBeautifulParam.y,
                          imgBeautifulParam.width,
                          imgBeautifulParam.height,
                          0,
                          0,
                          ctx.canvas.width,
                          ctx.canvas.height
                         );

            _.each(widgetList,function(c){
                c.draw(ctx);
            });

        },
        houseKeeping: function(){
            console.log('housekeeping of:'+ name);
            w.getInterface().clear();

        }
    };
} // end of plane2DLoop

function threeDLoop(opt){
    var name = 'threeDLoop';
    var ctx = opt.context;
    var ctxGL = opt.contextGL;

    console.log('into threeDLoop');

    //ctx.canvas.style.background = 'rgba(0,0,0,1)';
    //ctx.canvas.style.display = "none";
    //ctx.canvas.style.background = 'rgba(255,255,0,0.2';
    ctx.fillColor='rgba(255,255,0,0.5)';
    ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
    ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);
    
    return{
        loop:function(td){
            //ctxGL.clearColor();

        },
        housekeeping:function(){
            console.log('housekeeping of:'+ name);
            w.getInterface().clear();

        }
    };
}

/**
 * 
 * @param {} function
 * @returns {} 
 */


window.w = (function(){
    //global variable definition
    var canvas, ctx;
    var canvasGL, ctxGL;
    
    var currentGameLoop = null,
        bGameRunning = false;

    var interface = null;

    var imgList = [];
    var numImageLoaded = 0;

    //
    function _getImage(ilist,name){
        var result = _.find(ilist,function(c){
            return c.name === name;
        });
        if(!result) { throw 'image ' + name + ' not found.'; }
        return result;
    }
    function init_images(img_path, img_list,callback){
        
        for(var i=0;i < img_path.length; i++){
            img_list[i] = new Image();
            img_list[i].src = img_path[i].path;
            img_list[i].name = img_path[i].name;
            img_list[i].onload = function(){
                numImageLoaded += 1;
                if(numImageLoaded === img_path.length){
                    console.log('img loaded.');
                    callback();
                }
            };
        }
    }
    // to generate a game loop
    function createGameLoop(handler, callback){
        var start;
        var MIN_TD = 0.006;
        
        return function(timestamp){
            if(!start){
                start = timestamp;
            }
            
            var td = (timestamp - start)/1000; // in micro second
            start = timestamp;

            if(!bGameRunning){
                console.log('out of game loop');
                //remove callback , do some housekeeping here
                callback();
            }
            else if(td > MIN_TD){
                handler(td);
                window.requestAnimationFrame(currentGameLoop);
            }
            else{
                window.requestAnimationFrame(currentGameLoop);
            }
        };
    }    
    
    function _initWebview(){
        Cocoon.App.WebView.on("load",{
            success : function(){
                //Cocoon.App.showTheWebView();
                console.log('initwebview success' + strPrintTime());
                window.setTimeout(function(){
                    Cocoon.App.showTheWebView();
                    console.log('begin to show the webview' + strPrintTime());
                },3000
                );
            },
            error : function(){
                console.log("Cannot show the Webview for some reason :/");
                console.log(JSON.stringify(arguments));
            }
        });
        Cocoon.App.loadInTheWebView("WV.html");
        console.log('start to load webview' + strPrintTime());
    }

    function _initCanvas(){
        canvas = document.createElement(navigator.isCocoonJS ? 'screencanvas' : 'canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.id = 'canvas_2d';
        document.body.appendChild(canvas);

        // init context
        ctx = canvas.getContext("2d");

        canvasGL = document.createElement(navigator.isCocoonJS ? 'screencanvas' : 'canvas');
        canvasGL.width = window.innerWidth;
        canvasGL.height = window.innerHeight;
        canvasGL.id = "canvas_3d";
        document.body.appendChild(canvasGL);

        try{
            ctxGL = canvasGL.getContext('experimental-webgl');
            ctxGL.viewportWidth = canvasGL.width;
            ctxGL.viewPortHeight = canvasGL.height;
        }
        catch(e){
            console.log('webgl init failure');
        }
        if(!ctxGL){
            console.log('no gl.');
        }
        else{
            console.log('gl exist');
            ctxGL.clearColor(0,0,0,1);
            ctxGL.clear(ctxGL.COLOR_BUFFER_BIT);
        }
    }
    //_initCanvas();

    function _setGameLoop( handler,opt){
        console.log('set game loop');
        var tmp = handler(opt);

        //tmp.setContext(ctx);
        currentGameLoop = createGameLoop(tmp.loop, tmp.houseKeeping);

    }

    function _stopGameLoop(){
        bGameRunning = false;
    }

    function _pauseGameLoop(){
        bGameRunning = false;
    }

    function _startGameLoop(){
        bGameRunning = true;
        window.requestAnimationFrame(currentGameLoop);
        console.log('startGameloop');

    }

    function messageObj(opt){
        this.obj = opt.obj;
        this.message = opt.message;
        this.callback = opt.callback;

    }
    
    // touch callback
    /**
     dispatch(message)

     register(obj, message)

     every obj registered has a function: obj.message()
     every obj has a messageObj

     { 
       name:,
       callback:
     }
     */
    function _initInterface(){
        var chain = {
            touchstart:[],
            touchmove:[],
            mousedown:[],
            touchend:[]
        };

        // loop the message list to triger the func
        // init point won't be in the list
        function _hook(message){
            // check if message is in chain.keys
            if( !( _.contains( _.keys(chain) ,message)) ){
                console.log(message);
                console.log(typeof message);
                console.log(_.keys(chain));
                console.log( message in _.keys(chain));
                console.log('Error: message' + '"'+ message + '"' + 'not in chain');
                return null;
            }
            else{
                console.log('Register Event:' + message);
            }
            return function(event){
                console.log('event:' + message);
                _.each(chain[message],
                       function(c){
                           c.func(event);
                       }
                      );
                return false;
            };
        }
        
        return{
            register:function(message, obj, func){
                if( _.contains(_.keys(chain), message)){
                    chain[message].push(
                        {
                            name:obj.name,
                            func:func
                        }
                    );
                }
            },
            dispatch: function(message,event){
                _.each(chain[message],
                       function(c){
                           c.func(event);
                       }
                      );
            },
            remove:function(message,obj){
                chain[message] = _.reject(chain[message],
                                          function(c){
                                              if(c.name === obj.name){
                                                  return true;
                                              }
                                              else
                                                  return false;
                                          }
                                         );

            },
            hook:_hook,
            clear:function(){
                console.log('Clear interface list');
                _.each(_.keys(chain),function(c){
                    chain.c = [];
                });
                
            }
        };
    }; // end of _initInterface

    function addHook(obj, inter,message){
        obj.addEventListener(message,inter.hook(message),false);
    }

    // return function window.w
    return {
        init: function(callback){
            // handle message dispatch, such as mouse and touch event
            console.log('into init' + strPrintTime());
            runSplash();
            
            interface = _initInterface();

            addHook(canvas, interface, 'mousedown');
            addHook( canvas, interface, 'touchstart');

            console.log('begin init webview' + strPrintTime());
            
            _initWebview();
            
        },
        pre_init:function(opt){
            console.log('init canvas' + strPrintTime());
            _initCanvas();
            console.log('init images' + strPrintTime());
            init_images(opt.img_path, imgList, w.init);
        },
        initWebview:_initWebview,
        // const1: _const1,
        setGameLoop: _setGameLoop,
        stopGameLoop: _stopGameLoop,
        startGameLoop: _startGameLoop,
        pauseGameLoop: _pauseGameLoop,
        toWebview:function(){
            w.stopGameLoop();
            //var canvas = w.getCanvas();
            Cocoon.App.forwardAsync("Cocoon.WebView.show(0, 0, " + ctx.canvas.width * window.devicePixelRatio + "," + ctx.canvas.height * window.devicePixelRatio + ");");
            Cocoon.Touch.disable();
        },
        getContext:function(){
            return ctx;
        },
        getContextGL:function(){
            return ctxGL;
        },        
        getCanvas:function(){
            return canvas;
        },
        getImage:function(name){
            return _getImage(imgList,name);
        },
        getInterface:function(){
            return interface;
        },
        getAspectRatio: function(){
            return ctx.canvas.width/ctx.canvas.height;
        },
        getCutImage: function(img){
            var imgAspect = img.width/img.height;
            var canvasAspect = ctx.canvas.width / ctx.canvas.height;
            var x0,y0,width0,height0;

            if(imgAspect< canvasAspect){
                width0 = img.width;
                x0 = 0;
                height0 = img.width/canvasAspect;
                y0 = (img.height - height0)/2;
            }
            else{
                height0 = img.height;
                y0 = 0;
                width0 = height0 * canvasAspect;
                x0 = (img.width - width0)/2;
            }
            return {
                x:x0,
                y:y0,
                width:width0,
                height:height0
            };
        }
    };
    
})();


function run2D(){
    w.setGameLoop(plane2DLoop, {context:w.getContext()});
    w.startGameLoop();
}

function runSplash(){
    w.setGameLoop(splashLoop, {context:w.getContext()});
    w.startGameLoop();
}

function run3DCube(){
    console.log('run3DCube');
    w.setGameLoop(threeDLoop, {
        context:w.getContext(),
        contextGL:w.getContextGL()}
                 );
    w.startGameLoop();

    
}

//w.initWebview();

w.pre_init({
    img_path:[
        { path:'css/images/icons-png/back-white.png',
          name:'btn_back_white'
        },
        { path:'css/images/icons-png/back-black.png',
          name:'btn_back_black'
        },
        {
            path:'img/splash.png',
            name:'splash_screen'
        },
        {
            path:'img/beautiful.png',
            name:'beautiful'
        }        
    ]
});

//runSplash();







