import { useState, useEffect } from 'react';
import type { Piece, BattleResult, LogEntry, Position } from '../types';
import { setupBoard, getValidMoves, rollDice, getDiceSides } from './ChessLogic';
import { calculateBestMove } from './ChessAI';

export const useChessGame = () => {
  const [pieces, setPieces] = useState<Piece[]>(setupBoard());
  const [turn, setTurn] = useState<'white' | 'black'>('white');
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [winner, setWinner] = useState<'white' | 'black' | null>(null);
  const [isNight, setIsNight] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isVsAI, setIsVsAI] = useState(false);
  const [aiMoveSequence, setAiMoveSequence] = useState<{ step: number, move: { startX: number, startY: number, targetX: number, targetY: number } } | null>(null);
  const [fogNear, setFogNear] = useState(10);
  const [fogFar, setFogFar] = useState(80);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [boardStyle, setBoardStyle] = useState<'wood' | 'stone' | 'marble'>('wood');
  const [windStrength, setWindStrength] = useState(1.0);
  const [whiteColor, setWhiteColor] = useState('#f0d9b5');
  const [blackColor, setBlackColor] = useState('#4a4a4a');

  // --- AI Logic ---
  useEffect(() => {
    if (isVsAI && turn === 'black' && !isRolling && !isPaused && !winner && hasStarted && !aiMoveSequence) {
      // Small delay to simulate "thinking" and let the UI settle
      const thinkTimer = setTimeout(() => {
        const move = calculateBestMove(pieces, 'black');
        if (move) {
          setAiMoveSequence({ step: 1, move: { startX: move.piece.x, startY: move.piece.y, targetX: move.target.x, targetY: move.target.y } });
        }
      }, 800);
      return () => clearTimeout(thinkTimer);
    }
  }, [pieces, turn, isVsAI, isRolling, isPaused, winner, hasStarted, aiMoveSequence]);

  useEffect(() => {
    if (aiMoveSequence && !isPaused && !winner) {
      if (aiMoveSequence.step === 1) {
        const timer = setTimeout(() => {
          handleSquareClick(aiMoveSequence.move.startX, aiMoveSequence.move.startY);
          setAiMoveSequence(prev => prev ? { ...prev, step: 2 } : null);
        }, 300);
        return () => clearTimeout(timer);
      } else if (aiMoveSequence.step === 2) {
        const timer = setTimeout(() => {
          handleSquareClick(aiMoveSequence.move.targetX, aiMoveSequence.move.targetY);
          setAiMoveSequence(null);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [aiMoveSequence, isPaused, winner, handleSquareClick]);
  // --------------

  const addLog = (message: string, type: LogEntry['type']) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: Date.now()
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
  };

  const resetGame = () => {
    setPieces(setupBoard());
    setTurn('white');
    setSelectedPieceId(null);
    setBattleResult(null);
    setIsRolling(false);
    setIsPaused(false);
    setWinner(null);
    setHasStarted(true); // Don't show start screen again on reset
    setLogs([]);
    addLog('Match Restarted', 'move');
  };

  const getPieceAt = (x: number, y: number) => pieces.find(p => p.x === x && p.y === y);

  const handleSquareClick = (x: number, y: number) => {
    if (isRolling || isPaused || winner || !hasStarted) return; // Block input during dice roll, pause, game over, or if not started

    // Clear battle result on next action if it's already shown
    if (battleResult && !isRolling) setBattleResult(null);

    const clickedPiece = getPieceAt(x, y);
    const selectedPiece = pieces.find(p => p.id === selectedPieceId);

    // If a piece is selected and a valid move is chosen
    if (selectedPiece) {
      const validMoves = getValidMoves(selectedPiece, pieces);
      const isValidMove = validMoves.some(m => m.x === x && m.y === y);

      if (isValidMove) {
        if (clickedPiece && clickedPiece.color !== selectedPiece.color) {
          // RPG Battle Phase!
          const attackerRoll = rollDice(selectedPiece.type);
          const defenderRoll = rollDice(clickedPiece.type);
          const attackerTotal = attackerRoll + Math.min(selectedPiece.kills, 5);
          const defenderTotal = defenderRoll + Math.min(clickedPiece.defends, 5);
          
          const success = attackerTotal > defenderTotal;
          const damage = Math.abs(attackerTotal - defenderTotal);
          
          setIsRolling(true);
          setBattleResult({ 
            attackerRoll, attackerTotal, attackerStats: Math.min(selectedPiece.kills, 5),
            attackerDice: getDiceSides(selectedPiece.type),
            defenderRoll, defenderTotal, defenderStats: Math.min(clickedPiece.defends, 5),
            defenderDice: getDiceSides(clickedPiece.type),
            success,
            targetX: x, targetY: y
          });

          setTimeout(() => {
            setIsRolling(false);
            if (success) {
              // Attacker wins
              const newHp = clickedPiece.hp - damage;
              const defenderKilled = newHp <= 0;
              
              if (defenderKilled) {
                if (clickedPiece.type === 'king') {
                  setWinner(selectedPiece.color);
                  addLog(`${selectedPiece.color.toUpperCase()} SLAUGHTERED THE KING!`, 'kill');
                } else {
                  addLog(`${selectedPiece.color} ${selectedPiece.type} killed ${clickedPiece.color} ${clickedPiece.type}`, 'kill');
                }
                
                // EXECUTION ANIMATION START
                setPieces(prev => prev.map(p => {
                  if (p.id === selectedPiece.id) return { ...p, status: 'attacking' as const };
                  if (p.id === clickedPiece.id) return { ...p, status: 'dying' as const, hp: 0 };
                  return p;
                }));

                setTimeout(() => {
                  const isPromotion = selectedPiece.type === 'pawn' && (y === 0 || y === 7);
                  if (isPromotion) {
                    addLog(`${selectedPiece.color} Pawn promoted to Queen!`, 'promotion');
                  }

                  setPieces(prev => prev.map(p => {
                    if (p.id === selectedPiece.id) {
                      let type = p.type;
                      let maxHp = p.maxHp;
                      let hp = p.hp;
                      // Promotion
                      if (isPromotion) {
                        type = 'queen';
                        maxHp = 40;
                        hp = 40;
                      }
                      return { ...p, x, y, type, hp, maxHp, kills: Math.min(p.kills + 1, 5), hasMoved: true, status: 'idle' as const };
                    }
                    return p;
                  }).filter(p => p.id !== clickedPiece.id));
                }, 1000); // 1s for the killing animation

              } else {
                addLog(`${selectedPiece.color} ${selectedPiece.type} dealt ${damage} dmg to ${clickedPiece.color} ${clickedPiece.type}`, 'attack');
                setPieces(prev => prev.map(p => {
                  if (p.id === clickedPiece.id) return { ...p, hp: newHp };
                  if (p.id === selectedPiece.id) return { ...p, hasMoved: true };
                  return p;
                }));
              }
            } else {
              // Defender wins (or draw)
              const newHp = selectedPiece.hp - (damage === 0 ? 1 : damage); // Draw deals 1 damage to attacker
              const attackerKilled = newHp <= 0;
              
              if (attackerKilled) {
                addLog(`${clickedPiece.color} ${clickedPiece.type} counter-killed ${selectedPiece.color} ${selectedPiece.type}`, 'kill');
                if (selectedPiece.type === 'king') {
                   setWinner(clickedPiece.color);
                   addLog(`${clickedPiece.color.toUpperCase()} DEFENDED THE THRONE!`, 'kill');
                }

                // EXECUTION ANIMATION START (Counter kill)
                setPieces(prev => prev.map(p => {
                  if (p.id === clickedPiece.id) return { ...p, status: 'attacking' as const };
                  if (p.id === selectedPiece.id) return { ...p, status: 'dying' as const, hp: 0 };
                  return p;
                }));

                setTimeout(() => {
                  setPieces(prev => prev.map(p => {
                    if (p.id === clickedPiece.id) return { ...p, defends: Math.min(p.defends + 1, 5), status: 'idle' as const };
                    return p;
                  }).filter(p => p.id !== selectedPiece.id));
                }, 1000);

              } else {
                addLog(`${clickedPiece.color} ${clickedPiece.type} repelled attack (${damage === 0 ? 1 : damage} dmg to attacker)`, 'attack');
                setPieces(prev => prev.map(p => {
                  if (p.id === selectedPiece.id) return { ...p, hp: newHp, hasMoved: true };
                  if (p.id === clickedPiece.id) return { ...p, defends: Math.min(p.defends + 1, 5) }; // Integer bonus for survival
                  return p;
                }));
              }
            }
            
            // Turn always ends after an attack
            setTurn(turn === 'white' ? 'black' : 'white');
            setSelectedPieceId(null);
          }, 2000); 

          return;
        } else if (!clickedPiece) {
          // Normal empty square move
          let logMsg = `${selectedPiece.color} ${selectedPiece.type} moved to ${String.fromCharCode(97 + x)}${y + 1}`;
          let logType: LogEntry['type'] = 'move';

          if (selectedPiece.type === 'pawn' && (y === 0 || y === 7)) {
            logMsg = `${selectedPiece.color} Pawn promoted to Queen!`;
            logType = 'promotion';
          } else if (selectedPiece.type === 'king' && Math.abs(x - selectedPiece.x) === 2) {
            const isKingside = x > selectedPiece.x;
            logMsg = `${selectedPiece.color} Castled ${isKingside ? 'Kingside' : 'Queenside'}`;
            logType = 'castle';
          }

          addLog(logMsg, logType);

          setPieces(prev => {
            let nextPieces = prev.map(p => {
              if (p.id === selectedPiece.id) {
                let type = p.type;
                let maxHp = p.maxHp;
                let hp = p.hp;
                // Promotion
                if (p.type === 'pawn' && (y === 0 || y === 7)) {
                  type = 'queen';
                  maxHp = 40;
                  hp = 40;
                }
                return { ...p, x, y, type, hp, maxHp, hasMoved: true };
              }
              return p;
            });

            // Castling Move Execution (Rook follows)
            if (selectedPiece.type === 'king' && Math.abs(x - selectedPiece.x) === 2) {
              const isKingside = x > selectedPiece.x;
              const row = selectedPiece.color === 'white' ? 0 : 7;
              const rookX = isKingside ? 7 : 0;
              const newRookX = isKingside ? 5 : 3;
              nextPieces = nextPieces.map(p => {
                if (p.type === 'rook' && p.color === selectedPiece.color && p.x === rookX && p.y === row) {
                  return { ...p, x: newRookX, hasMoved: true };
                }
                return p;
              });
            }

            return nextPieces;
          });
          setTurn(turn === 'white' ? 'black' : 'white');
          setSelectedPieceId(null);
          return;
        }
      }
    }

    // Select piece if it belongs to current player
    if (clickedPiece && clickedPiece.color === turn) {
      setSelectedPieceId(clickedPiece.id);
    } else {
      setSelectedPieceId(null);
    }
  };

  return {
    pieces,
    turn,
    selectedPieceId,
    battleResult,
    isRolling,
    isPaused,
    winner,
    isNight,
    hasStarted,
    fogNear,
    fogFar,
    logs,
    boardStyle,
    windStrength,
    whiteColor,
    blackColor,
    setBoardStyle,
    setWindStrength,
    setWhiteColor,
    setBlackColor,
    setFogNear,
    setFogFar,
    setHasStarted,
    setIsNight,
    setIsPaused,
    resetGame,
    handleSquareClick,
    setBattleResult,
    isVsAI,
    setIsVsAI
  };
};
