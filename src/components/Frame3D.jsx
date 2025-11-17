import { useMemo } from "react";

export default function Frame3D({ children, size = 1 }) {
  // Auto normalize semua object agar ukuran relatif konsisten
  const scale = useMemo(() => {
    return 1 / size;
  }, [size]);

  return (
    <group position={[0, 0, 0]} scale={scale}>
      {children}
    </group>
  );
}
