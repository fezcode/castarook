import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';

interface Props {
  attackerRoll: number;
  attackerStats: number;
  attackerDice: number;
  defenderRoll: number;
  defenderStats: number;
  defenderDice: number;
  defenderDebuff: number;
  isRolling: boolean;
}

export const DiceRoll: React.FC<Props> = ({ 
  attackerRoll, attackerStats, attackerDice,
  defenderRoll, defenderStats, defenderDice, defenderDebuff,
  isRolling 
}) => {
  const attackerGroupRef = useRef<THREE.Group>(null);
  const defenderGroupRef = useRef<THREE.Group>(null);
  
  const [displayAttacker, setDisplayAttacker] = useState('?');
  const [displayDefender, setDisplayDefender] = useState('?');

  useEffect(() => {
    if (isRolling) {
      setDisplayAttacker('?');
      setDisplayDefender('?');
      const timeout = setTimeout(() => {
        setDisplayAttacker(attackerRoll.toString());
        setDisplayDefender(defenderRoll.toString());
      }, 1500);
      return () => clearTimeout(timeout);
    } else {
      setDisplayAttacker(attackerRoll.toString());
      setDisplayDefender(defenderRoll.toString());
    }
  }, [isRolling, attackerRoll, defenderRoll]);

  useFrame((_, delta) => {
    // Animate the dice meshes spinning
    if (isRolling) {
      if (attackerGroupRef.current) {
        attackerGroupRef.current.rotation.x += delta * 15;
        attackerGroupRef.current.rotation.y += delta * 20;
      }
      if (defenderGroupRef.current) {
        defenderGroupRef.current.rotation.x -= delta * 18;
        defenderGroupRef.current.rotation.y -= delta * 22;
      }
    } else {
      // Return dice to neutral rotation
      if (attackerGroupRef.current) {
        attackerGroupRef.current.rotation.x = THREE.MathUtils.lerp(attackerGroupRef.current.rotation.x, 0, delta * 10);
        attackerGroupRef.current.rotation.y = THREE.MathUtils.lerp(attackerGroupRef.current.rotation.y, 0, delta * 10);
      }
      if (defenderGroupRef.current) {
        defenderGroupRef.current.rotation.x = THREE.MathUtils.lerp(defenderGroupRef.current.rotation.x, 0, delta * 10);
        defenderGroupRef.current.rotation.y = THREE.MathUtils.lerp(defenderGroupRef.current.rotation.y, 0, delta * 10);
      }
    }
  });

  return (
    <group position={[0, 5, 0]}>
      {/* Attacker */}
      <group position={[-2, 0, 0]}>
        {/* The Spinning Mesh */}
        <group ref={attackerGroupRef}>
          <mesh castShadow>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#d32f2f" roughness={0.3} metalness={0.1} flatShading />
          </mesh>
        </group>
        {/* The Billboard Text */}
        <Billboard follow={true}>
          <Text position={[0, 1.2, 0]} fontSize={0.4} color="white" outlineWidth={0.05} outlineColor="black">
            D{attackerDice}
          </Text>
          <Text position={[0, 0, 1.1]} fontSize={0.6} color="white" anchorX="center" anchorY="middle">
            {displayAttacker}
          </Text>
          <Text position={[0, -1.8, 1.1]} fontSize={0.5} color="#ff8a80" outlineWidth={0.05} outlineColor="black">
            Attacker
          </Text>
          <Text position={[0, -2.5, 1.1]} fontSize={0.6} color="#ffeb3b" outlineWidth={0.08} outlineColor="black" fontWeight="bold">
            +{attackerStats} Kills
          </Text>
        </Billboard>
      </group>
      
      {/* VS Text */}
      <Billboard follow={true}>
        <Text position={[0, 0, 0]} fontSize={0.8} color="white" outlineWidth={0.05} outlineColor="black">
          VS
        </Text>
      </Billboard>

      {/* Defender */}
      <group position={[2, 0, 0]}>
        {/* The Spinning Mesh */}
        <group ref={defenderGroupRef}>
          <mesh castShadow>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#1976d2" roughness={0.3} metalness={0.1} flatShading />
          </mesh>
        </group>
        {/* The Billboard Text */}
        <Billboard follow={true}>
          <Text position={[0, 1.2, 0]} fontSize={0.4} color="white" outlineWidth={0.05} outlineColor="black">
            D{defenderDice}
          </Text>
          <Text position={[0, 0, 1.1]} fontSize={0.6} color="white" anchorX="center" anchorY="middle">
            {displayDefender}
          </Text>
          <Text position={[0, -1.8, 1.1]} fontSize={0.5} color="#82b1ff" outlineWidth={0.05} outlineColor="black">
            Defender
          </Text>
          <Text position={[0, -2.5, 1.1]} fontSize={0.6} color="#ffeb3b" outlineWidth={0.08} outlineColor="black" fontWeight="bold">
            +{defenderStats} Defends
          </Text>
          {defenderDebuff > 0 && (
            <Text position={[0, -3.2, 1.1]} fontSize={0.4} color="#ff5252" outlineWidth={0.05} outlineColor="black" fontWeight="bold">
              - {defenderDebuff} VULNERABLE
            </Text>
          )}
        </Billboard>
      </group>
    </group>
  );
};
