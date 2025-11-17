varying vec3 vNormal;
varying vec3 vViewDirection;

void main() {
    /*
      'normalMatrix', 'cameraPosition', 'modelMatrix',
      'projectionMatrix', 'modelViewMatrix'
      SEMUA SUDAH ADA. Jangan dideklarasikan lagi.
    */
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vViewDirection = normalize(cameraPosition - worldPosition.xyz);

    /*
      Gunakan 'modelViewMatrix' (bukan 'viewMatrix')
      agar posisi modelnya benar.
    */
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}