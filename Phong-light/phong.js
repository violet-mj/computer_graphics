"use strict";

var canvas;
var gl;
var near = 0.3;
var far = 3.0;
var radius = 0.125;
var p_theta  = 0.0;
var phi    = 0.0;
var dr = 5.0 * Math.PI/180.0;

var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect = 0.1;       // Viewport aspect ratio

var mvMatrix, pMatrix;
var p_modelView, p_projection;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);
var numVertices  = 216;

var pointsArray = [];
var normalsArray = [];

var vertices = [
        vec4( -0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5,  0.5,  0.5, 1.0 ),
        vec4( 0.5, -0.5,  0.5, 1.0 ),
        vec4( -0.5, -0.5, -0.5, 1.0 ),
        vec4( -0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5,  0.5, -0.5, 1.0 ),
        vec4( 0.5, -0.5, -0.5, 1.0 ),
        vec4( 0.125, 0.5, 0.125, 1.0 ),
        vec4( 0.125, 0.75, 0.125, 1.0 ),
        vec4( 0.375, 0.75, 0.125, 1.0 ),
        vec4( 0.375, 0.5, 0.125, 1.0 ),
        vec4( 0.125, 0.5, 0.375, 1.0 ),
        vec4( 0.125, 0.75, 0.375, 1.0 ),
        vec4( 0.375, 0.75, 0.375, 1.0 ),
        vec4( 0.375, 0.5, 0.375, 1.0 ),
        vec4( -0.375, 0.5, 0.125, 1.0 ),
        vec4( -0.375, 0.75, 0.125, 1.0 ),
        vec4( -0.125, 0.75, 0.125, 1.0 ),
        vec4( -0.125, 0.5, 0.125, 1.0 ),
        vec4( -0.375, 0.5, 0.375, 1.0 ),
        vec4( -0.375, 0.75, 0.375, 1.0 ),
        vec4( -0.125, 0.75, 0.375, 1.0 ),
        vec4( -0.125, 0.5, 0.375, 1.0 ),
        vec4( -0.25, -0.5, 0.5, 1.0 ),
        vec4( -0.25, -0, 0.5, 1.0 ),
        vec4( 0.25, -0, 0.5, 1.0 ),
        vec4( 0.25, -0.5, 0.5, 1.0 ),
        vec4( -0.25, -0.5, 0.75, 1.0 ),
        vec4( -0.25, -0, 0.75, 1.0 ),
        vec4( 0.25, -0, 0.75, 1.0 ),
        vec4( 0.25, -0.5, 0.75, 1.0 ),
        vec4(0.166, 0, 0.5, 1.0),
        vec4(0.166, 0.166, 0.5, 1.0),
        vec4(0.332, 0.166, 0.5, 1.0),
        vec4(0.332, 0, 0.5, 1.0),
        vec4(0.166, 0, 0.52, 1.0),
        vec4(0.166, 0.166, 0.52, 1.0),
        vec4(0.332, 0.166, 0.52, 1.0),
        vec4(0.332, 0, 0.52, 1.0),
        vec4(-0.332, 0, 0.5, 1.0),
        vec4(-0.332, 0.166, 0.5, 1.0),
        vec4(-0.166, 0.166, 0.5, 1.0),
        vec4(-0.166, 0, 0.5, 1.0),
        vec4(-0.332, 0, 0.52, 1.0),
        vec4(-0.332, 0.166, 0.52, 1.0),
        vec4(-0.166, 0.166, 0.52, 1.0),
        vec4(-0.166, 0, 0.52, 1.0),
    ];

var lightPosition = vec4(1.0, 1.0, 1.0, 0.0 );
var lightAmbient = vec4(0.1, 0.1 ,0.1, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 1.0, 0.8, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var ctm;
var ambientColor, diffuseColor, specularColor;
var modelView, projection;
var viewerPos;
var program;

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;
var axis = 0;
var theta =[0, 0, 0];

var thetaLoc;

var flag = true;

function quad(a, b, c, d) {

     var t1 = subtract(vertices[b], vertices[a]);
     var t2 = subtract(vertices[c], vertices[b]);
     var normal = cross(t1, t2);
     var normal = vec3(normal);


     pointsArray.push(vertices[a]);
     normalsArray.push(normal);
     pointsArray.push(vertices[b]);
     normalsArray.push(normal);
     pointsArray.push(vertices[c]);
     normalsArray.push(normal);
     pointsArray.push(vertices[a]);
     normalsArray.push(normal);
     pointsArray.push(vertices[c]);
     normalsArray.push(normal);
     pointsArray.push(vertices[d]);
     normalsArray.push(normal);
}


function colorCube()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
    quad( 9, 8, 11, 10 );
    quad( 10, 11, 15, 14 );
    quad( 11, 8, 12, 15 );
    quad( 14, 13, 9, 10 );
    quad( 12, 13, 14, 15 );
    quad( 13, 12, 8, 9 );
    quad( 17, 16, 19, 18 );
    quad( 18, 19, 23, 22 );
    quad( 19, 17, 20, 23 );
    quad( 22, 21, 17, 18 );
    quad( 20, 21, 22, 23 );
    quad( 21, 20, 16, 17 );
    quad( 25, 24, 27, 26 );
    quad( 26, 27, 31, 30 );
    quad( 27, 25, 28, 31 );
    quad( 30, 29, 25, 26 );
    quad( 28, 29, 30, 31 );
    quad( 29, 28, 24, 25 );
    quad( 33, 32, 35, 34 );
    quad( 34, 35, 39, 38 );
    quad( 35, 33, 36, 39 );
    quad( 38, 37, 33, 34 );
    quad( 36, 37, 38, 39 );
    quad( 37, 36, 32, 33 );
    quad( 41, 40, 43, 42 );
    quad( 42, 43, 47, 46 );
    quad( 43, 41, 44, 47 );
    quad( 46, 45, 41, 42 );
    quad( 44, 45, 46, 47 );
    quad( 45, 44, 40, 41 );
}


window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    colorCube();

    var nBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, nBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(normalsArray), gl.STATIC_DRAW );

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(pointsArray), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    thetaLoc = gl.getUniformLocation(program, "theta");

    viewerPos = vec3(0.0, 0.0, -20.0 );

    projection = ortho(-1, 1, -1, 1, -100, 100);

    p_modelView = gl.getUniformLocation( program, "modelView" );
    p_projection = gl.getUniformLocation( program, "projection" );
   //  document.getElementById("Button1").onclick = function(){near  *= 1.1; far *= 1.1;};
   //  document.getElementById("Button2").onclick = function(){near *= 0.9; far *= 0.9;};
   //  document.getElementById("Button3").onclick = function(){radius *= 2.0;};
   //  document.getElementById("Button4").onclick = function(){radius *= 0.5;};
    document.getElementById("Button5").onclick = function(){p_theta += dr;};
    document.getElementById("Button6").onclick = function(){p_theta -= dr;};
    document.getElementById("Button7").onclick = function(){phi += dr;};
    document.getElementById("Button8").onclick = function(){phi -= dr;};
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);

   //  document.getElementById("ButtonX").onclick = function(){axis = xAxis;};
   //  document.getElementById("ButtonY").onclick = function(){axis = yAxis;};
   //  document.getElementById("ButtonZ").onclick = function(){axis = zAxis;};
   //  document.getElementById("ButtonT").onclick = function(){flag = !flag;};

   document.getElementById('rotateX').onchange = function(e) {
      theta[xAxis] = parseInt(e.target.value)
   }
   document.getElementById('rotateY').onchange = function(e) {
      theta[yAxis] = parseInt(e.target.value)
   }
   document.getElementById('rotateZ').onchange = function(e) {
      theta[zAxis] = parseInt(e.target.value)
   }

    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"),
       flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"),
       flatten(diffuseProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"),
       flatten(specularProduct) );
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"),
       flatten(lightPosition) );

    gl.uniform1f(gl.getUniformLocation(program,
       "shininess"),materialShininess);

   //  gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),
   //     false, flatten(projection));

    render();
}

var render = function(){

    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

   //  if(flag) theta[axis] += 2.0;

    modelView = mat4();
    modelView = mult(modelView, rotate(theta[xAxis], [1, 0, 0] ));
    modelView = mult(modelView, rotate(theta[yAxis], [0, 1, 0] ));
    modelView = mult(modelView, rotate(theta[zAxis], [0, 0, 1] ));
    eye = vec3(radius*Math.sin(p_theta)*Math.cos(phi),
    radius*Math.sin(p_theta)*Math.sin(phi), radius*Math.cos(p_theta));
    mvMatrix = lookAt(eye, at , up);
    modelView = mult(modelView, mvMatrix)
    console.log(fovy, aspect, near, far)
    pMatrix = perspective(fovy, aspect, near, far);
   //  projection = pMatrix
    gl.uniformMatrix4fv( gl.getUniformLocation(program, "projectionMatrix"),
       false, flatten(projection));
    gl.uniformMatrix4fv( p_projection, false, flatten(pMatrix) );
    gl.uniformMatrix4fv( gl.getUniformLocation(program,
            "modelViewMatrix"), false, flatten(modelView) );

    gl.drawArrays( gl.TRIANGLES, 0, numVertices );


    requestAnimFrame(render);
}
