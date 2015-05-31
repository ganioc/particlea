/**
 * @fileOverview
 * @name main.js
 * @author spike yang 
 * @license MIT
 */

function base2DLoop(){
    

}

function base3DLoop(){
    

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
    
    return{
        loop:function(td){

            //console.log(td);
            
            ctx.fillStyle = 'yellow';
            ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);
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
    
    ctx = opt.context || null;

    console.log('In plane2DLoop configuration');
    
    return{
        loop:function(td){

            //console.log(td);
            
            ctx.fillStyle = 'white';
            ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height);

        },
        // setContext:function(context){
        //     ctx = context;
        // },
        houseKeeping: function(){
            console.log('housekeeping of:'+ name);

            
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
        function _triger(message){
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
                console.log('down:' + message);
                _.each(chain.message,
                       function(c){
                           c.func(event);
                       }
                      );
                return false;
            };
        }
        
        return{
            register:function(message, obj, func){


            },
            dispatch: function(message){

            },
            remove:function(message,obj){


            },
            triger:_triger

        };
    }; // end of _initInterface
    
    return {
        pre_init: function(callback){
            _initCanvas();
            interface = _initInterface();

            canvas.addEventListener(
                'mousedown',
                interface.triger('mousedown'),
                false
            );
            
        },
        initWebview:_initWebview,
        const1: _const1,
        setGameLoop: _setGameLoop,
        stopGameLoop: _stopGameLoop,
        startGameLoop: _startGameLoop,
        pauseGameLoop: _pauseGameLoop,
        getContext:function(){
            return ctx;
        },
        getCanvas:function(){
            return canvas;
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

w.initWebview();
w.pre_init();

runSplash();







