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
                -1,-1, 0,
            1, -1, 0,
                -1,1,0,
            1,1, 0            
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

    program = webGLUtil.initShader(gl,vertexShaderSRC,fragmentShaderSRC);
    gl.useProgram(program);

    var vertLoc = gl.getAttribLocation(program, 'a_vertex');
    var vertBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertBuffer);
    gl.enableVertexAttribArray(vertLoc);
    gl.bufferData(gl.ARRAY_BUFFER, imgBackgroundObj.verts, gl.STATIC_DRAW);
    
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

    var pMatrixLoc = gl.getUniformLocation(program, 'u_pMatrix');

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

    function imgStar(startingDistance, rotationSpeed){
        this.angle = 0;// in radian already
        this.rotationSpeed = rotationSpeed;
        this.dist = startingDistance;
        this.randomiseColors();
    }
    imgStar.prototype.randomiseColors = function(){
        this.r = Math.random();
        this.g = Math.random();
        this.b = Math.random();
        this.twinkleR = Math.random();
        this.twinkleG = Math.random();
        this.twinkleB = Math.random();
    };    

    imgStar.prototype.animate = function(td){
        if(bDirection){
            this.angle += this.rotationSpeed * td * 3;
        }else{
            this.angle -= this.rotationSpeed * td * 3;
        }
        this.dist -= 0.5 * td;
        if( this.dist < 0.0){
            this.dist += 9.0;
            this.randomiseColors();
        }
    };
    
    

    
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, sampler2DTexture);
    gl.uniform1i(sampler2DLoc, 0);

    gl.bindBuffer( gl.ARRAY_BUFFER, vertBuffer);
    gl.vertexAttribPointer(vertLoc, imgBackgroundObj.vertSize, gl.FLOAT, false, 0,0);
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.vertexAttribPointer(texCoordLoc, imgBackgroundObj.texCoordSize, gl.FLOAT, false, 0, 0);

    var mvMatrix = mat4.create(), pMatrix = mat4.create();
    var mvMatrixStack = [];
    var zoom = -20, tilt = Math.PI/2, spin = 0;
    var numStars = 50;

    for( var i=0; i< numStars; i++){
        objList.push(new imgStar((i/numStars)*8.0 + 1, i/numStars ));
    }
    
    gl.clearColor(0,0,0,1);
    //gl.enable(gl.DEPTH_TEST);

    
    function draw(gl , bMark, td){
        gl.viewport(0,0,WIDTH,HEIGHT);
        gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT);

        mat4.identity(pMatrix);        
        mat4.perspective(pMatrix, Math.PI/4, WIDTH/HEIGHT, 0.1, 10000);
        //gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.blendFunc(gl.ONE, gl.ONE);
        gl.enable(gl.BLEND);

        mat4.identity(mvMatrix);
        mat4.translate(mvMatrix, mvMatrix, [0,0,zoom]);//move
        mat4.rotate( mvMatrix, mvMatrix, tilt, [1.0, 0.0, 0.0]);// tilt
        
        _.each(objList,function(c){
            mvPushMatrix();
            
            mat4.rotate(mvMatrix, mvMatrix, c.angle, [0.0, 1.0, 0.0]);
            mat4.translate(mvMatrix, mvMatrix, [c.dist, 0, 0]);
            mat4.rotate(mvMatrix, mvMatrix, -c.angle, [0.0, 1.0, 0.0]);
            mat4.rotate(mvMatrix, mvMatrix, -tilt, [1.0, 0, 0]);
            
            gl.uniformMatrix4fv(matrixLoc, false, mvMatrix);
            gl.uniformMatrix4fv(pMatrixLoc, false, pMatrix);

            gl.uniform3f(colorLoc, c.twinkleR, c.twinkleG, c.twinkleB);            
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, imgBackgroundObj.vertNum);

            mat4.rotate(mvMatrix, mvMatrix, spin, [0, 0, 1.0]);            
            gl.uniform3f(colorLoc, c.r, c.g, c.b);            
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, imgBackgroundObj.vertNum);

            mvPopMatrix();
            spin += 0.3;
        });

        _.each(objList, function(c){
            c.animate(td);
        });

    }
    var counter = 0;
    var bDirection = true;
    
    return{
        loop:function(td){
            counter += td*0.02;

            if(counter >= 0.7853 ){//0.7853
                counter = 0;
                bDirection = !bDirection;
            }
            
            tilt = (Math.PI/2) * Math.cos(counter);
            zoom = ( -40 + 5 * Math.cos(counter));
            draw(gl,false, td);
        },
        houseKeeping:function(){
            console.log('housekeeping of:'+ name);
            w.getInterface().clear();
        }
    };
}
// end of runningStarLoop

function multiThingWebGLLoop(opt){
    var gl = opt.contextGL;
    gl.getExtension('OES_texture_float');
    
    var name = "multiThingWebGLLoop";
    console.log("into multiThing Loop");

    var WIDTH = w.getCanvas().width, HEIGHT = w.getCanvas().height;

    var bufferVertexShaderSRC = [
        "attribute vec2 a_bufferVertex;",
        "uniform vec2 u_bufferResolution;",
        "uniform vec2 u_clickPosition;",
        
        "varying vec2 v_UV;",
        "varying vec2 v_clickPosition;",
        "varying vec2 v_bufferResolution;",
        
        "vec2 convert(vec2 inp, vec2 res){",
        "    vec2 temp = inp/res;",
        "    return vec2(2.0*temp - 1.0);",
        "}",
        "void main(void){",
        "    gl_PointSize = 1.0;",
        "    vec2 posTemp = convert(a_bufferVertex, u_bufferResolution);",
        "    gl_Position = vec4(posTemp.x, posTemp.y, 0.0,  1.0);",
        "    v_clickPosition = vec2(u_clickPosition.x, u_bufferResolution.y - u_clickPosition.y);",
        "    v_bufferResolution = u_bufferResolution;",
        "}"
    ].join("\n");

    var bufferFragmentShaderSRC = [
        "precision highp float;",
        "varying vec2 v_UV;",
        "varying vec2 v_clickPosition;",
        "varying vec2 v_bufferResolution;",
        "vec2 convert2D(vec2 inp, vec2 res){",
        "    return vec2(0.0, 0.0);",
        "}",        
        "void main(){",// write the mouse clicked point as an impulse into buffer0
        "    vec2 onePixel = vec2(1.0, 1.0)/v_bufferResolution;",
        "    if((gl_FragCoord.x - v_clickPosition.x ) == -0.5 && (gl_FragCoord.y - v_clickPosition.y ) == -0.5){",
        "        gl_FragColor = vec4(10000.0, 0.0, 0.0, 0.0);",
        "    }else if( (gl_FragCoord.x - v_clickPosition.x ) == 0.5 && (gl_FragCoord.y - v_clickPosition.y ) == -0.5 ){",
        "        gl_FragColor = vec4(-10000.0, 0.0, 0.0, 0.0);",
        "    }else{ ",
                "discard; }", //""
        "}"
    ].join("\n");

    var buffer2VertexShaderSRC = [
        "attribute vec2 a_vertex2;",
        "attribute vec2 a_texCoord2;",
        "varying vec2 v_texCoord2;",
        "void main(void){",
        "    gl_Position = vec4(a_vertex2, 0.0, 1.0);",
        "    v_texCoord2 = a_texCoord2;",
        "}"
    ].join("\n");

    var buffer2FragmentShaderSRC = [
        "precision highp float;",        
        "uniform sampler2D u_texture0;",
        "uniform sampler2D u_texture1;",
        "uniform vec2 u_buffer2Resolution;",
        "varying vec2 v_texCoord2;",
        "void main(void){",
        "    vec2 onePixel = vec2(1.0, 1.0)/u_buffer2Resolution;",
        "    float oldWaveHeight = texture2D(u_texture1, v_texCoord2).r;",
        "    float newMinusOne = texture2D(u_texture0,v_texCoord2 + vec2(-onePixel.x,0)).r;",
        "    float newPlusOne= texture2D(u_texture0,v_texCoord2 + vec2(onePixel.x,0)).r;",
        "    float newMinusCol= texture2D(u_texture0, v_texCoord2 + vec2(0,-onePixel.y)).r;",
        "    float newPlusCol= texture2D(u_texture0, v_texCoord2 + vec2(0, onePixel.y)).r;",
        "    ",
        "    float xColor = (newMinusOne + newPlusOne + newMinusCol + newPlusCol )/2.0 - oldWaveHeight;",
        "    gl_FragColor = vec4(xColor, 0.0, 0.0, 0.0);",
        //"    gl_FragColor = vec4( texture2D(u_texture0, v_texCoord2).r, 0.0, 0.0, 0.0);",
        "",
        "}"
    ].join("\n");
    
    var vertexShaderSRC = [
        "attribute vec2 a_vertex;",
        "attribute vec2 a_texCoord;",
        "varying vec2 v_texCoord;",
        "void main(void){",
        "    gl_Position = vec4(a_vertex*vec2(1,1), 0.0, 1.0);",
        "    v_texCoord = a_texCoord;",
        "}"
    ].join("\n");

    var fragmentShaderSRC = [
        "precision highp float;",
        "uniform sampler2D u_texture2;",
        "uniform sampler2D u_textureOriginal;",
        "uniform vec2 u_resolution;",
        "varying vec2 v_texCoord;",
        "void main(void){",
        "    vec2 onePixel = vec2(1.0, 1.0)/u_resolution;",
        "    float waveMinusTwo = texture2D(u_texture2, v_texCoord + vec2(-2.0*onePixel.x, 0)).r;",
        "    float waveMinusCol= texture2D(u_texture2,v_texCoord + vec2(0,-onePixel.y)).r;",
        "    float waveHeight = texture2D(u_texture2, v_texCoord ).r;",
        "",
        "    float offsetX = (waveMinusTwo - waveHeight)*0.08;",
        "    float offsetY = (waveMinusCol - waveHeight)*0.08;",
        "",
        "    offsetX = (offsetX<0.0)?0.0:(offsetX>u_resolution.x?u_resolution.x:offsetX);",
        "    offsetY = (offsetY<0.0)?0.0:(offsetY>u_resolution.y?u_resolution.y:offsetY);",
        "    float light = waveHeight*2.0 - waveMinusTwo*0.6;",
        "    light = (light < -10.0)?(-10.0):(light>100.0?100.0:light);",
        "    light = light/255.0;",
        "    ",
        "    gl_FragColor = texture2D(u_textureOriginal, v_texCoord + vec2(offsetX, offsetY)) + vec4(light, light, light, 0.0);",
        "}"
    ].join("\n");

    var clickPosition = {x:-5, y:-5};
    
    function clickCallback(e){
        console.log('mouse clicked:'+ e.clientX +':'+ e.clientY);
        clickPosition.x = e.clientX * window.devicePixelRatio;
        clickPosition.y = e.clientY * window.devicePixelRatio;
    }

    function touchstartCallback(e){
        clickPosition.x = e.touches[0].pageX * window.devicePixelRatio;
        clickPosition.y = e.touches[0].pageY * window.devicePixelRatio;
        console.log('touched:' + clickPosition.x +':' + clickPosition.y);
    }
    
    w.getInterface().register(
        'mousedown',
        {name:'canvas'},
        clickCallback
    );

    w.getInterface().register(
        'touchstart',
        {name:'canvas'},
        touchstartCallback
    );

    var bufferProgram = webGLUtil.initShader(gl, bufferVertexShaderSRC, bufferFragmentShaderSRC);
    //var buffer1Program = webGLUtil.initShader(gl, buffer1VertexShaderSRC, buffer1FragmentShaderSRC);
    var buffer2Program = webGLUtil.initShader(gl, buffer2VertexShaderSRC, buffer2FragmentShaderSRC);
    var program = webGLUtil.initShader(gl, vertexShaderSRC, fragmentShaderSRC);

    // framebuffers and textures
    var frameBuffers = [];
    var textures = [],  textureIndex0 = 0, textureIndex1 = 1, textureIndex2 = 2;
    for(var i =0 ; i < 3; i++){
        textures[i] = createAndSetupTexture(gl);
        // make the texture the same size as the image, RGBA used
        gl.texImage2D(
            gl.TEXTURE_2D, 0, gl.RGBA, WIDTH, HEIGHT, 0,
            gl.RGBA, gl.FLOAT, null);

        // gl.texImage2D(
        //     gl.TEXTURE_2D, 0, gl.RGBA, WIDTH, HEIGHT, 0,
        //     gl.RGBA, gl.UNSIGNED_BYTE, null);        
        
        frameBuffers[i] = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffers[i]);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0,
                                gl.TEXTURE_2D, textures[i], 0);
    }
    
    var originalTexture = createAndSetupTexture(gl);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, w.getImage('beautiful'));
    
    var particles = new Float32Array(WIDTH * HEIGHT * 2);
    for(var j = 0; j < WIDTH*HEIGHT; j++){
        particles[j*2] = j % WIDTH;
        particles[j*2 +1] = Math.floor(j/WIDTH);
    }
    var particlesBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, particlesBuffer  );
    gl.bufferData( gl.ARRAY_BUFFER, particles, gl.STATIC_DRAW);

    var verts = new Float32Array(
        [-1.0, -1.0,
         1.0,  -1.0,
         -1.0,  1.0,
         -1.0,  1.0,
         1.0,   1.0,
         1.0,  -1.0
        ]);
    var texCoords = new Float32Array(
        [0.0,  0.0,
         1.0,  0.0,
         0.0,  1.0,
         0.0,  1.0,
         1.0,  1.0,
         1.0,  0.0
        ]);
    
    var vertsBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertsBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);

    var texCoordsBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, texCoordsBuffer );
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);
    
    function createAndSetupTexture(gl) {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        // Set up texture so we can render any size image and so we are
        // working with pixels.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        return texture;
    }

    function setFramebuffer(fbo, width, height) {
        // make this the framebuffer we are rendering to.
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
        
        // Tell the shader the resolution of the framebuffer.
        //gl.uniform2f(resolutionLoc, width, height);
        
        // Tell webgl the viewport setting needed for framebuffer.
        gl.viewport(0, 0, width, height);
    }
    //gl.useProgram( bufferProgram);
    //gl.viewport(0,0, WIDTH, HEIGHT);
    function decreaseIndex(n){
        var temp = n - 1;
        if( temp < 0){
            return 2;
        }else{
            return temp;
        }
    }
    function switchTextureBuffer(){
        textureIndex0 = decreaseIndex(textureIndex0);
        textureIndex1 = decreaseIndex(textureIndex1);
        textureIndex2 = decreaseIndex(textureIndex2);
    }
    
    function draw(gl, bMark){
        // write to buffer0
        //gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        //gl.enable(gl.BLEND);
        
        gl.useProgram(bufferProgram);
        setFramebuffer( frameBuffers[textureIndex0], WIDTH, HEIGHT);

        var particlesLoc = gl.getAttribLocation(bufferProgram, 'a_bufferVertex');
        gl.bindBuffer(gl.ARRAY_BUFFER, particlesBuffer);
        gl.vertexAttribPointer( particlesLoc, 2, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray( particlesLoc);
        
        var bufferResolutionLoc = gl.getUniformLocation(bufferProgram, 'u_bufferResolution');
        gl.uniform2f( bufferResolutionLoc, WIDTH, HEIGHT);

        var clickPositionLoc = gl.getUniformLocation(bufferProgram, 'u_clickPosition');
        gl.uniform2f( clickPositionLoc, clickPosition.x, clickPosition.y);

        gl.drawArrays(gl.POINTS, 0, WIDTH*HEIGHT);
        //=====================================================================
        // write to buffer2 from buffer0 and buffer1
        gl.useProgram(buffer2Program);
        setFramebuffer( frameBuffers[textureIndex2], WIDTH, HEIGHT);
        var vertsBuffer2Loc = gl.getAttribLocation(buffer2Program, 'a_vertex2');
        gl.bindBuffer(gl.ARRAY_BUFFER, vertsBuffer);
        gl.vertexAttribPointer(vertsBuffer2Loc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray( vertsBuffer2Loc );

        var texCoordsBuffer2Loc = gl.getAttribLocation(buffer2Program, 'a_texCoord2');
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsBuffer);
        gl.vertexAttribPointer(texCoordsBuffer2Loc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray( texCoordsBuffer2Loc);

        var uTexture0Buffer2Loc = gl.getUniformLocation(buffer2Program, 'u_texture0');
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture( gl.TEXTURE_2D, textures[textureIndex0]  );
        gl.uniform1i( uTexture0Buffer2Loc, 0 );

        var uTexture1Buffer2Loc = gl.getUniformLocation(buffer2Program, 'u_texture1');
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture( gl.TEXTURE_2D, textures[textureIndex1]  );
        gl.uniform1i( uTexture1Buffer2Loc, 1 );        

        var uBuffer2ResolutionLoc = gl.getUniformLocation( buffer2Program, 'u_buffer2Resolution');
        gl.uniform2f( uBuffer2ResolutionLoc, WIDTH, HEIGHT);        

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        //=======================================================================
        
        //=======================================================================
        // write to normal display from buffer2
        gl.useProgram(program);
        setFramebuffer( null, WIDTH, HEIGHT);
        gl.clearColor(0,0,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT);
        
        var vertsLoc = gl.getAttribLocation(program, 'a_vertex');
        gl.bindBuffer(gl.ARRAY_BUFFER, vertsBuffer);
        gl.vertexAttribPointer( vertsLoc, 2, gl.FLOAT, false, 0, 0 );
        gl.enableVertexAttribArray(vertsLoc);
        
        var texCoordsLoc = gl.getAttribLocation(program, 'a_texCoord');
        gl.bindBuffer(gl.ARRAY_BUFFER, texCoordsBuffer);
        gl.vertexAttribPointer( texCoordsLoc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(texCoordsLoc);

        var uTexture0Loc = gl.getUniformLocation(program, 'u_texture2');
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures[textureIndex2]);
        gl.uniform1i( uTexture0Loc, 0);

        var uTextureOriginalLoc = gl.getUniformLocation(program, 'u_textureOriginal');
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, originalTexture);
        gl.uniform1i( uTextureOriginalLoc, 1);

        var uResolutionLoc = gl.getUniformLocation( program, 'u_resolution');
        gl.uniform2f( uResolutionLoc, WIDTH, HEIGHT);        
        
        gl.drawArrays( gl.TRIANGLES, 0, 6);
        //==============================================================
        //
        clickPosition.x = -5;
        clickPosition.y = -5;
        switchTextureBuffer();// switch buffer0 and buffer1
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

function multiThingWebGLLoop3(opt){
    var gl = opt.contextGL;
    var name = "multiThingWebGLLoop";
    console.log("into multiThing Loop");

    var WIDTH = w.getCanvas().width, HEIGHT = w.getCanvas().height;
    var SIZE = WIDTH*HEIGHT;

    var buffer0 = new Float32Array(SIZE);
    var buffer1 = new Float32Array(SIZE);

    function disturb(x,y,z){
        if( x< 2 || x > (WIDTH -2) || y < 1 || y >(HEIGHT -2)){
            return;
        }
        var i = x + y* WIDTH;
        buffer0[i] += z;
        buffer0[i -1] -= z;
    }
    function average_waveheight(){
        var i , x;
        for(i = WIDTH + 1; i < SIZE - WIDTH -1; i+=2){
            for( x = 1; x < WIDTH -1; x++, i++){
                buffer0[i] =
                    (buffer0[i] + buffer0[i+1] + buffer0[i-1] + buffer0[i-WIDTH] +buffer0[i+WIDTH])/5.0;
            }
        }
    }
    function compute_waveheight(){
        var i , x, waveHeight;
        for(i = WIDTH + 1; i < SIZE - WIDTH -1; i+=2){
            for( x = 1; x < WIDTH -1; x++, i++){
                waveHeight = (buffer0[i+1] + buffer0[i-1] + buffer0[i-WIDTH] +buffer0[i+WIDTH])/2 - buffer1[i];
                buffer1[i] = waveHeight;
            }
        }
    }
    function switch_buffer(){
        var temp = buffer0;
        buffer0 = buffer1;
        buffer1 = temp;
    }
    function draw(gl, bMark){
        average_waveheight();
        compute_waveheight();
        switch_buffer();
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
