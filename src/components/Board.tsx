import React from 'react';
import type { Piece } from '../types';
import { Square } from './Square';

interface BoardProps {
  children: React.ReactNode;
}

export const Board: React.FC<BoardProps> = ({ children }) => {
  return (
    <div className="board">
      {children}
    </div>
  );
}; 