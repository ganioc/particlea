/**
 * 
 * @param {} opt
 * @returns {} 
 */
//////////////////////////////////////////////////
function runningStarWebGLLoop(opt){
    var gl = opt.contextGL;
    var name = "runningstar";
    console.log("into running star Loop");
    
    var program;
    var objList = [];
    var WIDTH = w.getCanvas().width;
    var HEIGHT = w.getCanvas().height;
    
    var vertexShaderSRC = ""
        +"attribute vec3 a_vertex;\n"
        +"attribute vec2 a_texCoord;\n"
        +"uniform mat4 u_matrix;\n"
        +"uniform mat4 u_pMatrix;\n"
        +"varying vec2 v_texCoord;\n"
        +"void main(void){\n"
        +"    gl_Position= u_pMatrix * u_matrix * vec4(a_vertex, 1.0);\n"
        +"    gl_PointSize = 10.0;\n"
        +"    v_texCoord = a_texCoord;\n"
        //+"    v_color = vec4(0,1,0,1);\n"
        +"}\n"
    ;
    var fragmentShaderSRC = ""
        +"precision mediump float;\n"
        +"uniform sampler2D u_image;\n"
        +"uniform vec3 uColor;\n"
        +"varying vec2 v_texCoord;\n"
        +"void main(void){\n"
        +"    vec4 textureColor = texture2D(u_image,vec2(v_texCoord.s,v_texCoord.t));\n"
        +"    gl_FragColor = textureColor * vec4(uColor, 1.0);\n"
        +"}\n"
    ;
    var imgBackgroundObj = {
        verts:new Float32Array([
                -1.0,-1.0, 0,
            1.0, -1.0, 0,
                -1.0,1.0,0,
            1.0,1.0, 0            
        ]),
        img: w.getImage('star'),
        texCoord: new Float32Array([
            0,0,
            1,0,
            0,1,
            1,1            
        ]
        ),
        vertNum:4,
        vertSize:3,
        texCoordNum:4,
        texCoordSize:2,
        bTexture:true,
        drawType:gl.TRIANGLE_STRIP
    };

    function initProgram(gl, vSRC, fSRC){
        return webGLUtil.initShader(gl,vSRC,fSRC);
    }

    program = initProgram(gl,vertexShaderSRC,fragmentShaderSRC);
    gl.useProgram(program);

    var vertLoc = gl.getAttribLocation(program, 'a_vertex');
    var vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    gl.enableVertexAttribArray(vertLoc);
    gl.bufferData(gl.ARRAY_BUFFER, imgBackgroundObj.verts
                  , gl.STATIC_DRAW);
    //gl.bufferData(gl.ARRAY_BUFFER,new Float32Array( rectObj.verts),gl.STATIC_DRAW);
    
    var texCoordLoc = gl.getAttribLocation(program, 'a_texCoord');
    var texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.enableVertexAttribArray(texCoordLoc);
    gl.bufferData(gl.ARRAY_BUFFER, imgBackgroundObj.texCoord, gl.STATIC_DRAW);

    var colorLoc = gl.getUniformLocation(program, 'uColor');
    gl.uniform3f(colorLoc, 1,0,0);
    
    var sampler2DLoc = gl.getUniformLocation(program, 'u_image');
    var sampler2DTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, sampler2DTexture);
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
        imgBackgroundObj.img
    );
    gl.bindTexture(gl.TEXTURE_2D, null);
    
    var matrixLoc = gl.getUniformLocation(program, 'u_matrix');
    gl.uniformMatrix4fv(matrixLoc, false,[
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,0,1
    ]);

    var pMatrixLoc = gl.getUniformLocation(program, 'u_pMatrix');
    gl.uniformMatrix4fv(pMatrixLoc, false,[
        1,0,0,0,
        0,1,0,0,
        0,0,1,0,
        0,0,0,1
    ]);
    // Object Star
    function Star(startingDistance, rotationSpeed){
        this.angle = 0;
        this.dist = startingDistance;
        this.rotationSpeed = rotationSpeed;
        this.randomiseColors();
    }
    Star.prototype.randomiseColors = function(){
        this.r = Math.random();
        this.g = Math.random();
        this.b = Math.random();
        this.twinkleR = Math.random();
        this.twinkleG = Math.random();
        this.twinkleB = Math.random();
    };
    
    Star.prototype.draw = function(tilt, spin, twinkle){
        mvPushMatrix();
        //mat4.rotate(mvMatrix, mvMatrix, webGLUtil.degToRad(this.angle), [0.0, 1.0, 0.0]);
        mat4.translate(mvMatrix, mvMatrix, [this.dist, 0.0, 0.0]);

        //mat4.rotate(mvMatrix, mvMatrix,webGLUtil.degToRad(-this.angle), [0.0, 1.0, 0.0]);
        //mat4.rotate(mvMatrix, mvMatrix,webGLUtil.degToRad(-tilt), [1.0, 0.0, 0.0]);
        //mat4.rotate(mvMatrix,mvMatrix,webGLUtil.degToRad(spin), [0.0,0.0,1.0]);
        
        gl.uniform3f(colorLoc, this.r, this.g, this.b);
        drawStar();
        mvPopMatrix();
    };

    function drawStar(){
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, sampler2DTexture);
        gl.uniform1i(sampler2DLoc, 0);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
        gl.vertexAttribPointer(vertLoc,imgBackgroundObj.vertSize,gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
        gl.vertexAttribPointer(texCoordLoc, imgBackgroundObj.texCoordSize, gl.FLOAT,false, 0,0);
        
        //gl.uniformMatrix4fv(matrixLoc,false, mvMatrix);//mvMatrix
        console.log('before drawing');
        console.log('mv');
        console.log(mvMatrix);
        console.log(pMatrix);
        
        setMatrixUniforms();
        //gl.uniformMatrix4fv(pMatrixLoc, false, pMatrix);
        
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, imgBackgroundObj.vertNum);

    }

    function mvPushMatrix() {
        var copy = mat4.create();
        mat4.copy(copy,mvMatrix);
        mvMatrixStack.push(copy);
    }

    function mvPopMatrix() {
        if (mvMatrixStack.length == 0) {
            throw "Invalid popMatrix!";
        }
        mvMatrix = mvMatrixStack.pop();
    }

    function setMatrixUniforms() {
        gl.uniformMatrix4fv(pMatrixLoc, false, pMatrix);
        gl.uniformMatrix4fv(matrixLoc, false, mvMatrix);
    }
    //objList.push(imgBackgroundObj );
    objList.push( new Star(0.8, 0.1) );
    objList.push( new Star(0.2, 0.1) );    
    // var numStars = 5;
    // for(var j =0; j<numStars;j++){
    //     objList.push( new Star((j/numStars) *5.0 , j/numStars ) );
    // }
    
    var mvMatrix = mat4.create(), pMatrix = mat4.create();
    var mvMatrixStack = [];
    var zoom = -15, tilt = 90, spin = 0;
    
    gl.clearColor(0,0,0,1);
    gl.enable(gl.DEPTH_TEST);
    
    function draw(gl, bMark){
        gl.viewport(0,0,w.getCanvas().width,w.getCanvas().height);

        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);

        gl.useProgram(program);

        mat4.perspective(pMatrix, Math.PI/4, WIDTH/HEIGHT, 0.1, 10000.0);

        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.enable(gl.BLEND);

        mat4.identity(mvMatrix);
        mat4.translate(mvMatrix, mvMatrix, [0.0, 0.0, zoom]);
        mat4.rotate( mvMatrix, mvMatrix, webGLUtil.degToRad(tilt),[1.0, 0.0, 0.0]  );
        console.log('mvMatrix:');
        console.log(mvMatrix);
        console.log('pMatrix:');
        console.log(pMatrix);
        
        //gl.useProgram(program);
        _.each(objList,
               function(c){
                   c.draw(tilt, spin, true);
                   spin += 0.1;
               });
    }
    
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
// end of runningStarLoop
