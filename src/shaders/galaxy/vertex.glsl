uniform float uTime;
uniform float uSize;

attribute vec3 color;

varying vec3 vColor;

mat4 rotationMatrix(vec3 axis, float angle) {
    axis = normalize(axis);
    float s = sin(angle);
    float c = cos(angle);
    float oc = 1.0 - c;

    return mat4(
        oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,  0.0,
        oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,  0.0,
        oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c,           0.0,
        0.0, 0.0, 0.0, 1.0
    );
}

void main() {
    vColor = color;

    float angle = uTime * 0.5;
    mat4 rotMatrix = rotationMatrix(vec3(0.0, 1.0, 0.0), angle);
    
    // Apply rotation to the position
    vec4 newPosition = rotMatrix * vec4(position, 1.0);

    vec4 mvPosition = modelViewMatrix * newPosition;
    gl_Position = projectionMatrix * mvPosition;

    // Ensure point size scales correctly with distance
    gl_PointSize = uSize / max(-mvPosition.z, 0.1);
}