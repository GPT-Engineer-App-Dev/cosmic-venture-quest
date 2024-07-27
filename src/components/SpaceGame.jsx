import React, { useRef, useState, useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { Vector3 } from 'three'
import * as THREE from 'three'

function HUD({ points, health, level }) {
  return (
    <div className="absolute top-0 left-0 p-4 text-white font-bold text-xl">
      <div>Points: {points}</div>
      <div>Health: {health}</div>
      <div>Level: {level}</div>
    </div>
  )
}

function Spaceship({ position, rotation }) {
  const meshRef = useRef()
  const [lasers, setLasers] = useState([])

  useFrame((state) => {
    meshRef.current.rotation.y += 0.01
    
    // Update laser positions
    setLasers(prevLasers => 
      prevLasers.map(laser => ({ ...laser, position: laser.position.add(new Vector3(0, 0, -1)) }))
        .filter(laser => laser.position.z > -100)
    )
  })

  const shootLaser = () => {
    setLasers(prevLasers => [...prevLasers, { position: new Vector3(position.x, position.y, position.z) }])
  }

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'Space') shootLaser()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

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
      <Points>
        <pointsMaterial size={0.1} color="orange" />
        <Float speed={5} floatIntensity={2}>
          {Array.from({ length: 20 }).map((_, i) => (
            <point key={i} position={[Math.random() - 0.5, Math.random() - 0.5, -2]} />
          ))}
        </Float>
      </Points>
      {lasers.map((laser, index) => (
        <mesh key={index} position={laser.position}>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial color="red" />
        </mesh>
      ))}
    </group>
  )
}

function Planet({ position, color, size }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    const gradient = context.createRadialGradient(128, 128, 0, 128, 128, 128);
    gradient.addColorStop(0, color);
    gradient.addColorStop(0.5, color);
    gradient.addColorStop(1, 'black');
    context.fillStyle = gradient;
    context.fillRect(0, 0, 256, 256);
    
    // Add some noise
    for (let i = 0; i < 1000; i++) {
      const x = Math.random() * 256;
      const y = Math.random() * 256;
      const radius = Math.random() * 2;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.2})`;
      context.fill();
    }
    
    return new THREE.CanvasTexture(canvas);
  }, [color]);

  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 64, 64]} />
      <meshStandardMaterial map={texture} />
      <Particles count={100} color={color} size={size} />
    </mesh>
  )
}

function Particles({ count, color, size }) {
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = size + (Math.random() * 0.2);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
      const particleColor = new THREE.Color(color);
      colors[i * 3] = particleColor.r;
      colors[i * 3 + 1] = particleColor.g;
      colors[i * 3 + 2] = particleColor.b;
    }
    return [positions, colors];
  }, [count, color, size]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attachObject={['attributes', 'position']} count={count} array={positions} itemSize={3} />
        <bufferAttribute attachObject={['attributes', 'color']} count={count} array={colors} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} vertexColors />
    </points>
  );
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
  const [rotation, setRotation] = useState(0)

  useFrame((state, delta) => {
    setRotation(rotation => rotation + delta * 0.1)
  })

  return (
    <group position={position}>
      <mesh rotation={[0, rotation, 0]}>
        <boxGeometry args={[4, 1, 1]} />
        <meshStandardMaterial color="gray" />
      </mesh>
      <mesh position={[0, 1, 0]} rotation={[0, rotation, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 2, 16]} />
        <meshStandardMaterial color="silver" />
      </mesh>
      <mesh position={[2, 0, 0]} rotation={[0, rotation, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
        <meshStandardMaterial color="gold" />
      </mesh>
      <mesh position={[-2, 0, 0]} rotation={[0, rotation, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.1, 4, 8]} />
        <meshStandardMaterial color="gold" />
      </mesh>
      <Points>
        <pointsMaterial size={0.05} color="cyan" />
        <Float speed={2} floatIntensity={1}>
          {Array.from({ length: 50 }).map((_, i) => (
            <point key={i} position={[(Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5, (Math.random() - 0.5) * 5]} />
          ))}
        </Float>
      </Points>
    </group>
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

function Particles({ count = 5000 }) {
  const [positions, colors] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 300
      positions[i * 3 + 1] = (Math.random() - 0.5) * 300
      positions[i * 3 + 2] = (Math.random() - 0.5) * 300
      const color = new THREE.Color()
      color.setHSL(Math.random(), 0.7, 0.9)
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }
    return [positions, colors]
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
        <bufferAttribute
          attachObject={['attributes', 'color']}
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial size={0.5} vertexColors />
    </points>
  )
}

export default function SpaceGame() {
  const [gameState, setGameState] = useState({
    points: 0,
    health: 100,
    level: 1
  })

  useEffect(() => {
    const gameLoop = setInterval(() => {
      setGameState(prevState => ({
        ...prevState,
        points: prevState.points + 1
      }))
    }, 1000)

    return () => clearInterval(gameLoop)
  }, [])

  return (
    <div className="relative w-full h-full">
      <Canvas camera={{ position: [0, 5, 10] }} style={{ background: '#000010' }}>
        <color attach="background" args={['#000010']} />
        <fog attach="fog" args={['#000010', 100, 500]} />
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={0.8} />
        <PlayerSpaceship />
        <Planet position={[-20, 0, -50]} color="#ff4400" size={5} />
        <Planet position={[30, 10, -80]} color="#00aaff" size={3} />
        <Planet position={[-40, -5, -120]} color="#ffaa00" size={8} />
        <Planet position={[60, 20, -150]} color="#00ff88" size={4} />
        <SpaceStation position={[50, 0, -100]} />
        <Stars radius={300} depth={60} count={50000} factor={7} saturation={0} fade speed={1} />
        <Particles />
      </Canvas>
      <HUD points={gameState.points} health={gameState.health} level={gameState.level} />
    </div>
  )
}
