precision mediump float;
uniform sampler2D uSampler;
varying vec2 vTextureCoordinates;
varying vec4 vColor;

void main() {
	vec4 textureColor = texture2D(uSampler, vTextureCoordinates);
	gl_FragColor = textureColor * vColor;
}

