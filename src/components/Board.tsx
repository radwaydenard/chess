import React from 'react';
import Square from './Square';
import type { Piece } from '../types';

interface BoardProps {
  board: (Piece | null)[][];
  onSquareClick: (row: number, col: number) => void;
  selectedSquare: [number, number] | null;
  validMoves: [number, number][];
}

const Board: React.FC<BoardProps> = ({ board, onSquareClick, selectedSquare, validMoves }) => {
  return (
    <div className="board">
      {board.map((row, rowIndex) => (
        <div key={rowIndex} className="board-row">
          {row.map((piece, colIndex) => {
            const isSelected = selectedSquare?.[0] === rowIndex && selectedSquare?.[1] === colIndex;
            const isValidMove = validMoves.some(
              ([r, c]) => r === rowIndex && c === colIndex
            );
            return (
              <Square
                key={`${rowIndex}-${colIndex}`}
                piece={piece}
                isBlack={(rowIndex + colIndex) % 2 === 1}
                onClick={() => onSquareClick(rowIndex, colIndex)}
                isSelected={isSelected}
                isValidMove={isValidMove}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default Board; 