import { useState } from 'react';
import Board from './Board';
import type { Board as BoardType } from '../types';

const BOARD_SIZE = 8;

const createInitialBoard = (): BoardType => {
  const board: BoardType = Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(null));
  
  // Place black pieces
  for (let row = 0; row < 3; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { color: 'black', isKing: false };
      }
    }
  }
  
  // Place red pieces
  for (let row = 5; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if ((row + col) % 2 === 1) {
        board[row][col] = { color: 'red', isKing: false };
      }
    }
  }
  
  return board;
};

const Game: React.FC = () => {
  const [board, setBoard] = useState<BoardType>(createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<'red' | 'black'>('red');
  const [selectedSquare, setSelectedSquare] = useState<[number, number] | null>(null);
  const [validMoves, setValidMoves] = useState<[number, number][]>([]);
  const [scores, setScores] = useState({ red: 0, black: 0 });

  const getValidMoves = (row: number, col: number): [number, number][] => {
    const piece = board[row][col];
    if (!piece || piece.color !== currentPlayer) return [];

    const moves: [number, number][] = [];
    const directions = piece.isKing ? [-1, 1] : [piece.color === 'red' ? -1 : 1];

    for (const rowDir of directions) {
      for (const colDir of [-1, 1]) {
        const newRow = row + rowDir;
        const newCol = col + colDir;

        if (newRow >= 0 && newRow < BOARD_SIZE && newCol >= 0 && newCol < BOARD_SIZE) {
          if (!board[newRow][newCol]) {
            moves.push([newRow, newCol]);
          } else if (
            board[newRow][newCol]?.color !== piece.color &&
            newRow + rowDir >= 0 &&
            newRow + rowDir < BOARD_SIZE &&
            newCol + colDir >= 0 &&
            newCol + colDir < BOARD_SIZE &&
            !board[newRow + rowDir][newCol + colDir]
          ) {
            moves.push([newRow + rowDir, newCol + colDir]);
          }
        }
      }
    }

    return moves;
  };

  const handleSquareClick = (row: number, col: number) => {
    const piece = board[row][col];

    if (selectedSquare) {
      const [selectedRow, selectedCol] = selectedSquare;
      const isValidMove = validMoves.some(([r, c]) => r === row && c === col);

      if (isValidMove) {
        const newBoard = [...board.map(row => [...row])];
        newBoard[row][col] = board[selectedRow][selectedCol];
        newBoard[selectedRow][selectedCol] = null;

        // Проверяем, был ли это ход с захватом фишки
        const rowDiff = row - selectedRow;
        const colDiff = col - selectedCol;
        if (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 2) {
          // Удаляем захваченную фишку
          const capturedRow = selectedRow + rowDiff / 2;
          const capturedCol = selectedCol + colDiff / 2;
          const capturedPiece = newBoard[capturedRow][capturedCol];
          newBoard[capturedRow][capturedCol] = null;

          // Обновляем счет
          if (capturedPiece) {
            setScores(prev => ({
              ...prev,
              [currentPlayer]: prev[currentPlayer] + 1
            }));
          }
        }

        // Check if piece should become king
        if ((row === 0 && currentPlayer === 'red') || (row === BOARD_SIZE - 1 && currentPlayer === 'black')) {
          newBoard[row][col] = { ...newBoard[row][col]!, isKing: true };
        }

        setBoard(newBoard);
        setCurrentPlayer(currentPlayer === 'red' ? 'black' : 'red');
      }

      setSelectedSquare(null);
      setValidMoves([]);
    } else if (piece && piece.color === currentPlayer) {
      setSelectedSquare([row, col]);
      setValidMoves(getValidMoves(row, col));
    }
  };

  return (
    <div className="game">
      <div className="game-info">
        <div className="scores">
          <div className="score red">Красные: {scores.red}</div>
          <div className="score black">Черные: {scores.black}</div>
        </div>
        <div>
          Текущий ход: <span className={`current-player ${currentPlayer}`}>
            {currentPlayer === 'red' ? 'Красные' : 'Черные'}
          </span>
        </div>
      </div>
      <Board
        board={board}
        onSquareClick={handleSquareClick}
        selectedSquare={selectedSquare}
        validMoves={validMoves}
      />
    </div>
  );
};

export default Game; 