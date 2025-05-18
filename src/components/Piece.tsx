import React from 'react';

interface PieceProps {
  player: 'red' | 'black';
  isKing: boolean;
}

export const Piece: React.FC<PieceProps> = ({ player, isKing }) => {
  return (
    <div className={`piece ${player} ${isKing ? 'king' : ''}`} />
  );
}; 