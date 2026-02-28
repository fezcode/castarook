import React from 'react';
import type { Piece, BattleResult, LogEntry } from '../types';

interface Props {
  turn: string;
  selectedPiece: Piece | null;
  battleResult: BattleResult | null;
  pieces: Piece[];
  isPaused: boolean;
  winner: 'white' | 'black' | null;
  isNight: boolean;
  hasStarted: boolean;
  fogNear: number;
  fogFar: number;
  logs: LogEntry[];
  boardStyle: 'wood' | 'stone' | 'marble';
  windStrength: number;
  whiteColor: string;
  blackColor: string;
  setBoardStyle: (style: 'wood' | 'stone' | 'marble') => void;
  setWindStrength: (val: number) => void;
  setWhiteColor: (color: string) => void;
  setBlackColor: (color: string) => void;
  setFogNear: (val: number) => void;
  setFogFar: (val: number) => void;
  setHasStarted: (started: boolean) => void;
  setIsNight: (night: boolean) => void;
  setIsPaused: (paused: boolean) => void;
  resetGame: () => void;
  setBattleResult: (result: BattleResult | null) => void;
}

export const GameUI: React.FC<Props> = ({ 
  turn, selectedPiece, battleResult, pieces, isPaused, winner, isNight, hasStarted, 
  fogNear, fogFar, logs, 
  boardStyle, windStrength, whiteColor, blackColor,
  setBoardStyle, setWindStrength, setWhiteColor, setBlackColor,
  setFogNear, setFogFar,
  setHasStarted, setIsNight, setIsPaused, resetGame, setBattleResult 
}) => {
  const [isTutorialOpen, setIsTutorialOpen] = React.useState(false);

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'move': return '#ccc';
      case 'attack': return '#ffa726';
      case 'kill': return '#f44336';
      case 'promotion': return '#d4af37';
      case 'castle': return '#29b6f6';
      default: return '#fff';
    }
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'move': return '👣';
      case 'attack': return '⚔️';
      case 'kill': return '💀';
      case 'promotion': return '👑';
      case 'castle': return '🏰';
      default: return '•';
    }
  };

  const whitePieces = pieces.filter(p => p.color === 'white');
  const blackPieces = pieces.filter(p => p.color === 'black');
  
  const whiteKills = whitePieces.reduce((sum, p) => sum + p.kills, 0);
  const blackKills = blackPieces.reduce((sum, p) => sum + p.kills, 0);

  const menuButtonStyle = {
    display: 'block',
    width: '100%',
    padding: '12px',
    marginBottom: '12px',
    fontSize: '18px',
    cursor: 'pointer',
    background: 'linear-gradient(to bottom, #444, #222)',
    color: '#d4af37',
    border: '1px solid #d4af37',
    borderRadius: '4px',
    fontFamily: 'serif',
    textTransform: 'uppercase' as const,
    transition: 'all 0.2s'
  };

  const aoeBoxStyle = {
    background: 'rgba(20, 15, 10, 0.9)',
    border: '2px solid #d4af37',
    boxShadow: 'inset 0 0 15px rgba(212, 175, 55, 0.2), 0 4px 15px rgba(0,0,0,0.8)',
    color: '#f0d9b5',
    fontFamily: 'serif'
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
      fontFamily: 'serif'
    }}>

      {/* Start Game Overlay */}
      {!hasStarted && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'radial-gradient(circle, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.8) 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          pointerEvents: 'auto',
          zIndex: 40,
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            textAlign: 'center',
            animation: 'popIn 1s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            <div style={{ width: '100px', height: '2px', background: '#d4af37', margin: '0 auto 20px auto', boxShadow: '0 0 10px #d4af37' }}></div>
            <h2 style={{ color: '#d4af37', fontSize: '24px', margin: 0, textTransform: 'uppercase', letterSpacing: '6px', opacity: 0.8 }}>A Strategic Saga</h2>
            <h1 style={{ color: '#fff', fontSize: '100px', margin: '5px 0 30px 0', textTransform: 'uppercase', letterSpacing: '12px', fontWeight: 'bold', textShadow: '0 0 20px rgba(212, 175, 55, 0.5), 2px 2px 0px #000' }}>
              RPG<span style={{ color: '#d4af37' }}>CHESS</span>
            </h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '320px', margin: '0 auto' }}>
              <button onClick={() => setHasStarted(true)} style={{ ...menuButtonStyle, background: 'linear-gradient(to bottom, #d4af37, #aa8a2e)', color: '#000', border: '2px solid #fff', fontSize: '24px', fontWeight: 'bold', padding: '15px' }}>Start Campaign</button>
              <button onClick={() => setIsTutorialOpen(true)} style={{ ...menuButtonStyle, background: 'rgba(0,0,0,0.6)', color: '#d4af37' }}>Learn the Rules</button>
              <button style={{ ...menuButtonStyle, background: 'rgba(0,0,0,0.6)', color: '#aaa', border: '1px solid #444', cursor: 'not-allowed' }}>Multiplayer (Coming)</button>
            </div>
            <div style={{ width: '200px', height: '1px', background: 'rgba(212, 175, 55, 0.3)', margin: '40px auto 0 auto' }}></div>
            <p style={{ color: '#666', fontSize: '12px', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '2px' }}>Built for the Workhammer Suite</p>
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* Top Left: Score Board */}
        <div style={{ ...aoeBoxStyle, padding: '15px', borderRadius: '4px', minWidth: '180px' }}>
          <h3 style={{ margin: '0 0 10px 0', borderBottom: '1px solid #d4af37', paddingBottom: '5px', color: '#d4af37', textTransform: 'uppercase', letterSpacing: '1px' }}>Army Strength</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
            <span>White:</span>
            <span style={{ fontWeight: 'bold' }}>{whitePieces.length} Units ({whiteKills} Kills)</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Black:</span>
            <span style={{ fontWeight: 'bold' }}>{blackPieces.length} Units ({blackKills} Kills)</span>
          </div>
        </div>

        {/* Top Center: Turn Indicator */}
        <div style={{
          ...aoeBoxStyle,
          background: turn === 'white' ? '#f0d9b5' : '#1a1510',
          color: turn === 'white' ? '#2a1a0a' : '#d4af37',
          padding: '12px 40px',
          borderRadius: '4px',
          fontSize: '28px',
          fontWeight: 'bold',
          textTransform: 'uppercase',
          letterSpacing: '3px',
          border: '3px double #d4af37',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          {turn}'s Command
        </div>
        
        {/* Top Right: Menu Button */}
        <div style={{ minWidth: '180px', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => setIsPaused(true)}
            disabled={!!winner}
            style={{
              ...menuButtonStyle,
              width: 'auto',
              padding: '10px 25px',
              fontSize: '16px',
              margin: 0,
              opacity: winner ? 0.5 : 1,
              pointerEvents: 'auto'
            }}
          >
            📜 Strategic Menu
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
          <div style={{ ...aoeBoxStyle, padding: '40px', borderRadius: '8px', maxWidth: '650px', textAlign: 'center', border: '4px double #d4af37' }}>
            <h1 style={{ color: '#d4af37', marginTop: 0, fontSize: '36px', textTransform: 'uppercase' }}>Chronicles of Battle</h1>
            <div style={{ textAlign: 'left', lineHeight: '1.8', fontSize: '18px' }}>
              <p>Command your pieces across the valley. Unlike regular chess, combat is determined by the fate of the dice.</p>
              <ul style={{ listStyleType: 'square' }}>
                <li><strong>Skirmishes:</strong> Every unit has a unique die (Pawn: D6, Knight: D10, Bishop: D12, Rook: D15, Queen: D18, King: D20).</li>
                <li><strong>Valor & Health:</strong> Totals include battle-hardened stats (max +5). Damage is dealt based on the roll difference. Units perish only at 0 HP.</li>
                <li><strong>Advanced Maneuvers:</strong>
                  <ul style={{ color: '#d4af37' }}>
                    <li>Promotion: Reach the end to crown a Queen.</li>
                    <li>Castling: King and Rook may pivot if unmoved.</li>
                  </ul>
                </li>
                <li><strong>Victory Conditions:</strong> No checkmate exists in this saga. You must execute the enemy King!</li>
              </ul>
            </div>
            <button onClick={() => setIsTutorialOpen(false)} style={{ ...menuButtonStyle, background: 'linear-gradient(to bottom, #d4af37, #aa8a2e)', color: '#000', marginTop: '30px', fontWeight: 'bold' }}>
              Back to the Front
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
            ...aoeBoxStyle,
            background: winner === 'white' ? 'linear-gradient(135deg, #f0d9b5, #d4af37)' : 'linear-gradient(135deg, #2a1a0a, #000)',
            color: winner === 'white' ? '#2a1a0a' : '#d4af37',
            padding: '60px 100px',
            borderRadius: '8px',
            textAlign: 'center',
            border: '5px double #d4af37',
            animation: 'popInScale 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
          }}>
            <h1 style={{ fontSize: '64px', margin: '0 0 10px 0', textTransform: 'uppercase', letterSpacing: '4px' }}>
              {winner} Victory!
            </h1>
            <p style={{ fontSize: '24px', margin: '0 0 40px 0', opacity: 0.8, fontStyle: 'italic' }}>
              The saga concludes. The {winner} throne stands supreme.
            </p>
            <button onClick={resetGame} style={{ ...menuButtonStyle, background: '#2a1a0a', color: '#d4af37', padding: '20px', fontSize: '24px', fontWeight: 'bold' }}>
              Begin a New Chapter
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
          <div style={{ ...aoeBoxStyle, padding: '40px', borderRadius: '8px', textAlign: 'center', minWidth: '350px', border: '3px double #d4af37' }}>
            <h1 style={{ color: '#d4af37', marginTop: 0, marginBottom: '30px', textTransform: 'uppercase' }}>Battle Paused</h1>
            
            <button onClick={() => setIsPaused(false)} style={menuButtonStyle}>Resume Campaign</button>
            <button onClick={() => { setIsTutorialOpen(true); setIsPaused(false); }} style={menuButtonStyle}>The Art of War (Help)</button>
            <button onClick={resetGame} style={{ ...menuButtonStyle, color: '#ff5252' }}>Abandon Match</button>
            <button onClick={() => setIsNight(!isNight)} style={{ ...menuButtonStyle, background: isNight ? '#2a1a0a' : '#d4af37', color: isNight ? '#d4af37' : '#000' }}>
              Set to {isNight ? 'Sunrise' : 'Twilight'}
            </button>

            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '15px', borderRadius: '4px', marginBottom: '15px', border: '1px solid #d4af37', textAlign: 'left' }}>
              <div style={{ color: '#d4af37', marginBottom: '10px', fontSize: '14px', textTransform: 'uppercase', textAlign: 'center' }}>Customization</div>
              
              <div style={{ marginBottom: '15px' }}>
                <div style={{ color: '#f0d9b5', fontSize: '12px', marginBottom: '5px' }}>Board Style</div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  {(['wood', 'stone', 'marble'] as const).map(s => (
                    <button key={s} onClick={() => setBoardStyle(s)} style={{ 
                      flex: 1, padding: '5px', fontSize: '12px', background: boardStyle === s ? '#d4af37' : '#222', 
                      color: boardStyle === s ? '#000' : '#d4af37', border: '1px solid #d4af37', cursor: 'pointer', textTransform: 'capitalize' 
                    }}>{s}</button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ color: '#f0d9b5', fontSize: '12px', marginBottom: '5px' }}>Team Colors</div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10px', color: '#aaa' }}>White</div>
                    <input type="color" value={whiteColor} onChange={(e) => setWhiteColor(e.target.value)} style={{ width: '100%', height: '30px', border: '1px solid #d4af37', background: 'none', cursor: 'pointer', pointerEvents: 'auto' }} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '10px', color: '#aaa' }}>Black</div>
                    <input type="color" value={blackColor} onChange={(e) => setBlackColor(e.target.value)} style={{ width: '100%', height: '30px', border: '1px solid #d4af37', background: 'none', cursor: 'pointer', pointerEvents: 'auto' }} />
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '15px' }}>
                <div style={{ color: '#f0d9b5', fontSize: '12px', marginBottom: '5px' }}>Wind Power: {windStrength.toFixed(1)}x</div>
                <input type="range" min="0.1" max="3.0" step="0.1" value={windStrength} onChange={(e) => setWindStrength(parseFloat(e.target.value))} style={{ width: '100%', pointerEvents: 'auto' }} />
              </div>

              <div style={{ borderTop: '1px solid rgba(212, 175, 55, 0.3)', paddingTop: '10px', marginTop: '10px' }}>
                <div style={{ color: '#d4af37', marginBottom: '10px', fontSize: '14px', textTransform: 'uppercase', textAlign: 'center' }}>Mist Density</div>
                <div style={{ display: 'flex', alignItems: 'center', color: '#f0d9b5', fontSize: '14px' }}>
                  <span style={{ width: '80px' }}>Near: {fogNear}</span>
                  <input type="range" min="0" max="50" step="1" value={fogNear} onChange={(e) => setFogNear(parseInt(e.target.value))} style={{ flex: 1, pointerEvents: 'auto' }} />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', color: '#f0d9b5', fontSize: '14px', marginTop: '5px' }}>
                  <span style={{ width: '80px' }}>Far: {fogFar}</span>
                  <input type="range" min="10" max="200" step="1" value={fogFar} onChange={(e) => setFogFar(parseInt(e.target.value))} style={{ flex: 1, pointerEvents: 'auto' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Battle Result Pop-up */}
      {battleResult && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          ...aoeBoxStyle,
          borderWidth: '4px',
          borderColor: battleResult.success ? '#4caf50' : '#f44336',
          borderRadius: '16px',
          padding: '30px 50px',
          textAlign: 'center',
          animation: 'popInScale 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          zIndex: 5,
          minWidth: '450px',
          pointerEvents: 'auto'
        }}>
          <h1 style={{ fontSize: '48px', margin: '0 0 20px 0', color: battleResult.success ? '#4caf50' : '#f44336', textShadow: '2px 2px 0px #000' }}>
            {battleResult.success ? 'VICTORY' : 'DEFEATED'}
          </h1>
          <div style={{ marginBottom: '25px', padding: '20px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', border: '1px solid #d4af37' }}>
            <div style={{ fontSize: '22px', marginBottom: '12px', color: '#d4af37' }}>
              Attacker (D{battleResult.attackerDice}): {battleResult.attackerRoll} + {battleResult.attackerStats} = <strong>{battleResult.attackerTotal}</strong>
            </div>
            <div style={{ fontSize: '22px', color: '#f0d9b5' }}>
              Defender (D{battleResult.defenderDice}): {battleResult.defenderRoll} + {battleResult.defenderStats} = <strong>{battleResult.defenderTotal}</strong>
            </div>
          </div>
          <h2 style={{ fontSize: '24px', margin: '0 0 25px 0', opacity: 0.9, fontStyle: 'italic' }}>
            {battleResult.success ? 'The objective is secured!' : 'The onslaught was resisted!'}
          </h2>
          <button 
            onClick={() => setBattleResult(null)}
            style={{ 
              ...menuButtonStyle, 
              width: '180px', 
              margin: '0 auto', 
              background: 'rgba(212, 175, 55, 0.2)', 
              fontSize: '16px',
              padding: '10px'
            }}
          >
            Continue Saga
          </button>
        </div>
      )}

      {/* Bottom Left: Unit Information */}
      <div style={{ position: 'absolute', bottom: '20px', left: '20px' }}>
        {selectedPiece && (
          <div style={{ ...aoeBoxStyle, padding: '20px', borderRadius: '8px', border: '3px double #d4af37', minWidth: '220px' }}>
            <div style={{ color: '#d4af37', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '5px' }}>Unit Selected</div>
            <h3 style={{ margin: '0 0 15px 0', textTransform: 'capitalize', fontSize: '24px', borderBottom: '1px solid rgba(212, 175, 55, 0.3)', paddingBottom: '5px' }}>
              {selectedPiece.color} {selectedPiece.type}
            </h3>
            <div style={{ fontSize: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>🎲</span> <span>Dice: <strong>D{
                  selectedPiece.type === 'pawn' ? 6 :
                  selectedPiece.type === 'knight' ? 10 :
                  selectedPiece.type === 'bishop' ? 12 :
                  selectedPiece.type === 'rook' ? 15 :
                  selectedPiece.type === 'queen' ? 18 : 20
                }</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>⚔️</span> <span>Veteran Kills: <strong>{selectedPiece.kills}</strong> {selectedPiece.kills >= 5 && <small style={{ color: '#4caf50', fontSize: '12px' }}>(MAX)</small>}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>🛡️</span> <span>Walls Defended: <strong>{selectedPiece.defends}</strong> {selectedPiece.defends >= 5 && <small style={{ color: '#4caf50', fontSize: '12px' }}>(MAX)</small>}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Right: War Chronicles */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        width: '380px',
        height: '240px',
        ...aoeBoxStyle,
        borderRadius: '8px',
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'auto',
        overflow: 'hidden'
      }}>
        <div style={{
          background: '#2a1a0a',
          padding: '10px 20px',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#d4af37',
          textTransform: 'uppercase',
          borderBottom: '2px solid #d4af37',
          display: 'flex',
          justifyContent: 'space-between',
          letterSpacing: '1px'
        }}>
          <span>📜 War Chronicles</span>
          <span style={{ opacity: 0.6, fontSize: '12px' }}>{logs.length} Deeds</span>
        </div>
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '15px',
          fontSize: '14px',
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: '8px',
          scrollbarWidth: 'thin'
        }}>
          {logs.map(log => (
            <div key={log.id} style={{
              color: getLogColor(log.type),
              padding: '6px 10px',
              background: 'rgba(212, 175, 55, 0.05)',
              borderRadius: '2px',
              borderLeft: `4px solid ${getLogColor(log.type)}`
            }}>
              <span style={{ opacity: 0.5, marginRight: '10px', fontSize: '11px' }}>[{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span>
              <strong>{getLogIcon(log.type)}</strong> {log.message}
            </div>
          ))}
          {logs.length === 0 && <div style={{ color: '#666', textAlign: 'center', marginTop: '70px', fontStyle: 'italic' }}>The history is yet to be written...</div>}
        </div>
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
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }
        ::-webkit-scrollbar-thumb { background: #d4af37; border-radius: 3px; }
      `}</style>
    </div>
  );
};
