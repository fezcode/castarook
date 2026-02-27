import React from 'react';
import { useCursor, Billboard, Text } from '@react-three/drei';
import type { Piece } from '../types';
import { KnightPieceModel } from './Scenery';

interface Props {
  piece: Piece;
  isSelected: boolean;
  onClick: () => void;
}

export const ChessPiece: React.FC<Props> = ({ piece, isSelected, onClick }) => {
  const [hovered, setHovered] = React.useState(false);
  useCursor(hovered);

  const posX = piece.x - 3.5;
  const posZ = piece.y - 3.5;
  
  const baseColor = piece.color === 'white' ? '#f0d9b5' : '#4a4a4a';
  const highlightColor = isSelected ? '#ffeb3b' : hovered ? '#81c784' : baseColor;
  const stripeColor = piece.secondaryColor || (piece.color === 'white' ? '#d4af37' : '#ff5252');

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
      <Billboard position={[0, 2.5, 0]} follow={true}>
        <group>
          <mesh position={[0, 0, -0.02]}>
            <planeGeometry args={[0.64, 0.14]} />
            <meshBasicMaterial color="black" />
          </mesh>
          <mesh position={[0, 0, -0.01]}>
            <planeGeometry args={[0.6, 0.1]} />
            <meshBasicMaterial color="#333" />
          </mesh>
          <mesh position={[( (piece.hp / piece.maxHp) - 1 ) * 0.3, 0, 0]}>
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
          >
            {Math.ceil(piece.hp)} / {piece.maxHp}
          </Text>
        </group>
      </Billboard>
      
      {(piece.kills > 0 || piece.defends > 0) && (
        <Billboard position={[0, 3.0, 0]} follow={true}>
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
