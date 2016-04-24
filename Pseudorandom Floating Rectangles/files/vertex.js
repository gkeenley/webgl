// Encode vertex shader.
attribute vec3 aVertexPosition; // Position attribute for a given vertex.
attribute vec4 aVertexColor; // color attribute for a given vertex.
// Need to define matrix uniforms. The model-view (current position) and projection matrices operate within the Javascript code, and matrix uniforms translate the values obtained from these matrices to the graphics card.
uniform mat4 uMVMatrix; // Model-view matrix uniform.
uniform mat4 uPMatrix; // Projection matrix uniform.
varying vec4 vColor; // Same as fragment shader, declare varying color variable vColor.
void main(void) { // Calculate value of vertex shader for each pixel in a given rectangle. Pass input attribute to varying output variable to define color.
    gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
    vColor = aVertexColor;
}