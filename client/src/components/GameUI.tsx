import React from 'react';
import type { Piece, BattleResult, LogEntry } from '../types';
import packageJson from '../../package.json';

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
  showCoordinates: boolean;
  setBoardStyle: (style: 'wood' | 'stone' | 'marble') => void;
  setWindStrength: (val: number) => void;
  setWhiteColor: (color: string) => void;
  setBlackColor: (color: string) => void;
  setShowCoordinates: (show: boolean) => void;
  setFogNear: (val: number) => void;
  setFogFar: (val: number) => void;
  setHasStarted: (started: boolean) => void;
  setIsNight: (night: boolean) => void;
  setIsPaused: (paused: boolean) => void;
  resetGame: () => void;
  setBattleResult: (result: BattleResult | null) => void;
  isVsAI: boolean;
  setIsVsAI: (vsAI: boolean) => void;
  playerColor: 'white' | 'black';
  setPlayerColor: (color: 'white' | 'black') => void;
  turnCount: number;
  whiteSiegeUsed: boolean;
  blackSiegeUsed: boolean;
  fireSiege: (color: 'white' | 'black', targetX: number, targetY: number) => void;
  volume: number;
  setVolume: (v: number) => void;
  isMuted: boolean;
  setIsMuted: (m: boolean) => void;
  startMusic: () => void;
  playSound: (name: any) => void;
  }

  export const GameUI: React.FC<Props> = ({ 
  turn, selectedPiece, battleResult, pieces, isPaused, winner, isNight, hasStarted, 
  fogNear, fogFar, logs, 
  boardStyle, windStrength, whiteColor, blackColor, showCoordinates,
  setBoardStyle, setWindStrength, setWhiteColor, setBlackColor, setShowCoordinates,
  setFogNear, setFogFar,
  setHasStarted, setIsNight, setIsPaused, resetGame, setBattleResult,
  isVsAI, setIsVsAI, playerColor, setPlayerColor, turnCount, whiteSiegeUsed, blackSiegeUsed,
  volume, setVolume, isMuted, setIsMuted, startMusic, playSound
  }) => {
  const [isTutorialOpen, setIsTutorialOpen] = React.useState(false);
  const [isCreditsOpen, setIsCreditsOpen] = React.useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = React.useState(false);
  const [showAiColorSelect, setShowAiColorSelect] = React.useState(false);
  const [changelogData, setChangelogData] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}changelog.json`)
      .then(res => res.json())
      .then(data => setChangelogData(data))
      .catch(err => console.error("Failed to load changelog:", err));
  }, []);

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
            <img src={`${import.meta.env.BASE_URL}favicon.svg`} alt="Crown Logo" style={{ width: '80px', height: '80px', marginBottom: '10px', filter: 'drop-shadow(0px 4px 6px rgba(0,0,0,0.5))' }} />
            <div style={{ width: '100px', height: '2px', background: '#d4af37', margin: '0 auto 20px auto', boxShadow: '0 0 10px #d4af37' }}></div>
            <h2 style={{ color: '#d4af37', fontSize: '24px', margin: 0, textTransform: 'uppercase', letterSpacing: '6px', opacity: 0.8 }}>A Strategic Saga</h2>
            <h1 style={{ color: '#fff', fontSize: '100px', margin: '5px 0 0 0', textTransform: 'uppercase', letterSpacing: '12px', fontWeight: 'bold', textShadow: '0 0 20px rgba(212, 175, 55, 0.5), 2px 2px 0px #000' }}>
              CASTA<span style={{ color: '#d4af37' }}>ROOK</span>
            </h1>
            <div style={{ color: '#d4af37', fontSize: '16px', fontWeight: 'bold', marginBottom: '30px', letterSpacing: '3px', textShadow: '1px 1px 0px #000' }}>v{packageJson.version}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', width: '320px', margin: '0 auto' }}>
              <button onClick={() => { setIsVsAI(false); setHasStarted(true); startMusic(); }} style={{ ...menuButtonStyle, background: 'linear-gradient(to bottom, #d4af37, #aa8a2e)', color: '#000', border: '2px solid #fff', fontSize: '20px', fontWeight: 'bold', padding: '15px' }}>Player vs Player</button>
              
              <div>
                {!showAiColorSelect ? (
                  <>
                    <button onClick={() => setShowAiColorSelect(true)} style={{ ...menuButtonStyle, background: 'linear-gradient(to bottom, #546e7a, #37474f)', color: '#fff', border: '2px solid #b0bec5', fontSize: '20px', fontWeight: 'bold', padding: '15px', marginBottom: '5px' }}>Player vs AI (Beta)</button>
                    <div style={{ color: '#ffb74d', fontSize: '12px', fontStyle: 'italic', letterSpacing: '1px', lineHeight: '1.4' }}>Warning: The AI uses a greedy algorithm and may behave unpredictably or foolishly.</div>
                  </>
                ) : (
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '5px' }}>
                    <button onClick={() => { setPlayerColor('white'); setIsVsAI(true); setHasStarted(true); startMusic(); }} style={{ ...menuButtonStyle, background: '#f0d9b5', color: '#000', flex: 1, padding: '15px', fontWeight: 'bold' }}>Play White</button>
                    <button onClick={() => { setPlayerColor('black'); setIsVsAI(true); setHasStarted(true); startMusic(); }} style={{ ...menuButtonStyle, background: '#1a1510', color: '#d4af37', flex: 1, padding: '15px', fontWeight: 'bold' }}>Play Black</button>
                  </div>
                )}
              </div>

              <button onClick={() => setIsTutorialOpen(true)} style={{ ...menuButtonStyle, background: 'rgba(0,0,0,0.6)', color: '#d4af37' }}>Learn the Rules</button>
              <button onClick={() => { setIsChangelogOpen(true); playSound('menu'); }} style={{ ...menuButtonStyle, background: 'rgba(0,0,0,0.6)', color: '#d4af37' }}>Changelog</button>
              <button onClick={() => setIsCreditsOpen(true)} style={{ ...menuButtonStyle, background: 'rgba(0,0,0,0.6)', color: '#d4af37' }}>Credits</button>
            </div>
            <div style={{ width: '200px', height: '1px', background: 'rgba(212, 175, 55, 0.3)', margin: '40px auto 20px auto' }}></div>
            <button 
              onClick={() => window.open('https://fezcode.com', '_blank')} 
              style={{ 
                background: 'none', 
                border: '1px solid #d4af37', 
                color: '#d4af37', 
                padding: '8px 16px', 
                fontSize: '12px', 
                cursor: 'pointer',
                fontFamily: 'serif',
                textTransform: 'uppercase',
                letterSpacing: '2px',
                borderRadius: '4px',
                transition: 'all 0.2s',
                pointerEvents: 'auto'
              }}
              onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(212, 175, 55, 0.1)'; }}
              onMouseOut={(e) => { e.currentTarget.style.background = 'none'; }}
            >
              Created by Fezcode
            </button>
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
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span>Black:</span>
            <span style={{ fontWeight: 'bold' }}>{blackPieces.length} Units ({blackKills} Kills)</span>
          </div>
          <div style={{ fontSize: '11px', color: '#aaa', borderTop: '1px solid rgba(212, 175, 55, 0.2)', paddingTop: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span>Onager (White):</span>
              <span style={{ color: whiteSiegeUsed ? '#f44336' : '#4caf50' }}>{whiteSiegeUsed ? 'DEPLETED' : 'READY'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Onager (Black):</span>
              <span style={{ color: blackSiegeUsed ? '#f44336' : '#4caf50' }}>{blackSiegeUsed ? 'DEPLETED' : 'READY'}</span>
            </div>
          </div>
        </div>

        {/* Top Center: Turn Indicator */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
          <div style={{
            marginTop: '8px',
            background: 'rgba(20, 15, 10, 0.8)',
            border: '1px solid #d4af37',
            color: '#d4af37',
            padding: '4px 16px',
            borderRadius: '12px',
            fontSize: '12px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.5)'
          }}>
            {isVsAI ? 'Player vs AI' : 'Player vs Player'}
          </div>
          <div style={{
            marginTop: '4px',
            color: '#aaa',
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
          }}>
            Turn {turnCount}
          </div>
        </div>
        
        {/* Top Right: Menu Button */}
        <div style={{ minWidth: '180px', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={() => { setIsPaused(true); playSound('menu'); }}
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
                <li><strong>Opportunity Attack:</strong> Any unit that has just moved becomes <strong>Vulnerable (-2 Defense)</strong> until the start of its next turn.</li>
                <li><strong>Advanced Maneuvers:</strong>
                  <ul style={{ color: '#d4af37' }}>
                    <li>Promotion: Reach the end to crown a Queen.</li>
                    <li>Castling: King and Rook may pivot if unmoved.</li>
                    <li>Siege Engine: Fire your Onager once per match to rain destruction on the nearest 4 rows (12-16 DMG).</li>
                  </ul>
                </li>
                <li><strong>Observation:</strong>
                  <ul style={{ color: '#d4af37' }}>
                    <li>Orbit: Left Click + Drag</li>
                    <li>Pan: Right Click + Drag</li>
                    <li>Zoom: Scroll Wheel</li>
                    <li>Reset View: Press 'R' or Middle Click</li>
                  </ul>
                </li>
                <li><strong>Victory Conditions:</strong> No checkmate exists in this saga. You must execute the enemy King!</li>
              </ul>
            </div>
            <button onClick={() => { setIsTutorialOpen(false); playSound('menu'); }} style={{ ...menuButtonStyle, background: 'linear-gradient(to bottom, #d4af37, #aa8a2e)', color: '#000', marginTop: '30px', fontWeight: 'bold' }}>
              Back to the Front
            </button>
          </div>
        </div>
      )}

      {/* Changelog Overlay */}
      {isChangelogOpen && (
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
          <div style={{ ...aoeBoxStyle, padding: '40px', borderRadius: '8px', maxWidth: '600px', width: '90%', textAlign: 'center', border: '4px double #d4af37', display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}>
            <h1 style={{ color: '#d4af37', marginTop: 0, fontSize: '36px', textTransform: 'uppercase' }}>War Room Updates</h1>
            
            <div style={{ 
              flex: 1, 
              overflowY: 'auto', 
              textAlign: 'left', 
              paddingRight: '20px',
              marginBottom: '20px',
              scrollbarWidth: 'thin',
              scrollbarColor: '#d4af37 rgba(0,0,0,0.2)'
            }}>
              {changelogData.map((entry, idx) => (
                <div key={idx} style={{ marginBottom: '25px' }}>
                  <h2 style={{ color: '#fff', borderBottom: '1px solid #d4af37', paddingBottom: '5px', fontSize: '20px' }}>
                    v{entry.version} - {entry.title}
                    <span style={{ float: 'right', fontSize: '12px', color: '#aaa', marginTop: '8px' }}>{entry.date}</span>
                  </h2>
                  <ul style={{ color: '#f0d9b5', lineHeight: '1.6', fontSize: '16px' }}>
                    {entry.changes.map((change: string, cIdx: number) => (
                      <li key={cIdx}>{change}</li>
                    ))}
                  </ul>
                </div>
              ))}
              {changelogData.length === 0 && (
                <div style={{ textAlign: 'center', color: '#aaa', marginTop: '50px' }}>Loading chronicles...</div>
              )}
            </div>

            <button onClick={() => { setIsChangelogOpen(false); playSound('menu'); }} style={{ ...menuButtonStyle, background: 'linear-gradient(to bottom, #d4af37, #aa8a2e)', color: '#000', fontWeight: 'bold' }}>
              Back to Command
            </button>
          </div>
        </div>
      )}

      {/* Credits Overlay */}
      {isCreditsOpen && (
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
          <div style={{ ...aoeBoxStyle, padding: '40px', borderRadius: '8px', minWidth: '400px', textAlign: 'center', border: '4px double #d4af37' }}>
            <h1 style={{ color: '#d4af37', marginTop: 0, fontSize: '36px', textTransform: 'uppercase' }}>Architects of the Saga</h1>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', margin: '30px 0' }}>
              <div 
                onClick={() => window.open('https://fezcode.com', '_blank')}
                style={{ fontSize: '24px', cursor: 'pointer', color: '#f0d9b5', transition: 'color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#d4af37'}
                onMouseOut={(e) => e.currentTarget.style.color = '#f0d9b5'}
              >
                Samil Bulbul (@fezcode)
              </div>
              <div 
                onClick={() => window.open('https://github.com/TheLastRoadRunner', '_blank')}
                style={{ fontSize: '24px', cursor: 'pointer', color: '#f0d9b5', transition: 'color 0.2s' }}
                onMouseOver={(e) => e.currentTarget.style.color = '#d4af37'}
                onMouseOut={(e) => e.currentTarget.style.color = '#f0d9b5'}
              >
                Sabri Bulbul (@thelastroadrunner)
              </div>
            </div>
            <button onClick={() => { setIsCreditsOpen(false); playSound('menu'); }} style={{ ...menuButtonStyle, background: 'linear-gradient(to bottom, #d4af37, #aa8a2e)', color: '#000', marginTop: '10px', fontWeight: 'bold' }}>
              Return to Menu
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
            <button onClick={() => { resetGame(); playSound('menu'); }} style={{ ...menuButtonStyle, background: '#2a1a0a', color: '#d4af37', padding: '20px', fontSize: '24px', fontWeight: 'bold' }}>
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
            
            <button onClick={() => { setIsPaused(false); playSound('menu'); }} style={menuButtonStyle}>Resume Campaign</button>
            <button onClick={() => { setIsTutorialOpen(true); setIsPaused(false); playSound('menu'); }} style={menuButtonStyle}>The Art of War (Help)</button>
            <button onClick={() => { resetGame(); playSound('menu'); }} style={{ ...menuButtonStyle, color: '#ff5252' }}>Abandon Match</button>
            <button onClick={() => { setIsNight(!isNight); playSound('menu'); }} style={{ ...menuButtonStyle, background: isNight ? '#2a1a0a' : '#d4af37', color: isNight ? '#d4af37' : '#000' }}>
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
                <button onClick={() => { setShowCoordinates(!showCoordinates); playSound('menu'); }} style={{ 
                  width: '100%', padding: '8px', fontSize: '12px', background: showCoordinates ? '#d4af37' : '#222', 
                  color: showCoordinates ? '#000' : '#d4af37', border: '1px solid #d4af37', cursor: 'pointer', pointerEvents: 'auto'
                }}>
                  {showCoordinates ? '📍 Coordinates: Visible' : '📍 Coordinates: Hidden'}
                </button>
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
                <div style={{ color: '#d4af37', marginBottom: '10px', fontSize: '14px', textTransform: 'uppercase', textAlign: 'center' }}>Audio Chronicles</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <button 
                    onClick={() => setIsMuted(!isMuted)}
                    style={{ 
                      background: isMuted ? '#f44336' : '#4caf50', color: '#fff', border: '1px solid #fff', 
                      borderRadius: '4px', padding: '4px 8px', cursor: 'pointer', fontSize: '12px', pointerEvents: 'auto'
                    }}
                  >
                    {isMuted ? '🔇 Muted' : '🔊 Active'}
                  </button>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                    <input 
                      type="range" min="0" max="1" step="0.05" value={volume} 
                      onChange={(e) => setVolume(parseFloat(e.target.value))} 
                      style={{ width: '100%', pointerEvents: 'auto' }} 
                    />
                  </div>
                </div>
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
          <h1 style={{ fontSize: '48px', margin: '0 0 20px 0', color: battleResult.success ? '#4caf50' : '#f44336', textShadow: '2px 2px 0px #000', textTransform: 'uppercase' }}>
            {battleResult.success 
              ? `${battleResult.attackerColor}'s Victory` 
              : `${battleResult.attackerColor === 'white' ? 'black' : 'white'}'s Victory`}
          </h1>
          <div style={{ marginBottom: '25px', padding: '20px', background: 'rgba(0,0,0,0.5)', borderRadius: '8px', border: '1px solid #d4af37' }}>
            {battleResult.isSiege ? (
              <div style={{ fontSize: '22px', color: '#ff5722' }}>
                Siege Onslaught: <strong>{battleResult.attackerTotal} DMG</strong> dealt to defender!
              </div>
            ) : (
              <>
                <div style={{ fontSize: '22px', marginBottom: '12px', color: '#d4af37' }}>
                  Attacker (D{battleResult.attackerDice}): {battleResult.attackerRoll} + {battleResult.attackerStats} = <strong>{battleResult.attackerTotal}</strong>
                </div>
                <div style={{ fontSize: '22px', color: '#f0d9b5' }}>
                  Defender (D{battleResult.defenderDice}): {battleResult.defenderRoll} + {battleResult.defenderStats} {battleResult.defenderDebuff > 0 ? `- ${battleResult.defenderDebuff} (Vulnerable)` : ''} = <strong>{battleResult.defenderTotal}</strong>
                </div>
              </>
            )}
          </div>
          <h2 style={{ fontSize: '24px', margin: '0 0 25px 0', opacity: 0.9, fontStyle: 'italic' }}>
            {battleResult.isSiege ? 'Brute force from the shadows!' : (battleResult.success ? 'The objective is secured!' : 'The onslaught was resisted!')}
          </h2>
          <button 
            onClick={() => { setBattleResult(null); playSound('menu'); }}
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
              {selectedPiece.isDebuffed && (
                <div style={{ marginTop: '5px', color: '#ff5252', fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <span style={{ fontSize: '18px' }}>⚠️</span> VULNERABLE (-2 DEF)
                </div>
              )}
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
