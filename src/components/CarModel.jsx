// CarModel.jsx
// Componente do carro F1. Anima suavemente até os alvos recebidos por props.
import { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function CarModel({
  position = [0, 0, 0],
  rotation = [0, 0, 0], // em radianos
  scale = 1,
}) {
  const group = useRef();
  const { scene } = useGLTF("/Model/red_bull_f1.glb");

  // aplica no primeiro frame
  useEffect(() => {
    if (!group.current) return;
    group.current.position.set(...position);
    group.current.rotation.set(...rotation);
    group.current.scale.setScalar(scale);
  }, []);

  // amortecimento por frame (animação suave)
  useFrame(() => {
    if (!group.current) return;

    // posição
    group.current.position.lerp(new THREE.Vector3(...position), 0.1);

    // rotação
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

    // escala
    const cur = group.current.scale.x;
    const next = THREE.MathUtils.lerp(cur, scale, 0.1);
    group.current.scale.setScalar(next);
  });

  return (
    <group ref={group} castShadow receiveShadow>
      {/* Colocar o GLB dentro do grupo para animar o conjunto */}
      <primitive object={scene} />
    </group>
  );
}

useGLTF.preload("/Model/red_bull_f1.glb");
