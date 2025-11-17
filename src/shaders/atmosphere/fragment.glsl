precision highp float;

uniform vec3 uGlowColor;
uniform float uGlowPower;

varying vec3 vNormal;
varying vec3 vViewDirection;

void main() {
float fresnel = 1.0 - dot(vNormal, vViewDirection); // Dibalik
fresnel = pow(fresnel, uGlowPower);
gl_FragColor = vec4(uGlowColor * fresnel, fresnel * 0); // Alpha dinaikkan (opsional)
}