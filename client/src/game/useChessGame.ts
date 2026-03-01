import { useState, useEffect } from 'react';
import type { Piece, BattleResult, LogEntry, Position as _Position } from '../types';
import { setupBoard, getValidMoves, rollDice, getDiceSides } from './ChessLogic';
import { calculateBestMove } from './ChessAI';

export const useChessGame = (playSound: (name: any) => void) => {
  const [pieces, setPieces] = useState<Piece[]>(setupBoard());
  const [turn, setTurn] = useState<'white' | 'black'>('white');
  const [selectedPieceId, setSelectedPieceId] = useState<string | null>(null);
  const [selectedOnagerColor, setSelectedOnagerColor] = useState<'white' | 'black' | null>(null);
  const [battleResult, setBattleResult] = useState<BattleResult | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [winner, setWinner] = useState<'white' | 'black' | null>(null);
  const [isNight, setIsNight] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isVsAI, setIsVsAI] = useState(false);
  const [turnCount, setTurnCount] = useState(1);
  const [aiMoveSequence, setAiMoveSequence] = useState<{ step: number, move: { startX: number, startY: number, targetX: number, targetY: number } } | null>(null);
  const [fogNear, setFogNear] = useState(10);
  const [fogFar, setFogFar] = useState(80);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [boardStyle, setBoardStyle] = useState<'wood' | 'stone' | 'marble'>('wood');
  const [windStrength, setWindStrength] = useState(1.0);
  const [whiteColor, setWhiteColor] = useState('#f0d9b5');
  const [blackColor, setBlackColor] = useState('#4a4a4a');
  const [showCoordinates, setShowCoordinates] = useState(false);

  const addLog = (message: string, type: LogEntry['type']) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      message,
      type,
      timestamp: Date.now()
    };
    setLogs(prev => [newLog, ...prev].slice(0, 50)); // Keep last 50 logs
  };

  const [whiteSiegeUsed, setWhiteSiegeUsed] = useState(false);
  const [blackSiegeUsed, setBlackSiegeUsed] = useState(false);
  const [isSiegeFiring, setIsSiegeFiring] = useState<'white' | 'black' | null>(null);

  const fireSiege = (color: 'white' | 'black', targetX: number, targetY: number) => {
    if (color === 'white' && whiteSiegeUsed) return;
    if (color === 'black' && blackSiegeUsed) return;
    if (turn !== color || isRolling || isPaused || winner || !hasStarted) return;

    const targetPiece = pieces.find(p => p.x === targetX && p.y === targetY);
    if (!targetPiece) return;

    setIsSiegeFiring(color);
    if (color === 'white') setWhiteSiegeUsed(true);
    else setBlackSiegeUsed(true);

    playSound('siege');
    addLog(`${color.toUpperCase()} FIRED THE ONAGER at ${targetPiece.color} ${targetPiece.type}!`, 'siege');

    setTimeout(() => {
      const dmg = Math.floor(Math.random() * 5) + 12; // 12-16
      
      // We'll show a battle result for the siege too!
      setBattleResult({
        attackerRoll: dmg,
        attackerTotal: dmg,
        attackerStats: 0,
        attackerDice: 16,
        attackerColor: color,
        defenderRoll: targetPiece.hp,
        defenderTotal: Math.max(0, targetPiece.hp - dmg),
        defenderStats: 0,
        defenderDice: 0,
        defenderDebuff: 0,
        isSiege: true,
        success: dmg >= targetPiece.hp,
        targetX,
        targetY
      });

      setPieces(prev => prev.map(p => {
        if (p.id === targetPiece.id) {
          const newHp = Math.max(0, p.hp - dmg);
          if (newHp === 0) {
            if (p.type === 'king') setWinner(color);
            return { ...p, hp: 0, status: 'dying' as const };
          }
          return { ...p, hp: newHp };
        }
        return p;
      }));

      setTimeout(() => {
        setPieces(prev => prev.filter(p => p.hp > 0 || p.status !== 'dying'));
        setIsSiegeFiring(null);
        nextTurn(color);
      }, 1000);
    }, 1500); 
  };

  const resetGame = () => {
    setPieces(setupBoard());
    setTurn('white');
    setTurnCount(1);
    setSelectedPieceId(null);
    setBattleResult(null);
    setIsRolling(false);
    setIsPaused(false);
    setWinner(null);
    setHasStarted(false); // Return to main menu
    setLogs([]);
    setWhiteSiegeUsed(false);
    setBlackSiegeUsed(false);
    setIsSiegeFiring(null);
  };

  const getPieceAt = (x: number, y: number) => pieces.find(p => p.x === x && p.y === y);

  const nextTurn = (currentTurn: 'white' | 'black') => {
    const nextPlayer = currentTurn === 'white' ? 'black' : 'white';
    setTurn(nextPlayer);
    if (nextPlayer === 'white') {
      setTurnCount(prev => prev + 1);
    }
    // Clear debuffs for the player who is about to start their turn
    setPieces(prev => prev.map(p => p.color === nextPlayer ? { ...p, isDebuffed: false } : p));
  };

  const handleOnagerClick = (color: 'white' | 'black') => {
    if (isRolling || isPaused || winner || !hasStarted || turn !== color) return;
    if (color === 'white' && whiteSiegeUsed) return;
    if (color === 'black' && blackSiegeUsed) return;

    playSound('select');
    setSelectedOnagerColor(color);
    setSelectedPieceId(null);
  };

  const handleSquareClick = (x: number, y: number, isAiCall: boolean = false) => {
    if (isRolling || isPaused || winner || !hasStarted) return; 
    
    // Block HUMAN input if it's the AI's turn
    if (isVsAI && turn === 'black' && !isAiCall) return;

    // Clear battle result on next action if it's already shown
    if (battleResult && !isRolling) setBattleResult(null);

    // Case 1: Onager is selected and we click a target
    if (selectedOnagerColor) {
      const clickedPiece = getPieceAt(x, y);
      const isInRange = selectedOnagerColor === 'white' ? (y <= 3) : (y >= 4);
      
      if (clickedPiece && clickedPiece.color !== selectedOnagerColor && isInRange) {
        fireSiege(selectedOnagerColor, x, y);
        setSelectedOnagerColor(null);
        return;
      }
      // If we clicked something else, deselect onager
      setSelectedOnagerColor(null);
    }

    const clickedPiece = getPieceAt(x, y);
    const selectedPiece = pieces.find(p => p.id === selectedPieceId);

    // If a piece is selected and a valid move is chosen
    if (selectedPiece) {
      const validMoves = getValidMoves(selectedPiece, pieces);
      const isValidMove = validMoves.some(m => m.x === x && m.y === y);

      if (isValidMove) {
        if (clickedPiece && clickedPiece.color !== selectedPiece.color) {
          // RPG Battle Phase!
          playSound('attack');
          const attackerRoll = rollDice(selectedPiece.type);
          const defenderRoll = rollDice(clickedPiece.type);
          const attackerTotal = Math.max(0, attackerRoll + Math.min(selectedPiece.kills, 5));
          
          // Apply -2 defense penalty if defender is debuffed
          const defPenalty = clickedPiece.isDebuffed ? 2 : 0;
          const defenderTotal = Math.max(0, defenderRoll + Math.min(clickedPiece.defends, 5) - defPenalty);
          
          const success = attackerTotal > defenderTotal;
          const damage = Math.abs(attackerTotal - defenderTotal);
          
          setIsRolling(true);
          setBattleResult({ 
            attackerRoll, attackerTotal, attackerStats: Math.min(selectedPiece.kills, 5),
            attackerDice: getDiceSides(selectedPiece.type),
            attackerColor: selectedPiece.color,
            defenderRoll, defenderTotal, defenderStats: Math.min(clickedPiece.defends, 5),
            defenderDice: getDiceSides(clickedPiece.type),
            defenderDebuff: defPenalty,
            isSiege: false,
            success,
            targetX: x, targetY: y
          });

          setTimeout(() => {
            setIsRolling(false);
            if (success) {
              playSound('victory');
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
              playSound('defeat');
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
            nextTurn(turn);
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
          playSound('move');

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
                return { ...p, x, y, type, hp, maxHp, hasMoved: true, isDebuffed: true };
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
                  return { ...p, x: newRookX, hasMoved: true, isDebuffed: true };
                }
                return p;
              });
            }

            return nextPieces;
          });
          nextTurn(turn);
          setSelectedPieceId(null);
          return;
        }
      }
    }

    // Select piece if it belongs to current player
    if (clickedPiece && clickedPiece.color === turn) {
      playSound('select');
      setSelectedPieceId(clickedPiece.id);
    } else {
      setSelectedPieceId(null);
    }
  };

  // --- AI Logic ---
  useEffect(() => {
    if (isVsAI && turn === 'black' && !isRolling && !isPaused && !winner && hasStarted && !aiMoveSequence && !battleResult && !isSiegeFiring) {
      // Small delay to simulate "thinking" and let the UI settle
      const thinkTimer = setTimeout(() => {
        const move = calculateBestMove(pieces, 'black', blackSiegeUsed);
        if (move) {
          if (move.isSiege) {
            setAiMoveSequence({ step: 1, move: { startX: -1, startY: -1, targetX: move.target.x, targetY: move.target.y } });
          } else {
            setAiMoveSequence({ step: 1, move: { startX: move.piece.x, startY: move.piece.y, targetX: move.target.x, targetY: move.target.y } });
          }
        }
      }, 800);
      return () => clearTimeout(thinkTimer);
    }
  }, [pieces, turn, isVsAI, isRolling, isPaused, winner, hasStarted, aiMoveSequence, battleResult, blackSiegeUsed]);

  useEffect(() => {
    if (aiMoveSequence && !isPaused && !winner) {
      const isSiege = aiMoveSequence.move.startX === -1;

      if (aiMoveSequence.step === 1) {
        const timer = setTimeout(() => {
          if (isSiege) {
            handleOnagerClick('black');
          } else {
            handleSquareClick(aiMoveSequence.move.startX, aiMoveSequence.move.startY, true);
          }
          setAiMoveSequence(prev => prev ? { ...prev, step: 2 } : null);
        }, 300);
        return () => clearTimeout(timer);
      } else if (aiMoveSequence.step === 2) {
        const timer = setTimeout(() => {
          handleSquareClick(aiMoveSequence.move.targetX, aiMoveSequence.move.targetY, true);
          setAiMoveSequence(null);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [aiMoveSequence, isPaused, winner, handleSquareClick, handleOnagerClick]);
  // --------------

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
    showCoordinates,
    setBoardStyle,
    setWindStrength,
    setWhiteColor,
    setBlackColor,
    setShowCoordinates,
    setFogNear,
    setFogFar,
    setHasStarted,
    setIsNight,
    setIsPaused,
    resetGame,
    handleSquareClick,
    handleOnagerClick,
    setBattleResult,
    isVsAI,
    setIsVsAI,
    turnCount,
    whiteSiegeUsed,
    blackSiegeUsed,
    isSiegeFiring,
    fireSiege,
    selectedOnagerColor
  };
};
