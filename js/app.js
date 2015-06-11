/**
 * @fileOverview
 * @name app.js
 * @author 
 * @license 
 */

var webGLUtil = {

    /**
     * 
     * @param {} gl
     * @param {} str
     * @param {} type
     * @returns {} 
     */
    createShader:function(gl, str, type){
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
            console.log(gl.getShaderInfoLog(shader));
            console.log(type);
            return null;
        }
        return shader;
    },
    initShader:function(gl,vSRC,fSRC){
    	// load and compile the fragment and vertex shader
        var fragmentShader = webGLUtil.createShader(gl,fSRC, "fragment");
        var vertexShader = webGLUtil.createShader(gl,vSRC, "vertex");

        // link them together into a new program
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        return program;        
    },
    makeTranslation:function(tx, ty, tz){
        return [
            1,0,0,0,
            0,1,0,0,
            0,0,1,0,
            tx,ty,tz,1
        ];
    },
    makeXRotation:function(angleInRadians){
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        return [
            1,0,0,0,
            0,c,s,0,
            0,-s,c,0,
            0,0,0,1
        ];
    },
    makeYRotation:function(angleInRadians){
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
 
        return [
            c, 0, -s, 0,
            0, 1, 0, 0,
            s, 0, c, 0,
            0, 0, 0, 1
        ];
    },
    makeZRotation:function(angleInRadians){
        var c = Math.cos(angleInRadians);
        var s = Math.sin(angleInRadians);
        return [
            c, s, 0, 0,
           -s, c, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1,
        ];
    },
    matrixMultiply:function(a,b){
        var a00 = a[0*4+0];
        var a01 = a[0*4+1];
        var a02 = a[0*4+2];
        var a03 = a[0*4+3];
        var a10 = a[1*4+0];
        var a11 = a[1*4+1];
        var a12 = a[1*4+2];
        var a13 = a[1*4+3];
        var a20 = a[2*4+0];
        var a21 = a[2*4+1];
        var a22 = a[2*4+2];
        var a23 = a[2*4+3];
        var a30 = a[3*4+0];
        var a31 = a[3*4+1];
        var a32 = a[3*4+2];
        var a33 = a[3*4+3];
        var b00 = b[0*4+0];
        var b01 = b[0*4+1];
        var b02 = b[0*4+2];
        var b03 = b[0*4+3];
        var b10 = b[1*4+0];
        var b11 = b[1*4+1];
        var b12 = b[1*4+2];
        var b13 = b[1*4+3];
        var b20 = b[2*4+0];
        var b21 = b[2*4+1];
        var b22 = b[2*4+2];
        var b23 = b[2*4+3];
        var b30 = b[3*4+0];
        var b31 = b[3*4+1];
        var b32 = b[3*4+2];
        var b33 = b[3*4+3];
        return [a00 * b00 + a01 * b10 + a02 * b20 + a03 * b30,
                a00 * b01 + a01 * b11 + a02 * b21 + a03 * b31,
                a00 * b02 + a01 * b12 + a02 * b22 + a03 * b32,
                a00 * b03 + a01 * b13 + a02 * b23 + a03 * b33,
                a10 * b00 + a11 * b10 + a12 * b20 + a13 * b30,
                a10 * b01 + a11 * b11 + a12 * b21 + a13 * b31,
                a10 * b02 + a11 * b12 + a12 * b22 + a13 * b32,
                a10 * b03 + a11 * b13 + a12 * b23 + a13 * b33,
                a20 * b00 + a21 * b10 + a22 * b20 + a23 * b30,
                a20 * b01 + a21 * b11 + a22 * b21 + a23 * b31,
                a20 * b02 + a21 * b12 + a22 * b22 + a23 * b32,
                a20 * b03 + a21 * b13 + a22 * b23 + a23 * b33,
                a30 * b00 + a31 * b10 + a32 * b20 + a33 * b30,
                a30 * b01 + a31 * b11 + a32 * b21 + a33 * b31,
                a30 * b02 + a31 * b12 + a32 * b22 + a33 * b32,
                a30 * b03 + a31 * b13 + a32 * b23 + a33 * b33];

    },
    makeScale:function(sx,sy,sz){
        return [
            sx, 0,  0,  0,
            0, sy,  0,  0,
            0,  0, sz,  0,
            0,  0,  0,  1,
        ];
    },
    make2DProjection:function(width,height,depth){
        // Note: This matrix flips the Y axis so 0 is at the top.
        return [
            2 / width, 0,           0,         0,
            0,         -2 / height, 0,         0,
            0,         0,           2 / depth, 0,
           -1,         1,           0,         1
        ];
    },
    degToRad:function(d){
        return d * Math.PI / 180;
    },
    radToDeg:function(r){
        return r * 180 / Math.PI;
    },
    fuzzy:function(range, base){
        return (base||0) + (Math.random()-0.5)*range*2;
    }

};

/**
 * 
 * @param {} opt
 * @returns {} 
 */
function pointWebGLLoop(opt){
    var gl = opt.contextGL;
    var name = "pointWebGLLoop";
    console.log("into pointWebGLLoop");

    var program;
    var modelViewMatrix, projectionMatrix;

    var vertexShaderSRC =
            ""
        +"attribute vec4 a_vertex;\n"
        +"attribute vec4 a_color;\n"
        +"uniform mat4 u_matrix;\n"
        +"uniform vec2 u_resolution;\n"
        +"varying vec4 v_color;\n"
        //+"uniform mat4 projectionMatrix;\n"
        +"void main(void){\n"
        // +"    vec2 position= a_position/u_resolution;\n"
        // +"    vec2 zeroToTwo = position * 2.0;\n"
        // +"    vec2 clipSpace = zeroToTwo - 1.0;\n"
        // +"    gl_PointSize = 4.0;\n"
    //        +"    position=[0.5,0.5];\n"
    //+"    gl_Position= modelViewMatrix * vec4(clipSpace * vec2(1,-1),0,1.0);\n"
        +"    gl_PointSize= min(5.0,length(a_vertex)*0.1);\n"
        +"    gl_Position= u_matrix * a_vertex;\n"    
        +"    v_color = a_color;\n"
        +"}\n"
    ;
    var fragmentShaderSRC = ""
        +"precision mediump float;\n"
        +"uniform vec4 u_color;\n"
        +"varying vec4 v_color;\n"
        +"void main(void){\n"
        +"    gl_FragColor= v_color;\n"
        +"}\n"
    ;

    var objList = [];
    
    function initProgram(gl, vSRC, fSRC){
        return webGLUtil.initShader(gl,vSRC,fSRC);
    }
    function initMatrices(canvas){
        modelViewMatrix = mat4.create();
        //mat4.translate(modelViewMatrix , modelViewMatrix,[0,0,0]);

        // 45 degree field of view
        // projectionMatrix = mat4.create();
        // mat4.perspective(
        //     projectionMatrix,
        //     Math.PI/4,
        //     canvas.width/canvas.height,
        //     1,
        //     10000
        // );
    }
    program = initProgram(gl,vertexShaderSRC,fragmentShaderSRC);

    initMatrices(w.getCanvas());

//     // vertex positions
//     var positionLocation = gl.getAttribLocation(program, 'a_position');
//     var modelViewMatrixLocation = gl.getUniformLocation(program,'modelViewMatrix');
//     var colorLocation = gl.getUniformLocation(program,'u_color');
//     var resolutionLocation = gl.getUniformLocation(program,'u_resolution');
    
// //    var projectionMatrixLocation = gl.getUniformLocation(program, 'projectionMatrix');
//     var vertexBuffer = gl.createBuffer();
//     gl.bindBuffer(gl.ARRAY_BUFFER,vertexBuffer);
//     gl.enableVertexAttribArray(positionLocation);
    
//     var objTriangle = {
//         verts:[
//                 100, 100,
//             100, 120, 
//             100, 130, 
//                 100,140
//             // 0.5,0.5,
//             // 0.5,0.4,
//             // 0.5,0.3,
//             // 0.5,0.2
//         ],
//         buffer:vertexBuffer,
//         location:positionLocation,
//         vertSize:2,
//         nVerts:4,
//         primtype:gl.POINTS,
//         program:program,
//         mvMatrix:modelViewMatrix,
//         mvMatrixLocation:modelViewMatrixLocation,
//         color:[1,0,0,1],
//         colorLocation:colorLocation
//     };
//     gl.vertexAttribPointer(positionLocation,objTriangle.vertSize, gl.FLOAT, false, 0, 0);
    
//     objList.push(objTriangle);

    var colors =[];
    var verts = [];
    var theta =0;
    for(var radius = 180.0; radius >1.0; radius -= 0.2){
        colors.push(radius/160.0, 0.7, 1-(radius/160.0));
        verts.push( radius*Math.cos(theta), radius*Math.sin(theta) );
        theta += Math.PI/50;
    }
    var numPoints = colors.length/3;
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

    var vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

    var u_matLoc = gl.getUniformLocation(program, 'u_matrix');
    var colorLoc = gl.getAttribLocation(program, 'a_color');
    var vertLoc = gl.getAttribLocation(program, 'a_vertex');

    
    gl.viewport(0,0,w.getCanvas().width,w.getCanvas().height);

    gl.useProgram(program);

    var WIDTH, HEIGHT;
    WIDTH = w.getCanvas().width;
    HEIGHT = w.getCanvas().height;

    var VELOCITY = 300;

    gl.uniformMatrix4fv(u_matLoc, false,[
            3/WIDTH, 0, 0, 0,
            0,       -3/HEIGHT, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);

    modelViewMatrix = mat4.create();
    mat4.scale(modelViewMatrix, modelViewMatrix,[3/WIDTH, -3/HEIGHT,1]);    

    function draw(gl, bMark,td){
        gl.clearColor(0,0,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        mat4.rotateZ(modelViewMatrix,modelViewMatrix,-Math.PI*td*2);
        gl.uniformMatrix4fv(u_matLoc, false, modelViewMatrix);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.vertexAttribPointer(colorLoc, 3, gl.FLOAT, false, 0,0);
        gl.enableVertexAttribArray(colorLoc);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
        gl.vertexAttribPointer(vertLoc, 2, gl.FLOAT, false, 0,0);
        gl.enableVertexAttribArray(vertLoc);
        
        gl.drawArrays(gl.POINTS, 0, numPoints);
    }
    
    return{
        loop:function(td){
            draw(gl,false,td);
        },
        houseKeeping:function(){
            console.log('housekeeping of:'+ name);
            w.getInterface().clear();
        }
    };
}
// end of pointWebGLLoop

/**
 * this is a demo program for fireworks, I will use webgl to do it
 * @param {} opt, include some webgl context handler, and arguments possible
 * @returns {} a function to be used by requestAnimateFrame() 
 */
function fireworksWebGLLoop(opt){
    var gl = opt.contextGL;
    var name = "fireworkswebglloop";
    console.log("into fireworksLoop");

    var WIDTH = w.getCanvas().width;
    var HEIGHT = w.getCanvas().height;
    var emitX = WIDTH/2;
    var emitY = HEIGHT/2;

    var PARTICLE_NUM = 100;
    var NFIELDS = 4;
    var MAX_PARTICLES = 20000;
    var PARTICLES_LENGTH = MAX_PARTICLES * NFIELDS;
    var MAX_AGE = 4;
    var drag = 0.99;
    var gravity = 30;
    var particles_i = 0;
    var particles = new Float32Array(PARTICLES_LENGTH);

    var PFIELDS = 4;
    var params = new Float32Array(MAX_PARTICLES * PFIELDS);
    
    var program;

    var vertexShaderSRC =""
        +"attribute vec4 a_vertex;\n"
        +"attribute vec4 a_param;\n"
        +"uniform vec2 u_resolution;\n"
        +"uniform mat4 u_matrix;\n"
        +"uniform vec4 u_color;\n"
        +"varying vec4 v_color;\n"
        +"void main(void){\n"
        +"    vec2 position = vec2(a_vertex.x, a_vertex.y)/u_resolution;\n"
        +"    vec2 zeroToTwo = position * 2.0;\n"
        +"    vec2 clipSpace = zeroToTwo - 1.0;\n"
        +"    gl_Position= u_matrix * vec4(clipSpace * vec2(1,-1), 0.0, 1.0);\n"
        +"    gl_PointSize = 1.0;\n"
        +"    v_color = u_color;\n"
        +"}\n"
    ;
    var fragmentShaderSRC = ""
        +"precision mediump float;\n"
        +"varying vec4 v_color;\n"
        +"void main(void){\n"
        +"    gl_FragColor = v_color;\n"
        +"}\n"
    ;

    function emit(x,y){
        for(var i =0; i< PARTICLE_NUM; i++){
            particles_i = (particles_i + NFIELDS)% PARTICLES_LENGTH;
            particles[particles_i] = x;
            particles[particles_i + 1] = y;
            var alpha = webGLUtil.fuzzy(Math.PI),// direction
                radius = Math.random() * 300;  // velocity
            particles[particles_i + 2] = Math.cos(alpha)* radius;
            particles[particles_i + 3] = Math.sin(alpha)* radius;
            params[particles_i] = webGLUtil.fuzzy(1);
            //particles[particles_i + 4] = webGLUtil.fuzzy(2,2); // age
        }
    }
    
    function createGeometry(gl){

    }

    function initProgram(gl, vSRC, fSRC){
        return webGLUtil.initShader(gl,vSRC,fSRC);
    }
    function draw(gl, td){
        emit(emitX, emitY);
        
        gl.clearColor(0,0,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        for(var i = 0; i< PARTICLES_LENGTH; i+= NFIELDS){
            var x = ~~(particles[i]= (particles[i]+
                                      (particles[i+2]*=drag)*td));
            var y = ~~(particles[i+1] = (particles[i+1]+
                                         (particles[i+3]=(particles[i+3] + gravity*td)*drag)*td));
        }

        gl.bindBuffer(gl.ARRAY_BUFFER,vertBuffer );
        gl.bufferData(gl.ARRAY_BUFFER, particles, gl.STATIC_DRAW);
        gl.vertexAttribPointer(vertLoc, NFIELDS, gl.FLOAT, false, 0,0);


        // gl.bindBuffer(gl.ARRAY_BUFFER, paramBuffer);
        // gl.bufferData(gl.ARRAY_BUFFER,params,gl.STATIC_DRAW);
        // gl.vertexAttribPointer(paramLoc, 2, gl.FLOAT, false, 0,0);
        // gl.enableVertexAttribArray(paramLoc);
        
        gl.drawArrays(gl.POINTS, 0, MAX_PARTICLES);
    }
    
    program = initProgram(gl,vertexShaderSRC,fragmentShaderSRC);
    gl.useProgram(program);

    var vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    var vertLoc = gl.getAttribLocation(program, 'a_vertex');
    gl.enableVertexAttribArray(vertLoc);
    gl.bufferData(gl.ARRAY_BUFFER, particles, gl.STATIC_DRAW);
    
    // var paramBuffer = gl.createBuffer();
    // gl.bindBuffer(gl.ARRAY_BUFFER, paramBuffer);
    // var paramLoc = gl.getAttribLocation(program, 'a_param');
    // gl.enableVertexAttribArray(paramLoc);
    // gl.bufferData(gl.ARRAY_BUFFER, params, gl.STATIC_DRAW);    

    var resolutionLoc = gl.getUniformLocation(program, 'u_resolution');
    gl.uniform2f(resolutionLoc,WIDTH,HEIGHT);
    
    var matrixLoc = gl.getUniformLocation(program, 'u_matrix');
    gl.uniformMatrix4fv(matrixLoc, false,[
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,0,1
    ]);
    var colorLoc = gl.getUniformLocation(program, 'u_color');
    gl.uniform4fv(colorLoc, [125, 155, 0, 0.8 ]);
    
    gl.viewport(0,0,w.getCanvas().width,w.getCanvas().height);
    //initMatrices(w.getCanvas());
    //createGeometry(gl);
    //initShader(gl);
    
    return{
        loop:function(td){
                draw(gl,td);
            
        },
        houseKeeping:function(){
            console.log('housekeeping of:'+ name);
            w.getInterface().clear();
        }
    };
}
// end of fireworks


/**
 * this is a demo program for webgl app
 * @param {} opt
 * @returns {} 
 */
function exampleLoop(opt){
    var gl = opt.contextGL;
    var name = "exampleLoop";
    console.log("into exampleLoop");

    var program;

    var vertexShaderSRC = "";
    var fragmentShaderSRC = "";
    
    function createGeometry(gl){

    }

    function initProgram(gl, vSRC, fSRC){
        return webGLUtil.initShader(gl,vSRC,fSRC);
    }
    function draw(gl, bMark){
        gl.clearColor(0,0,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT);        

    }
    program = initProgram(gl,vertexShaderSRC,fragmentShaderSRC);
    gl.useProgram(program);
    
    gl.viewport(0,0,w.getCanvas().width,w.getCanvas().height);
    //initMatrices(w.getCanvas());
    //createGeometry(gl);
    //initShader(gl);
    
    return{
        loop:function(td){
                draw(gl,false);
            
        },
        houseKeeping:function(){
            console.log('housekeeping of:'+ name);
            w.getInterface().clear();
        }
    };
}
// end of exampleLoop

function fThreeDLoop(opt){
    /**
     * 
     * @param {} gl
     * @param {} str
     * @param {} type
     * @returns {} 
     */
    var gl = opt.contextGL;
    var name = "fThreeDLoop";
    console.log("into 3dLoop");

    var program;

    var vertexShaderSRC = ""
        +"attribute vec4 a_position;\n"
        +"attribute vec4 a_color;\n"
        +"uniform mat4 u_matrix;\n"
        +"uniform float u_fudgeFactor;\n"
        +"varying vec4 v_color;\n"
        +"void main(){\n"
        +"    vec4 position = u_matrix * a_position;\n"
        +"    float zToDivideBy = 1.0 + position.z*u_fudgeFactor;\n"
        +"    gl_Position = vec4(position.xy/zToDivideBy, position.zw);\n"
        +"    v_color = a_color;\n"
        +"}\n"
    ;
    var fragmentShaderSRC = ""
        +"precision mediump float;\n"
        +"varying vec4 v_color;\n"
        +"void main(){\n"
        +"    gl_FragColor = v_color;\n"
        +"}\n"
    ;
    
    function createGeometry(gl){
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
    // left column front
            0,   0,  0,
           30,   0,  0,
            0, 150,  0,
            0, 150,  0,
           30,   0,  0,
           30, 150,  0,

          // top rung front
           30,   0,  0,
          100,   0,  0,
           30,  30,  0,
           30,  30,  0,
          100,   0,  0,
          100,  30,  0,

          // middle rung front
           30,  60,  0,
           67,  60,  0,
           30,  90,  0,
           30,  90,  0,
           67,  60,  0,
           67,  90,  0,

          // left column back
            0,   0,  30,
           30,   0,  30,
            0, 150,  30,
            0, 150,  30,
           30,   0,  30,
           30, 150,  30,

          // top rung back
           30,   0,  30,
          100,   0,  30,
           30,  30,  30,
           30,  30,  30,
          100,   0,  30,
          100,  30,  30,

          // middle rung back
           30,  60,  30,
           67,  60,  30,
           30,  90,  30,
           30,  90,  30,
           67,  60,  30,
           67,  90,  30,

          // top
            0,   0,   0,
          100,   0,   0,
          100,   0,  30,
            0,   0,   0,
          100,   0,  30,
            0,   0,  30,

          // top rung front
          100,   0,   0,
          100,  30,   0,
          100,  30,  30,
          100,   0,   0,
          100,  30,  30,
          100,   0,  30,

          // under top rung
          30,   30,   0,
          30,   30,  30,
          100,  30,  30,
          30,   30,   0,
          100,  30,  30,
          100,  30,   0,

          // between top rung and middle
          30,   30,   0,
          30,   30,  30,
          30,   60,  30,
          30,   30,   0,
          30,   60,  30,
          30,   60,   0,

          // top of middle rung
          30,   60,   0,
          30,   60,  30,
          67,   60,  30,
          30,   60,   0,
          67,   60,  30,
          67,   60,   0,

          // front of middle rung
          67,   60,   0,
          67,   60,  30,
          67,   90,  30,
          67,   60,   0,
          67,   90,  30,
          67,   90,   0,

          // bottom of middle rung.
          30,   90,   0,
          30,   90,  30,
          67,   90,  30,
          30,   90,   0,
          67,   90,  30,
          67,   90,   0,

          // front of bottom
          30,   90,   0,
          30,   90,  30,
          30,  150,  30,
          30,   90,   0,
          30,  150,  30,
          30,  150,   0,

          // bottom
          0,   150,   0,
          0,   150,  30,
          30,  150,  30,
          0,   150,   0,
          30,  150,  30,
          30,  150,   0,

          // left side
          0,   0,   0,
          0,   0,  30,
          0, 150,  30,
          0,   0,   0,
          0, 150,  30,
          0, 150,   0
            ]),
            gl.STATIC_DRAW
        );
    }
    function setColors(gl){
        gl.bufferData(
        gl.ARRAY_BUFFER,
        new Uint8Array(
            [
                // left column front
                200,  70, 120,
                200,  70, 120,
                200,  70, 120,
                200,  70, 120,
                200,  70, 120,
                200,  70, 120,

                // top rung front
                200,  70, 120,
                200,  70, 120,
                200,  70, 120,
                200,  70, 120,
                200,  70, 120,
                200,  70, 120,

                // middle rung front
                200,  70, 120,
                200,  70, 120,
                200,  70, 120,
                200,  70, 120,
                200,  70, 120,
                200,  70, 120,

                // left column back
                80, 70, 200,
                80, 70, 200,
                80, 70, 200,
                80, 70, 200,
                80, 70, 200,
                80, 70, 200,

                // top rung back
                80, 70, 200,
                80, 70, 200,
                80, 70, 200,
                80, 70, 200,
                80, 70, 200,
                80, 70, 200,

                // middle rung back
                80, 70, 200,
                80, 70, 200,
                80, 70, 200,
                80, 70, 200,
                80, 70, 200,
                80, 70, 200,

                // top
                70, 200, 210,
                70, 200, 210,
                70, 200, 210,
                70, 200, 210,
                70, 200, 210,
                70, 200, 210,

                // top rung front
                200, 200, 70,
                200, 200, 70,
                200, 200, 70,
                200, 200, 70,
                200, 200, 70,
                200, 200, 70,

                // under top rung
                210, 100, 70,
                210, 100, 70,
                210, 100, 70,
                210, 100, 70,
                210, 100, 70,
                210, 100, 70,

                // between top rung and middle
                210, 160, 70,
                210, 160, 70,
                210, 160, 70,
                210, 160, 70,
                210, 160, 70,
                210, 160, 70,

                // top of middle rung
                70, 180, 210,
                70, 180, 210,
                70, 180, 210,
                70, 180, 210,
                70, 180, 210,
                70, 180, 210,

                // front of middle rung
                100, 70, 210,
                100, 70, 210,
                100, 70, 210,
                100, 70, 210,
                100, 70, 210,
                100, 70, 210,

                // bottom of middle rung.
                76, 210, 100,
                76, 210, 100,
                76, 210, 100,
                76, 210, 100,
                76, 210, 100,
                76, 210, 100,

                // front of bottom
                140, 210, 80,
                140, 210, 80,
                140, 210, 80,
                140, 210, 80,
                140, 210, 80,
                140, 210, 80,

                // bottom
                90, 130, 110,
                90, 130, 110,
                90, 130, 110,
                90, 130, 110,
                90, 130, 110,
                90, 130, 110,

                // left side
                160, 160, 220,
                160, 160, 220,
                160, 160, 220,
                160, 160, 220,
                160, 160, 220,
                160, 160, 220
            ]
        ),
        gl.STATIC_DRAW);
    }
    
    function initProgram(gl, vSRC, fSRC){
        return webGLUtil.initShader(gl,vSRC,fSRC);
    }

    var canvas = w.getCanvas();

    gl.enable(gl.DEPTH_TEST);
    
    function draw(gl, bMark){
        gl.clearColor(0,0,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT);        
        var projectionMatrix = webGLUtil.make2DProjection(canvas.width, canvas.height,400);
        var translationMatrix = webGLUtil.makeTranslation(translation[0], translation[1], translation[2]);
        var rotationXMatrix = webGLUtil.makeXRotation(rotation[0]);
        var rotationYMatrix = webGLUtil.makeYRotation(rotation[1]);
        var rotationZMatrix = webGLUtil.makeZRotation(rotation[2]);
        var scaleMatrix = webGLUtil.makeScale(scale[0],scale[1],scale[2]);
        var matrix = webGLUtil.matrixMultiply(scaleMatrix, rotationZMatrix);
        matrix = webGLUtil.matrixMultiply(matrix, rotationYMatrix);
        matrix = webGLUtil.matrixMultiply(matrix, rotationXMatrix);
        matrix = webGLUtil.matrixMultiply(matrix, translationMatrix);
        matrix = webGLUtil.matrixMultiply(matrix, projectionMatrix);

        gl.uniformMatrix4fv(matrixLocation,false,matrix);
        gl.uniform1f(fudgeLocation, fudgeFactor);
        
        gl.drawArrays(gl.TRIANGLES, 0, 16 * 6);
        
    }
    program = initProgram(gl,vertexShaderSRC,fragmentShaderSRC);
    gl.useProgram(program);

      // look up where the vertex data needs to go.
    var positionLocation = gl.getAttribLocation(program, "a_position");
    var colorLocation = gl.getAttribLocation(program,'a_color');
    // lookup uniforms
    var fudgeLocation = gl.getUniformLocation(program, "u_fudgeFactor");
    var matrixLocation = gl.getUniformLocation(program, "u_matrix");

    var fudgeFactor = 1;
    
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 3,gl.FLOAT,false,0,0);

    createGeometry(gl);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.enableVertexAttribArray(colorLocation);
    gl.vertexAttribPointer(colorLocation, 3, gl.UNSIGNED_BYTE, true,0,0);
    setColors(gl);

    //gl.uniform4f(colorLocation, Math.random(),Math.random(),Math.random(), 1);

    var translation = [45, 150,0];
    var rotation = [
        webGLUtil.degToRad(40),
        webGLUtil.degToRad(25),
        webGLUtil.degToRad(325)
    ];
    var scale = [1,1,1];
    
    gl.viewport(0,0,w.getCanvas().width,w.getCanvas().height);
    //initMatrices(w.getCanvas());
    //createGeometry(gl);
    //initShader(gl);
    
    return{
        loop:function(td){
                draw(gl,false);
            
        },
        houseKeeping:function(){
            console.log('housekeeping of:'+ name);
            w.getInterface().clear();
        }
    };
}
// end of 3DF


function webGLWorksLoop(opt){
    var gl = opt.contextGL;
    var name = "webglworks";
    console.log("into webglworksloop");
    
    var program;

    var vertexShaderSRC =
            ""
        +"attribute vec2 a_position;\n"
        +"uniform vec2 u_resolution;\n"
        +"uniform vec2 u_translation;\n"
        +"uniform vec2 u_rotation;\n"
        +"void main(){\n"
        +"    vec2 rotatedPosition=vec2( a_position.x * u_rotation.y + a_position.y * u_rotation.x, a_position.y * u_rotation.y - a_position.x * u_rotation.x);\n"
        +"    vec2 position = rotatedPosition + u_translation;\n"
        +"    vec2 zeroToOne = position/u_resolution;\n"
        +"    vec2 zeroToTwo = zeroToOne * 2.0;\n"
        +"    vec2 clipSpace = zeroToTwo - 1.0;\n"
        +"    gl_Position = vec4(clipSpace* vec2(1,-1), 0, 1);\n"
        +"}\n";
    var fragmentShaderSRC = ""
        +"precision mediump float;\n"
        +"uniform vec4 u_color;\n"
        +"void main(){\n"
        +"    gl_FragColor = u_color;\n"
        +"}\n";
    
    function createGeometry(gl,x,y){
        var width = 100;
        var height = 150;
        var thickness = 30;
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                //left column
                x,y,
                x+thickness, y,
                x, y + height,
                x, y + height,
                x + thickness, y,
                x + thickness, y + height,
                
                // top rung
                x + thickness, y,
                x + width, y,
                x + thickness, y + thickness,
                x + thickness, y + thickness,
                x + width, y,
                x + width, y + thickness,
                
                // middle rung
                x + thickness, y + thickness * 2,
                x + width * 2 / 3, y + thickness * 2,
                x + thickness, y + thickness * 3,
                x + thickness, y + thickness * 3,
                x + width * 2 / 3, y + thickness * 2,
                x + width * 2 / 3, y + thickness * 3]),
            gl.STATIC_DRAW);
    }

    function initProgram(gl, vSRC, fSRC){
        return webGLUtil.initShader(gl,vSRC,fSRC);
    }
    function draw(gl, bMark){
        gl.clearColor(0,0,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform2fv(translationLocation,translation);
        gl.uniform2fv(rotationLocation,rotation);
        gl.drawArrays(gl.TRIANGLES, 0, 18);

    }
    program = initProgram(gl,vertexShaderSRC,fragmentShaderSRC);
    gl.useProgram(program);

    var positionLocation = gl.getAttribLocation(program,'a_position');
    // lookup uniforms
    var resolutionLocation = gl.getUniformLocation(program, "u_resolution");
    var colorLocation = gl.getUniformLocation(program, "u_color");
    var translationLocation = gl.getUniformLocation(program, "u_translation");
    // set the resolution
    gl.uniform2f(resolutionLocation, w.getCanvas().width, w.getCanvas().height);

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation,2,gl.FLOAT,false,0,0);
    createGeometry(gl,10,10);

    gl.uniform4f(colorLocation, 1,0,0,1);

    var translation = [100,100];

    var rotationLocation = gl.getUniformLocation(program,'u_rotation');
    var rotation = [1/2,1/2];
    
    gl.viewport(0,0,w.getCanvas().width,w.getCanvas().height);
    //initMatrices(w.getCanvas());
    //createGeometry(gl);
    //initShader(gl);
    
    return{
        loop:function(td){
            draw(gl,false);
            
        },
        houseKeeping:function(){
            console.log('housekeeping of:'+ name);
            w.getInterface().clear();
        }
    };

}// end of webGLWorksLoop

//splash screen, duing load in webview
function splashLoopJumpingRectangle(opt){
    var gl = opt.contextGL;
    var name = "splashscreen";
    console.log("into splashLoop");

    //var fragmentShader, vertexShader;
    var program;
    var shaderSamplerUniform;
    
    function createShader(gl,str, type) {
        var shader;
        if (type == "fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (type == "vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }
        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }
    function initProgram(gl, vSRC, fSRC){
    	// load and compile the fragment and vertex shader
        var fragmentShader = createShader(gl,fSRC, "fragment");
        var vertexShader = createShader(gl,vSRC, "vertex");

        // link them together into a new program
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        return program;
    }
    var vertexShaderSRC = 
            ""
        +"attribute vec2 a_position;\n"
        //+"attribute vec2 a_texCoord;\n"
    //+"varying vec2 v_texCoord;\n"
        +"uniform vec2 u_resolution;\n"
        +"void main(){\n "
        +"    vec2 zeroToOne = a_position/u_resolution;\n"
        +"    vec2 zeroToTwo = zeroToOne * 2.0;\n"
        +"    vec2 clipSpace = zeroToTwo - 1.0;\n"
        +"    gl_Position = vec4(clipSpace* vec2(1,-1), 0, 1);\n"
        //+"    v_texCoord = a_texCoord;\n"
        +"}\n"
    ;
    var fragmentShaderSRC = 
            ""
        +"precision mediump float;\n"
        //+"uniform sampler2D u_image;\n"
    //+"varying vec2 v_texCoord;"
        +"uniform vec4 u_color;\n"
        +"void main(){\n"
    //+"    gl_FragColor = texture2D(u_image, v_texCoord);\n"
        +"    gl_FragColor = u_color;\n"
        +"}\n"
    ;
    
    program = initProgram(gl, vertexShaderSRC,fragmentShaderSRC);
    gl.useProgram(program);

    // create a attribute array
    var positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(
            [
                    -1,-1,
                1,-1,
                    -1,1,
                    -1,1,
                1,-1,
                1,1
            ]
        ),
        gl.STATIC_DRAW
    );


    var colorLocation = gl.getUniformLocation(program, 'u_color');
    gl.uniform4f(colorLocation,1,1,1,1);

    var resolutionLocation = gl.getUniformLocation(program,'u_resolution');
    gl.uniform2f(resolutionLocation,gl.canvas.width,gl.canvas.height);
    
    // var texCoordLocation = gl.getAttribLocation(
    //     program,'a_texCoord');
    
    // gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    // gl.bufferData(
    //     gl.ARRAY_BUFFER,
    //     new Float32Array(
    //         [
    //             0,0,
    //             1,0,
    //             0,1,
    //             0,1,
    //             1,0,
    //             1,1
    //         ]
    //     ),
    //     gl.STATIC_DRAW
    // );
    // gl.enableVertexAttribArray(texCoordLocation);
    // gl.vertexAttribPointer(
    //     texCoordLocation,
    //     2,
    //     gl.FLOAT,
    //     false,
    //     0,
    //     0
    // );

    // //gl.bindTexture( gl.TEXTURE_2D, gl.createElement() );
    // shaderSamplerUniform = gl.getUniformLocation(program, "u_image");

    // if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    //         alert("Could not initialise shaders");
    //     }

    // gl.activeTexture(gl.TEXTURE0);
    // gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    // gl.texParameteri(
    //     gl.TEXTURE_2D,
    //     gl.TEXTURE_WRAP_S,
    //     gl.CLAMP_TO_EDGE
    // );
    // gl.texParameteri(
    //     gl.TEXTURE_2D,
    //     gl.TEXTURE_WRAP_T,
    //     gl.CLAMP_TO_EDGE
    //     );
    // gl.texParameteri(
    //     gl.TEXTURE_2D,
    //     gl.TEXTURE_MIN_FILTER,
    //     gl.NEAREST
    //     );
    // gl.texParameteri(
    //     gl.TEXTURE_2D,
    //     gl.TEXTURE_MAG_FILTER,
    //     gl.NEAREST
    // );

    // gl.texImage2D(
    //     gl.TEXTURE_2D,
    //     0,
    //     gl.RGBA,
    //     gl.RGBA,
    //     gl.UNSIGNED_BYTE,
    //     w.getImage('splash_screen')
    // );
    // //gl.bindTexture(gl.TEXTURE_2D, null);
    // gl.uniform1i(shaderSamplerUniform, 0);
    function randomInt(range){
        return Math.floor(Math.random()* range);
    }

    function setRectangle(gl, x, y, width, height){
        var x1 = x,
            y1 = y,
            x2 = x + width,
            y2 = y + height;
        gl.bufferData(gl.ARRAY_BUFFER,
                      new Float32Array(
                          [
                              x1,y1,
                              x2,y1,
                              x1,y2,
                              x1,y2,
                              x2,y2,
                              x2,y1
                          ]
                      ),
                      gl.STATIC_DRAW
                     );
    }

    var WIDTH = gl.canvas.width;
    var HEIGHT = gl.canvas.height;
    var square_shape = {};
    
    square_shape.x = randomInt(WIDTH);
    square_shape.y = randomInt(HEIGHT);
    square_shape.width = randomInt(WIDTH);
    square_shape.height = randomInt(HEIGHT);
    
    function draw(gl, bChange){
        gl.clearColor(0,0,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        if(bChange === true){
            square_shape.x = randomInt(WIDTH);
            square_shape.y = randomInt(HEIGHT);
            square_shape.width = randomInt(WIDTH);
            square_shape.height = randomInt(HEIGHT);
        }

        for(var i =0; i< 1; i++){
            setRectangle(gl,
                square_shape.x,
                square_shape.y,
                square_shape.width,
                square_shape.height
            );

            //gl.uniform4f(colorLocation,Math.random(),
            //Math.random(),Math.random(),1);
            gl.uniform4f(colorLocation,1,0,0,1);

            gl.drawArrays(gl.TRIANGLES,0,6);
            
        }
    }
    var counter = 0;    
    return{
        loop:function(td){
            counter += td;
            if(counter > 0.5){
                counter = 0;
                draw(gl,true);
            }
            else{
                draw(gl,false);
            }
            
        },
        houseKeeping:function(){
            console.log('housekeeping of:'+ name);
            w.getInterface().clear();

        }
    };

}

//splash screen, duing load in webview
function splashLoop(opt){
    var gl = opt.contextGL;
    var name = "splashscreen";
    console.log("into splashLoop");

    //var fragmentShader, vertexShader;
    var program;
    var shaderSamplerUniform;
    
    function createShader(gl,str, type) {
        var shader;
        if (type == "fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (type == "vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }
        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }
        return shader;
    }
    function initProgram(gl, vSRC, fSRC){
    	// load and compile the fragment and vertex shader
        var fragmentShader = createShader(gl,fSRC, "fragment");
        var vertexShader = createShader(gl,vSRC, "vertex");

        // link them together into a new program
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        return program;
    }
    var vertexShaderSRC = 
            ""
        +"attribute vec2 a_position;\n"
        +"attribute vec2 a_texCoord;\n"
        +"varying vec2 v_texCoord;\n"
        +"uniform vec2 u_resolution;\n"
        +"void main(){\n"
        +"    vec2 zeroToOne = a_position/u_resolution;\n"
        +"    vec2 zeroToTwo = zeroToOne * 2.0;\n"
        +"    vec2 clipSpace = zeroToTwo - 1.0;\n"
        +"    gl_Position = vec4(clipSpace* vec2(1,-1), 0, 1);\n"
        +"    v_texCoord = a_texCoord;\n"
        +"}\n"
    ;
    var fragmentShaderSRC = 
            ""
        +"precision mediump float;\n"
        +"uniform sampler2D u_image;\n"
        +"varying vec2 v_texCoord;\n"
        +"uniform vec4 u_color;\n"
        +"void main(){\n"
    //+"    gl_FragColor = texture2D(u_image, v_texCoord);\n"
        +"    gl_FragColor = texture2D(u_image, v_texCoord).bgra;\n"
        +"}\n"
    ;
    
    program = initProgram(gl, vertexShaderSRC,fragmentShaderSRC);
    gl.useProgram(program);

    // create a attribute array
    var positionLocation = gl.getAttribLocation(program, 'a_position');
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(
        positionLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    setRectangle(gl, 0, 0, gl.canvas.width,gl.canvas.height);

    var colorLocation = gl.getUniformLocation(program, 'u_color');
    gl.uniform4f(colorLocation,1,1,1,1);

    var resolutionLocation = gl.getUniformLocation(program,'u_resolution');
    gl.uniform2f(resolutionLocation,gl.canvas.width,gl.canvas.height);
    
    var texCoordLocation = gl.getAttribLocation(
         program,'a_texCoord');
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());

    var img = w.getImage("splash_screen");
    var imgParam = w.getCutImage(img);
    var v_x = imgParam.x/img.width,
        v_y = imgParam.y/img.height,
        v_width = imgParam.width/img.width,
        v_height = imgParam.height/img.height;
    var vCoord=[
        v_x,           v_y,
        v_x + v_width, v_y,
        v_x,           v_y + v_height,
        v_x,           v_y + v_height,
        v_x + v_width, v_y,
        v_x + v_width, v_y + v_height
    ];
    gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(vCoord),
        gl.STATIC_DRAW
    );
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(
        texCoordLocation,
        2,
        gl.FLOAT,
        false,
        0,
        0
    );

    // //gl.bindTexture( gl.TEXTURE_2D, gl.createElement() );
    shaderSamplerUniform = gl.getUniformLocation(program, "u_image");

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
    }

    // gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, gl.createTexture());
    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_S,
        gl.CLAMP_TO_EDGE
    );
    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_WRAP_T,
        gl.CLAMP_TO_EDGE
        );
    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.NEAREST
        );
    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MAG_FILTER,
        gl.NEAREST
    );

    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        w.getImage('splash_screen')
    );
    // //gl.bindTexture(gl.TEXTURE_2D, null);
    // gl.uniform1i(shaderSamplerUniform, 0);
    function randomInt(range){
        return Math.floor(Math.random()* range);
    }

    function setRectangle(gl, x, y, width, height){
        var x1 = x,
            y1 = y,
            x2 = x + width,
            y2 = y + height;
        gl.bufferData(gl.ARRAY_BUFFER,
                      new Float32Array(
                          [
                              x1,y1,
                              x2,y1,
                              x1,y2,
                              x1,y2,
                              x2,y1,
                              x2,y2
                          ]
                      ),
                      gl.STATIC_DRAW
                     );
    }

    var WIDTH = gl.canvas.width;
    var HEIGHT = gl.canvas.height;
    var square_shape = {};
    
    square_shape.x = randomInt(WIDTH);
    square_shape.y = randomInt(HEIGHT);
    square_shape.width = randomInt(WIDTH);
    square_shape.height = randomInt(HEIGHT);
    
    function draw(gl, bChange){
        gl.clearColor(0,0,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT);

        // if(bChange === true){
        //     square_shape.x = randomInt(WIDTH);
        //     square_shape.y = randomInt(HEIGHT);
        //     square_shape.width = randomInt(WIDTH);
        //     square_shape.height = randomInt(HEIGHT);
        // }

        // for(var i =0; i< 1; i++){
        //     setRectangle(gl,
        //         square_shape.x,
        //         square_shape.y,
        //         square_shape.width,
        //         square_shape.height
        //     );

        //     //gl.uniform4f(colorLocation,Math.random(),
        //     //Math.random(),Math.random(),1);
        //     gl.uniform4f(colorLocation,1,0,0,1);

        gl.drawArrays(gl.TRIANGLES,0,6);

    }
    var counter = 0;    
    return{
        loop:function(td){
            counter += td;
            if(counter > 0.5){
                counter = 0;
                draw(gl,true);
            }
            else{
                draw(gl,false);
            }
            
        },
        houseKeeping:function(){
            console.log('housekeeping of:'+ name);
            w.getInterface().clear();
            gl.clearColor(0,0,0,1);
            gl.clearColor(0,0,w.getCanvas().width, w.getCanvas().height);
        }
    };
}

function cubeTextureLoop(opt){
    var ctxGL = opt.contextGL;
    var name = "cubeTexture";
    console.log("into cubeTexture");

    var projectionMatrix,modelViewMatrix;
    var shaderProgram,
        shaderVertexPositionAttribute,
        shaderVertexColorAttribute,
        shaderTexCoordAttribute,
        shaderProjectionMatrixUniform,
        shaderModelViewMatrixUniform,
        shaderSamplerUniform;
    
    var rotationAxis;
    var webGLTexture;

    function initMatrices(canvas){
        modelViewMatrix = mat4.create();
        mat4.translate( modelViewMatrix, modelViewMatrix, [0,0,-8]);
        
        projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, Math.PI/4,
                         canvas.width/canvas.height, 1, 10000);
        rotationAxis = vec3.create();
        vec3.normalize(rotationAxis, [1,1,1]);
    }

    function createCube(gl){
        //vertex
        var vertexBuffer;
        vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        var verts= [
            //front
                -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            1.0, 1.0, 1.0,
                -1.0, 1.0, 1.0,
            //back
                -1.0, -1.0, -1.0,
                -1.0, 1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, -1.0, -1.0,
            // top
                -1.0, 1.0, -1.0,
                -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, -1.0,
            //bot
                -1.0,-1.0,-1.0,
            1.0,-1.0,-1.0,
            1.0,-1.0,1.0,
                -1.0, -1.0,1.0,
            //right
            1.0,-1.0,-1.0,
            1.0,1.0,-1.0,
            1.0,1.0,1.0,
            1.0, -1.0, 1.0,
            //left
                -1.0,-1.0,-1.0,
                -1.0,-1.0,1.0,
                -1.0,1.0,1.0,
                -1.0,1.0,-1.0
            
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

        var texCoordBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);

        var textureCoords = [
          // Front face
          // 0.0, 0.0,
          // 1.0, 0.0,
          // 1.0, 1.0,
          // 0.0, 1.0,
            1.0, 0.0,
            0.0, 1.0,
            0.0, 0.0,
            1.0, 1.0,
          // Back face
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,
          0.0, 0.0,

          // Top face
          0.0, 1.0,
          0.0, 0.0,
          1.0, 0.0,
          1.0, 1.0,

          // Bottom face
          1.0, 1.0,
          0.0, 1.0,
          0.0, 0.0,
          1.0, 0.0,

          // Right face
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,
          0.0, 0.0,

          // Left face
          0.0, 0.0,
          1.0, 0.0,
          1.0, 1.0,
          0.0, 1.0,
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
        // Index data (defines the triangles to be drawn)
        var cubeIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
        var cubeIndices = [
            0, 1, 2,      0, 2, 3,    // Front face
            4, 5, 6,      4, 6, 7,    // Back face
            8, 9, 10,     8, 10, 11,  // Top face
            12, 13, 14,   12, 14, 15, // Bottom face
            16, 17, 18,   16, 18, 19, // Right face
            20, 21, 22,   20, 22, 23  // Left face
        ];
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);
        
        var cube = {buffer:vertexBuffer, texCoordBuffer:texCoordBuffer, indices:cubeIndexBuffer,
                vertSize:3, nVerts:24, texCoordSize:2, nTexCoords: 24, nIndices:36,
                primtype:gl.TRIANGLES};
        
        return cube;
        
    }

    function createShader(gl, str, type) {
        var shader;
        if (type == "fragment") {
            shader = gl.createShader(gl.FRAGMENT_SHADER);
        } else if (type == "vertex") {
            shader = gl.createShader(gl.VERTEX_SHADER);
        } else {
            return null;
        }

        gl.shaderSource(shader, str);
        gl.compileShader(shader);

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            alert(gl.getShaderInfoLog(shader));
            return null;
        }

        return shader;
    }

    var vertexShaderSource =
		
		"    attribute vec3 vertexPos;\n" +
		"    attribute vec2 texCoord;\n" +
		"    uniform mat4 modelViewMatrix;\n" +
		"    uniform mat4 projectionMatrix;\n" +
		"    varying vec2 vTexCoord;\n" +
		"    void main(void) {\n" +
		"		// Return the transformed and projected vertex value\n" +
		"        gl_Position = projectionMatrix * modelViewMatrix * \n" +
		"            vec4(vertexPos, 1.0);\n" +
		"        // Output the texture coordinate in vTexCoord\n" +
		"        vTexCoord = texCoord;\n" +
		"    }\n";

    var fragmentShaderSource = 
		"    precision mediump float;\n" +
		"    varying vec2 vTexCoord;\n" +
		"    uniform sampler2D uSampler;\n" + 
		"    void main(void) {\n" +
		"    // Return the pixel color: always output white\n" +
        "    gl_FragColor = texture2D(uSampler, vec2(vTexCoord.s, vTexCoord.t));\n" +
    	"}\n";

    function initShader(gl) {

    	// load and compile the fragment and vertex shader
        var fragmentShader = createShader(gl, fragmentShaderSource, "fragment");
        var vertexShader = createShader(gl, vertexShaderSource, "vertex");

        // link them together into a new program
        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        // get pointers to the shader params
        shaderVertexPositionAttribute = gl.getAttribLocation(shaderProgram, "vertexPos");
        gl.enableVertexAttribArray(shaderVertexPositionAttribute);

        shaderTexCoordAttribute = gl.getAttribLocation(shaderProgram, "texCoord");
        gl.enableVertexAttribArray(shaderTexCoordAttribute);
        
        shaderProjectionMatrixUniform = gl.getUniformLocation(shaderProgram, "projectionMatrix");
        shaderModelViewMatrixUniform = gl.getUniformLocation(shaderProgram, "modelViewMatrix");
        shaderSamplerUniform = gl.getUniformLocation(shaderProgram, "uSampler");
        
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }
    }    
    function handleTextureLoaded(gl, texture) {
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, texture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    function initTexture(gl){
        webGLTexture = gl.createTexture();
        webGLTexture.image = w.getImage("logo256");
        //handleTextureLoaded(gl, webGLTexture);
        
        gl.bindTexture(gl.TEXTURE_2D, webGLTexture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, webGLTexture.image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    function draw(gl, obj, td){
        // clear the background (with black)
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT  | gl.DEPTH_BUFFER_BIT);

        // set the shader to use
        gl.useProgram(shaderProgram);

 		// connect up the shader parameters: vertex position, texture coordinate,
 		// projection/model matrices and texture
   	    // set up the buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute, obj.vertSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.texCoordBuffer);
        gl.vertexAttribPointer(shaderTexCoordAttribute, obj.texCoordSize, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);

        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false, projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, modelViewMatrix);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, webGLTexture);
        gl.uniform1i(shaderSamplerUniform, 0);

        // draw the object
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);        
        

    }

    ctxGL.viewport(0,0,w.getCanvas().width,
                   w.getCanvas().height);
    initMatrices(w.getCanvas());
    var Cube = createCube(ctxGL);
    initShader(ctxGL);
    initTexture(ctxGL);

    return{
        loop:function(td){
            var fract = td/4;
            var angle = Math.PI * 2 * fract;
            mat4.rotate(modelViewMatrix, modelViewMatrix, angle, rotationAxis);
            //initMatrices(w.getCanvas());
            draw(ctxGL, Cube, td);
            
        },
        houseKeeping:function(){
            console.log('housekeeping of:'+ name);
            w.getInterface().clear();
        }
    };
}

function cubeGeometryLoop(opt){
    var ctxGL = opt.contextGL;
    var name = "cubeGeometry";
    console.log("into cubeGeometryLoop");

    var projectionMatrix,modelViewMatrix;
    var shaderProgram,
        shaderVertexPositionAttribute,
        shaderVertexColorAttribute,
        shaderProjectionMatrixUniform,
        shaderModelViewMatrixUniform;
    var rotationAxis;
    
    function createCube(gl){
        //vertex
        var vertexBuffer;
        vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        var verts= [
            //front
                -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            1.0, 1.0, 1.0,
                -1.0, 1.0, 1.0,
            //back
                -1.0, -1.0, -1.0,
                -1.0, 1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, -1.0, -1.0,
            // top
                -1.0, 1.0, -1.0,
                -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, -1.0,
            //bot
                -1.0,-1.0,-1.0,
            1.0,-1.0,-1.0,
            1.0,-1.0,1.0,
                -1.0, -1.0,1.0,
            //right
            1.0,-1.0,-1.0,
            1.0,1.0,-1.0,
            1.0,1.0,1.0,
            1.0, -1.0, 1.0,
            //left
                -1.0,-1.0,-1.0,
                -1.0,-1.0,1.0,
                -1.0,1.0,1.0,
                -1.0,1.0,-1.0
            
        ];
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);

        var colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        var faceColors= [
            [1.0, 0.0, 0.0, 1.0], // front
            [0.0, 1.0, 0.0, 1.0], // back
            [0.0, 0.0, 1.0, 1.0], // top
            [1.0, 1.0, 0.0, 1.0],//bot
            [1.0, 0.0, 1.0, 1.0],//right
            [0.0, 1.0, 1.0, 1.0]//left
        ];
        var vertexColors = [];
        for(var i in faceColors){
            var color = faceColors[i];
            for(var j=0; j<4; j++){// 4 vertice for 1 face
                vertexColors = vertexColors.concat(color);
            }
        }
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);

        var cubeIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeIndexBuffer);
        var cubeIndices = [
            0,1,2,  0,2,3,  //front face
            4,5,6,  4,6,7,  // back face
            8,9,10, 8, 10,11, // top face
            12,13,14,  12,14,15, // bot face
            16,17,18,  16,18,19, // right face
            20,21,22,  20,22,23 // left face
        ];
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeIndices), gl.STATIC_DRAW);

        var cube = {
            buffer:vertexBuffer,
            colorBuffer:colorBuffer,
            indices:cubeIndexBuffer,
            vertSize:3,
            nVerts:24,
            colorSize:4,
            nColors:24,
            nIndices:36,
            primtype:gl.TRIANGLES
        };
        return cube;
    }

    function initMatrices(canvas){
        modelViewMatrix = mat4.create();
        mat4.translate( modelViewMatrix, modelViewMatrix, [0,0,-8]);

        projectionMatrix = mat4.create();
        mat4.perspective(projectionMatrix, Math.PI/4,
                         canvas.width/canvas.height, 1, 10000);
        rotationAxis = vec3.create();
        vec3.normalize(rotationAxis, [1,1,1]);
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
            "attribute vec4 vertexColor;\n" +
            "uniform mat4 modelViewMatrix;\n" +
            "uniform mat4 projectionMatrix;\n" +
            "varying vec4 vColor;\n" +
            "void main(void){\n" +
            "    gl_Position = projectionMatrix * modelViewMatrix * vec4(vertexPos, 1.0);\n" +
            "    vColor = vertexColor;\n" +
            "}\n";
    var fragmentShaderSRC =
            "precision mediump float;\n" +
            "varying vec4 vColor;\n" +
            "void main(void){\n" +
            "    gl_FragColor = vColor;\n" +
            "}\n";

    function initShader(gl){
        var fragmentShader = createShader(gl,fragmentShaderSRC, "fragment");
        var vertexShader = createShader(gl, vertexShaderSRC, "vertex");

        shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        shaderVertexPositionAttribute=gl.getAttribLocation(shaderProgram,"vertexPos");
        gl.enableVertexAttribArray(shaderVertexPositionAttribute);
            
        shaderVertexColorAttribute =gl.getAttribLocation(shaderProgram,"vertexColor");
        gl.enableVertexAttribArray(shaderVertexColorAttribute);

        shaderProjectionMatrixUniform =
            gl.getUniformLocation(shaderProgram, "projectionMatrix");
        shaderModelViewMatrixUniform =
            gl.getUniformLocation(shaderProgram, "modelViewMatrix");

        if( !gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)){
            console.log("Could not init shaders");
        }
    }

    
    function draw(gl,obj,td){
        gl.clearColor(0,0,0,1);
        gl.enable(gl.DEPTH_TEST);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.useProgram(shaderProgram);

        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffer);
        gl.vertexAttribPointer(shaderVertexPositionAttribute,obj.vertSize, gl.FLOAT, false, 0,0);
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.colorBuffer);
        gl.vertexAttribPointer(shaderVertexColorAttribute, obj.colorSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.indices);
        gl.uniformMatrix4fv(shaderProjectionMatrixUniform, false,projectionMatrix);
        gl.uniformMatrix4fv(shaderModelViewMatrixUniform, false, modelViewMatrix);
        gl.drawElements(obj.primtype, obj.nIndices, gl.UNSIGNED_SHORT, 0);
        
    }

    ctxGL.viewport(0,0,w.getCanvas().width,
                   w.getCanvas().height);
    initMatrices(w.getCanvas());
    var Cube = createCube(ctxGL);
    initShader(ctxGL);
    
    return{
        loop:function(td){
            var fract = td/4;
            var angle = Math.PI * 2 * fract;
            mat4.rotate(modelViewMatrix, modelViewMatrix, angle, rotationAxis);
            //initMatrices(w.getCanvas());
            draw(ctxGL, Cube, td);
            
        },
        houseKeeping:function(){
            console.log('housekeeping of:'+ name);
            w.getInterface().clear();
        }
    };
}
