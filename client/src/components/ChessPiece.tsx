import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useCursor, Billboard, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { Piece } from '../types';
import { KnightPieceModel } from './Scenery';

interface Props {
  piece: Piece;
  isSelected: boolean;
  onClick: () => void;
  customWhiteColor?: string;
  customBlackColor?: string;
}

export const ChessPiece: React.FC<Props> = ({ piece, isSelected, onClick, customWhiteColor, customBlackColor }) => {
  const groupRef = useRef<THREE.Group>(null);
  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  const posX = piece.x - 3.5;
  const posZ = piece.y - 3.5;
  
  const teamBaseColor = piece.color === 'white' ? (customWhiteColor || '#f0d9b5') : (customBlackColor || '#4a4a4a');
  const highlightColor = isSelected ? '#ffeb3b' : hovered ? '#81c784' : teamBaseColor;
  const stripeColor = piece.secondaryColor || (piece.color === 'white' ? '#d4af37' : '#ff5252');

  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!groupRef.current) return;

    const t = state.clock.getElapsedTime();

    // Pulse vulnerability ring
    if (ringRef.current && piece.isDebuffed) {
      const pulseVertical = 0.1 + Math.sin(t * 5) * 0.15; // Vertical "slider" movement
      
      ringRef.current.position.y = pulseVertical;
      
      // Update opacity for all meshes in the group
      ringRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh && child.material) {
          const mat = child.material as THREE.MeshStandardMaterial;
          // Determine base opacity by geometry type/index
          // Inner circle or outer rings
          const isCenter = child.geometry.type === 'CircleGeometry';
          const isMiddle = child.geometry.type === 'RingGeometry' && mat.emissive.getHex() === 0xd4af37;
          
          // Use a higher minimum opacity (0.4) to ensure it's never invisible
          const baseOpacity = isCenter ? 0.8 : isMiddle ? 0.5 : 0.7;
          mat.opacity = baseOpacity + Math.sin(t * 5) * 0.2;
        }
      });
    }

    if (piece.status === 'attacking') {
      // Lunge animation
      const lunge = Math.sin(t * 15) * 0.5;
      groupRef.current.position.y = 0.01 + Math.abs(lunge * 0.5);
      // Move slightly forward based on color
      const dir = piece.color === 'white' ? 1 : -1;
      groupRef.current.position.z = posZ + lunge * 0.8 * dir;
    } else if (piece.status === 'dying') {
      // Death animation: Fall over and sink
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, Math.PI / 2.2, 0.1);
      groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, -0.5, 0.05);
    } else {
      // Idle / Normal position
      groupRef.current.position.x = posX;
      groupRef.current.position.y = 0.01;
      groupRef.current.position.z = posZ;
      groupRef.current.rotation.x = 0;
    }
  });

  const getGeometry = () => {
    switch (piece.type) {
      case 'pawn': 
        return (
          <group>
            <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.25, 16, 16]} />
              <meshStandardMaterial color={highlightColor} />
            </mesh>
            <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.2, 0.3, 0.6, 16]} />
              <meshStandardMaterial color={highlightColor} />
            </mesh>
            <mesh position={[0, 0.3, 0]}>
              <cylinderGeometry args={[0.26, 0.26, 0.05, 16]} />
              <meshStandardMaterial color={stripeColor} />
            </mesh>
          </group>
        );
      case 'rook': 
        return (
          <group>
            <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.35, 0.35, 0.6, 16]} />
              <meshStandardMaterial color={highlightColor} />
            </mesh>
            <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.3, 0.4, 0.6, 16]} />
              <meshStandardMaterial color={highlightColor} />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.41, 0.41, 0.05, 16]} />
              <meshStandardMaterial color={stripeColor} />
            </mesh>
            <mesh position={[0, 0.7, 0]}>
              <cylinderGeometry args={[0.36, 0.36, 0.05, 16]} />
              <meshStandardMaterial color={stripeColor} />
            </mesh>
          </group>
        );
      case 'knight': 
        return (
          <group rotation={[0, piece.color === 'white' ? 0 : Math.PI, 0]}>
            <KnightPieceModel color={highlightColor} stripeColor={stripeColor} scale={1.1} />
          </group>
        );
      case 'bishop': 
        return (
          <group>
            <mesh position={[0, 1.3, 0]} castShadow receiveShadow>
              <coneGeometry args={[0.2, 0.6, 16]} />
              <meshStandardMaterial color={highlightColor} />
            </mesh>
            <mesh position={[0, 0.5, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.2, 0.35, 1.0, 16]} />
              <meshStandardMaterial color={highlightColor} />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.3, 0.3, 0.05, 16]} />
              <meshStandardMaterial color={stripeColor} />
            </mesh>
          </group>
        );
      case 'queen': 
        return (
          <group>
            <mesh position={[0, 1.7, 0]} castShadow receiveShadow>
              <torusGeometry args={[0.15, 0.05, 16, 32]} />
              <meshStandardMaterial color={highlightColor} />
            </mesh>
            <mesh position={[0, 0.8, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.2, 0.4, 1.6, 16]} />
              <meshStandardMaterial color={highlightColor} />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.32, 0.32, 0.05, 16]} />
              <meshStandardMaterial color={stripeColor} />
            </mesh>
            <mesh position={[0, 1.2, 0]}>
              <cylinderGeometry args={[0.25, 0.25, 0.05, 16]} />
              <meshStandardMaterial color={stripeColor} />
            </mesh>
          </group>
        );
      case 'king': 
        return (
          <group>
            <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.1, 0.4, 0.1]} />
              <meshStandardMaterial color={highlightColor} />
            </mesh>
            <mesh position={[0, 2.0, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.4, 0.1, 0.1]} />
              <meshStandardMaterial color={highlightColor} />
            </mesh>
            <mesh position={[0, 0.9, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.25, 0.4, 1.8, 16]} />
              <meshStandardMaterial color={highlightColor} />
            </mesh>
            <mesh position={[0, 0.5, 0]}>
              <cylinderGeometry args={[0.35, 0.32, 0.05, 16]} />
              <meshStandardMaterial color={stripeColor} />
            </mesh>
            <mesh position={[0, 1.4, 0]}>
              <cylinderGeometry args={[0.28, 0.28, 0.05, 16]} />
              <meshStandardMaterial color={stripeColor} />
            </mesh>
          </group>
        );
      default: 
        return <mesh position={[0, 0.3, 0]}><boxGeometry args={[0.6, 0.6, 0.6]} /></mesh>;
    }
  };

  return (
    <group 
      ref={groupRef}
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
    >
      {getGeometry()}

      {/* Vulnerability Halo (Bullseye Energy Field) */}
      {piece.isDebuffed && (
        <group ref={ringRef} position={[0, 0.1, 0]}>
          {/* Outer Ring - Bright Red */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.55, 0.65, 32]} />
            <meshStandardMaterial 
              color="#ff0000" 
              emissive="#ff0000" 
              emissiveIntensity={2} 
              transparent 
              opacity={0.8} 
              side={THREE.DoubleSide} 
            />
          </mesh>
          {/* Middle Ring - White/Gold Glow */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
            <ringGeometry args={[0.35, 0.45, 32]} />
            <meshStandardMaterial 
              color="#ffffff" 
              emissive="#d4af37" 
              emissiveIntensity={1.5} 
              transparent 
              opacity={0.6} 
              side={THREE.DoubleSide} 
            />
          </mesh>
          {/* Inner Bullseye - Solid Red */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <circleGeometry args={[0.15, 16]} />
            <meshStandardMaterial 
              color="#ff0000" 
              emissive="#ff0000" 
              emissiveIntensity={1} 
              transparent 
              opacity={0.9} 
              side={THREE.DoubleSide} 
            />
          </mesh>
        </group>
      )}

      {/* Health Bar Billboard */}
      <Billboard position={[0, 2.5, 0]} follow={true} pointerEvents="none">
        <group>
          <mesh position={[0, 0, -0.02]} raycast={() => null}>
            <planeGeometry args={[0.64, 0.14]} />
            <meshBasicMaterial color="black" />
          </mesh>
          <mesh position={[0, 0, -0.01]} raycast={() => null}>
            <planeGeometry args={[0.6, 0.1]} />
            <meshBasicMaterial color="#333" />
          </mesh>
          <mesh position={[( (piece.hp / piece.maxHp) - 1 ) * 0.3, 0, 0]} raycast={() => null}>
            <planeGeometry args={[Math.max(0.01, 0.6 * (piece.hp / piece.maxHp)), 0.1]} />
            <meshBasicMaterial color={piece.hp / piece.maxHp > 0.5 ? "#4caf50" : piece.hp / piece.maxHp > 0.2 ? "#ffeb3b" : "#f44336"} />
          </mesh>
          <Text 
            position={[0, 0, 0.05]} 
            fontSize={0.12} 
            color="white" 
            outlineWidth={0.015} 
            outlineColor="black"
            fontWeight="bold"
            raycast={() => null}
          >
            {Math.ceil(piece.hp)} / {piece.maxHp}
          </Text>
        </group>
      </Billboard>
      
      {(piece.kills > 0 || piece.defends > 0) && (
        <Billboard position={[0, 3.0, 0]} follow={true} pointerEvents="none">
          {piece.kills > 0 && (
            <Text position={[0, 0.2, 0]} fontSize={0.25} color="#ff8a80" outlineWidth={0.02} outlineColor="black" raycast={() => null}>
              ⚔️{piece.kills}
            </Text>
          )}
          {piece.defends > 0 && (
            <Text position={[0, -0.2, 0]} fontSize={0.25} color="#82b1ff" outlineWidth={0.02} outlineColor="black" raycast={() => null}>
              🛡️{piece.defends}
            </Text>
          )}
        </Billboard>
      )}
    </group>
  );
};
