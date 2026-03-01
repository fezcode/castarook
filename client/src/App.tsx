import { useMemo, useEffect, useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls, Sky, Stars, Environment } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import { useChessGame } from './game/useChessGame';
import { useAudio } from './game/useAudio';
import { getValidMoves } from './game/ChessLogic';
import { ChessBoard } from './components/ChessBoard';
import { ChessPiece } from './components/ChessPiece';
import { GameUI } from './components/GameUI';
import { DiceRoll } from './components/DiceRoll';
import { CombatEffect } from './components/CombatEffect';
import { Scenery } from './components/Scenery';

// Component to handle camera reset logic
const CameraHandler = ({ controlsRef }: { controlsRef: React.RefObject<OrbitControlsImpl | null> }) => {
  const { camera } = useThree();

  const resetCamera = () => {
    if (controlsRef.current) {
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
    volume, setVolume, isMuted, setIsMuted, playSound, startMusic 
  } = useAudio();

  const { 
    pieces, turn, selectedPieceId, battleResult, isRolling, isPaused, winner, 
    isNight, hasStarted, fogNear, fogFar, logs,
    boardStyle, windStrength, whiteColor, blackColor, showCoordinates,
    setBoardStyle, setWindStrength, setWhiteColor, setBlackColor, setShowCoordinates,
    setHasStarted, setIsNight, setIsPaused, setFogNear, setFogFar,
    resetGame, handleSquareClick, handleOnagerClick, setBattleResult, isVsAI, setIsVsAI, playerColor, setPlayerColor, turnCount,
    whiteSiegeUsed, blackSiegeUsed, isSiegeFiring, fireSiege, selectedOnagerColor
  } = useChessGame(playSound);

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
          <Scenery 
            isNight={isNight} 
            windStrength={windStrength}
            whiteSiegeUsed={whiteSiegeUsed}
            blackSiegeUsed={blackSiegeUsed}
            selectedOnagerColor={selectedOnagerColor}
            whiteColor={whiteColor}
            blackColor={blackColor}
            onOnagerClick={handleOnagerClick}
          />
          <ChessBoard 
            pieces={pieces} 
            selectedPieceId={selectedPieceId} 
            validMoves={validMoves} 
            highlightSquares={selectedOnagerColor ? 
              pieces.filter(p => p.color !== selectedOnagerColor && (selectedOnagerColor === 'white' ? p.y <= 3 : p.y >= 4)).map(p => ({ x: p.x, y: p.y }))
              : []
            }
            highlightColor={selectedOnagerColor ? "#f44336" : undefined}
            onSquareClick={handleSquareClick} 
            boardStyle={boardStyle}
            showCoordinates={showCoordinates}
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

        <CombatEffect battleResult={battleResult} isRolling={isRolling} isSiegeFiring={isSiegeFiring} />

        {(isRolling || battleResult) && battleResult && (
           <DiceRoll 
             attackerRoll={battleResult.attackerRoll} 
             attackerStats={battleResult.attackerStats}
             attackerDice={battleResult.attackerDice}
             defenderRoll={battleResult.defenderRoll} 
             defenderStats={battleResult.defenderStats}
             defenderDice={battleResult.defenderDice}
             defenderDebuff={battleResult.defenderDebuff}
             isSiege={battleResult.isSiege}
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
        showCoordinates={showCoordinates}
        setBoardStyle={setBoardStyle}
        setWindStrength={setWindStrength}
        setWhiteColor={setWhiteColor}
        setBlackColor={setBlackColor}
        setShowCoordinates={setShowCoordinates}
        setFogNear={setFogNear}
        setFogFar={setFogFar}
        setHasStarted={setHasStarted}
        setIsNight={setIsNight}
        setIsPaused={setIsPaused}
        resetGame={resetGame}
        setBattleResult={setBattleResult}
        isVsAI={isVsAI}
        setIsVsAI={setIsVsAI}
        playerColor={playerColor}
        setPlayerColor={setPlayerColor}
        turnCount={turnCount}
        whiteSiegeUsed={whiteSiegeUsed}
        blackSiegeUsed={blackSiegeUsed}
        fireSiege={fireSiege}
        volume={volume}
        setVolume={setVolume}
        isMuted={isMuted}
        setIsMuted={setIsMuted}
        startMusic={startMusic}
        playSound={playSound}
      />
    </div>
  );
}

export default App;
