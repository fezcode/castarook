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
  isSiege?: boolean; // Added isSiege prop
  isMonk?: boolean;
  isHealer?: boolean;
  isRolling: boolean;
}

export const DiceRoll: React.FC<Props> = ({ 
  attackerRoll, attackerStats, attackerDice,
  defenderRoll, defenderStats, defenderDice, defenderDebuff,
  isSiege, isMonk, isHealer, isRolling 
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
      if (defenderGroupRef.current && !isSiege && !isHealer) {
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

  const getAttackerLabel = () => {
    if (isSiege) return "Onager DMG";
    if (isMonk) return "Monk Roll";
    if (isHealer) return "Healer Roll";
    return "Attacker";
  };

  const getDefenderLabel = () => {
    if (isMonk) return "Threshold";
    if (isHealer) return "Current HP";
    return "Defender";
  };

  return (
    <group position={[0, 5, 0]}>
      {/* Attacker / Support */}
      <group position={isSiege ? [0, 0, 0] : [-2, 0, 0]}>
        <group ref={attackerGroupRef}>
          <mesh castShadow>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={(isMonk || isHealer) ? "#4caf50" : "#d32f2f"} roughness={0.3} metalness={0.1} flatShading />
          </mesh>
        </group>
        <Billboard follow={true}>
          {attackerDice > 0 && !isSiege && (
            <Text position={[0, 1.2, 0]} fontSize={0.4} color="white" outlineWidth={0.05} outlineColor="black">
              D{attackerDice}
            </Text>
          )}
          <Billboard follow={true}>
            <Text position={[0, 0, 1.1]} fontSize={0.6} color="white" anchorX="center" anchorY="middle">
              {displayAttacker}
            </Text>
          </Billboard>
          <Text position={[0, -1.8, 1.1]} fontSize={0.5} color={isMonk ? "#d4af37" : isHealer ? "#4caf50" : "#ff8a80"} outlineWidth={0.05} outlineColor="black">
            {getAttackerLabel()}
          </Text>
          {!isSiege && !isMonk && !isHealer && (
            <Text position={[0, -2.5, 1.1]} fontSize={0.6} color="#ffeb3b" outlineWidth={0.08} outlineColor="black" fontWeight="bold">
              +{attackerStats} Kills
            </Text>
          )}
        </Billboard>
      </group>
      
      {/* VS Text - Hide if Siege */}
      {!isSiege && (
        <Billboard follow={true}>
          <Text position={[0, 0, 0]} fontSize={0.8} color="white" outlineWidth={0.05} outlineColor="black">
            {isHealer ? "➜" : "VS"}
          </Text>
        </Billboard>
      )}

      {/* Defender - Hide if Siege, Monk, or Healer */}
      {!isSiege && !isMonk && !isHealer && (
        <group position={[2, 0, 0]}>
          <group ref={defenderGroupRef}>
            <mesh castShadow>
              <icosahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color={isHealer ? "#81c784" : "#1976d2"} roughness={0.3} metalness={0.1} flatShading />
            </mesh>
          </group>
          <Billboard follow={true}>
            {defenderDice > 0 && (
              <Text position={[0, 1.2, 0]} fontSize={0.4} color="white" outlineWidth={0.05} outlineColor="black">
                D{defenderDice}
              </Text>
            )}
            <Billboard follow={true}>
              <Text position={[0, 0, 1.1]} fontSize={0.6} color="white" anchorX="center" anchorY="middle">
                {displayDefender}
              </Text>
            </Billboard>
            <Text position={[0, -1.8, 1.1]} fontSize={0.5} color={isHealer ? "#81c784" : "#82b1ff"} outlineWidth={0.05} outlineColor="black">
              {getDefenderLabel()}
            </Text>
            {!isMonk && !isHealer && (
              <Text position={[0, -2.5, 1.1]} fontSize={0.6} color="#ffeb3b" outlineWidth={0.08} outlineColor="black" fontWeight="bold">
                +{defenderStats} Defends
              </Text>
            )}
            {defenderDebuff > 0 && !isMonk && !isHealer && (
              <Text position={[0, -3.2, 1.1]} fontSize={0.4} color="#ff5252" outlineWidth={0.05} outlineColor="black" fontWeight="bold">
                - {defenderDebuff} VULNERABLE
              </Text>
            )}
          </Billboard>
        </group>
      )}

      {/* Special Display for Monk/Healer Targets (Text only, no die) */}
      {(isMonk || isHealer) && (
        <group position={[2, 0, 0]}>
          <Billboard follow={true}>
            <Text position={[0, 0, 1.1]} fontSize={1.2} color="white" anchorX="center" anchorY="middle">
              {isMonk ? `${defenderRoll}+` : displayDefender}
            </Text>
            <Text position={[0, -1.8, 1.1]} fontSize={0.5} color={isHealer ? "#81c784" : "#d4af37"} outlineWidth={0.05} outlineColor="black">
              {getDefenderLabel()}
            </Text>
          </Billboard>
        </group>
      )}
    </group>
  );
};
