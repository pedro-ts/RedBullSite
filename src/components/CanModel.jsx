// CanModel.jsx
// Componente da lata. Mesmo esquema do CarModel.
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function CanModel({
  position = [0, 0, 0],
  rotation = [0, 0, 0], // em radianos
  scale = 1,
}) {
  const group = useRef();
  const { scene } = useGLTF("/Model/redbull_lata.glb");

  useEffect(() => {
    if (!group.current) return;
    group.current.position.set(...position);
    group.current.rotation.set(...rotation);
    group.current.scale.setScalar(scale);
  }, []);

  useFrame(() => {
    if (!group.current) return;

    group.current.position.lerp(new THREE.Vector3(...position), 0.1);

    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      rotation[0],
      0.1
    );
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      rotation[1],
      0.1
    );
    group.current.rotation.z = THREE.MathUtils.lerp(
      group.current.rotation.z,
      rotation[2],
      0.1
    );

    const cur = group.current.scale.x;
    const next = THREE.MathUtils.lerp(cur, scale, 0.1);
    group.current.scale.setScalar(next);
  });

  return (
    <group ref={group} castShadow receiveShadow>
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/Model/redbull_lata.glb");
