'use strict';
module.exports = "attribute vec3 aVertexPosition;\nattribute vec2 aTextureCoordinates;\nattribute vec4 aColor;\n\nuniform mat4 uMVMatrix;\nuniform mat4 uPMatrix;\nvarying vec2 vTextureCoordinates;\nvarying vec4 vColor;\n\nvoid main() {\n\tgl_Position = uPMatrix * uMVMatrix * vec4(aVertexPosition, 1.0);\n\tvTextureCoordinates = aTextureCoordinates;\n\tvColor = aColor;\n}\n\n";
