export type Player = 'red' | 'black';
export type PieceType = 'normal' | 'king';

export interface Piece {
  player: Player;
  type: PieceType;
}

export type Board = (Piece | null)[][]; 