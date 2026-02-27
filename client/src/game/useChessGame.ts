import { useState } from 'react';
import type { Piece, BattleResult } from '../types';
import { setupBoard, getValidMoves, rollDice } from './ChessLogic';

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
  const [fogNear, setFogNear] = useState(10);
  const [fogFar, setFogFar] = useState(80);

  const resetGame = () => {
    setPieces(setupBoard());
    setTurn('white');
    setSelectedPieceId(null);
    setBattleResult(null);
    setIsRolling(false);
    setIsPaused(false);
    setWinner(null);
    setHasStarted(true); // Don't show start screen again on reset
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
          const attackerRoll = rollDice();
          const defenderRoll = rollDice();
          const attackerTotal = attackerRoll + selectedPiece.kills;
          const defenderTotal = defenderRoll + clickedPiece.defends;
          
          const success = attackerTotal > defenderTotal;
          const damage = Math.abs(attackerTotal - defenderTotal);
          
          setIsRolling(true);
          setBattleResult({ 
            attackerRoll, attackerTotal, attackerStats: selectedPiece.kills,
            defenderRoll, defenderTotal, defenderStats: clickedPiece.defends,
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
                if (clickedPiece.type === 'king') setWinner(selectedPiece.color);
                setPieces(prev => prev.map(p => {
                  if (p.id === selectedPiece.id) return { ...p, x, y, kills: p.kills + 1 };
                  return p;
                }).filter(p => p.id !== clickedPiece.id));
              } else {
                setPieces(prev => prev.map(p => {
                  if (p.id === clickedPiece.id) return { ...p, hp: newHp };
                  return p;
                }));
              }
            } else {
              // Defender wins (or draw)
              const newHp = selectedPiece.hp - (damage === 0 ? 1 : damage); // Draw deals 1 damage to attacker
              const attackerKilled = newHp <= 0;
              
              if (attackerKilled) {
                if (selectedPiece.type === 'king') setWinner(clickedPiece.color);
                setPieces(prev => prev.map(p => {
                  if (p.id === clickedPiece.id) return { ...p, defends: p.defends + 1 };
                  return p;
                }).filter(p => p.id !== selectedPiece.id));
              } else {
                setPieces(prev => prev.map(p => {
                  if (p.id === selectedPiece.id) return { ...p, hp: newHp };
                  if (p.id === clickedPiece.id) return { ...p, defends: p.defends + 1 }; // Integer bonus for survival
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
          setPieces(prev => prev.map(p => {
            if (p.id === selectedPiece.id) return { ...p, x, y };
            return p;
          }));
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
    setFogNear,
    setFogFar,
    setHasStarted,
    setIsNight,
    setIsPaused,
    resetGame,
    handleSquareClick
  };
};
