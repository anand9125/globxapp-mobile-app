"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

function Blob() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.05;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.08;
    }
  });

  return (
    <Float speed={0.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <mesh ref={meshRef} scale={2.2}>
        <icosahedronGeometry args={[1.2, 2]} />
        <meshStandardMaterial
          color="#00D4AA"
          roughness={0.6}
          metalness={0.2}
          emissive="#00D4AA"
          emissiveIntensity={0.12}
        />
      </mesh>
    </Float>
  );
}

function SecondBlob() {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * 0.04;
      meshRef.current.rotation.y = state.clock.elapsedTime * -0.06;
    }
  });

  return (
    <Float speed={0.4} rotationIntensity={0.15} floatIntensity={0.2}>
      <mesh ref={meshRef} position={[3, -1, -2]} scale={1.5}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial
          color="#00C853"
          roughness={0.7}
          metalness={0.1}
          emissive="#00C853"
          emissiveIntensity={0.08}
        />
      </mesh>
    </Float>
  );
}

function Particles() {
  const count = 100;
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      pos[i] = (Math.random() - 0.5) * 20;
      pos[i + 1] = (Math.random() - 0.5) * 20;
      pos[i + 2] = (Math.random() - 0.5) * 10;
    }
    return pos;
  }, []);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color="#00D4AA"
        transparent
        opacity={0.35}
        sizeAttenuation
      />
    </points>
  );
}

export function Scene3D() {
  return (
    <div className="absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 6], fov: 55 }}
        dpr={[1, 1.5]}
        gl={{ alpha: true, antialias: true }}
      >
        <color attach="background" args={["transparent"]} />
        <ambientLight intensity={0.4} />
        <pointLight position={[10, 10, 10]} intensity={0.8} color="#00D4AA" />
        <pointLight position={[-10, -10, 5]} intensity={0.3} color="#00C853" />
        <Blob />
        <SecondBlob />
        <Particles />
      </Canvas>
    </div>
  );
}
