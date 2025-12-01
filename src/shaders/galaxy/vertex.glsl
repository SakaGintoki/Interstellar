uniform float uTime;
uniform float uSize;

attribute float aScale;
attribute vec3 aRandomness;

varying vec3 vColor;

void main() {
    vColor = color;

    vec4 modelPosition = modelMatrix * vec4(position, 1.0);

    float distanceToCenter = length(modelPosition.xz);
    
    float angleOffset = (1.0 / distanceToCenter) * uTime * 0.2;
    
    angleOffset += aRandomness.x * 0.5;

    float angle = atan(modelPosition.x, modelPosition.z);
    angle += angleOffset;

    modelPosition.x = cos(angle) * distanceToCenter;
    modelPosition.z = sin(angle) * distanceToCenter;

    modelPosition.y += sin(uTime * 0.5 + distanceToCenter) * 0.2;

    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectedPosition = projectionMatrix * viewPosition;

    gl_Position = projectedPosition;

    gl_PointSize = uSize * aScale;
    gl_PointSize *= (1.0 / -viewPosition.z);

    gl_PointSize *= (1.0 + sin(uTime * 3.0 + aRandomness.y * 20.0) * 0.5);
}