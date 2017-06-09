attribute vec3 aVertexPosition;
attribute vec2 aTextureCoordinates;
attribute vec4 aColor;

uniform mat4 uMVMatrix;
uniform mat4 uPMatrix;
varying vec2 vTextureCoordinates;
varying vec4 vColor;

void main() {
	gl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);
	vTextureCoordinates = aTextureCoordinates;
	vColor = aColor;
}

