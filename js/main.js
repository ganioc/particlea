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

    var img1 = w.getImage('btn_back_white');
    var img2 = w.getImage('splash_screen');
    return{
        loop:function(td){

            //console.log(td);
            
            //ctx.fillStyle = 'yellow';
            //ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);

            ctx.drawImage(img2,0,0,img2.width,img2.height,0,0,ctx.canvas.width,ctx.canvas.height);
            ctx.drawImage(img1, 0, 0);
            
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
    
    ctx = opt.context || null;

    console.log('In plane2DLoop configuration');
    

    var widgetList = [];

    var widgetBack = new Widget(
        {
            name:'back',
            x:SPACING,
            y:SPACING,
            width:14,
            height:14,
            img : w.getImage('btn_back_black'),
            imgPressed: w.getImage('btn_back_white'),
            parent:w
        }
    );


    widgetBack.mousedownCallback = function(event){
        console.log("widgetBack clicked");
        //console.log(this.x + ' ' + this.y + ' ' + this.width + ' ' + this.height);
        if(widgetBack.getPressed()) { return; }
        if(bPointWithinRect(event.pageX, event.pageY,widgetBack.x,widgetBack.y,widgetBack.width,widgetBack.height)){
            widgetBack.setPressed();
            window.setTimeout(w.toWebview, 300);
        }

    };
    
    widgetBack.draw = function(context){
        if(!widgetBack.getPressed()){
            context.drawImage(widgetBack.img, widgetBack.x , widgetBack.y);
        }else{
            context.drawImage(widgetBack.imgPressed, widgetBack.x , widgetBack.y);
        }
    };

    widgetList.push(widgetBack);

    w.getInterface().register( 'mousedown',widgetBack, widgetBack.mousedownCallback );
    
    return{
        loop:function(td){

            //console.log(td);
            
            ctx.fillStyle = 'blue';
            ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);

            _.each(widgetList,function(c){
                c.draw(ctx);
            });

        },
        houseKeeping: function(){
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
    var canvas, ctx, _const1 = 1.02;

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
        var MIN_TD = 0.010;
        
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
                Cocoon.App.showTheWebView();
            },
            error : function(){
                console.log("Cannot show the Webview for some reason :/");
                console.log(JSON.stringify(arguments));
            }
        });
        Cocoon.App.loadInTheWebView("WV.html");
    }

    function _initCanvas(){
        canvas = document.createElement(navigator.isCocoonJS ? 'screencanvas' : 'canvas');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        canvas.id = 'canvas_2d';
        document.body.appendChild(canvas);

        // init context
        ctx = canvas.getContext("2d");
        // ctx.fillColor = 'red';
        // ctx.clearRect(0,0,ctx.canvas.width, ctx.canvas.height);
        // ctx.fillRect(0,0, 200,100);
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
    
    return {
        init: function(callback){
  
            _initWebview();
            
            // handle message dispatch, such as mouse and touch event
            interface = _initInterface();

            canvas.addEventListener(
                'mousedown',
                interface.hook('mousedown'),
                false
            );

            runSplash();
        },
        pre_init:function(opt){
            _initCanvas();
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
        getCanvas:function(){
            return canvas;
        },
        getImage:function(name){
            return _getImage(imgList,name);
        },
        getInterface:function(){
            return interface;
        }
    };
    
})();

var w = window.w;

function run2D(){
    w.setGameLoop(plane2DLoop, {context:w.getContext()});
    w.startGameLoop();
}

function runSplash(){
    w.setGameLoop(splashLoop, {context:w.getContext()});
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
        }
    ]
});

//runSplash();







