// Module: Variables.
// Author: Gabe Keenleyside
// Date: 02/10/13
// Purpose: Declare and initialize variables, in the order in which they are used in the subsequent functions. These are all INPUT parameters.

// Create variable for webGL context 'gl' for use in future functions.
var gl;
// Define 'mvMatrix' that will contain 'model view matrix', ie. the matrix that defines the current 'state' with respect to xy-position and rotation, and scales vertex coordinates accordingly. Initialize it to empty. (Used in functions mcPushMatrix, mvPopMatrix, setMatrixUniforms, drawScenePosition, and drawSceneColor.)
var mvMatrix = mat4.create();
// Define projection matrix called 'pMatrix', ie. the matrix by which we multiply the model-view matrix in order to update it. Initialize it to empty. (Used in function setMatrixUniforms, drawScenePosition, and drawSceneColor.)
var pMatrix = mat4.create();      
// Create variable to hold position buffers of all rectangles. (Used in functions initBuffers, drawScenePosition, and drawSceneColor.)
var VertexPositionBuffer = new Array();
// Create variable to hold color buffers of all rectangles. (Used in functions initBuffers and drawSceneColor.)
var VertexColorBuffer = new Array();
// Define 'myMatrixStack', the stack that we will use when accessing elements of mvMatrix. (Used in functions mvPushMatrix and mvPopMatrix.)
var mvMatrixStack = [];
// Create variable shaderProgram, which will contain the fragment and vertex shaders and deliver them to the graphics card using an attribute. (Used in functions initShaders, setMatrixUniforms, drawScenePosition, and drawSceneColor.)
var shaderProgram;
var lastTime = 0; // Time value immediately prior to (one millisecond before) the current one. Initialize to zero, because we will use these time variables when performing the animation over elapsed time, the first call to which will occur at the first incremented time value, ie. 1 millisecond. (Used in function keepTime.)
var rectangleNum = 50; // Number of rectangles. (Used in functions initBuffers, drawScenePosition, drawSceneColor, and keepTime.)
var maxLength = 0.6; // Maximum unscaled rectangle length. (Used in function initBuffers.)
var minLength = 0.15; // Minimum unscaled rectangle length. (Used in function initBuffers)
var maxWidth = 0.6; // Maximum unscaled rectangle width. (Used in function initBuffers)
var minWidth = 0.15; // Minimum unscaled rectangle width. (Used in function initBuffers)
var maxOpacity = 1.4; // Maximum rectangle opacity (0-255). (Used in function initBuffers)
var minOpacity = 0.9; // Minimum rectangle opacity (0-255). (Used in function initBuffers)
var sceneDepth = 8.0; // How 'deep into screen' rectangles are located. (Used in function initBuffers)
var inclination = 45; // Angle of view, relative to top-down view. (Used in functions drawScenePosition and drawSceneColor.)
var nearLim = 0.1; // Closest that an object can be to screen and still be visible. (Used in functions drawScenePosition and drawSceneColor.)
var farLim = 100; // Furthest that an object can be from screen and still be visible. (Used in functions drawScenePosition and drawSceneColor.)
var scalePulseFrequency = 1/20; // Frequency of sinusoidal scaling function, in units of 1/degree. (Used in functions drawScenePosition and drawSceneColor.)
var scalePulseAmplitude = 2/3; // Amplitude of sinusoidal scaling function. (Used in functions drawScenePosition and drawSceneColor.)
var scalePulseOffset = 1; // Average value of sinusoidal scaling function. (Used in functions drawScenePosition and drawSceneColor.)
// Declare range of initial conditions by specifying maxima. Each rectangle can be initialized within a range of + or - these values.
var maxInitPosn = new Array();
maxInitPosn[0] = 7.11; // Maximum (absolute) x-position (corresponds to width of screen).
maxInitPosn[1] = 3.296; // Maximum (absolute) y-position (corresponds to height of screen).
maxInitPosn[2] = 90; // Maximum (absolute) rotational orientation (since these are rectangles rather than arbitrary polygons, + or - 90 degrees contains all possible orientations from the viewer's perspective).
// Define 'trackers', variables which contain the state of each rectangle as a function of time. These will be updated as time elapses, and serve as the input the the function that draws the scene every millisecond.
var tracker = new Array();
tracker[0] = new Array(); // x-position. (Used in functions drawScenePosition, drawSceneColor, and keepTime.)
tracker[1] = new Array(); // y-position. (Used in functions drawScenePosition, drawSceneColor, and keepTime.)
tracker[2] = new Array(); // Rotational orientation. (Used in functions drawScenePosition, drawSceneColor, and keepTime.)
// Assign initial positions: Initialize trackers with random initial values within appropriate range.
for (var j = 0; j < maxInitPosn.length; j++) { // For the three transformation parameters (x-position, y-position, and rotation)...
    for (var i = 0; i < rectangleNum; i++) { // ...and for each rectangle...
        tracker[j][i] = (Math.random()*(2*maxInitPosn[j])-maxInitPosn[j]); // ...set the value of that particular parameter for that particular rectangle to an independent random number within the range + or - the maximum initial value.
    }
}
// Declare range of possible speeds. Each rectangle will have a speed with respect to our three degrees of speed freedom (x, y, and rotation). All three will be random and independent for a given rectangle, as well as independent between one rectangle and the next. Each speed can take on a value within a range of + or - of the maximum we declare, and will retain that value throughout the animation.
var maxSpeed = new Array();
maxSpeed[0] = 1; // Maximum x-speed
maxSpeed[1] = 1; // Maximum y-speed
maxSpeed[2] = 0.5; // Maximum rotation speed
// Allocate variables to hold speed values.
var speed = new Array(); // Independent speeds of each rectangle with respect to our three degrees of freedom:
speed[0] = new Array(); // Speed in x-direction. (Used in function keepTime.)
speed[1] = new Array(); // Speed in y-direction. (Used in function keepTime.)
speed[2] = new Array(); // Speed of rotation. (Used in function keepTime.)
// Assign speeds.
for (var j = 0; j < speed.length; j++) {
    for (var i = 0; i < rectangleNum; i++) {
        speed[j][i] = (Math.random()*(2*maxSpeed[j])-maxSpeed[j]);
    }
}
// Declare 'wrap-around' values: boundaries outside of which rectangles should wrap around to the other side of the screen in order to come back into view (Used in function keepTime.)
var wrapAround = new Array();
wrapAround[0] = maxInitPosn[0] + scalePulseOffset + scalePulseAmplitude*(Math.sqrt((Math.pow(maxLength, 2)) + (Math.pow(maxWidth, 2)))); // Horizontal wrap-around condition.
wrapAround[1] = maxInitPosn[1] + scalePulseOffset + scalePulseAmplitude*(Math.sqrt((Math.pow(maxLength, 2)) + (Math.pow(maxWidth, 2)))); // Vertical wrap-around condition.

// END 'Variables'


// Module: Functions
// Author: Gabe Keenleyside
// Date: 02/10/13
// Purpose: Declare all functions. All are output parameters.

// Module: function 'initGL'
// Author: Gabe Keenleyside
// Date: 02/10/13
// Purpose: Initiate use of WebGL.
function initGL(canvas) {
    try {
        // gl initiation function obtains wenGL context called 'gl' from the canvas.
        gl = canvas.getContext("experimental-webgl");
        // Sets viewport's width equal to canvas' width.
        gl.viewportWidth = canvas.width;
        // Sets viewport's height equal to canvas' height.
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) { // If error occurs...
        alert("Could not initialise WebGL."); // ...create alert.
    }
}
// END function initGL.

// Function: 'getShader'
// Author: Gabe Keenleyside
// Date: 02/10/13
// Purpose: Extracts element from html page to match input parameter, and creates corresponding shader to be sent to the graphics card.
function getShader(gl, id) {
    var shaderScript = document.getElementById(id); // Declare that variable shaderScript will be taken from this script, according to its ID.
    if (!shaderScript) { // ShaderScript is the only variable to be displayed here.
        return null;
    }
    var str = ""; // Input parameter.
    var k = shaderScript.firstChild; // Begin to cycle through the elements ('children') of shaderScript.
    while (k) {
        if (k.nodeType == 3) { // If k is a textual context...
            str += k.textContent; // ...then add the contents of k to the input 'str'.
            }
            k = k.nextSibling; // Cycle through remaining children of shaderScript.
        }
        var shader;
        if (shaderScript.type == "x-shader/x-fragment") { // If the contents of the element of our HTML page matching the input parameter are of fragment type...
            shader = gl.createShader(gl.FRAGMENT_SHADER); // ...then the shader we create must be a fragment shader.
        } else if (shaderScript.type == "x-shader/x-vertex") { // If the contents of the element of our HTML page matching the input parameter are of vertex type...
            shader = gl.createShader(gl.VERTEX_SHADER); // ...then the shader we create must be a vertex shader.
        } else {
            return null; // Otherwise return nothing. ie. shaderScript MUST be of type fragment or vertex.
        }
        gl.shaderSource(shader, str); // Associate shader with the element ID from which it originated.
        gl.compileShader(shader); // Compile shader into form that can run on graphics card.

        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) { // If an error occurs...
            alert(gl.getShaderInfoLog(shader)); // ...create and alert.
            return null;
        }
        return shader; // Return the shader variable when this function is called.
}
// End function getShader.

// Module: function 'initShaders'
// Author: Gabe Keenleyside
// Date: 02/10/13
// Purpose: Initializes shaders, called by function 'webGLStart', with input parameter from functions 'getShader'. We use shaders in order to access the graphics card, so that we do not need to do everything with Javascript, because it is slower.
function initShaders() {
        // Use 'getShader' function to access 'fragmentShader' and 'vertexShader'.
        var fragmentShader = getShader(gl, "shader-fs");
        var vertexShader = getShader(gl, "shader-vs");
        // Designate variable 'shaderProgram' as a program, ie. code that operates directly on the graphics card.
        shaderProgram = gl.createProgram();
        // Attach fragmentShader and vertexShader to shaderProgram. A program can hold one fragment and one vertex shader.
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        // Activate shaderProgram.
        gl.linkProgram(shaderProgram);
        // Notify user if shader(s) is/are incompatible with shaderProgram.
        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            alert("Could not initialise shaders");
        }
        // Run shaderProgram.
        gl.useProgram(shaderProgram);
        // 'Version' of position buffer on the graphics card itself. Vertex attribute pointer connects buffer to corresponding attribute.
        shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "aVertexPosition");
        // Tell webGL to accept input for the position attribute via an array.
        gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);
        // 'Version' of color buffer on the graphics card itself. Vertex attribute pointer connects buffer to corresponding attribute.
        shaderProgram.vertexColorAttribute = gl.getAttribLocation(shaderProgram, "aVertexColor");
        // Tell webGL to accept input for the color attribute via an array.
        gl.enableVertexAttribArray(shaderProgram.vertexColorAttribute);
        // Access uniform variables to store in program. Uniforms are the way for webGL to communicate states of matrices from Javascript to graphics card.
        shaderProgram.pMatrixUniform = gl.getUniformLocation(shaderProgram, "uPMatrix");
        shaderProgram.mvMatrixUniform = gl.getUniformLocation(shaderProgram, "uMVMatrix");
}
// End function 'initshaders'

// Module: function 'mvPushMatrix'
// Author: Gabe Keenleyside
// Date: 02/10/13
// Purpose: 'Pushes' model-view matrices onto stack.
function mvPushMatrix() {
    var copy = mat4.create(); // Create variable 'copy' to hold copy of model-view matrix.
    mat4.set(mvMatrix, copy); // Set 'copy' equal to model-view matrix.
    mvMatrixStack.push(copy); // Put 'copy' on stack, thus salvaging mvMatrix for future use.
}
// END function 'mvPushMatrix'

// Module: function 'popMatrix'
// Author: Gabe Keenleyside
// Date: 02/10/13
// Purpose: 'Pops' model-view matrices off of stack.
function mvPopMatrix() {
    if (mvMatrixStack.length == 0) { // Checks that stack is non-empty.
        throw "Invalid popMatrix!"; // If it IS empty, create alert.
    }
    mvMatrix = mvMatrixStack.pop(); //Set model-view matrix equal to item on top of stack. We do not need to make a copy the way we did with 'push', since mvMatrix is staying where it is and simply being modified.
}
// END function 'popMatrix'

// Module: function 'setMatrixUniforms'
// Author: Gabe Keenleyside
// Date: 02/10/13
// Purpose: Set the uniforms of the model-view and projection matrices. A uniform is the representation of the matrices that is transferred to the graphics card itself, since the matrices are usable only within the Javascript code.
function setMatrixUniforms() {
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, pMatrix); // Projection matrix.
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, mvMatrix); // Model-view matrix.
}
// END function 'setMatrixUniforms'

// Module: function 'degToRad'
// Author: Gabe Keenleyside
// Date: 02/10/13
// Purpose: Convert degrees to radians for rotation calculations.
function degToRad(degrees) {
    return degrees * Math.PI / 180; // Convert a degree values to radians by normalizing to 180 degrees/rad. 
}
// END function 'degToRad'

// Module: function 'initBuffers'
// Author: Gabe Keenleyside
// Date: 02/10/13
// Purpose: Initialize the buffers for position and color.
function initBuffers() {
    for (var i = 0; i < rectangleNum; i++) { // For each rectangle...
        L=(Math.random()*(maxLength - minLength) + minLength); // Length (un-scaled)
        W=(Math.random()*(maxWidth - minWidth) + minWidth); // Width (un-scaled)
        // Create the rectangle buffer itself, ie. memory allocated on the graphics card.
        VertexPositionBuffer[i] = gl.createBuffer();
        // "Binds" all future buffers to the rectangle buffer, ie. tells webGL that any subsequent buffer operations must be applied to the rectangle buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, VertexPositionBuffer[i]);
        // Define vertex positions. This gives a rectangular shape, of random length and width for each rectangle. Set all rectangles at a depth of 8.0 units.
        var vertices = [
             W,  L,  -sceneDepth,  // Top right corner.
            -W,  L,  -sceneDepth,  // Top left corner.
             W, -L,  -sceneDepth,  // Bottom right corner.
            -W, -L,  -sceneDepth   // Bottom left corner.
        ];
        // Fill the current buffer (ie. rectangle buffer) with the list of floating point numbers listed in 'vertices'. We need to convert 'vertices' to a Float32Array because Float32arrays can be used to fill buffers, whereas regular vars cannot.
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
        // Specifies that each of the four vertices comprises three spacial coordinates (x,y,z).
        VertexPositionBuffer[i].itemSize = 3;
        // Specifies that each rectangle comprises four vertices.
        VertexPositionBuffer[i].numItems = 4;
        // Create color buffer
        VertexColorBuffer[i] = gl.createBuffer();
        // "Binds" all future color buffers to the rectangle's color  buffer, ie. tells webGL that any subsequent buffer operations must be applied to the rectangle color buffer.
        gl.bindBuffer(gl.ARRAY_BUFFER, VertexColorBuffer[i]);
        // Define rectangle color scheme.
        var colors = []
        for (var j = 0; j < 4; j++) { // For the four components of the color of each rectangle...
            colors = colors.concat([Math.random(), Math.random(), Math.random(), Math.random()*(maxOpacity - minOpacity) + minOpacity]); // Amounts of red, blue, and green are randomized for each rectangle. Opaqueness is also randomized, but kept away from the lower and upper extremes.
        }
        // Fill the current buffer with the list of floating point numbers listed in 'colors'. We need to convert 'colors' to a Float32Array because Float32arrays can be used to fill buffers, whereas regular vars cannot.
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
        // Specifies that each of the four vertices comprises four colors components (red, blue, green, and opaqueness).
        VertexColorBuffer[i].itemSize = 4;
        // Specifies that each rectangle comprises four vertices.
        VertexColorBuffer[i].numItems = 4;
    }
}
// END function 'initBuffers'

// Module: function 'drawScenePosition'
// Author: Gabe Keenleyside
// Date: 02/10/13
// Purpose: Draw rectangles on canvas according to state of model view matrix. Distinct from drawScenecolor in that drawScenePosition is updated over time, whereas drawScenecolor is used to draw initial scene, and color does not change thereafter.
function drawScenePosition() {
        // Declare canvas size.
        gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
        // Clear canvas in preparation for drawing on it.
        // Set up perspective with which we view the scene. Use the 'perspective' function from the 'mat4' module, and apply the resulting perspective to the pMatrix in order to scale our object(s) accordingly.
        // 1) 45 degree elevation.
        // 2) Width-height ratio of canvas.
        // 3) Don't want to see anything closer than 0.1 units.
        // 4) Don't want to see anything further away than 100 units
        mat4.perspective(inclination, gl.viewportWidth / gl.viewportHeight, nearLim, farLim, pMatrix);
        // Sets the 'model view matrix', ie. the matrix containing the position of our object, to an origin point (via the identity matrix) from which we can perform spacial transformations by multiplying the given matrix by a transformation matrix.
        mat4.identity(mvMatrix);
        // Loop over all 25 rectangles.
        for (var i = 0; i < rectangleNum; i++) {
        // Set 'origin' for model view matrix.
        mat4.translate(mvMatrix, [0, 0, 0]);
        // Activate Push Matrix for stack.
        mvPushMatrix();
        // Define state with respect to translation (initially random).
        mat4.translate(mvMatrix, [tracker[0][i], tracker[1][i], 0]);
        // Define state with respect to scale (initially random).
        mat4.scale(mvMatrix, [(scalePulseOffset+(scalePulseAmplitude)*(Math.sin((scalePulseFrequency)*(tracker[2][i])))), (scalePulseOffset+(scalePulseAmplitude)*(Math.cos((scalePulseFrequency)*(tracker[2][i])))), 1]);
        // Define state with respect to rotation (initially random).
        mat4.rotate(mvMatrix, degToRad(tracker[2][i]), [0, 0, 1]);

        // Start actually drawing
        // Set any given buffer to the position buffer again (was previously bound to square buffer).
        gl.bindBuffer(gl.ARRAY_BUFFER, VertexPositionBuffer[i]);
        // Tell webGL:
        // 1) Each item in the buffer is three elements in size.
        // 2) Pointer is of type 'float'.
        // 3) All fixed-point data values are NOT normalized.
        // 4) Everything else set to default.
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, VertexPositionBuffer[i].itemSize, gl.FLOAT, false, 0, 0);
        // Move the transformation data generated by mvMatrix to the graphics card.
        setMatrixUniforms();
        // webGL now has vertex data. Next we instruct it on how to process that data.
        // Take data from triangle buffer and draw a triangle using them as vertices, scanning through the vertex elements from the first (0) to the last (numItems).
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, VertexPositionBuffer[i].numItems);
        mvPopMatrix();
        } // END drawing loop over all rectangles.
} 
// END function 'drawScenePosition'

// Module: function 'drawScenecolor'
// Author: Gabe Keenleyside
// Date: 02/10/13
// Purpose: Draw rectangles on canvas according to state of model view matrix. Distinct from drawScenePosition in that drawScenecolor is used to draw initial scene, and color does not change thereafter, whereas drawScenePosition is updated over time, whereas drawScenecolor.
function drawScenecolor() {
    // Declare canvas size.
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    // Clear canvas in preparation for drawing on it.
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    // Set up perspective with which we view the scene. Use the 'perspective' function from the 'mat4' module, and apply the resulting perspective to the pMatrix in order to scale our object(s) accordingly.
    // 1) 45 degree elevation.
    // 2) Width-height ratio of canvas.
    // 3) Don't want to see anything closer than 0.1 units.
    // 4) Don't want to see anything further away than 100 units
    mat4.perspective(inclination, gl.viewportWidth / gl.viewportHeight, nearLim, farLim, pMatrix);
    // Sets the 'model view matrix', ie. the matrix containing the position of our object, to an origin point (via the identity matrix) from which we can perform spacial transformations by multiplying the given matrix by a transformation matrix.
    mat4.identity(mvMatrix);

    // Loop over all 25 rectangles.
    for (var i = 0; i < rectangleNum; i++) {
        // Activate Push matrixfor stack.
        mvPushMatrix();

        // Initial positions with respect to translations, scale, and rotation.

        mat4.translate(mvMatrix, [tracker[0][i], tracker[1][i], 0]);

        mat4.scale(mvMatrix, [(scalePulseOffset+(scalePulseAmplitude)*(Math.sin((scalePulseFrequency)*(tracker[2][i])))), (scalePulseOffset+(scalePulseAmplitude)*(Math.cos((scalePulseFrequency)*(tracker[2][i])))), 1]);

        // Make rectangles rotate about z-axis.
        mat4.rotate(mvMatrix, degToRad(tracker[2][i]), [0, 0, 1]);

        // Start actually drawing

        // Set any given buffer to the rectangle buffer again (was previously bound to square buffer).
        gl.bindBuffer(gl.ARRAY_BUFFER, VertexPositionBuffer[i]);
        // Tell webGL:
        // 1) Each item in the buffer is three elements in size.
        // 2) Pointer is of type 'float'.
        // 3) All fixed-point data values are NOT normalized.
        // 4) Everything else set to default.
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, VertexPositionBuffer[i].itemSize, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, VertexColorBuffer[i]);
        gl.vertexAttribPointer(shaderProgram.vertexColorAttribute, VertexColorBuffer[i].itemSize, gl.FLOAT, false, 0, 0);
        // Moves the transformation data generated by mvMatrix to the graphics card.
        setMatrixUniforms();
        // webGL now has vertex data. Next we instruct it on how to process that data.
        // Take data from triangle buffer and draw a triangle using them as vertices, scanning through the vertex elements from the first (0) to the last (numItems).
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, VertexPositionBuffer[i].numItems);
        mvPopMatrix();
        } // END Draw
}
// END function 'drawScenecolor'

// Module: function 'keepTime'
// Author: Gabe Keenleyside
// Date: 02/10/13
// Purpose: Keep track of time and states. Control wrap-around mechanism.
function keepTime() {
    var timeNow = new Date().getTime(); // Access current time (relative to Epoch).
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime; // Time increment since last scene was drawn.
        // Loop over all rectangles and update x-position, wrapping around if position reaches screen edge.
        for (var j = 0; j < 2; j++) { // For the two (horizontal and vertical) possible wrap-around scenarios.
            for (var i = 0; i < rectangleNum; i++) { // For each rectangle...
                tracker[j][i] += (speed[j][i] * elapsed) / 1000.0; // New position is (speed * time increment in seconds).
                if (tracker[j][i] > wrapAround[j]) { // If rectangle passes through positive boundary...
                    tracker[j][i] = tracker[j][i] - 2*wrapAround[j]; // ...rectangle wraps around to negative boundary and comes back into view.
                }
                else if (tracker[j][i] < -wrapAround[j]) { // ...if rectangle passes through negative boundary...
                    tracker[j][i] = tracker[j][i] + 2*wrapAround[j]; // ...rectangle wraps around to positive boundary and comes back into view.
                }
            }
        }

        // Loop over all rectangles and update rotational position.
        for (var i = 0; i < rectangleNum; i++) { // For each rectangle...
            tracker[2][i] += (90 * speed[2][i] * elapsed) / 1000.0; // ...new rotational orientation is (angular speed * time increment in seconds), normalized to 90 degrees.
        }
    }
    lastTime = timeNow; // Update lastTime in preparation for drawing frame after next time increment.
}
// END function 'keepTime'

// Module: function 'tick'
// Author: Gabe Keenleyside
// Date: 02/10/13
// Purpose: Updates scene's animation state at every time increment.
function tick() {
    requestAnimFrame(tick); // Updates scene's animation state when tick is called.
    drawScenePosition(); // Draws scene with updated positions for each rectangle.
    drawScenecolor(); // Draws scene with same color for rectangles in updated positions.
    keepTime(); // Draw entire scene.
}
// END function 'tick'

// Module: function 'webGLStart'
// Author: Gabe Keenleyside
// Date: 02/10/13
// Purpose: Draw canvas, and rectangles in their initial (stationary) state.
function webGLStart() {
    var canvas = document.getElementById("myCanvas");
    // Initiates webGL to operate on canvas.
    initGL(canvas);
    // Initiates shaders.
    initShaders();
    // Initiates buffers which contain details about shapes.
    initBuffers();
    // Screen is cleared by 'clearColor' command, screen color is set to black.
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    // Specifies that depth testing is carried out. That is, if an object is in front of another object, it hides the object behind.
    gl.enable(gl.DEPTH_TEST);
    drawScenePosition(); // Draws blank rectangles.
    drawScenecolor(); // Adds color.
}
// END function 'wenGLStart'

// Module: function 'animationStart'
// Author: Gabe Keenleyside
// Date: 02/10/13
// Purpose: Initiate movement of rectangles.
function animationStart() {
    var canvas = document.getElementById("myCanvas");  // Acc
    initGL(canvas); // Initiate use of webGL
    initShaders() // Initialize shaders.
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Set background to black.
    gl.enable(gl.DEPTH_TEST); // Enable depth testing. ie. If an object is behind another object, it is blocked from view.
    requestAnimFrame(tick); // Updates scene's animation state when tick is called.
    drawScenePosition(); // Draw rectangles on canvas according to state of model view matrix.
}
// END function 'animationStart'

// Module: function 'keyCommand'
// Author: Gabe Keenleyside
// Date: 02/10/13
// Purpose: Define behaviour of animation and HTML page when certain keys are tapped (after page has loaded).
function keyCommand(e) {
    if (!e) e = window.event; // Declare that tapping a key will initiate action with respect to the HTML page.
    if (e.keyCode == "83") { // If 's' is entered...
        animationStart(); // ...initiate movement.
    }
    else if (e.keyCode == "81") { // If 'q' is entered...
        window.close(); // ...close HTML window.
    }
}
// END function 'keyCommand'
document.onkeydown = keyCommand; // After HTML page has loaded, when a key is tapped, call 'keyComand' function in order to either initiate animation of close page.

// END 'Functions'