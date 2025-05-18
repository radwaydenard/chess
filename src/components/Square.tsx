import React from 'react';

interface SquareProps {
  isBlack: boolean;
  isSelected: boolean;
  isValidMove: boolean;
  isDebugSelected?: boolean;
  onClick: () => void;
  children?: React.ReactNode;
}

export const Square: React.FC<SquareProps> = ({
  isBlack,
  isSelected,
  isValidMove,
  isDebugSelected,
  onClick,
  children
}) => {
  return (
    <div
      className={`square ${isBlack ? 'black' : ''} ${isSelected ? 'selected' : ''} ${isValidMove ? 'valid-move' : ''} ${isDebugSelected ? 'debug-selected' : ''}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}; 