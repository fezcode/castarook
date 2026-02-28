export type PieceType = 'pawn' | 'rook' | 'knight' | 'bishop' | 'queen' | 'king';
export type PlayerColor = 'white' | 'black';

export interface Piece {
  id: string;
  type: PieceType;
  color: PlayerColor;
  secondaryColor?: string;
  x: number;
  y: number;
  kills: number;
  defends: number;
  hp: number;
  maxHp: number;
  hasMoved: boolean;
  status: 'idle' | 'attacking' | 'dying';
}

export interface Position {
  x: number;
  y: number;
}

export interface BattleResult {
  attackerRoll: number;
  attackerTotal: number;
  attackerStats: number;
  attackerDice: number;
  defenderRoll: number;
  defenderTotal: number;
  defenderStats: number;
  defenderDice: number;
  success: boolean;
  targetX: number;
  targetY: number;
}

export interface LogEntry {
  id: string;
  message: string;
  type: 'move' | 'attack' | 'kill' | 'promotion' | 'castle';
  timestamp: number;
}
