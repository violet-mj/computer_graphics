"use strict";

var canvas;
var gl;
var slide;
var selectTag1;
var selectTag2;
var selectTag3;
var rotateTag
var triangleLineLength = 20;
var colorIndex1 = 0;
var colorIndex2 = 0;
var colorIndex3 = 0;
var theta = 0.0;
var degreeTag;
var degree = 0;



var maxNumTriangles = 200;
var maxNumVertices  = 3 * maxNumTriangles;
var index = 0;

var colors = [
    vec4( 0.0, 0.0, 0.0, 1.0 ),  // black
    vec4( 1.0, 0.0, 0.0, 1.0 ),  // red
    vec4( 1.0, 1.0, 0.0, 1.0 ),  // yellow
    vec4( 0.0, 1.0, 0.0, 1.0 ),  // green
    vec4( 0.0, 0.0, 1.0, 1.0 ),  // blue
    vec4( 1.0, 0.0, 1.0, 1.0 ),  // magenta
    vec4( 0.0, 1.0, 1.0, 1.0 )   // cyan
];


window.onload = function init() {
    let triangle;
    let triangleSize;
    canvas = document.getElementById( "gl-canvas" );
    slide = document.getElementById("slide");
    selectTag1 = document.getElementById("color_select1")
    selectTag2 = document.getElementById("color_select2")
    selectTag3 = document.getElementById("color_select3")
    degreeTag = document.getElementById("degree")

    const rangeValue = document.getElementById("range_value")
    const degreeValue = document.getElementById("degree_value")

    function rotatePoint(center, rotatePoint, deg) {

        let x = rotatePoint[0] - center[0]
        let y = rotatePoint[1] - center[1]

        let rotateX = x * Math.cos(deg) - y * Math.sin(deg)
        let rotateY = x * Math.sin(deg) + y * Math.cos(deg)

        return [rotateX + center[0], rotateY + center[1]]
    }

    degreeTag.addEventListener("change", (e) => {
        degree = e.target.value
        degreeValue.innerText = e.target.value
    })

    slide.addEventListener("change", (e) => {
        triangleLineLength = e.target.value
        rangeValue.innerText = (e.target.value / 100 * Math.sqrt(3)).toFixed(2)
    })

    selectTag1.addEventListener("change", (e) => {
        colorIndex1 = parseInt(e.target.value)
    })
    selectTag2.addEventListener("change", (e) => {
        colorIndex2 = parseInt(e.target.value)
    })
    selectTag3.addEventListener("change", (e) => {
        colorIndex3 = parseInt(e.target.value)
    })

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }


    canvas.addEventListener("click", function(event){


        triangle = []
        gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );

        triangleSize = parseInt(triangleLineLength) / 100

        
        let centerX = 2*event.clientX/canvas.width-1 
        let centerY = 2*(canvas.height-event.clientY)/canvas.height -1
        let center = [centerX, centerY]

        let leftBottomX = centerX - triangleSize * (Math.sqrt(3) / 2) 
        let leftBottomY = centerY - triangleSize * (1/2)
        let rightBottomX = centerX + triangleSize * (Math.sqrt(3) / 2)
        let rightBottomY = centerY - triangleSize * (1/2)
        let middleX = centerX
        let middleY = centerY + triangleSize

        let radian = 2 * Math.PI / 360 * degree


        let leftBottom = rotatePoint(center, [leftBottomX, leftBottomY], radian)
        let rightBottom = rotatePoint(center, [rightBottomX, rightBottomY], radian)
        let middle = rotatePoint(center, [middleX, middleY], radian)


        triangle.push( vec2(...leftBottom))
        triangle.push( vec2(...rightBottom))
        triangle.push( vec2(...middle) )

        console.log(triangle)
        gl.bufferSubData(gl.ARRAY_BUFFER, 24*index, flatten(triangle));

        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        triangle = [
            vec4(colors[colorIndex1]),
            vec4(colors[colorIndex2]),
            vec4(colors[colorIndex3])
        ]
        gl.bufferSubData(gl.ARRAY_BUFFER, 48*index, flatten(triangle));
        index++;
    } );


    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.5, 0.5, 0.5, 1.0 );


    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, 24*maxNumVertices, gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation(program, "vPosition");
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, 16*maxNumVertices, gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );


    render();

}


function render() {

    gl.clear( gl.COLOR_BUFFER_BIT );



    gl.drawArrays( gl.TRIANGLES, 0, index * 3);

    window.requestAnimFrame(render);

}