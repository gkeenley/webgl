// Encode fragment shader.
precision mediump float; // Indicates medium precision when interpreting floating point numbers. 
varying vec4 vColor; // Indicates that we will draw in color. Declares variable vColor which will vary from rectangle to rectangle.
void main(void) { // Calculate the value of the fragment shader for each pixel in a given rectangle.
	gl_FragColor = vColor;
}