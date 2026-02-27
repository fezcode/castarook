import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, Sky, Stars } from '@react-three/drei';
import { useChessGame } from './game/useChessGame';
import { getValidMoves } from './game/ChessLogic';
import { ChessBoard } from './components/ChessBoard';
import { ChessPiece } from './components/ChessPiece';
import { GameUI } from './components/GameUI';
import { DiceRoll } from './components/DiceRoll';
import { CombatEffect } from './components/CombatEffect';
import { Scenery } from './components/Scenery';

function App() {
  const { pieces, turn, selectedPieceId, battleResult, isRolling, isPaused, winner, isNight, hasStarted, setHasStarted, setIsNight, setIsPaused, resetGame, handleSquareClick } = useChessGame();

  const selectedPiece = useMemo(() => 
    pieces.find(p => p.id === selectedPieceId) || null,
  [pieces, selectedPieceId]);

  const validMoves = useMemo(() => 
    selectedPiece ? getValidMoves(selectedPiece, pieces) : [],
  [selectedPiece, pieces]);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <Canvas shadows camera={{ position: [0, 8, -10], fov: 50 }}>
        {/* Lighting & Environment */}
        <ambientLight intensity={isNight ? 0.1 : 0.5} />
        <directionalLight 
          castShadow 
          position={[5, 15, -5]} 
          intensity={isNight ? 0.2 : 1.2} 
          shadow-mapSize={[2048, 2048]} 
        />
        
        {/* Skybox for day/night */}
        {!isNight ? (
          <Sky sunPosition={[0, 1, -10]} turbidity={0.3} rayleigh={2} mieCoefficient={0.005} mieDirectionalG={0.8} />
        ) : (
          <Sky sunPosition={[0, -1, -10]} turbidity={10} rayleigh={0.5} mieCoefficient={0.1} mieDirectionalG={0.8} />
        )}
        <Stars radius={100} depth={50} count={isNight ? 10000 : 1000} factor={4} saturation={0} fade speed={1} />
        <Environment preset={isNight ? "night" : "sunset"} />

        {/* Game Scene */}
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

        {/* Immersive 3D Combat Visuals at Target Location */}
        <CombatEffect battleResult={battleResult} isRolling={isRolling} />

        {/* 3D Dice Rolling Animation */}
        {(isRolling || battleResult) && battleResult && (
           <DiceRoll 
             attackerRoll={battleResult.attackerRoll} 
             attackerStats={battleResult.attackerStats}
             defenderRoll={battleResult.defenderRoll} 
             defenderStats={battleResult.defenderStats}
             isRolling={isRolling} 
           />
        )}

        {/* Camera Controls */}
        <OrbitControls 
          target={[0, 0, 0]} 
          maxPolarAngle={Math.PI / 2.2} 
          minDistance={5} 
          maxDistance={35} 
          enabled={!isPaused && hasStarted} // Disable camera rotation when paused or not started
        />
      </Canvas>

      {/* 2D UI Overlay */}
      <GameUI 
        turn={turn} 
        selectedPiece={selectedPiece} 
        battleResult={isRolling ? null : battleResult}
        pieces={pieces}
        isPaused={isPaused}
        winner={winner}
        isNight={isNight}
        hasStarted={hasStarted}
        setHasStarted={setHasStarted}
        setIsNight={setIsNight}
        setIsPaused={setIsPaused}
        resetGame={resetGame}
      />
    </div>
  );
}

export default App;
