import React, { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
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
  const [position, setPosition] = useState(new Vector3(0, 0, 0))
  const [keys, setKeys] = useState({ forward: false, backward: false, left: false, right: false, shoot: false })
  const speed = 0.1
  const { scene, camera } = useThree()
  const lasers = useRef([])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowUp') setKeys((keys) => ({ ...keys, forward: true }))
      if (event.key === 'ArrowDown') setKeys((keys) => ({ ...keys, backward: true }))
      if (event.key === 'ArrowLeft') setKeys((keys) => ({ ...keys, left: true }))
      if (event.key === 'ArrowRight') setKeys((keys) => ({ ...keys, right: true }))
      if (event.key === ' ') setKeys((keys) => ({ ...keys, shoot: true }))
    }

    const handleKeyUp = (event) => {
      if (event.key === 'ArrowUp') setKeys((keys) => ({ ...keys, forward: false }))
      if (event.key === 'ArrowDown') setKeys((keys) => ({ ...keys, backward: false }))
      if (event.key === 'ArrowLeft') setKeys((keys) => ({ ...keys, left: false }))
      if (event.key === 'ArrowRight') setKeys((keys) => ({ ...keys, right: false }))
      if (event.key === ' ') setKeys((keys) => ({ ...keys, shoot: false }))
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame(() => {
    const newPosition = position.clone()
    if (keys.forward) newPosition.z -= speed
    if (keys.backward) newPosition.z += speed
    if (keys.left) newPosition.x -= speed
    if (keys.right) newPosition.x += speed
    setPosition(newPosition)

    camera.position.set(newPosition.x, newPosition.y + 5, newPosition.z + 10)
    camera.lookAt(newPosition.x, newPosition.y, newPosition.z)

    if (keys.shoot) {
      const laser = <Laser position={newPosition.clone()} direction={new Vector3(0, 0, -1)} />
      lasers.current.push(laser)
      scene.add(laser)
    }

    // Update and remove lasers
    lasers.current = lasers.current.filter(laser => {
      if (laser.position.z > -100) {
        return true
      } else {
        scene.remove(laser)
        return false
      }
    })

    // Check for collisions
    scene.children.forEach(child => {
      if (child.type === 'Mesh' && child.geometry.type === 'SphereGeometry') {
        const distance = newPosition.distanceTo(child.position)
        if (distance < 1) {
          scene.remove(child)
        }
        
        // Check laser collisions
        lasers.current.forEach(laser => {
          const laserDistance = laser.position.distanceTo(child.position)
          if (laserDistance < 1) {
            scene.remove(child)
            scene.remove(laser)
          }
        })
      }
    })
  })

  return <Spaceship position={position} rotation={[0, Math.PI, 0]} />
}

function Laser({ position, direction }) {
  const ref = useRef()

  useFrame(() => {
    if (ref.current) {
      ref.current.position.add(direction.multiplyScalar(0.5))
      if (ref.current.position.z < -100) {
        ref.current.removeFromParent()
      }
    }
  })

  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshBasicMaterial color="red" />
    </mesh>
  )
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

function Particles({ count = 1000 }) {
  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 100
      pos[i * 3 + 1] = (Math.random() - 0.5) * 100
      pos[i * 3 + 2] = (Math.random() - 0.5) * 100
    }
    return pos
  }, [count])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attachObject={['attributes', 'position']}
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.1} color="white" transparent opacity={0.8} />
    </points>
  )
}

export default function SpaceGame() {
  return (
    <Canvas camera={{ position: [0, 5, 10] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <PlayerSpaceship />
      <Planet position={[-20, 0, -50]} color="red" size={5} />
      <Planet position={[30, 10, -80]} color="blue" size={3} />
      <SpaceStation position={[50, 0, -100]} />
      <Stars radius={300} depth={60} count={20000} factor={7} saturation={0} fade />
      <Particles />
    </Canvas>
  )
}
