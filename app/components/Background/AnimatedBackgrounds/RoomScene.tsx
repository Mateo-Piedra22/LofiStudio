'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import * as THREE from 'three';

export default function RoomScene() {
  const girlRef = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (girlRef.current) {
      // Subtle breathing animation
      girlRef.current.position.y = Math.sin(clock.getElapsedTime() * 0.5) * 0.05;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <directionalLight position={[-5, 5, 5]} intensity={0.5} />

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#8B7355" />
      </mesh>

      {/* Desk */}
      <mesh position={[0, -1, -2]}>
        <boxGeometry args={[3, 0.1, 1.5]} />
        <meshStandardMaterial color="#654321" />
      </mesh>

      {/* Chair (simple representation) */}
      <group ref={girlRef} position={[0, -0.5, 0]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.8, 0.1, 0.8]} />
          <meshStandardMaterial color="#4A4A4A" />
        </mesh>
        <mesh position={[0, -0.5, -0.3]}>
          <boxGeometry args={[0.8, 1, 0.1]} />
          <meshStandardMaterial color="#4A4A4A" />
        </mesh>
      </group>

      {/* Laptop */}
      <mesh position={[0, -0.85, -1.5]} rotation={[-0.2, 0, 0]}>
        <boxGeometry args={[1, 0.02, 0.8]} />
        <meshStandardMaterial color="#333333" emissive="#4A90E2" emissiveIntensity={0.5} />
      </mesh>

      {/* Window */}
      <mesh position={[-3, 0, -3]}>
        <planeGeometry args={[2, 3]} />
        <meshStandardMaterial color="#87CEEB" emissive="#87CEEB" emissiveIntensity={0.3} />
      </mesh>

      {/* Plant */}
      <group position={[2, -1, -2]}>
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.3, 8, 8]} />
          <meshStandardMaterial color="#228B22" />
        </mesh>
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.5]} />
          <meshStandardMaterial color="#8B4513" />
        </mesh>
      </group>

      <Environment preset="sunset" />
      <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} />
    </>
  );
}
