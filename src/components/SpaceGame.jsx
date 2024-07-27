import React, { useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Text, useGLTF } from '@react-three/drei'
import { Vector3 } from 'three'

function Spaceship({ position, rotation }) {
  const { nodes, materials } = useGLTF('/spaceship.glb')
  const meshRef = useRef()

  useFrame((state) => {
    meshRef.current.rotation.y += 0.01
  })

  return (
    <group ref={meshRef} position={position} rotation={rotation}>
      <mesh geometry={nodes.Spaceship.geometry} material={materials.SpaceshipMaterial} />
    </group>
  )
}

function Planet({ position, color, size }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

function PlayerSpaceship() {
  const [position, setPosition] = useState([0, 0, 0])
  const speed = 0.1
  const { camera } = useThree()

  useFrame((state, delta) => {
    if (state.keyboard.forward) setPosition(prev => new Vector3(prev[0], prev[1], prev[2] - speed))
    if (state.keyboard.backward) setPosition(prev => new Vector3(prev[0], prev[1], prev[2] + speed))
    if (state.keyboard.left) setPosition(prev => new Vector3(prev[0] - speed, prev[1], prev[2]))
    if (state.keyboard.right) setPosition(prev => new Vector3(prev[0] + speed, prev[1], prev[2]))
    camera.position.set(position[0], position[1] + 5, position[2] + 10)
    camera.lookAt(position[0], position[1], position[2])
  })

  return <Spaceship position={position} rotation={[0, Math.PI, 0]} />
}

function SpaceStation({ position }) {
  const { nodes, materials } = useGLTF('/space_station.glb')
  return (
    <group position={position}>
      <mesh geometry={nodes.SpaceStation.geometry} material={materials.SpaceStationMaterial} />
    </group>
  )
}

export default function SpaceGame() {
  return (
    <div className="w-full h-screen">
      <Canvas camera={{ position: [0, 5, 10] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <PlayerSpaceship />
        <Planet position={[-20, 0, -50]} color="red" size={5} />
        <Planet position={[30, 10, -80]} color="blue" size={3} />
        <SpaceStation position={[50, 0, -100]} />
        <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade />
        <OrbitControls />
        <Text position={[0, 20, -50]} color="white" fontSize={5}>
          Welcome to Space!
        </Text>
      </Canvas>
      <div className="absolute bottom-5 left-5 text-white bg-black bg-opacity-50 p-2 rounded">
        Use arrow keys to move the spaceship
      </div>
    </div>
  )
}

useGLTF.preload('/spaceship.glb')
useGLTF.preload('/space_station.glb')
