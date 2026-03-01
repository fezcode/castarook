import type { Piece, PieceType, PlayerColor, Position } from '../types';
import { getValidMoves, getDiceSides } from './ChessLogic';

const getPieceValue = (type: PieceType): number => {
  switch (type) {
    case 'pawn': return 10;
    case 'knight': return 30;
    case 'bishop': return 30;
    case 'rook': return 50;
    case 'queen': return 90;
    case 'king': return 1000; // High value to prioritize killing/saving king
    default: return 0;
  }
};

const evaluatePiece = (piece: Piece): number => {
  const baseValue = getPieceValue(piece.type);
  const hpPercent = piece.hp / piece.maxHp;
  const statsBonus = (piece.kills * 2) + (piece.defends * 2);
  return (baseValue * hpPercent) + statsBonus;
};

export const calculateBestMove = (
  pieces: Piece[], 
  color: PlayerColor, 
  siegeUsed: boolean
): { piece: Piece, target: Position, score: number, isSiege?: boolean } | null => {
  const myPieces = pieces.filter(p => p.color === color && p.hp > 0);
  const enemyPieces = pieces.filter(p => p.color !== color && p.hp > 0);
  const myKing = myPieces.find(p => p.type === 'king');

  // --- Defensive Analysis ---
  // Identify all squares currently threatened by the enemy
  const threatenedSquares: Set<string> = new Set();
  enemyPieces.forEach(ep => {
    const moves = getValidMoves(ep, pieces);
    moves.forEach(m => threatenedSquares.add(`${m.x},${m.y}`));
  });

  const isKingThreatened = myKing && threatenedSquares.has(`${myKing.x},${myKing.y}`);

  let bestMove: { piece: Piece, target: Position, score: number, isSiege?: boolean } | null = null;
  let bestScore = -Infinity;

  // --- Consider Siege Attack ---
  if (!siegeUsed) {
    const rangeY = color === 'black' ? [4, 5, 6, 7] : [0, 1, 2, 3];
    const targets = enemyPieces.filter(p => rangeY.includes(p.y));
    
    for (const target of targets) {
      const avgDmg = 14;
      let score = 0;
      
      if (target.hp <= avgDmg) {
        score = evaluatePiece(target) * 3;
        if (target.type === 'king') score += 10000;
      } else {
        score = avgDmg * 2;
      }

      // If our King is in danger, prioritizing Siege on the biggest threat might help
      if (isKingThreatened) score += 1000; 

      if (score > bestScore) {
        bestScore = score;
        bestMove = { 
          piece: { id: 'onager' } as Piece, 
          target: { x: target.x, y: target.y }, 
          score, 
          isSiege: true 
        };
      }
    }
  }

  // --- Consider Normal Moves ---
  const shuffledPieces = [...myPieces].sort(() => Math.random() - 0.5);

  for (const piece of shuffledPieces) {
    const validMoves = getValidMoves(piece, pieces);
    
    for (const move of validMoves) {
      let score = 0;
      const targetPiece = pieces.find(p => p.x === move.x && p.y === move.y);
      
      // 1. Combat Evaluation
      if (targetPiece && targetPiece.color !== color) {
        const attackerVal = evaluatePiece(piece);
        const defenderVal = evaluatePiece(targetPiece);
        const attackerDice = getDiceSides(piece.type);
        const defenderDice = getDiceSides(targetPiece.type);
        
        const expectedAttackerTotal = (attackerDice / 2) + piece.kills;
        const expectedDefenderTotal = (defenderDice / 2) + targetPiece.defends - (targetPiece.isDebuffed ? 2 : 0);
        
        // AI is now more willing to take "even" or slightly risky fights
        if (expectedAttackerTotal >= expectedDefenderTotal - 1) {
          score += defenderVal * 3; // Increased attack weight
          if (targetPiece.type === 'king') score += 5000;
          
          // HUNTER BONUS: Target vulnerable pieces!
          if (targetPiece.isDebuffed) score += 40;

          // Defensive bonus: reward killing a piece that is threatening our King
          if (isKingThreatened) {
            const enemyThreats = getValidMoves(targetPiece, pieces);
            if (myKing && enemyThreats.some(mt => mt.x === myKing.x && mt.y === myKing.y)) {
              score += 2000; // Priority: Kill the assassin (Toned down from 8000)
            }
          }
        } else {
          score -= attackerVal * 0.5; // Less afraid of losing pieces
        }
      } else {
        // 2. Positional Evaluation
        const advanceBonus = color === 'black' ? (piece.y - move.y) : (move.y - piece.y);
        score += advanceBonus * 2; // Increased advance weight (from 0.5)

        const centerDist = Math.abs(3.5 - move.x) + Math.abs(3.5 - move.y);
        score -= centerDist * 0.5;

        if (piece.type === 'pawn' && (move.y === 0 || move.y === 7)) {
          score += 150; // High priority for promotion
        }

        // 3. KING SAFETY LOGIC (Toned down to prevent "Coward AI")
        if (myKing) {
          if (piece.type === 'king' && isKingThreatened) {
            if (!threatenedSquares.has(`${move.x},${move.y}`)) {
              score += 3000; // Run away if in danger (Toned down from 9000)
            }
          }

          const distToKingAfter = Math.abs(move.x - myKing.x) + Math.abs(move.y - myKing.y);
          if (piece.type !== 'king') {
            if (distToKingAfter <= 2) {
              score += 5; // Minimal Guardian bonus (Toned down from 15)
            }
            if (isKingThreatened) {
              const distToKingBefore = Math.abs(piece.x - myKing.x) + Math.abs(piece.y - myKing.y);
              if (distToKingAfter < distToKingBefore) {
                score += 15; // Small hustle to help (Toned down from 40)
              }
            }
          }
        }
      }

      score += Math.random() * 2;

      if (score > bestScore) {
        bestScore = score;
        bestMove = { piece, target: { x: move.x, y: move.y }, score };
      }
    }
  }

  return bestMove;
};
