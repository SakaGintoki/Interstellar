varying vec3 vNormal;
varying vec3 vViewDirection;

void main() {
    vNormal = normalize(normalMatrix * normal);

    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vViewDirection = normalize(cameraPosition - worldPosition.xyz);

    // Ensure correct transformation for gl_Position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}