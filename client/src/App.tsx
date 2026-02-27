import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Stars, Environment } from '@react-three/drei';
import { useChessGame } from './game/useChessGame';
import { getValidMoves } from './game/ChessLogic';
import { ChessBoard } from './components/ChessBoard';
import { ChessPiece } from './components/ChessPiece';
import { GameUI } from './components/GameUI';
import { DiceRoll } from './components/DiceRoll';
import { CombatEffect } from './components/CombatEffect';
import { Scenery } from './components/Scenery';

function App() {
  const { 
    pieces, turn, selectedPieceId, battleResult, isRolling, isPaused, winner, 
    isNight, hasStarted, fogNear, fogFar,
    setHasStarted, setIsNight, setIsPaused, setFogNear, setFogFar,
    resetGame, handleSquareClick 
  } = useChessGame();

  const selectedPiece = useMemo(() => 
    pieces.find(p => p.id === selectedPieceId) || null,
  [pieces, selectedPieceId]);

  const validMoves = useMemo(() => 
    selectedPiece ? getValidMoves(selectedPiece, pieces) : [],
  [selectedPiece, pieces]);

  const sceneBackground = isNight ? '#050505' : '#e0c3a0';

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas 
        shadows 
        camera={{ position: [0, 8, -10], fov: 50 }}
      >
        <color attach="background" args={[sceneBackground]} />
        <fog attach="fog" args={[sceneBackground, fogNear, fogFar]} />
        
        {/* Lighting & Environment */}
        <ambientLight intensity={isNight ? 0.2 : 0.6} />
        <directionalLight 
          castShadow 
          position={[10, 20, 10]} 
          intensity={isNight ? 0.3 : 1.5} 
          shadow-mapSize={[1024, 1024]} 
        />
        
        {!isNight ? (
          <Sky sunPosition={[10, 20, 10]} turbidity={0.1} rayleigh={0.5} />
        ) : (
          <Sky sunPosition={[0, -1, -10]} turbidity={10} rayleigh={0.5} />
        )}
        <Stars radius={100} depth={50} count={isNight ? 5000 : 1000} factor={4} saturation={0} fade speed={1} />
        <Environment preset={isNight ? "night" : "sunset"} />

        <group>
          <Scenery isNight={isNight} />
          <ChessBoard 
            pieces={pieces} 
            selectedPieceId={selectedPieceId} 
            validMoves={validMoves} 
            onSquareClick={handleSquareClick} 
          />
          {pieces.map(piece => (
            <ChessPiece 
              key={piece.id} 
              piece={piece} 
              isSelected={piece.id === selectedPieceId} 
              onClick={() => handleSquareClick(piece.x, piece.y)}
            />
          ))}
        </group>

        <CombatEffect battleResult={battleResult} isRolling={isRolling} />

        {(isRolling || battleResult) && battleResult && (
           <DiceRoll 
             attackerRoll={battleResult.attackerRoll} 
             attackerStats={battleResult.attackerStats}
             defenderRoll={battleResult.defenderRoll} 
             defenderStats={battleResult.defenderStats}
             isRolling={isRolling} 
           />
        )}

        <OrbitControls 
          target={[0, 0, 0]} 
          maxPolarAngle={Math.PI / 2.2} 
          minDistance={5} 
          maxDistance={40} 
          enabled={!isPaused && hasStarted} 
        />
      </Canvas>

      <GameUI 
        turn={turn} 
        selectedPiece={selectedPiece} 
        battleResult={isRolling ? null : battleResult}
        pieces={pieces}
        isPaused={isPaused}
        winner={winner}
        isNight={isNight}
        hasStarted={hasStarted}
        fogNear={fogNear}
        fogFar={fogFar}
        setFogNear={setFogNear}
        setFogFar={setFogFar}
        setHasStarted={setHasStarted}
        setIsNight={setIsNight}
        setIsPaused={setIsPaused}
        resetGame={resetGame}
      />
    </div>
  );
}

export default App;
