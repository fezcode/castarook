import type { Piece, PieceType, PlayerColor, Position } from '../types';
import { getValidMoves, getDiceSides } from './ChessLogic';

interface Move {
  piece: Piece;
  target: Position;
  score: number;
}

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

export const calculateBestMove = (pieces: Piece[], color: PlayerColor): Move | null => {
  const myPieces = pieces.filter(p => p.color === color && p.hp > 0);
  const enemyPieces = pieces.filter(p => p.color !== color && p.hp > 0);

  let bestMove: Move | null = null;
  let bestScore = -Infinity;

  // Shuffle pieces to add some randomness when scores are equal
  const shuffledPieces = [...myPieces].sort(() => Math.random() - 0.5);

  for (const piece of shuffledPieces) {
    const validMoves = getValidMoves(piece, pieces);
    
    for (const move of validMoves) {
      let score = 0;
      
      const targetPiece = pieces.find(p => p.x === move.x && p.y === move.y);
      
      if (targetPiece && targetPiece.color !== color) {
        // It's an attack! Let's calculate expected value.
        const attackerVal = evaluatePiece(piece);
        const defenderVal = evaluatePiece(targetPiece);
        
        const attackerDice = getDiceSides(piece.type);
        const defenderDice = getDiceSides(targetPiece.type);
        
        // Very basic expectation: Average roll + stats
        const expectedAttackerTotal = (attackerDice / 2) + piece.kills;
        const expectedDefenderTotal = (defenderDice / 2) + targetPiece.defends - (targetPiece.isDebuffed ? 2 : 0);
        
        if (expectedAttackerTotal > expectedDefenderTotal) {
          // We are likely to win this skirmish
          // Reward based on how valuable the target is
          score += defenderVal * 2; 
          
          // Extra incentive if we can kill the King
          if (targetPiece.type === 'king') score += 5000;
        } else {
          // We are likely to lose
          score -= attackerVal; // Penalize based on our piece's value
        }
      } else {
        // It's an empty square move
        // Encourage moving forward (for black, moving to lower Y values is forward)
        const advanceBonus = color === 'black' ? (piece.y - move.y) : (move.y - piece.y);
        score += advanceBonus * 0.5;

        // Encourage controlling the center
        const centerDist = Math.abs(3.5 - move.x) + Math.abs(3.5 - move.y);
        score -= centerDist * 0.2;

        // Promotion incentive
        if (piece.type === 'pawn' && (move.y === 0 || move.y === 7)) {
          score += 80;
        }
      }

      // Add a tiny bit of random noise to make the AI less predictable
      score += Math.random() * 2;

      if (score > bestScore) {
        bestScore = score;
        bestMove = { piece, target: { x: move.x, y: move.y }, score };
      }
    }
  }

  return bestMove;
};
