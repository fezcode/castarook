import React from 'react';
import { useCursor, Billboard, Text } from '@react-three/drei';
import type { Piece } from '../types';

interface Props {
  piece: Piece;
  isSelected: boolean;
  onClick: () => void;
}

export const ChessPiece: React.FC<Props> = ({ piece, isSelected, onClick }) => {
  const [hovered, setHovered] = React.useState(false);
  useCursor(hovered);

  // Map board coordinates to 3D world space (centered)
  const posX = piece.x - 3.5;
  const posZ = piece.y - 3.5;
  
  const color = piece.color === 'white' ? '#f0d9b5' : '#4a4a4a';
  const highlightColor = isSelected ? '#ffeb3b' : hovered ? '#81c784' : color;

  // Geometries are designed so their base is exactly at local y = 0
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
          </group>
        );
      case 'rook': 
        return (
          <group>
            <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.35, 0.35, 0.4, 16]} />
              <meshStandardMaterial color={highlightColor} />
            </mesh>
            <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.3, 0.4, 0.4, 16]} />
              <meshStandardMaterial color={highlightColor} />
            </mesh>
          </group>
        );
      case 'knight': 
        return (
          <group>
            <mesh position={[0, 0.7, 0.1]} rotation={[-0.4, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.3, 0.6, 0.4]} />
              <meshStandardMaterial color={highlightColor} />
            </mesh>
            <mesh position={[0, 0.3, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.25, 0.35, 0.6, 16]} />
              <meshStandardMaterial color={highlightColor} />
            </mesh>
          </group>
        );
      case 'bishop': 
        return (
          <group>
            <mesh position={[0, 1.05, 0]} castShadow receiveShadow>
              <coneGeometry args={[0.2, 0.5, 16]} />
              <meshStandardMaterial color={highlightColor} />
            </mesh>
            <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.2, 0.35, 0.8, 16]} />
              <meshStandardMaterial color={highlightColor} />
            </mesh>
          </group>
        );
      case 'queen': 
        return (
          <group>
            <mesh position={[0, 1.45, 0]} castShadow receiveShadow>
              <torusGeometry args={[0.15, 0.05, 16, 32]} />
              <meshStandardMaterial color={highlightColor} />
            </mesh>
            <mesh position={[0, 0.7, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.2, 0.4, 1.4, 16]} />
              <meshStandardMaterial color={highlightColor} />
            </mesh>
          </group>
        );
      case 'king': 
        return (
          <group>
            {/* Cross on top */}
            <mesh position={[0, 1.65, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.1, 0.3, 0.1]} />
              <meshStandardMaterial color={highlightColor} />
            </mesh>
            <mesh position={[0, 1.65, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.3, 0.1, 0.1]} />
              <meshStandardMaterial color={highlightColor} />
            </mesh>
            <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
              <cylinderGeometry args={[0.25, 0.4, 1.5, 16]} />
              <meshStandardMaterial color={highlightColor} />
            </mesh>
          </group>
        );
      default: 
        return <mesh position={[0, 0.3, 0]}><boxGeometry args={[0.6, 0.6, 0.6]} /></mesh>;
    }
  };

  // Base offset is just 0.01 so it rests exactly on the square planes (which are at 0.01)
  const getHeightOffset = () => 0.01;

  return (
    <group 
      position={[posX, getHeightOffset(), posZ]} 
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
      onPointerOut={() => setHovered(false)}
    >
      {getGeometry()}

      {/* Health Bar Billboard */}
      <Billboard position={[0, 1.8, 0]} follow={true}>
        <group>
          {/* Outer Border */}
          <mesh position={[0, 0, -0.02]}>
            <planeGeometry args={[0.64, 0.14]} />
            <meshBasicMaterial color="black" />
          </mesh>
          {/* Background (dark gray) */}
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[0.6, 0.1]} />
            <meshBasicMaterial color="#333" />
          </mesh>
          {/* Foreground (HP bar) */}
          <mesh position={[( (piece.hp / piece.maxHp) - 1 ) * 0.3, 0, 0]}>
            <planeGeometry args={[Math.max(0.01, 0.6 * (piece.hp / piece.maxHp)), 0.1]} />
            <meshBasicMaterial color={piece.hp / piece.maxHp > 0.5 ? "#4caf50" : piece.hp / piece.maxHp > 0.2 ? "#ffeb3b" : "#f44336"} />
          </mesh>
          {/* HP Text with Contour (Outline) */}
          <Text 
            position={[0, 0, 0.05]} 
            fontSize={0.12} 
            color="white" 
            outlineWidth={0.015} 
            outlineColor="black"
            fontWeight="bold"
          >
            {Math.ceil(piece.hp)} / {piece.maxHp}
          </Text>
        </group>
      </Billboard>
      
      {/* Floating stats indicator - raised to clear all piece heights */}
      {(piece.kills > 0 || piece.defends > 0) && (
        <Billboard position={[0, 2.3, 0]} follow={true}>
          {piece.kills > 0 && (
            <Text position={[0, 0.2, 0]} fontSize={0.25} color="#ff8a80" outlineWidth={0.02} outlineColor="black">
              ⚔️{piece.kills}
            </Text>
          )}
          {piece.defends > 0 && (
            <Text position={[0, -0.2, 0]} fontSize={0.25} color="#82b1ff" outlineWidth={0.02} outlineColor="black">
              🛡️{piece.defends}
            </Text>
          )}
        </Billboard>
      )}
    </group>
  );
};
