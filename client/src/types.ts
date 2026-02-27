export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PlayerColor = 'white' | 'black';

export interface Piece {
  id: string;
  type: PieceType;
  color: PlayerColor;
  x: number;
  y: number;
  kills: number;
  defends: number;
  hp: number;
  maxHp: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface BattleResult {
  attackerRoll: number;
  attackerTotal: number;
  attackerStats: number;
  defenderRoll: number;
  defenderTotal: number;
  defenderStats: number;
  success: boolean;
  targetX: number;
  targetY: number;
}
