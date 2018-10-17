'use strict';
module.exports = "precision mediump float;\nuniform sampler2D uSampler;\nvarying vec2 vTextureCoordinates;\nvarying vec4 vColor;\n\nvoid main() {\n\tvec4 textureColor = texture2D(uSampler, vTextureCoordinates);\n\tgl_FragColor = textureColor * vColor;\n}\n\n";
