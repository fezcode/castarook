import React from 'react';
import type { Piece, BattleResult } from '../types';

interface Props {
  turn: string;
  selectedPiece: Piece | null;
  battleResult: BattleResult | null;
  pieces: Piece[];
  isPaused: boolean;
  winner: 'white' | 'black' | null;
  isNight: boolean;
  hasStarted: boolean;
  setHasStarted: (started: boolean) => void;
  setIsNight: (night: boolean) => void;
  setIsPaused: (paused: boolean) => void;
  resetGame: () => void;
}

export const GameUI: React.FC<Props> = ({ turn, selectedPiece, battleResult, pieces, isPaused, winner, isNight, hasStarted, setHasStarted, setIsNight, setIsPaused, resetGame }) => {
  const [isTutorialOpen, setIsTutorialOpen] = React.useState(false);
  const whitePieces = pieces.filter(p => p.color === 'white');
  const blackPieces = pieces.filter(p => p.color === 'black');
  
  const whiteKills = whitePieces.reduce((sum, p) => sum + p.kills, 0);
  const blackKills = blackPieces.reduce((sum, p) => sum + p.kills, 0);

  const menuButtonStyle = {
    display: 'block',
    width: '100%',
    padding: '15px',
    marginBottom: '15px',
    fontSize: '18px',
    cursor: 'pointer',
    background: '#444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    transition: 'background 0.2s'
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      padding: '20px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      fontFamily: 'sans-serif'
    }}>

      {/* Start Game Overlay */}
      {!hasStarted && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'auto',
          zIndex: 40
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #424242, #1a1a1a)',
            padding: '60px 80px',
            borderRadius: '24px',
            textAlign: 'center',
            boxShadow: '0 0 60px rgba(0,0,0,0.9)',
            border: '2px solid #ffeb3b',
            animation: 'popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            <h1 style={{ 
              color: '#ffeb3b', 
              fontSize: '72px', 
              margin: '0 0 10px 0', 
              textTransform: 'uppercase', 
              letterSpacing: '8px',
              fontStyle: 'italic'
            }}>
              RPG CHESS
            </h1>
            <p style={{ color: '#aaa', fontSize: '24px', marginBottom: '50px', letterSpacing: '2px' }}>
              Roll for Initiative!
            </p>
            
            <button 
              onClick={() => setHasStarted(true)} 
              style={{ 
                ...menuButtonStyle, 
                background: '#1976d2', 
                fontSize: '28px', 
                fontWeight: 'bold', 
                padding: '20px 60px',
                width: 'auto',
                margin: '0 auto',
                boxShadow: '0 8px 16px rgba(0,0,0,0.4)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              ENTER BATTLE
            </button>
            
            <button 
              onClick={() => { setIsTutorialOpen(true); }}
              style={{ 
                background: 'none', 
                border: 'none', 
                color: '#aaa', 
                marginTop: '30px', 
                cursor: 'pointer',
                fontSize: '18px',
                textDecoration: 'underline'
              }}
            >
              How to Play
            </button>
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* Top Left: Score Board */}
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '15px',
          borderRadius: '8px',
          minWidth: '150px'
        }}>
          <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #444', paddingBottom: '5px' }}>Scoreboard</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>White:</span>
            <span>{whitePieces.length} left (Kills: {whiteKills})</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Black:</span>
            <span>{blackPieces.length} left (Kills: {blackKills})</span>
          </div>
        </div>

        {/* Top Center: Turn Indicator */}
        <div style={{
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px 20px',
          borderRadius: '8px',
          fontSize: '24px',
          fontWeight: 'bold',
          textTransform: 'uppercase'
        }}>
          {turn}'s Turn
        </div>
        
        {/* Top Right Spacer / Menu Button */}
        <div style={{ minWidth: '150px', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => setIsPaused(true)}
            disabled={!!winner}
            style={{
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              border: '1px solid #444',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: winner ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              pointerEvents: 'auto',
              opacity: winner ? 0.5 : 1
            }}
          >
            Menu
          </button>
        </div>
      </div>

      {/* Tutorial Overlay */}
      {isTutorialOpen && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.9)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'auto',
          zIndex: 50
        }}>
          <div style={{
            background: '#222',
            color: 'white',
            padding: '40px',
            borderRadius: '16px',
            maxWidth: '600px',
            boxShadow: '0 8px 32px rgba(0,0,0,1)',
            textAlign: 'center'
          }}>
            <h1 style={{ color: '#ffeb3b', marginTop: 0 }}>Battle & Health Tutorial</h1>
            <p>Welcome to RPG Chess! Pieces now have health and don't always die in one hit.</p>
            <ul style={{ textAlign: 'left', lineHeight: '1.6' }}>
              <li><strong>Combat:</strong> When attacking, both pieces roll a D20 and add their stats.</li>
              <li><strong>Damage:</strong> The difference between the two totals is dealt as damage to the loser's health.</li>
              <li><strong>Health Points (HP):</strong>
                <ul>
                  <li>Pawn: 10 HP</li>
                  <li>Knight / Bishop: 20 HP</li>
                  <li>Rook: 30 HP</li>
                  <li>Queen: 40 HP</li>
                  <li>King: 50 HP</li>
                </ul>
              </li>
              <li><strong>Elimination:</strong> A piece is only removed when its health reaches 0.</li>
              <li><strong>Capture:</strong> The attacker only moves to the target square if they kill the defender.</li>
            </ul>
            <button onClick={() => setIsTutorialOpen(false)} style={{ ...menuButtonStyle, background: '#1976d2', marginTop: '20px' }}>
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {winner && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'auto',
          zIndex: 20
        }}>
          <div style={{
            background: winner === 'white' ? 'linear-gradient(135deg, #ffffff, #e0e0e0)' : 'linear-gradient(135deg, #424242, #1a1a1a)',
            padding: '50px 80px',
            borderRadius: '16px',
            textAlign: 'center',
            boxShadow: `0 0 40px ${winner === 'white' ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.8)'}`,
            animation: 'popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            <h1 style={{ 
              color: winner === 'white' ? '#1a1a1a' : '#ffffff', 
              fontSize: '48px',
              margin: '0 0 10px 0',
              textTransform: 'uppercase',
              letterSpacing: '2px'
            }}>
              {winner} Wins!
            </h1>
            <p style={{ 
              color: winner === 'white' ? '#444' : '#aaa', 
              fontSize: '20px', 
              margin: '0 0 40px 0' 
            }}>
              The enemy King has fallen.
            </p>
            
            <button onClick={resetGame} style={{ 
              ...menuButtonStyle, 
              background: winner === 'white' ? '#1976d2' : '#d32f2f',
              padding: '20px',
              fontSize: '24px',
              fontWeight: 'bold',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
            }}>
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Pause Menu Overlay */}
      {isPaused && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'auto',
          zIndex: 10
        }}>
          <div style={{
            background: '#222',
            padding: '40px',
            borderRadius: '12px',
            textAlign: 'center',
            minWidth: '300px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.8)'
          }}>
            <h1 style={{ color: 'white', marginTop: 0, marginBottom: '30px' }}>Game Paused</h1>
            
            <button onClick={() => setIsPaused(false)} style={menuButtonStyle}>
              Resume
            </button>

            <button onClick={() => { setIsTutorialOpen(true); setIsPaused(false); }} style={menuButtonStyle}>
              Tutorial / Help
            </button>
            
            <button onClick={resetGame} style={{ ...menuButtonStyle, background: '#d32f2f' }}>
              Restart Match
            </button>

            <button onClick={() => setIsNight(!isNight)} style={{ ...menuButtonStyle, background: isNight ? '#5c6bc0' : '#ffa726' }}>
              Switch to {isNight ? 'Day' : 'Night'} Mode
            </button>

            <button onClick={() => alert('Settings menu coming soon!')} style={menuButtonStyle}>
              Options
            </button>
          </div>
        </div>
      )}

      {/* Center: Battle Result Banner (2D Pop-up) */}
      {battleResult && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(20, 20, 20, 0.95)',
          border: `4px solid ${battleResult.success ? '#4caf50' : '#f44336'}`,
          borderRadius: '16px',
          padding: '30px 50px',
          color: 'white',
          textAlign: 'center',
          boxShadow: '0 0 50px rgba(0,0,0,0.8), 0 0 20px rgba(255,255,255,0.1)',
          animation: 'popInScale 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          zIndex: 5,
          minWidth: '400px',
          pointerEvents: 'auto'
        }}>
          <h1 style={{ 
            fontSize: '40px', 
            margin: '0 0 20px 0', 
            color: battleResult.success ? '#4caf50' : '#f44336',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>
            {battleResult.success ? 'VICTORY!' : 'DEFEATED!'}
          </h1>
          
          <div style={{ marginBottom: '25px', padding: '15px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
            <div style={{ fontSize: '20px', marginBottom: '10px', color: '#ffeb3b' }}>
              Attacker: {battleResult.attackerRoll} (Roll) + {battleResult.attackerStats} (Kills) = <strong>{battleResult.attackerTotal}</strong>
            </div>
            <div style={{ fontSize: '20px', color: '#82b1ff' }}>
              Defender: {battleResult.defenderRoll} (Roll) + {battleResult.defenderStats} (Defends) = <strong>{battleResult.defenderTotal}</strong>
            </div>
          </div>
          
          <h2 style={{ fontSize: '24px', margin: 0, opacity: 0.9 }}>
            {battleResult.success ? 'The target was eliminated!' : 'The attack was repelled!'}
          </h2>
        </div>
      )}

      {/* Bottom Bar: Selected Piece Stats */}
      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        {selectedPiece && (
          <div style={{
            background: 'rgba(255,255,255,0.9)',
            color: 'black',
            padding: '15px',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
            pointerEvents: 'auto'
          }}>
            <h3 style={{ margin: '0 0 10px 0', textTransform: 'capitalize' }}>
              {selectedPiece.color} {selectedPiece.type}
            </h3>
            <div>⚔️ Kills: {selectedPiece.kills}</div>
            <div>🛡️ Defends: {selectedPiece.defends}</div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes popIn {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes popInScale {
          0% { transform: translate(-50%, -50%) scale(0.7); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};
