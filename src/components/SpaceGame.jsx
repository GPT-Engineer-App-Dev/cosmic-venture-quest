import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'

function Spaceship() {
  const meshRef = useRef()

  useFrame((state, delta) => {
    meshRef.current.rotation.x += delta
  })

  return (
    <mesh ref={meshRef}>
      <coneGeometry args={[1, 2, 4]} />
      <meshStandardMaterial color="white" />
    </mesh>
  )
}

export default function SpaceGame() {
  return (
    <div className="w-full h-screen">
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Spaceship />
        <Stars />
        <OrbitControls />
      </Canvas>
    </div>
  )
}
