import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles, Float } from '@react-three/drei';
import * as THREE from 'three';

const getTerrainHeight = (x: number, z: number) => {
  const distFromCenter = Math.sqrt(x*x + z*z);
  
  // Base rolling hills noise
  let y = (Math.sin(x * 0.08) * Math.cos(z * 0.08) * 2.5) + (Math.sin(x * 0.04) * 2);
  
  // Localized hill clusters around the plaza area
  const localHills = (Math.sin(x * 0.25) * Math.cos(z * 0.25) * 2.2);
  if (distFromCenter > 20) {
    y += localHills * Math.min(1, (distFromCenter - 20) / 10);
  }

  // Western Mound
  const distToHill1 = Math.sqrt(Math.pow(x + 40, 2) + Math.pow(z + 40, 2));
  if (distToHill1 < 25) {
    y += Math.pow(Math.cos((distToHill1 / 25) * Math.PI / 2), 2) * 7;
  }

  // Eastern Plateau
  const distToPlateau = Math.sqrt(Math.pow(x - 45, 2) + Math.pow(z - 35, 2));
  if (distToPlateau < 30) {
    y += Math.pow(Math.cos((distToPlateau / 30) * Math.PI / 2), 0.5) * 4.5;
  }

  // Southern Ridges
  if (z > 40) {
    y += Math.sin(x * 0.2) * 2 * Math.min(1, (z - 40) / 20);
  }

  // Flatten the central area for the Plaza
  const flatRadius = 18;
  const smoothRadius = 32; 
  if (distFromCenter < smoothRadius) {
    const weight = distFromCenter < flatRadius ? 0 : (distFromCenter - flatRadius) / (smoothRadius - flatRadius);
    const smoothWeight = weight < 0.5 ? 2 * weight * weight : 1 - Math.pow(-2 * weight + 2, 2) / 2;
    y = y * smoothWeight;
  }

  // River 1 (Right side)
  const river1Center = 45 + Math.sin(z * 0.05) * 12;
  const distToRiver1 = Math.abs(x - river1Center);
  if (distToRiver1 < 15) {
    const riverDepth = (15 - distToRiver1) * 1.5;
    const plazaProtector = Math.min(1, Math.max(0, (distFromCenter - 16) / 12));
    y -= riverDepth * plazaProtector;
  }

  return y - 0.55; 
};

// Helper to get the actual surface height including plaza elevation
const getSurfaceHeight = (x: number, z: number) => {
  const distFromCenter = Math.sqrt(x*x + z*z);
  if (distFromCenter < 10.5) return -0.3; // Top of Main Plaza
  if (distFromCenter < 12) return -0.45;  // Top of Foundation tier
  // Sink vegetation slightly (-0.05) into ground to avoid floating due to mesh discretization
  return getTerrainHeight(x, z) - 0.05;
};

const Tree = ({ position, windStrength = 1.0, seed = Math.random() }: { position: [number, number, number], windStrength?: number, seed?: number }) => {
  const leavesRef = useRef<THREE.Group>(null);
  const { height, width, leafColor, treeType } = useMemo(() => {
    const types = ['pine', 'round', 'bushy'];
    return {
      height: 1.5 + seed * 2,
      width: 1 + seed * 0.8,
      leafColor: new THREE.Color(0x2d5a27).lerp(new THREE.Color(0x4d7a36), seed),
      treeType: types[Math.floor(seed * types.length)]
    };
  }, [seed]);

  useFrame((state) => {
    if (leavesRef.current) {
      const time = state.clock.getElapsedTime();
      const swayX = Math.sin(time * 1.2 + seed * 10) * 0.15 * windStrength;
      const swayZ = Math.cos(time * 0.8 + seed * 7) * 0.15 * windStrength;
      leavesRef.current.rotation.x = swayX;
      leavesRef.current.rotation.z = swayZ;
    }
  });

  return (
    <group position={[position[0], getSurfaceHeight(position[0], position[2]), position[2]]}>
      <mesh position={[0, height * 0.3, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.15, 0.25, height * 0.6, 8]} />
        <meshStandardMaterial color="#4d2c19" roughness={0.9} />
      </mesh>
      <group ref={leavesRef} position={[0, height * 0.5, 0]}>
        {treeType === 'pine' ? (
          <>
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow><coneGeometry args={[width, 2, 8]} /><meshStandardMaterial color={leafColor} roughness={0.8} /></mesh>
            <mesh position={[0, 1.2, 0]} castShadow receiveShadow><coneGeometry args={[width * 0.8, 1.5, 8]} /><meshStandardMaterial color={leafColor.clone().multiplyScalar(1.1)} roughness={0.8} /></mesh>
            <mesh position={[0, 1.8, 0]} castShadow receiveShadow><coneGeometry args={[width * 0.5, 1, 8]} /><meshStandardMaterial color={leafColor.clone().multiplyScalar(1.2)} roughness={0.8} /></mesh>
          </>
        ) : treeType === 'round' ? (
          <mesh position={[0, 1, 0]} castShadow receiveShadow>
            <sphereGeometry args={[width, 12, 12]} />
            <meshStandardMaterial color={leafColor} roughness={0.8} />
          </mesh>
        ) : (
          <group position={[0, 0.5, 0]}>
            <mesh position={[0, 0, 0]} castShadow receiveShadow><sphereGeometry args={[width * 0.7, 8, 8]} /><meshStandardMaterial color={leafColor} roughness={0.8} /></mesh>
            <mesh position={[width * 0.4, 0.5, 0]} castShadow receiveShadow><sphereGeometry args={[width * 0.5, 8, 8]} /><meshStandardMaterial color={leafColor.clone().multiplyScalar(1.1)} roughness={0.8} /></mesh>
            <mesh position={[-width * 0.4, 0.5, 0]} castShadow receiveShadow><sphereGeometry args={[width * 0.5, 8, 8]} /><meshStandardMaterial color={leafColor.clone().multiplyScalar(0.9)} roughness={0.8} /></mesh>
          </group>
        )}
      </group>
    </group>
  );
};

const Bush = ({ position, scale = 1 }: { position: [number, number, number], scale?: number }) => {
  return (
    <group position={[position[0], getSurfaceHeight(position[0], position[2]), position[2]]} scale={scale}>
      <mesh position={[0, 0.3, 0]} castShadow receiveShadow><sphereGeometry args={[0.5, 8, 8]} /><meshStandardMaterial color="#2e7d32" roughness={0.9} /></mesh>
      <mesh position={[0.3, 0.2, 0.2]} castShadow receiveShadow><sphereGeometry args={[0.4, 8, 8]} /><meshStandardMaterial color="#1b5e20" roughness={0.9} /></mesh>
      <mesh position={[-0.3, 0.2, -0.2]} castShadow receiveShadow><sphereGeometry args={[0.4, 8, 8]} /><meshStandardMaterial color="#388e3c" roughness={0.9} /></mesh>
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
    <group position={[position[0], getSurfaceHeight(position[0], position[2]), position[2]]} ref={ref}>
      <mesh position={[0, 0.1, 0]} rotation={[0, seed * Math.PI, 0]}><planeGeometry args={[0.2, 0.4]} /><meshStandardMaterial color="#4d7a36" side={THREE.DoubleSide} transparent alphaTest={0.5} /></mesh>
      <mesh position={[0, 0.1, 0]} rotation={[0, seed * Math.PI + Math.PI / 2, 0]}><planeGeometry args={[0.2, 0.4]} /><meshStandardMaterial color="#4d7a36" side={THREE.DoubleSide} transparent alphaTest={0.5} /></mesh>
    </group>
  );
};

const Flower = ({ position, color = "red" }: { position: [number, number, number], color?: string }) => {
  return (
    <group position={[position[0], getSurfaceHeight(position[0], position[2]), position[2]]}>
      <mesh position={[0, 0.1, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.02, 0.02, 0.3]} />
        <meshStandardMaterial color="#4caf50" />
      </mesh>
      <mesh position={[0, 0.25, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.2} />
      </mesh>
    </group>
  );
};

const Rabbit = ({ position, seed = Math.random() }: { position: [number, number, number], seed?: number }) => {
  const ref = useRef<THREE.Group>(null);
  const startX = position[0];
  const startZ = position[2];

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.getElapsedTime() + seed * 100;
      const hopHeight = Math.max(0, Math.sin(t * 4) * 0.5);
      const curX = startX + Math.sin(t * 0.5) * 2;
      const curZ = startZ + Math.cos(t * 0.5) * 2;
      ref.current.position.set(curX, getSurfaceHeight(curX, curZ) + hopHeight, curZ);
      ref.current.rotation.y = t * 0.5 + Math.PI / 2;
    }
  });

  return (
    <group ref={ref} position={position} scale={0.3}>
      <mesh position={[0, 0.4, 0]} castShadow receiveShadow><boxGeometry args={[0.6, 0.4, 1]} /><meshStandardMaterial color="#e0e0e0" /></mesh>
      <mesh position={[0, 0.7, 0.4]} castShadow receiveShadow><boxGeometry args={[0.4, 0.4, 0.4]} /><meshStandardMaterial color="#e0e0e0" /></mesh>
      <mesh position={[0.1, 1, 0.4]} castShadow receiveShadow><boxGeometry args={[0.1, 0.4, 0.1]} /><meshStandardMaterial color="#ffcdd2" /></mesh>
      <mesh position={[-0.1, 1, 0.4]} castShadow receiveShadow><boxGeometry args={[0.1, 0.4, 0.1]} /><meshStandardMaterial color="#ffcdd2" /></mesh>
    </group>
  );
};

const Palisade = ({ position, rotationY = 0, length = 5 }: { position: [number, number, number], rotationY?: number, length?: number }) => {
  const logs = [];
  for (let i = 0; i < length; i++) {
    logs.push(
      <group key={i} position={[i * 0.4, 0, 0]}>
        <mesh position={[0, 1, 0]} castShadow receiveShadow><cylinderGeometry args={[0.18, 0.2, 2, 6]} /><meshStandardMaterial color="#5d4037" roughness={0.9} /></mesh>
        <mesh position={[0, 2.2, 0]} castShadow receiveShadow><coneGeometry args={[0.18, 0.5, 6]} /><meshStandardMaterial color="#5d4037" roughness={0.9} /></mesh>
      </group>
    );
  }
  return <group position={[position[0], getSurfaceHeight(position[0], position[2]), position[2]]} rotation={[0, rotationY, 0]}>{logs}</group>;
};

const Mountain = ({ position, scale = [15, 20, 15], color = "#4a4a4a" }: { position: [number, number, number], scale?: [number, number, number], color?: string }) => {
  return (
    <mesh position={[position[0], getSurfaceHeight(position[0], position[2]) + scale[1] * 0.4, position[2]]} scale={scale} castShadow receiveShadow>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color={color} roughness={0.9} flatShading />
    </mesh>
  );
};

const Cottage = ({ position, rotationY = 0 }: { position: [number, number, number], rotationY?: number }) => {
  return (
    <group position={[position[0], getSurfaceHeight(position[0], position[2]), position[2]]} rotation={[0, rotationY, 0]}>
      <mesh position={[0, 1, 0]} castShadow receiveShadow><boxGeometry args={[3, 2, 2.5]} /><meshStandardMaterial color="#8d6e63" roughness={0.8} /></mesh>
      <mesh position={[0, 2.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow><coneGeometry args={[2.5, 1.5, 4]} /><meshStandardMaterial color="#5d4037" roughness={0.7} /></mesh>
      <mesh position={[0, 0.6, 1.26]}><planeGeometry args={[0.6, 1]} /><meshStandardMaterial color="#3e2723" /></mesh>
      <mesh position={[1, 1.2, 1.26]}><planeGeometry args={[0.4, 0.4]} /><meshStandardMaterial color="#81d4fa" emissive="#81d4fa" emissiveIntensity={0.2} /></mesh>
      <mesh position={[-1, 1.2, 1.26]}><planeGeometry args={[0.4, 0.4]} /><meshStandardMaterial color="#81d4fa" emissive="#81d4fa" emissiveIntensity={0.2} /></mesh>
    </group>
  );
};

const Castle = ({ position, rotationY = 0, scale = 1 }: { position: [number, number, number], rotationY?: number, scale?: number }) => {
  return (
    <group position={[position[0], getSurfaceHeight(position[0], position[2]), position[2]]} rotation={[0, rotationY, 0]} scale={scale}>
      <mesh position={[0, 3, 0]} castShadow receiveShadow><boxGeometry args={[6, 6, 6]} /><meshStandardMaterial color="#78909c" roughness={0.6} /></mesh>
      {[ [-3, 4, -3], [3, 4, -3], [-3, 4, 3], [3, 4, 3] ].map((pos, i) => (
        <group key={i} position={pos as [number, number, number]}>
          <mesh castShadow receiveShadow><cylinderGeometry args={[1.2, 1.2, 8, 8]} /><meshStandardMaterial color="#546e7a" roughness={0.6} /></mesh>
          <mesh position={[0, 4.5, 0]} castShadow receiveShadow><coneGeometry args={[1.5, 2, 8]} /><meshStandardMaterial color="#b71c1c" roughness={0.7} /></mesh>
        </group>
      ))}
      <mesh position={[0, 6.2, 0]} castShadow receiveShadow><boxGeometry args={[5.5, 0.5, 5.5]} /><meshStandardMaterial color="#455a64" /></mesh>
    </group>
  );
};

const Terrain = ({ isNight }: { isNight: boolean }) => {
  const vertices = useMemo(() => {
    const size = 160;
    const segments = 60;
    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setZ(i, getTerrainHeight(pos.getX(i), pos.getY(i)) + 0.55);
    }
    geometry.computeVertexNormals();
    return geometry;
  }, []);
  return <mesh geometry={vertices} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]} receiveShadow><meshStandardMaterial color={isNight ? "#051505" : "#1e3a1e"} roughness={0.8} flatShading /></mesh>;
};

const River = ({ windStrength = 1.0 }: { windStrength?: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const riverGeom = useMemo(() => {
    const segments = 100;
    const width = 15;
    const length = 200;
    const geometry = new THREE.PlaneGeometry(width, length, 1, segments);
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getY(i);
      // Synchronize with terrain's riverCenter: 45 + Math.sin(z * 0.05) * 12
      const xOffset = Math.sin(z * 0.05) * 12;
      pos.setX(i, x + xOffset);
      
      // Water surface level should be below the terrain top but above the bed
      // World Y will be MeshY + pos.Z. 
      // We want World Y to be around -1.2 in the deep parts
      pos.setZ(i, -0.6 + 0.55); 
    }
    geometry.computeVertexNormals();
    return geometry;
  }, []);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y = -0.55 + Math.sin(time * 0.5) * 0.02 * windStrength;
    }
  });

  return (
    <mesh geometry={riverGeom} ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[45, -0.55, 0]} receiveShadow>
      <meshStandardMaterial color="#0288d1" transparent opacity={0.7} roughness={0.1} metalness={0.9} emissive="#01579b" emissiveIntensity={0.5} />
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
    <group position={[position[0], getTerrainHeight(position[0], position[2]), position[2]]}>
      <mesh position={[0, 2, 0]} castShadow receiveShadow><cylinderGeometry args={[0.05, 0.05, 4, 8]} /><meshStandardMaterial color="#4d2c19" /></mesh>
      <mesh ref={meshRef} position={[0.6, 3.2, 0]} castShadow receiveShadow><planeGeometry args={[1.2, 0.8, 10, 10]} /><meshStandardMaterial color={color} side={THREE.DoubleSide} /></mesh>
    </group>
  );
};

const DecorativeItems = ({ position, rotationY }: { position: [number, number, number], rotationY: number }) => {
  const y = getSurfaceHeight(position[0], position[2]);
  return (
    <group position={[position[0], y, position[2]]} rotation={[0, rotationY, 0]}>
      <group position={[0.5, 0.1, 0.2]} rotation={[Math.PI / 2, 0.2, 0]}>
        <mesh castShadow position={[0, 0.4, 0]}><boxGeometry args={[0.08, 0.8, 0.02]} /><meshStandardMaterial color="#e0e0e0" metalness={0.9} roughness={0.1} /></mesh>
        <mesh castShadow position={[0, 0, 0]}><boxGeometry args={[0.3, 0.04, 0.04]} /><meshStandardMaterial color="#d4af37" metalness={0.8} /></mesh>
        <mesh castShadow position={[0, -0.15, 0]}><cylinderGeometry args={[0.03, 0.03, 0.2, 8]} /><meshStandardMaterial color="#4d2c19" /></mesh>
        <mesh castShadow position={[0, -0.25, 0]}><sphereGeometry args={[0.05, 8, 8]} /><meshStandardMaterial color="#d4af37" metalness={0.8} /></mesh>
      </group>
      <group position={[-0.5, 0.05, -0.2]} rotation={[Math.PI / 2.2, 0, 0.5]}>
        <mesh castShadow><cylinderGeometry args={[0.5, 0.5, 0.05, 16]} /><meshStandardMaterial color="#1976d2" metalness={0.5} roughness={0.3} /></mesh>
        <mesh position={[0, 0.05, 0]}><sphereGeometry args={[0.12, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshStandardMaterial color="#d4af37" metalness={0.8} /></mesh>
        <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}><torusGeometry args={[0.5, 0.02, 8, 32]} /><meshStandardMaterial color="#d4af37" metalness={0.8} /></mesh>
      </group>
    </group>
  );
};

const Firecamp = ({ position }: { position: [number, number, number] }) => {
  const lightRef = useRef<THREE.PointLight>(null);
  useFrame((state) => {
    if (lightRef.current) lightRef.current.intensity = 2 + Math.sin(state.clock.getElapsedTime() * 10) * 0.5;
  });
  const y = getSurfaceHeight(position[0], position[2]);
  return (
    <group position={[position[0], y, position[2]]}>
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

const WindParticles = () => {
  return (
    <group>
      <Sparkles count={150} scale={[40, 10, 40]} size={3} speed={4} color="#8d6e63" opacity={0.4} />
      <Sparkles count={100} scale={[50, 15, 50]} size={2} speed={6} color="#bcaaa4" opacity={0.3} />
    </group>
  );
};

const StonePlaza = ({ isNight }: { isNight: boolean }) => {
  const plazaColor = isNight ? "#1a1a1a" : "#4a4a4a";
  const rimColor = isNight ? "#111" : "#333";
  
  // Use polygonOffset to help Three.js resolve depth for overlapping planes
  const stoneMaterialProps = {
    polygonOffset: true,
    polygonOffsetFactor: -1,
    polygonOffsetUnits: -1,
  };

  const scatteredStones = useMemo(() => {
    return Array.from({ length: 16 }).map((_, i) => {
      const angle = (i / 16) * Math.PI * 2 + Math.random() * 0.2;
      const dist = 13.5 + Math.random() * 2.5;
      const scale = 0.5 + Math.random() * 1.5;
      const x = Math.cos(angle) * dist;
      const z = Math.sin(angle) * dist;
      const y = getTerrainHeight(x, z) + 0.75;
      return { id: i, position: [x, y, z] as [number, number, number], rotation: [-Math.PI / 2, 0, angle] as [number, number, number], scale: [scale, scale, 1.5] as [number, number, number] };
    });
  }, []);
  
  return (
    <group position={[0, -0.55, 0]}>
      {/* Foundation - Tiered stone slabs - Deep foundation to prevent floating */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <cylinderGeometry args={[12, 13, 1.2, 32]} />
        <meshStandardMaterial color={plazaColor} roughness={0.9} {...stoneMaterialProps} />
      </mesh>
      
      {/* Main Elevated Plaza */}
      <mesh position={[0, 0.15, 0]} receiveShadow>
        <cylinderGeometry args={[10.5, 11, 0.2, 32]} />
        <meshStandardMaterial color={plazaColor} roughness={0.8} {...stoneMaterialProps} />
      </mesh>

      {/* Decorative Rim */}
      <mesh position={[0, 0.15, 0]} receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[11, 0.1, 8, 48]} />
        <meshStandardMaterial color={rimColor} metalness={0.2} roughness={0.6} {...stoneMaterialProps} />
      </mesh>

      {/* Corner Pillars/Stones */}
      {[0, Math.PI/2, Math.PI, Math.PI*1.5].map((angle, i) => (
        <group key={i} position={[Math.cos(angle) * 11.5, 0.3, Math.sin(angle) * 11.5]} rotation={[0, -angle, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[1.5, 0.8, 1.5]} />
            <meshStandardMaterial color={plazaColor} roughness={0.7} {...stoneMaterialProps} />
          </mesh>
          <mesh position={[0, 0.5, 0]} castShadow>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
          </mesh>
        </group>
      ))}

      {/* Decorative Stone Tiles/Slabs scattered around */}
      {scatteredStones.map(stone => (
        <mesh 
          key={`slab-${stone.id}`} 
          position={stone.position} 
          rotation={stone.rotation}
          scale={stone.scale}
          receiveShadow
        >
          <boxGeometry args={[1, 1, 0.1]} />
          <meshStandardMaterial color={plazaColor} roughness={0.9} {...stoneMaterialProps} />
        </mesh>
      ))}

      {/* Steps leading up to the board area */}
      {[0, Math.PI].map((angle, i) => (
        <group key={`steps-${i}`} rotation={[0, angle + Math.PI/2, 0]}>
          <mesh position={[0, 0.15, 11.5]} receiveShadow>
            <boxGeometry args={[4, 0.1, 2]} />
            <meshStandardMaterial color={plazaColor} {...stoneMaterialProps} />
          </mesh>
          <mesh position={[0, 0.05, 13]} receiveShadow>
            <boxGeometry args={[5, 0.1, 2]} />
            <meshStandardMaterial color={plazaColor} {...stoneMaterialProps} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

const MountainStream = ({ windStrength = 1.0 }: { windStrength?: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const riverGeom = useMemo(() => {
    const segments = 100;
    const width = 12;
    const length = 200;
    const geometry = new THREE.PlaneGeometry(width, length, 1, segments);
    const pos = geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getY(i);
      // Synchronize with terrain's river2Center: -50 + Math.cos(z * 0.06) * 8
      const xOffset = Math.cos(z * 0.06) * 8;
      pos.setX(i, x + xOffset);
      pos.setZ(i, -0.6 + 0.55); 
    }
    geometry.computeVertexNormals();
    return geometry;
  }, []);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y = -0.55 + Math.sin(time * 0.4) * 0.02 * windStrength;
    }
  });

  return (
    <mesh geometry={riverGeom} ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[-50, -0.55, 0]} receiveShadow>
      <meshStandardMaterial color="#4fc3f7" transparent opacity={0.6} roughness={0.1} metalness={0.8} emissive="#0288d1" emissiveIntensity={0.3} />
    </mesh>
  );
};

const StoneBridge = ({ position, rotationY = 0, length = 22 }: { position: [number, number, number], rotationY?: number, length?: number }) => {
  return (
    <group position={position} rotation={[0, rotationY, 0]}>
      {/* Main Path */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[length, 1.2, 8]} />
        <meshStandardMaterial color="#555" roughness={0.8} />
      </mesh>
      {/* Side Rails */}
      <mesh position={[0, 1.0, 3.8]} receiveShadow castShadow>
        <boxGeometry args={[length, 0.8, 0.5]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      <mesh position={[0, 1.0, -3.8]} receiveShadow castShadow>
        <boxGeometry args={[length, 0.8, 0.5]} />
        <meshStandardMaterial color="#444" />
      </mesh>
      {/* Support Pillars */}
      {[-0.3, 0.3].map((offset, i) => (
        <mesh key={i} position={[length * offset, -2, 0]} receiveShadow castShadow>
          <boxGeometry args={[4, 6, 7.8]} />
          <meshStandardMaterial color="#333" />
        </mesh>
      ))}
    </group>
  );
};

export const Scenery = ({ isNight, windStrength = 1.0 }: { isNight: boolean, windStrength?: number }) => {
  const trees = useMemo(() => {
    const list = [];
    // More trees!
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 22 + Math.random() * 35;
      list.push({ pos: [Math.cos(angle) * radius, 0, Math.sin(angle) * radius] as [number, number, number], seed: Math.random() });
    }
    return list;
  }, []);

  const grassTufts = useMemo(() => {
    const tufts = [];
    for (let i = 0; i < 100; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 8 + Math.random() * 40;
      tufts.push({ pos: [Math.cos(angle) * radius, -0.5, Math.sin(angle) * radius] as [number, number, number], seed: Math.random() });
    }
    return tufts;
  }, []);

  const flowers = useMemo(() => {
    const list = [];
    const colors = ["#f44336", "#e91e63", "#9c27b0", "#ffeb3b"];
    for (let i = 0; i < 40; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 10 + Math.random() * 25;
      list.push({ pos: [Math.cos(angle) * radius, -0.5, Math.sin(angle) * radius] as [number, number, number], color: colors[Math.floor(Math.random() * colors.length)] });
    }
    return list;
  }, []);

  const rabbits = useMemo(() => {
    const list = [];
    for (let i = 0; i < 6; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radius = 12 + Math.random() * 15;
      list.push({ pos: [Math.cos(angle) * radius, -0.5, Math.sin(angle) * radius] as [number, number, number], seed: Math.random() });
    }
    return list;
  }, []);

  const mountains: { pos: [number, number, number], scale: [number, number, number], color: string }[] = useMemo(() => [
    { pos: [-60, 0, -60], scale: [40, 50, 40], color: "#3a3a3a" },
    { pos: [60, 0, 60], scale: [45, 60, 45], color: "#4a4a4a" },
    { pos: [-60, 0, 60], scale: [40, 55, 40], color: "#2a2a2a" },
    { pos: [60, 0, -60], scale: [50, 70, 50], color: "#333333" },
    { pos: [0, -5, -80], scale: [70, 40, 40], color: "#222222" },
    { pos: [80, -5, 0], scale: [40, 45, 70], color: "#444444" },
  ], []);

  const decoItems = useMemo(() => [
    { pos: [-5, 0, -2], rot: 0.5 }, { pos: [6, 0, 5], rot: 2.1 }, { pos: [-3, 0, 8], rot: 4.5 }
  ], []);

  const bushes = useMemo(() => [
    { pos: [-12, -0.5, -5], scale: 1 }, { pos: [10, -0.5, 8], scale: 1.2 }, { pos: [-5, -0.5, 12], scale: 0.8 },
    { pos: [15, -0.5, -10], scale: 1.1 }, { pos: [0, -0.5, -20], scale: 1.3 }
  ], []);

  const firecamps: [number, number, number][] = [[-6, 0, -6], [6, 0, 6], [-6, 0, 6], [6, 0, -6], [-15, 0, 0], [15, 0, 0], [0, 0, 15], [0, 0, -15]];

  return (
    <group>
      <Terrain isNight={isNight} />
      <River windStrength={windStrength} />

      <StonePlaza isNight={isNight} />

      <StoneBridge position={[45, -0.2, 0]} rotationY={Math.PI / 8} length={28} />

      {mountains.map((m, i) => <Mountain key={`mtn-${i}`} position={m.pos} scale={m.scale} color={m.color} />)}

      <Cottage position={[-18, -0.5, -18]} rotationY={Math.PI / 4} />
      <Castle position={[0, -0.5, 35]} scale={2} rotationY={Math.PI} />
      
      <Palisade position={[-10, -0.5, -12]} rotationY={0.5} length={8} />
      <Palisade position={[8, -0.5, 15]} rotationY={-0.8} length={10} />

      <group position={[-10, getTerrainHeight(-10, -8), -8]} rotation={[0, Math.PI / 4, 0]}><HorseModel color="#5d4037" scale={0.8} /></group>
      <group position={[12, getTerrainHeight(12, 5), 5]} rotation={[0, -Math.PI / 3, 0]}><HorseModel color="#795548" scale={0.9} /></group>
      
      <WindParticles />
      
      {trees.map((tree, i) => <Tree key={`tree-${i}`} position={tree.pos} seed={tree.seed} windStrength={windStrength} />)}
      {bushes.map((bush, i) => <Bush key={`bush-${i}`} position={bush.pos as [number, number, number]} scale={bush.scale} />)}
      {grassTufts.map((grass, i) => <Grass key={`grass-${i}`} position={grass.pos} seed={grass.seed} />)}
      {flowers.map((f, i) => <Flower key={`flower-${i}`} position={f.pos} color={f.color} />)}
      {rabbits.map((r, i) => <Rabbit key={`rabbit-${i}`} position={r.pos} seed={r.seed} />)}
      
      <Banner position={[-2, -0.5, -30]} color="#d32f2f" /><Banner position={[2, -0.5, -30]} color="#d32f2f" />
      <Banner position={[-2, -0.5, 30]} color="#1976d2" /><Banner position={[2, -0.5, 30]} color="#1976d2" />

      {decoItems.map((item) => <DecorativeItems key={`deco-${item.pos[0]}-${item.pos[2]}`} position={item.pos as [number, number, number]} rotationY={item.rot} />)}

      {isNight && firecamps.map((pos, i) => <Firecamp key={`fire-${i}`} position={pos} />)}
    </group>
  );
};
