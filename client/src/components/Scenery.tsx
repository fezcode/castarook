import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';

const Tree = ({ position, seed = Math.random() }: { position: [number, number, number], seed?: number }) => {
  const leavesRef = useRef<THREE.Group>(null);
  const { height, width, leafColor } = useMemo(() => ({
    height: 1.5 + seed * 1.5,
    width: 1 + seed * 0.5,
    leafColor: new THREE.Color(0x2d5a27).lerp(new THREE.Color(0x4d7a36), seed)
  }), [seed]);

  useFrame((state) => {
    if (leavesRef.current) {
      const time = state.clock.getElapsedTime();
      const swayX = Math.sin(time * 1.2 + seed * 10) * 0.15;
      const swayZ = Math.cos(time * 0.8 + seed * 7) * 0.15;
      leavesRef.current.rotation.x = swayX;
      leavesRef.current.rotation.z = swayZ;
    }
  });

  return (
    <group position={position}>
      <mesh position={[0, height * 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.25, height * 0.6, 8]} />
        <meshStandardMaterial color="#4d2c19" />
      </mesh>
      <group ref={leavesRef} position={[0, height * 0.5, 0]}>
        <mesh position={[0, 0.5, 0]} castShadow receiveShadow><coneGeometry args={[width, 2, 8]} /><meshStandardMaterial color={leafColor} /></mesh>
        <mesh position={[0, 1.2, 0]} castShadow receiveShadow><coneGeometry args={[width * 0.8, 1.5, 8]} /><meshStandardMaterial color={leafColor.clone().multiplyScalar(1.1)} /></mesh>
        <mesh position={[0, 1.8, 0]} castShadow receiveShadow><coneGeometry args={[width * 0.5, 1, 8]} /><meshStandardMaterial color={leafColor.clone().multiplyScalar(1.2)} /></mesh>
      </group>
    </group>
  );
};

const Mountain = ({ position, scale = [15, 20, 15], color = "#4a4a4a" }: { position: [number, number, number], scale?: [number, number, number], color?: string }) => {
  // Use Icosahedron for more jagged, believable mountains
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color={color} roughness={0.9} flatShading />
    </mesh>
  );
};

const Rock = ({ position, scale = 1 }: { position: [number, number, number], scale?: number }) => {
  return (
    <mesh position={position} scale={scale} castShadow receiveShadow>
      <dodecahedronGeometry args={[1, 0]} />
      <meshStandardMaterial color="#666" roughness={0.8} />
    </mesh>
  );
};

export const HorseModel = ({ color = "#8d6e63", scale = 1, animate = true }: { color?: string, scale?: number, animate?: boolean }) => {
  const headRef = useRef<THREE.Mesh>(null);
  const tailRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (animate) {
      const time = state.clock.getElapsedTime();
      if (headRef.current) headRef.current.rotation.x = Math.sin(time * 0.5) * 0.1;
      if (tailRef.current) tailRef.current.rotation.z = Math.sin(time * 2) * 0.2;
    }
  });
  return (
    <group scale={scale}>
      <mesh position={[0, 0.6, 0]} castShadow receiveShadow><boxGeometry args={[0.4, 0.5, 1.0]} /><meshStandardMaterial color={color} /></mesh>
      <mesh position={[0, 1.0, 0.4]} rotation={[-0.6, 0, 0]} castShadow receiveShadow><cylinderGeometry args={[0.15, 0.2, 0.7, 8]} /><meshStandardMaterial color={color} /></mesh>
      <mesh ref={headRef} position={[0, 1.35, 0.65]} rotation={[0.2, 0, 0]} castShadow receiveShadow><boxGeometry args={[0.25, 0.25, 0.5]} /><meshStandardMaterial color={color} /></mesh>
      {[ [0.15, 0.3, 0.35], [-0.15, 0.3, 0.35], [0.15, 0.3, -0.35], [-0.15, 0.3, -0.35] ].map((pos, i) => (
        <mesh key={i} position={pos as [number, number, number]} castShadow receiveShadow><cylinderGeometry args={[0.06, 0.08, 0.6, 8]} /><meshStandardMaterial color={color} /></mesh>
      ))}
      <mesh ref={tailRef} position={[0, 0.7, -0.55]} rotation={[0.5, 0, 0]} castShadow receiveShadow><cylinderGeometry args={[0.04, 0.02, 0.5, 8]} /><meshStandardMaterial color="#444" /></mesh>
    </group>
  );
};

export const KnightPieceModel = ({ color, stripeColor, scale = 1 }: { color: string, stripeColor: string, scale?: number }) => {
  return (
    <group scale={scale}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow><cylinderGeometry args={[0.3, 0.4, 0.6, 16]} /><meshStandardMaterial color={color} /></mesh>
      <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.36, 0.36, 0.05, 16]} /><meshStandardMaterial color={stripeColor} /></mesh>
      <mesh position={[0, 0.8, 0]} rotation={[-0.3, 0, 0]} castShadow receiveShadow><cylinderGeometry args={[0.2, 0.35, 0.8, 8]} /><meshStandardMaterial color={color} /></mesh>
      <mesh position={[0, 0.9, -0.1]} rotation={[-0.3, 0, 0]}><boxGeometry args={[0.1, 0.6, 0.2]} /><meshStandardMaterial color={stripeColor} /></mesh>
      <group position={[0, 1.2, 0.2]} rotation={[0.4, 0, 0]}>
        <mesh castShadow receiveShadow><boxGeometry args={[0.3, 0.35, 0.6]} /><meshStandardMaterial color={color} /></mesh>
        <mesh position={[0.1, 0.25, -0.1]}><coneGeometry args={[0.05, 0.2, 4]} /><meshStandardMaterial color={color} /></mesh>
        <mesh position={[-0.1, 0.25, -0.1]}><coneGeometry args={[0.05, 0.2, 4]} /><meshStandardMaterial color={color} /></mesh>
      </group>
    </group>
  );
};

const Banner = ({ position, color = "red" }: { position: [number, number, number], color?: string }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.rotation.y = Math.sin(time * 3) * 0.3;
      meshRef.current.rotation.x = Math.cos(time * 2) * 0.15;
    }
  });
  return (
    <group position={position}>
      <mesh position={[0, 2, 0]} castShadow receiveShadow><cylinderGeometry args={[0.05, 0.05, 4, 8]} /><meshStandardMaterial color="#4d2c19" /></mesh>
      <mesh ref={meshRef} position={[0.6, 3.2, 0]} castShadow receiveShadow><planeGeometry args={[1.2, 0.8, 10, 10]} /><meshStandardMaterial color={color} side={THREE.DoubleSide} /></mesh>
    </group>
  );
};

const DecorativeItems = ({ position, rotationY }: { position: [number, number, number], rotationY: number }) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Detailed Sword on ground */}
      <group position={[0.5, -0.45, 0.2]} rotation={[Math.PI / 2, 0.2, 0]}>
        {/* Blade */}
        <mesh castShadow position={[0, 0.4, 0]}>
          <boxGeometry args={[0.08, 0.8, 0.02]} />
          <meshStandardMaterial color="#e0e0e0" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Guard */}
        <mesh castShadow position={[0, 0, 0]}>
          <boxGeometry args={[0.3, 0.04, 0.04]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} />
        </mesh>
        {/* Grip */}
        <mesh castShadow position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.2, 8]} />
          <meshStandardMaterial color="#4d2c19" />
        </mesh>
        {/* Pommel */}
        <mesh castShadow position={[0, -0.25, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} />
        </mesh>
      </group>
      
      {/* Detailed Shield on ground */}
      <group position={[-0.5, -0.48, -0.2]} rotation={[Math.PI / 2.2, 0, 0.5]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.5, 0.5, 0.05, 16]} />
          <meshStandardMaterial color="#1976d2" metalness={0.5} roughness={0.3} />
        </mesh>
        {/* Shield Boss (Center bump) */}
        <mesh position={[0, 0.05, 0]}>
          <sphereGeometry args={[0.12, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} />
        </mesh>
        {/* Shield Rim */}
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.5, 0.02, 8, 32]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} />
        </mesh>
      </group>
    </group>
  );
};

const Firecamp = ({ position }: { position: [number, number, number] }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (lightRef.current) lightRef.current.intensity = 2 + Math.sin(state.clock.getElapsedTime() * 10) * 0.5;
  });
  return (
    <group position={position}>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.1, 0.2]} castShadow><cylinderGeometry args={[0.05, 0.05, 0.6, 6]} /><meshStandardMaterial color="#331a00" /></mesh>
      <mesh rotation={[0, Math.PI / 3, Math.PI / 2]} position={[0, 0.1, -0.2]} castShadow><cylinderGeometry args={[0.05, 0.05, 0.6, 6]} /><meshStandardMaterial color="#331a00" /></mesh>
      <group position={[0, 0.3, 0]}>
        <pointLight ref={lightRef} color="#ff5722" distance={10} decay={2} castShadow />
        <Sparkles count={20} scale={0.5} size={4} speed={2} color="#ff9800" />
        <Float speed={4} rotationIntensity={0.5} floatIntensity={0.5}>
          <mesh><sphereGeometry args={[0.1, 8, 8]} /><meshStandardMaterial color="#ff5722" emissive="#ff5722" emissiveIntensity={2} transparent opacity={0.6} /></mesh>
        </Float>
      </group>
    </group>
  );
};

const Grass = ({ position, seed = Math.random() }: { position: [number, number, number], seed?: number }) => {
  const ref = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (ref.current) {
      const time = state.clock.getElapsedTime();
      ref.current.rotation.x = Math.sin(time * 3 + seed * 5) * 0.3;
      ref.current.rotation.z = Math.cos(time * 2.5 + seed * 3) * 0.3;
    }
  });
  return (
    <group position={position} ref={ref}>
      <mesh position={[0, 0.1, 0]} rotation={[0, seed * Math.PI, 0]}><planeGeometry args={[0.2, 0.4]} /><meshStandardMaterial color="#4d7a36" side={THREE.DoubleSide} transparent alphaTest={0.5} /></mesh>
      <mesh position={[0, 0.1, 0]} rotation={[0, seed * Math.PI + Math.PI / 2, 0]}><planeGeometry args={[0.2, 0.4]} /><meshStandardMaterial color="#4d7a36" side={THREE.DoubleSide} transparent alphaTest={0.5} /></mesh>
    </group>
  );
};

const WindParticles = () => {
  return (
    <group>
      <Sparkles count={150} scale={[40, 10, 40]} size={3} speed={4} color="#8d6e63" opacity={0.4} />
      <Sparkles count={100} scale={[50, 15, 50]} size={2} speed={6} color="#bcaaa4" opacity={0.3} />
    </group>
  );
};

export const Scenery = ({ isNight }: { isNight: boolean }) => {
  const trees: { pos: [number, number, number], seed: number }[] = useMemo(() => [
    { pos: [-12, 0, -12], seed: 0.1 }, { pos: [-15, 0, -8], seed: 0.2 }, { pos: [-10, 0, -15], seed: 0.3 },
    { pos: [12, 0, 12], seed: 0.4 }, { pos: [15, 0, 8], seed: 0.5 }, { pos: [10, 0, 15], seed: 0.6 },
    { pos: [-12, 0, 12], seed: 0.7 }, { pos: [-15, 0, 8], seed: 0.8 }, { pos: [-10, 0, 15], seed: 0.9 },
    { pos: [12, 0, -12], seed: 0.15 }, { pos: [15, 0, -8], seed: 0.25 }, { pos: [10, 0, -15], seed: 0.35 },
    { pos: [-25, 0, 0], seed: 0.45 }, { pos: [25, 0, 0], seed: 0.55 }, { pos: [0, 0, 25], seed: 0.65 }, { pos: [0, 0, -25], seed: 0.75 },
  ], []);

  const grassTufts: { pos: [number, number, number], seed: number }[] = useMemo(() => {
    const tufts = [];
    for (let i = 0; i < 80; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 8 + Math.random() * 35;
      tufts.push({ pos: [Math.cos(angle) * radius, -0.5, Math.sin(angle) * radius] as [number, number, number], seed: Math.random() });
    }
    return tufts;
  }, []);

  const mountains: { pos: [number, number, number], scale: [number, number, number], color: string }[] = useMemo(() => [
    { pos: [-50, 0, -50], scale: [30, 40, 30], color: "#3a3a3a" },
    { pos: [50, 0, 50], scale: [35, 50, 35], color: "#4a4a4a" },
    { pos: [-50, 0, 50], scale: [30, 45, 30], color: "#2a2a2a" },
    { pos: [50, 0, -50], scale: [40, 60, 40], color: "#333333" },
    { pos: [0, -5, -70], scale: [60, 30, 30], color: "#222222" },
    { pos: [70, -5, 0], scale: [30, 35, 60], color: "#444444" },
  ], []);

  const decoItems = useMemo(() => [
    { pos: [-5, 0, -2], rot: 0.5 }, { pos: [6, 0, 5], rot: 2.1 }, { pos: [-3, 0, 8], rot: 4.5 }
  ], []);

  const firecamps: [number, number, number][] = [[-6, 0, -6], [6, 0, 6], [-6, 0, 6], [6, 0, -6], [-15, 0, 0], [15, 0, 0], [0, 0, 15], [0, 0, -15]];

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]} receiveShadow>
        <circleGeometry args={[150, 64]} />
        <meshStandardMaterial color={isNight ? "#051505" : "#1e3a1e"} />
      </mesh>

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.54, 0]} receiveShadow><planeGeometry args={[4, 150]} /><meshStandardMaterial color="#3d2b1f" /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.54, 0]} receiveShadow><planeGeometry args={[150, 4]} /><meshStandardMaterial color="#3d2b1f" /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.53, 0]} receiveShadow><circleGeometry args={[12, 32]} /><meshStandardMaterial color="#3d2b1f" /></mesh>

      {mountains.map((m, i) => <Mountain key={`mtn-${i}`} position={m.pos} scale={m.scale} color={m.color} />)}

      <Rock position={[-8, -0.2, -5]} scale={0.5} /><Rock position={[7, -0.2, 9]} scale={0.7} /><Rock position={[-12, -0.1, 4]} scale={0.4} />
      <group position={[-10, -0.5, -8]} rotation={[0, Math.PI / 4, 0]}><HorseModel color="#5d4037" scale={0.8} /></group>
      <group position={[12, -0.5, 5]} rotation={[0, -Math.PI / 3, 0]}><HorseModel color="#795548" scale={0.9} /></group>
      
      <WindParticles />
      
      {trees.map((tree, i) => <Tree key={`tree-${i}`} position={tree.pos} seed={tree.seed} />)}
      {grassTufts.map((grass, i) => <Grass key={`grass-${i}`} position={grass.pos} seed={grass.seed} />)}
      
      <Banner position={[-2, -0.5, -30]} color="#d32f2f" /><Banner position={[2, -0.5, -30]} color="#d32f2f" />
      <Banner position={[-2, -0.5, 30]} color="#1976d2" /><Banner position={[2, -0.5, 30]} color="#1976d2" />

      {decoItems.map((item, i) => <DecorativeItems key={`deco-${i}`} position={item.pos as [number, number, number]} rotationY={item.rot} />)}

      {isNight && firecamps.map((pos, i) => <Firecamp key={`fire-${i}`} position={pos} />)}
    </group>
  );
};
