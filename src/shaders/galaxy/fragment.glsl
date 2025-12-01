precision highp float;

varying vec3 vColor;

void main() {
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    
    float strength = 0.05 / distanceToCenter - 0.1; // Rumus glow
    strength = clamp(strength, 0.0, 1.0);

    vec3 color = vColor;
    
    gl_FragColor = vec4(color, strength);
}