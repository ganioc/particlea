//splash screen, duing load in webview
function splashLoop(opt){
    var ctxGL = opt.contextGL;
    var name = "splashscreen";
    console.log("into splashLoop");
    var counter = 0;
    function draw(gl, td){
        gl.clearColor(0,1,0,1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    }
    
    return{
        loop:function(td){
            draw(ctxGL,td);
            
        },
        houseKeeping:function(){
            console.log('housekeeping of:'+ name);
            w.getInterface().clear();

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
