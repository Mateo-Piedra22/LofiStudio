'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

export default function CafeScene() {
  const steamRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (steamRef.current) {
      steamRef.current.position.y = 1 + Math.sin(clock.getElapsedTime()) * 0.2;
      steamRef.current.scale.x = 1 + Math.sin(clock.getElapsedTime() * 2) * 0.1;
      steamRef.current.scale.z = 1 + Math.cos(clock.getElapsedTime() * 2) * 0.1;
    }
  });

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={1} color="#FFE4B5" />
      <directionalLight position={[-5, 5, 5]} intensity={0.4} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#A0826D" />
      </mesh>

      {/* Table */}
      <mesh position={[0, -1, -1]}>
        <cylinderGeometry args={[1.2, 1.2, 0.1, 32]} />
        <meshStandardMaterial color="#6F4E37" />
      </mesh>
      <mesh position={[0, -1.5, -1]}>
        <cylinderGeometry args={[0.1, 0.1, 1, 16]} />
        <meshStandardMaterial color="#4A3728" />
      </mesh>

      {/* Coffee Cup */}
      <group position={[0.3, -0.8, -0.8]}>
        <mesh>
          <cylinderGeometry args={[0.15, 0.12, 0.3, 32]} />
          <meshStandardMaterial color="#FFFFFF" />
        </mesh>
        {/* Coffee */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.05, 32]} />
          <meshStandardMaterial color="#3E2723" />
        </mesh>
        {/* Steam */}
        <group ref={steamRef} position={[0, 0.3, 0]}>
          <mesh>
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshStandardMaterial color="#FFFFFF" transparent opacity={0.3} />
          </mesh>
        </group>
      </group>

      {/* Book */}
      <mesh position={[-0.4, -0.85, -0.9]} rotation={[0, 0.3, 0]}>
        <boxGeometry args={[0.4, 0.05, 0.6]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>

      {/* Lamp */}
      <group position={[1.5, -0.5, -1]}>
        <mesh position={[0, 0.5, 0]}>
          <coneGeometry args={[0.3, 0.5, 32]} />
          <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[0.05, 0.05, 1, 16]} />
          <meshStandardMaterial color="#696969" />
        </mesh>
      </group>

      <Environment preset="city" />
      <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} />
    </>
  );
}
