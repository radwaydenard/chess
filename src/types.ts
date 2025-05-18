export type PieceColor = 'red' | 'black';

export interface Piece {
  color: PieceColor;
  isKing: boolean;
}

export type Board = (Piece | null)[][]; 