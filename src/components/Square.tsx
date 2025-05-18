import React from 'react';
import type { Piece } from '../types';

interface SquareProps {
  piece: Piece | null;
  isBlack: boolean;
  onClick: () => void;
  isSelected: boolean;
  isValidMove: boolean;
}

const Square: React.FC<SquareProps> = ({ piece, isBlack, onClick, isSelected, isValidMove }) => {
  const getSquareClass = () => {
    const classes = ['square'];
    if (isBlack) classes.push('black');
    if (isSelected) classes.push('selected');
    if (isValidMove) classes.push('valid-move');
    return classes.join(' ');
  };

  const getPieceClass = () => {
    if (!piece) return '';
    const classes = ['piece'];
    classes.push(piece.color);
    if (piece.isKing) classes.push('king');
    return classes.join(' ');
  };

  return (
    <div className={getSquareClass()} onClick={onClick}>
      {piece && <div className={getPieceClass()} />}
    </div>
  );
};

export default Square; 