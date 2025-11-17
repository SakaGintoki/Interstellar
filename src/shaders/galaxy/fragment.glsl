precision highp float;

/* 'in' di fragment diganti menjadi 'varying' */
varying vec3 vColor;

/* HAPUS: out vec4 fragColor; */

void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    float alpha = 1.0 - smoothstep(0.45, 0.5, dist);

    // Ensure alpha blending is applied correctly
    gl_FragColor = vec4(vColor, alpha);
}