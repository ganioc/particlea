/**
 * 
 * @param {} opt
 * @returns {} 
 */
function XLoop(opt){
    var gl = opt.contextGL;
    var name = "runningStarWebGLLoop";
    console.log("into running Star Loop");

    var program;
    var objList = [];
    var WIDTH = w.getCanvas().width, HEIGHT = w.getCanvas().height;

    var vertexShaderSRC = ""
        +"attribute vec3 a_vertex;\n"
        +"attribute vec2 a_texCoord;\n"
        +"uniform mat4 u_mvMatrix;\n"
        +"uniform mat4 u_pMatrix;\n"
        +"varying vec2 v_texCoord;\n"
        +"void main(void){\n"
        +"    gl_Position = u_mvMatrix * u_pMatrix * vec4(a_vertex, 1.0);\n"
        +"    v_texCoord = a_texCoord;\n"
        +"}\n"
    ;
    var fragmentShaderSRC = ""
        +"precision mediump float;\n"
        +"varying vec2 v_texCoord;\n"
        +"uniform sampler2D uSampler;\n"
        +"uniform vec3 uColor;\n"
        +"void main(void){\n"
        +"    vec4 textureColor = texture2D(uSampler, vec2(v_texCoord.s, v_texCoord.t));\n"
    //+"    gl_FragColor = textureColor * vec4(uColor,1.0);\n"
        +"    gl_FragColor = vec4(1.0,1.0,1.0,1.0);\n"
        +"}\n"
    ;
    
    function initProgram(gl, vSRC, fSRC){
        return webGLUtil.initShader(gl,vSRC,fSRC);
    }

    var starsObj = {
        verts: new Float32Array([
                -1.0,-1.0, 0,
            1.0, -1.0, 0,
                -1.0,1.0,0,
            1.0,1.0, 0
        ]),
        texCoord: new Float32Array([
            0,0,
            1,0,
            0,1,
            1,1
        ]),
        vertSize:3,
        vertNum:4,
        texCoordSize:2,
        texCoordNum:4
    };


    program = initProgram(gl,vertexShaderSRC,fragmentShaderSRC);
    gl.useProgram(program);

    var vertexAttrLoc = gl.getAttribLocation(program, 'a_vertex');
    gl.enableVertexAttribArray(vertexAttrLoc);
    var vertexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,starsObj.verts, gl.STATIC_DRAW);
    
    var texCoordAttrLoc = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(texCoordAttrLoc);
    var texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,starsObj.texCoord, gl.STATIC_DRAW);

    var mvMatrixUniLoc = gl.getUniformLocation(program, 'u_mvMatrix');
    var pMatrixUniLoc = gl.getUniformLocation(program, 'u_pMatrix');
    var sampler2DUniLoc = gl.getUniformLocation(program, 'uSampler');
    var colorUniLoc = gl.getUniformLocation(program, 'uColor');

    var starTexture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, starTexture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, w.getImage('star'));
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.bindTexture(gl.TEXTURE_2D, null);

    var mvMatrix = mat4.create();
    var pMatrix = mat4.create();
    var mvMatrixStack = [];
    var zoom = -15, tilt = 90, spin = 0;
    var stars = [], numStars = 50;
    var twinkle = true;
    
    function drawStar() {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, starTexture);
        //gl.uniform1i(sampler2DUniLoc, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER,texCoordBuffer);
        gl.vertexAttribPointer(texCoordAttrLoc, starsObj.texCoordSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(vertexAttrLoc,starsObj.vertSize , gl.FLOAT, false, 0, 0);

        //setMatrixUniforms();
        gl.uniformMatrix4fv(pMatrixUniLoc, false, pMatrix);
        gl.uniformMatrix4fv(mvMatrixUniLoc, false, mvMatrix);
        
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, starsObj.vertNum);
    }

    
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
    
    Star.prototype.draw = function (tilt, spin, twinkle) {
        mvPushMatrix();
        // Move to the star's position
        mat4.rotate(mvMatrix,mvMatrix, webGLUtil.degToRad(this.angle), [0.0, 1.0, 0.0]);
        mat4.translate(mvMatrix, mvMatrix,[this.dist, 0.0, 0.0]);

        // Rotate back so that the star is facing the viewer
        mat4.rotate(mvMatrix, mvMatrix,webGLUtil.degToRad(-this.angle), [0.0, 1.0, 0.0]);
        mat4.rotate(mvMatrix, mvMatrix,webGLUtil.degToRad(-tilt), [1.0, 0.0, 0.0]);

        if (twinkle) {
            // Draw a non-rotating star in the alternate "twinkling" color
            gl.uniform3f(colorUniLoc, this.twinkleR, this.twinkleG, this.twinkleB);
            drawStar();
        }
        // All stars spin around the Z axis at the same rate
        mat4.rotate(mvMatrix,mvMatrix,  webGLUtil.degToRad(spin), [0.0, 0.0, 1.0]);

        // Draw the star in its main color
        gl.uniform3f(colorUniLoc, this.r, this.g, this.b);
        drawStar();

        mvPopMatrix();
    };


    var effectiveFPMS = 60 / 1000;
    Star.prototype.animate = function (elapsedTime) {
        this.angle += this.rotationSpeed * effectiveFPMS * elapsedTime;

        // Decrease the distance, resetting the star to the outside of
        // the spiral if it's at the center.
        this.dist -= 0.01 * effectiveFPMS * elapsedTime;
        if (this.dist < 0.0) {
            this.dist += 5.0;
            this.randomiseColors();
        }

    };

    
    for(var i = 0; i< numStars; i++){
        stars.push(new Star( (i/numStars)*5.0, i/numStars));
    }
    
    function mvPushMatrix() {
        var copy = mat4.create();
        mat4.copy(mvMatrix, copy);
        mvMatrixStack.push(copy);
    }

    function mvPopMatrix() {
        if (mvMatrixStack.length == 0) {
            throw "Invalid popMatrix!";
        }
        mvMatrix = mvMatrixStack.pop();
    }
    
    gl.viewport(0,0,WIDTH, HEIGHT);


    function draw(gl,td){
        gl.clearColor(0,1,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        mat4.perspective(45, WIDTH/HEIGHT,0.1, 100.0, pMatrix);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.enable(gl.BLEND);

        mat4.identity(mvMatrix);
        mat4.translate(mvMatrix,mvMatrix, [0.0, 0.0, zoom]);
        mat4.rotate(mvMatrix,mvMatrix,webGLUtil.degToRad(tilt),[1.0,0.0,0.0]);
        for(var i in stars){
            stars[i].draw(tilt,spin, twinkle);
            spin += 0.1;
        }
        // animate it
        for(i in stars){
            stars[i].animate(td);
        }
    }
    
    return{
        loop:function(td){
            draw(gl,td);
            //console.log('.');
        },
        houseKeeping:function(){
            console.log('housekeeping of:'+ name);
            w.getInterface().clear();
        }
    };
}
// end of runningStarLoop
