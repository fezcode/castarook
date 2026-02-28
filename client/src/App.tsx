import { useMemo, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Stars, Environment } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useChessGame } from './game/useChessGame';
import { getValidMoves } from './game/ChessLogic';
import { ChessBoard } from './components/ChessBoard';
import { ChessPiece } from './components/ChessPiece';
import { GameUI } from './components/GameUI';
import { DiceRoll } from './components/DiceRoll';
import { CombatEffect } from './components/CombatEffect';
import { Scenery } from './components/Scenery';

// Component to handle camera reset logic
const CameraHandler = ({ controlsRef }: { controlsRef: React.RefObject<OrbitControlsImpl> }) => {
  const { camera } = useThree();

  const resetCamera = () => {
    if (controlsRef.current) {
      // Original camera position: [0, 8, -10]
      // Original target: [0, 0, 0]
      camera.position.set(0, 8, -10);
      controlsRef.current.target.set(0, 0, 0);
      controlsRef.current.update();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r') {
        resetCamera();
      }
    };

    const handleMouseDown = (e: MouseEvent) => {
      // Middle click check
      if (e.button === 1) {
        resetCamera();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('mousedown', handleMouseDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('mousedown', handleMouseDown);
    };
  }, [camera, controlsRef]);

  return null;
};

function App() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const { 
    pieces, turn, selectedPieceId, battleResult, isRolling, isPaused, winner, 
    isNight, hasStarted, fogNear, fogFar, logs,
    boardStyle, windStrength, whiteColor, blackColor,
    setBoardStyle, setWindStrength, setWhiteColor, setBlackColor,
    setHasStarted, setIsNight, setIsPaused, setFogNear, setFogFar,
    resetGame, handleSquareClick, setBattleResult, isVsAI, setIsVsAI 
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

        <CameraHandler controlsRef={controlsRef} />

        <group>
          <Scenery isNight={isNight} windStrength={windStrength} />
          <ChessBoard 
            pieces={pieces} 
            selectedPieceId={selectedPieceId} 
            validMoves={validMoves} 
            onSquareClick={handleSquareClick} 
            boardStyle={boardStyle}
          />
          {pieces.map(piece => (
            <ChessPiece 
              key={piece.id} 
              piece={piece} 
              isSelected={piece.id === selectedPieceId} 
              onClick={() => handleSquareClick(piece.x, piece.y)}
              customWhiteColor={whiteColor}
              customBlackColor={blackColor}
            />
          ))}
        </group>

        <CombatEffect battleResult={battleResult} isRolling={isRolling} />

        {(isRolling || battleResult) && battleResult && (
           <DiceRoll 
             attackerRoll={battleResult.attackerRoll} 
             attackerStats={battleResult.attackerStats}
             attackerDice={battleResult.attackerDice}
             defenderRoll={battleResult.defenderRoll} 
             defenderStats={battleResult.defenderStats}
             defenderDice={battleResult.defenderDice}
             defenderDebuff={battleResult.defenderDebuff}
             isRolling={isRolling} 
           />
        )}

        <OrbitControls 
          ref={controlsRef}
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
        logs={logs}
        boardStyle={boardStyle}
        windStrength={windStrength}
        whiteColor={whiteColor}
        blackColor={blackColor}
        setBoardStyle={setBoardStyle}
        setWindStrength={setWindStrength}
        setWhiteColor={setWhiteColor}
        setBlackColor={setBlackColor}
        setFogNear={setFogNear}
        setFogFar={setFogFar}
        setHasStarted={setHasStarted}
        setIsNight={setIsNight}
        setIsPaused={setIsPaused}
        resetGame={resetGame}
        setBattleResult={setBattleResult}
        isVsAI={isVsAI}
        setIsVsAI={setIsVsAI}
      />
    </div>
  );
}

export default App;
