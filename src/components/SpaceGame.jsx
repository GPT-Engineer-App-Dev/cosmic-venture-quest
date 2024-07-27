import React, { useRef, useState, useEffect } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Stars, Text } from '@react-three/drei'
import { Vector3 } from 'three'

function Spaceship({ position, rotation }) {
  const meshRef = useRef()

  useFrame((state) => {
    meshRef.current.rotation.y += 0.01
  })

  return (
    <group ref={meshRef} position={position} rotation={rotation}>
      <mesh>
        <coneGeometry args={[1, 2, 8]} />
        <meshStandardMaterial color="white" />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <sphereGeometry args={[0.5, 32, 32]} />
        <meshStandardMaterial color="lightblue" />
      </mesh>
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
  const [keys, setKeys] = useState({ forward: false, backward: false, left: false, right: false })
  const speed = 0.1
  const { camera } = useThree()

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowUp') setKeys((keys) => ({ ...keys, forward: true }))
      if (event.key === 'ArrowDown') setKeys((keys) => ({ ...keys, backward: true }))
      if (event.key === 'ArrowLeft') setKeys((keys) => ({ ...keys, left: true }))
      if (event.key === 'ArrowRight') setKeys((keys) => ({ ...keys, right: true }))
    }

    const handleKeyUp = (event) => {
      if (event.key === 'ArrowUp') setKeys((keys) => ({ ...keys, forward: false }))
      if (event.key === 'ArrowDown') setKeys((keys) => ({ ...keys, backward: false }))
      if (event.key === 'ArrowLeft') setKeys((keys) => ({ ...keys, left: false }))
      if (event.key === 'ArrowRight') setKeys((keys) => ({ ...keys, right: false }))
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame(() => {
    if (keys.forward) setPosition(prev => new Vector3(prev[0], prev[1], prev[2] - speed))
    if (keys.backward) setPosition(prev => new Vector3(prev[0], prev[1], prev[2] + speed))
    if (keys.left) setPosition(prev => new Vector3(prev[0] - speed, prev[1], prev[2]))
    if (keys.right) setPosition(prev => new Vector3(prev[0] + speed, prev[1], prev[2]))
    camera.position.set(position[0], position[1] + 5, position[2] + 10)
    camera.lookAt(position[0], position[1], position[2])
  })

  return <Spaceship position={position} rotation={[0, Math.PI, 0]} />
}

function SpaceStation({ position }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[4, 1, 1]} />
        <meshStandardMaterial color="gray" />
      </mesh>
      <mesh position={[0, 1, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 2, 16]} />
        <meshStandardMaterial color="silver" />
      </mesh>
      <mesh position={[2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
        <meshStandardMaterial color="gold" />
      </mesh>
      <mesh position={[-2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
        <meshStandardMaterial color="gold" />
      </mesh>
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
