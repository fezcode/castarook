import type { Piece, PieceType, PlayerColor, Position } from '../types';

export const setupBoard = (): Piece[] => {
  const pieces: Piece[] = [];
  
  const getInitialHp = (type: PieceType): number => {
    switch (type) {
      case 'pawn': return 10;
      case 'knight': return 20;
      case 'bishop': return 20;
      case 'rook': return 30;
      case 'queen': return 40;
      case 'king': return 50;
      default: return 10;
    }
  };

  const createPiece = (type: PieceType, color: PlayerColor, x: number, y: number): Piece => {
    const hp = getInitialHp(type);
    const secondaryColor = color === 'white' ? '#d4af37' : '#ff5252'; // Gold for white, Bright red for black
    return {
      id: `${type}-${color}-${x}-${y}-${Math.random().toString(36).substr(2, 9)}`,
      type, color, secondaryColor, x, y, kills: 0, defends: 0, hp, maxHp: hp
    };
  };

  // Pawns
  for (let x = 0; x < 8; x++) {
    pieces.push(createPiece('pawn', 'white', x, 1));
    pieces.push(createPiece('pawn', 'black', x, 6));
  }
  
  const backRowTypes: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook'];
  backRowTypes.forEach((type, x) => {
    pieces.push(createPiece(type, 'white', x, 0));
    pieces.push(createPiece(type, 'black', x, 7));
  });
  
  return pieces;
};

const getPieceAt = (pieces: Piece[], x: number, y: number) => pieces.find(p => p.x === x && p.y === y);

export const getValidMoves = (piece: Piece, pieces: Piece[]): Position[] => {
  const moves: Position[] = [];
  const { x, y, color, type } = piece;

  const addMove = (nx: number, ny: number, allowCapture = true, requireCapture = false) => {
    if (nx < 0 || nx > 7 || ny < 0 || ny > 7) return false;
    const target = getPieceAt(pieces, nx, ny);
    if (!target && !requireCapture) {
      moves.push({ x: nx, y: ny });
      return true; // continue scanning
    }
    if (target) {
      if (target.color !== color && allowCapture) {
        moves.push({ x: nx, y: ny });
      }
      return false; // blocked
    }
    return false;
  };

  const scanDir = (dx: number, dy: number) => {
    for (let i = 1; i < 8; i++) {
      if (!addMove(x + dx * i, y + dy * i)) break;
    }
  };

  switch (type) {
    case 'pawn': {
      const dir = color === 'white' ? 1 : -1;
      const startRow = color === 'white' ? 1 : 6;
      // Forward
      if (!getPieceAt(pieces, x, y + dir)) {
        addMove(x, y + dir, false);
        // Double forward
        if (y === startRow && !getPieceAt(pieces, x, y + dir * 2)) {
          addMove(x, y + dir * 2, false);
        }
      }
      // Captures
      addMove(x - 1, y + dir, true, true);
      addMove(x + 1, y + dir, true, true);
      break;
    }
    case 'knight': {
      const jumps = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
      jumps.forEach(([dx, dy]) => addMove(x + dx, y + dy));
      break;
    }
    case 'rook': {
      scanDir(0, 1); scanDir(0, -1); scanDir(1, 0); scanDir(-1, 0);
      break;
    }
    case 'bishop': {
      scanDir(1, 1); scanDir(1, -1); scanDir(-1, 1); scanDir(-1, -1);
      break;
    }
    case 'queen': {
      scanDir(0, 1); scanDir(0, -1); scanDir(1, 0); scanDir(-1, 0);
      scanDir(1, 1); scanDir(1, -1); scanDir(-1, 1); scanDir(-1, -1);
      break;
    }
    case 'king': {
      const dirs = [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]];
      dirs.forEach(([dx, dy]) => addMove(x + dx, y + dy));
      break;
    }
  }

  return moves;
};

// D20 dice roll
export const rollDice = () => Math.floor(Math.random() * 20) + 1;
