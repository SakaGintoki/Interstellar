/*
 HAPUS: 'varying vec3 position;'
 'position' adalah atribut bawaan.
*/

/* 'out' diganti menjadi 'varying' */
varying vec3 vRayDirection;

void main() {
    /* Gunakan 'position' (bawaan) */
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vRayDirection = normalize(worldPos.xyz - cameraPosition);

    // Ensure correct transformation for gl_Position
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}