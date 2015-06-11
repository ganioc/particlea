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

function Widget(opt){
    this.pressed = false;
    this.name = opt.name;
    this.x = opt.x || 0;
    this.y = opt.y || 0;
    this.width = opt.width ||0;
    this.height = opt.height ||0 ;
    this.img = opt.img || null;
    this.imgPressed = opt.imgPressed || null;
    this.parent = opt.parent || null;

    Widget.prototype.getPressed= function(){
        return this.pressed; };
    Widget.prototype.setPressed = function(){
        this.pressed = true; };
    Widget.prototype.resetPressed = function(){
        this.pressed = false;
    };
}


function threeDLoop(opt){
    var name = 'threeDLoop';
    var ctxGL = opt.contextGL;
    var projectionMatrix, modelViewMatrix;
    var shaderProgram, shaderVertexPositionAttribute,
        shaderProjectionMatrixUniform,
        shaderModelViewMatrixUniform;

    var vertices;
    var counter = 0;
    
    console.log('into threeDLoop');

    function createSquare(gl,td,c){
        var vertexBuffer;

        vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);// binding buffer
        var verts = [
            Math.cos(Math.PI * c)*0.5, 0.5*Math.sin(Math.PI*c), 0.0,
                -0.5*Math.sin(Math.PI*c/4),0.5,0.0,
            0.5*Math.sin(Math.PI* c*2),-0.5,0.0,
                -0.5* Math.cos(Math.PI* c/6),-0.5,0.0
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
        // send data to buffer
        var square = {
            buffer: vertexBuffer,
            vertSize:3,
            nVerts:4,
            primtype:gl.TRIANGLE_STRIP
        };
        return square;
    }

    function initMatrices(canvas){
        modelViewMatrix = mat4.create();
        mat4.translate( modelViewMatrix, modelViewMatrix, [0,0,-3.333]);

        projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, Math.PI/4,
                         canvas.width/canvas.height, 1, 10000);
    }

    function createShader(gl, str, type){
        var shader;
        if(type === 'fragment'){
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        }else if( type === 'vertex'){
            shader = gl.createShader(gl.VERTEX_SHADER);
        }
        else{
            return null;
        }

        gl.shaderSource(shader,str);
        gl.compileShader(shader);

        if( !gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
            console.log(gl.getShaderInfoLog(shader
                                           ));
            return null;
        }
        
        return shader;
    }

    var vertexShaderSRC =
            "attribute vec3 vertexPos;\n" +
            "uniform mat4 modelViewMatrix; \n" +
            "uniform mat4 projectionMatrix; \n" +
            "void main(void){\n" +
            "  gl_Position= projectionMatrix * modelViewMatrix * vec4(vertexPos,1.0);\n" +
            "}\n";
    
    var fragmentShaderSRC =
            "void main(void){\n" +
            "    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);\n" +
            "}\n";

    function initShader(gl){
        var fragmentShader = createShader(gl,fragmentShaderSRC, "fragment");
        var vertexShader = createShader(gl, vertexShaderSRC, "vertex");

        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        shaderVertexPositionAttribute=
            gl.getAttribLocation(shaderProgram,"vertexPos");
        gl.enableVertexAttribArray(shaderVertexPositionAttribute);

        shaderProjectionMatrixUniform =
            gl.getUniformLocation(shaderProgram, "projectionMatrix");
        shaderModelViewMatrixUniform =
            gl.getUniformLocation(shaderProgram, "modelViewMatrix");

        if( !gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
            console.log("Could not init shaders");
        }

    }
    
    function draw(gl, obj, c){

        gl.clearColor( Math.abs(Math.cos(Math.PI * c)), 0.0, 0.0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        //console.log(td);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);

        gl.useProgram(shaderProgram);

        gl.vertexAttribPointer( shaderVertexPositionAttribute,
                                obj.vertSize,
                                gl.FLOAT,
                                false,
                                0,
                                0
                              );
        gl.uniformMatrix4fv(shaderProjectionMatrixUniform,
                            false,
                            projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform,
                            false,
                            modelViewMatrix);
        
        gl.drawArrays(obj.primtype, 0, obj.nVerts);

    }

    ctxGL.viewport(0, 0, ctxGL.canvas.width, ctxGL.canvas.height);
    initMatrices(w.getCanvas());//init modelViewMatrix, projectionMatrix

    initShader(ctxGL);// init vertex fragment shader
    
    return{
        loop:function(td){
            counter += td;
            vertices = createSquare(ctxGL,td, counter);// create vertice array
            draw(ctxGL, vertices ,counter);

        },
        houseKeeping:function(){
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
    //var canvas, ctx;
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
                },2000
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
        canvasGL = document.createElement(navigator.isCocoonJS ? 'screencanvas' : 'canvas');
        canvasGL.width = window.innerWidth * window.devicePixelRatio;
        canvasGL.height = window.innerHeight * window.devicePixelRatio;
        canvasGL.id = 'canvas_3d';
        document.body.appendChild(canvasGL);
        
        // init context
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
    function _clearCanvas(){
        //remove canvas_2d
        //document.body.removeChild(canvas);
        //ctx = null;
        //canvas = null;
    }
    
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
                else{
                    console.log(message + ' dont exist');
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
    interface = _initInterface();

    function _addHook(obj, inter,message){
        obj.addEventListener(message,inter.hook(message),false);
    }

    // return function window.w
    return {
        init: function(callback){
            // handle message dispatch, such as mouse and touch event
            console.log('into init' + strPrintTime());
            runSplash();

            _addHook(canvasGL, interface, 'mousedown');
            _addHook(canvasGL, interface, 'touchstart');
            
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
        initCanvas:_initCanvas,
        clearCanvas:_clearCanvas,
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
        getContextGL:function(){
            return ctxGL;
        },        
        getImage:function(name){
            return _getImage(imgList,name);
        },
        getCanvas: function(){
            return canvasGL;
        },
        getInterface:function(){
            return interface;
        },
        getAspectRatio: function(){
            return ctxGL.canvas.width/ctxGL.canvas.height;
        },
        getCutImage: function(img){
            var imgAspect = img.width/img.height;
            var canvasAspect = ctxGL.canvas.width / ctxGL.canvas.height;
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
    w.setGameLoop(cubeGeometryLoop, {
        contextGL: w.getContextGL()});
    w.startGameLoop();
}


function run3DCube(){
    console.log('run3DCube');
    w.setGameLoop(threeDLoop, {
        //context:w.getContext(),
        contextGL:w.getContextGL()}
                 );
    w.startGameLoop();

    
}
function runSplash(){
    console.log('runSplash');
    w.setGameLoop(splashLoop, {
        //context:w.getContext(),
        contextGL:w.getContextGL()}
                 );
    w.startGameLoop();

}
//w.initWebview();
function runCubeTexture(){
    console.log('runCubeTexture');
    w.setGameLoop(cubeTextureLoop, {
        contextGL:w.getContextGL()}
                 );
    w.startGameLoop();

}

function runWebGLWorks(){
    console.log('runWebGLWorks');
    w.setGameLoop(webGLWorksLoop, {
        contextGL:w.getContextGL()}
                 );
    w.startGameLoop();
}
function runWebGLWorkF(){
    console.log('runWebGLWorkF');
    w.setGameLoop(fThreeDLoop, {
        contextGL:w.getContextGL()}
                 );
    w.startGameLoop();
}

function runPointWebGL(){
    console.log('runWebGLWorkF');
    w.setGameLoop(pointWebGLLoop, {
        contextGL:w.getContextGL()}
                 );
    w.startGameLoop();
}

function runFireworksWebGL(){
    console.log('runfireworks');
    w.setGameLoop(fireworksWebGLLoop, {
        contextGL:w.getContextGL()}
                 );
    w.startGameLoop();
}

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
        },
        {
            path:'img/webgl-logo-256.jpg',
            name:'logo256'
        }
    ]
});







