/* File: fragment.glsl */

precision highp float;
uniform vec3 uGlowColor;
uniform float uGlowPower;

varying vec3 vNormal;
varying vec3 vViewDirection;

void main() {
    /* 1. 'dot' akan bernilai [-1.0 di tengah] s/d [0.0 di tepi]
      2. Tambahkan 1.0 agar nilainya menjadi [0.0 di tengah] s/d [1.0 di tepi]
    */
    float fresnel = dot(vNormal, vViewDirection) + 1.0;

    /* 3. 'pow' akan mempertajam glow di tepi (nilai 1.0 tetap 1.0, nilai < 1.0 jadi kecil)
    */
    fresnel = pow(fresnel, uGlowPower);

    /* 4. Atur warna dan alpha */
    gl_FragColor = vec4(uGlowColor * fresnel, fresnel * 0.5);
}