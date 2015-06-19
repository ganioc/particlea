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
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
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
