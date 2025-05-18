import { useState } from 'react';
import { Board } from './Board';
import { Square } from './Square';
import type { Player, PieceType } from '../types';

interface GameState {
  board: (null | { player: Player; type: PieceType })[][];
  currentPlayer: Player;
  selectedPiece: [number, number] | null;
  validMoves: [number, number][];
  redScore: number;
  blackScore: number;
  winner: Player | 'draw' | null;
}

export const Game = () => {
  const [gameState, setGameState] = useState<GameState>(() => ({
    board: initializeBoard(),
    currentPlayer: 'red',
    selectedPiece: null,
    validMoves: [],
    redScore: 0,
    blackScore: 0,
    winner: null
  }));

  const [showDebug, setShowDebug] = useState(false);
  const [showNewGameModal, setShowNewGameModal] = useState(false);
  const [selectedDebugPiece, setSelectedDebugPiece] = useState<[number, number] | null>(null);

  function initializeBoard() {
    const board = Array(8).fill(null).map(() => Array(8).fill(null));
    
    // Place red pieces
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          board[row][col] = { player: 'red', type: 'normal' };
        }
      }
    }
    
    // Place black pieces
    for (let row = 5; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        if ((row + col) % 2 === 1) {
          board[row][col] = { player: 'black', type: 'normal' };
        }
      }
    }
    
    return board;
  }

  const getValidMoves = (row: number, col: number): [number, number][] => {
    const piece = gameState.board[row][col];
    if (!piece) return [];

    const moves: [number, number][] = [];
    const directions: [number, number][] = piece.type === 'king' 
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
      : [[-1, -1], [-1, 1], [1, -1], [1, 1]];

    // Проверяем ходы с захватом
    const captureMoves = findCaptureMoves(row, col, piece, directions);
    if (captureMoves.length > 0) {
      return captureMoves;
    }

    // Обычные ходы
    if (piece.type === 'king') {
      // Дамка может ходить на любое расстояние по диагонали
      for (const [dx, dy] of directions) {
        let newRow = row + dx;
        let newCol = col + dy;
        
        while (isValidPosition(newRow, newCol)) {
          if (!gameState.board[newRow][newCol]) {
            moves.push([newRow, newCol]);
          } else {
            break; // Прерываем, если встретили фишку
          }
          newRow += dx;
          newCol += dy;
        }
      }
    } else {
      // Обычная фишка ходит только на одну клетку в любом направлении
      for (const [dx, dy] of directions) {
        const newRow = row + dx;
        const newCol = col + dy;
        
        if (isValidPosition(newRow, newCol) && !gameState.board[newRow][newCol]) {
          moves.push([newRow, newCol]);
        }
      }
    }

    return moves;
  };

  const findCaptureMoves = (
    row: number, 
    col: number, 
    piece: { player: Player; type: PieceType },
    directions: [number, number][],
    visited: Set<string> = new Set(),
    path: [number, number][] = []
  ): [number, number][] => {
    const moves: [number, number][] = [];
    const key = `${row},${col}`;
    if (visited.has(key)) return moves;
    visited.add(key);

    for (const [dx, dy] of directions) {
      const jumpRow = row + dx;
      const jumpCol = col + dy;
      const landRow = row + dx * 2;
      const landCol = col + dy * 2;

      if (isValidPosition(jumpRow, jumpCol) && isValidPosition(landRow, landCol)) {
        const jumpedPiece = gameState.board[jumpRow][jumpCol];
        const landingSquare = gameState.board[landRow][landCol];

        if (jumpedPiece && jumpedPiece.player !== piece.player && !landingSquare) {
          // Проверяем, не было ли уже захвата этой фишки в текущем пути
          const jumpKey = `${jumpRow},${jumpCol}`;
          if (!path.some(([r, c]) => `${r},${c}` === jumpKey)) {
            moves.push([landRow, landCol] as [number, number]);
            
            // Создаем новый путь с добавлением текущей позиции
            const newPath: [number, number][] = [...path, [jumpRow, jumpCol] as [number, number]];
            
            // Рекурсивно ищем дополнительные захваты
            const additionalMoves = findCaptureMoves(
              landRow, 
              landCol, 
              piece, 
              directions, 
              new Set([...visited]), 
              newPath
            );
            
            // Добавляем найденные дополнительные ходы
            moves.push(...additionalMoves);
          }
        }
      }
    }

    return moves;
  };

  const isValidPosition = (row: number, col: number): boolean => {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
  };

  const resetGame = () => {
    setShowNewGameModal(true);
  };

  const handleNewGameConfirm = () => {
    setGameState({
      board: initializeBoard(),
      currentPlayer: 'red',
      selectedPiece: null,
      validMoves: [],
      redScore: 0,
      blackScore: 0,
      winner: null
    });
    setShowNewGameModal(false);
  };

  const handleNewGameCancel = () => {
    setShowNewGameModal(false);
  };

  const handleSquareClick = (row: number, col: number) => {
    if (gameState.winner) return;

    // Обработка debug режима
    if (showDebug) {
      const piece = gameState.board[row][col];
      
      // Если выбрано действие и нажали на фишку
      if (debugActions.currentAction !== 'none' && piece) {
        const newBoard = [...gameState.board.map(row => [...row])];
        
        if (debugActions.currentAction === 'makeKing') {
          newBoard[row][col] = { ...piece, type: 'king' };
        } else if (debugActions.currentAction === 'removePiece') {
          newBoard[row][col] = null;
        }

        setGameState(prev => ({
          ...prev,
          board: newBoard
        }));
        debugActions.currentAction = 'none';
        return;
      }
    }

    const piece = gameState.board[row][col];
    
    if (gameState.selectedPiece) {
      const [selectedRow, selectedCol] = gameState.selectedPiece;
      
      if (selectedRow === row && selectedCol === col) {
        setGameState(prev => ({
          ...prev,
          selectedPiece: null,
          validMoves: []
        }));
        return;
      }
      
      if (gameState.validMoves.some(([r, c]) => r === row && c === col)) {
        const newBoard = [...gameState.board.map(row => [...row])];
        const selectedPiece = newBoard[selectedRow][selectedCol]!;
        const capturedPieces: { player: Player; type: PieceType }[] = [];

        // Обработка захватов
        const rowDiff = row - selectedRow;
        const colDiff = col - selectedCol;
        
        if (Math.abs(rowDiff) >= 2 && Math.abs(colDiff) >= 2) {
          const rowStep = rowDiff / Math.abs(rowDiff);
          const colStep = colDiff / Math.abs(colDiff);
          
          let currentRow = selectedRow + rowStep;
          let currentCol = selectedCol + colStep;
          
          while (currentRow !== row && currentCol !== col) {
            const capturedPiece = newBoard[currentRow][currentCol];
            if (capturedPiece) {
              capturedPieces.push(capturedPiece);
              newBoard[currentRow][currentCol] = null;
            }
            currentRow += rowStep;
            currentCol += colStep;
          }
        }
        
        // Перемещаем фишку
        newBoard[row][col] = selectedPiece;
        newBoard[selectedRow][selectedCol] = null;

        // Проверяем, не стала ли фишка дамкой
        if ((selectedPiece.player === 'red' && row === 7) || 
            (selectedPiece.player === 'black' && row === 0)) {
          newBoard[row][col] = { ...selectedPiece, type: 'king' };
        }
        
        // Обновляем счет
        const redCaptures = capturedPieces.filter(p => p.player === 'red').length;
        const blackCaptures = capturedPieces.filter(p => p.player === 'black').length;
        
        const newRedScore = gameState.redScore + redCaptures;
        const newBlackScore = gameState.blackScore + blackCaptures;

        // Проверяем победителя
        const winner = checkWinner(newBoard, newRedScore, newBlackScore);

        setGameState(prev => ({
          ...prev,
          board: newBoard,
          currentPlayer: prev.currentPlayer === 'red' ? 'black' : 'red',
          selectedPiece: null,
          validMoves: [],
          redScore: newRedScore,
          blackScore: newBlackScore,
          winner
        }));
        return;
      }
      
      if (piece && piece.player === gameState.currentPlayer) {
        const validMoves = getValidMoves(row, col);
        setGameState(prev => ({
          ...prev,
          selectedPiece: [row, col],
          validMoves
        }));
        return;
      }
    }
    
    if (piece && piece.player === gameState.currentPlayer) {
      const validMoves = getValidMoves(row, col);
      setGameState(prev => ({
        ...prev,
        selectedPiece: [row, col],
        validMoves
      }));
    }
  };

  const handleCaptures = (
    fromRow: number,
    fromCol: number,
    toRow: number,
    toCol: number,
    board: (null | { player: Player; type: PieceType })[][]
  ): { player: Player; type: PieceType }[] => {
    const capturedPieces: { player: Player; type: PieceType }[] = [];
    const rowDiff = toRow - fromRow;
    const colDiff = toCol - fromCol;
    
    // Если это ход с захватом (перепрыгнули через фишку)
    if (Math.abs(rowDiff) === 2 && Math.abs(colDiff) === 2) {
      // Определяем направление движения
      const rowStep = rowDiff / Math.abs(rowDiff);
      const colStep = colDiff / Math.abs(colDiff);
      
      // Проходим по всему пути и собираем все захваченные фишки
      let currentRow = fromRow + rowStep;
      let currentCol = fromCol + colStep;
      
      while (currentRow !== toRow && currentCol !== toCol) {
        const capturedPiece = board[currentRow][currentCol];
        if (capturedPiece) {
          capturedPieces.push(capturedPiece);
          board[currentRow][currentCol] = null;
        }
        currentRow += rowStep;
        currentCol += colStep;
      }
    }
    
    return capturedPieces;
  };

  const checkWinner = (
    board: (null | { player: Player; type: PieceType })[][],
    redScore: number,
    blackScore: number
  ): Player | 'draw' | null => {
    // Проверяем, все ли фишки стали дамками
    let redPieces = 0;
    let blackPieces = 0;
    let redKings = 0;
    let blackKings = 0;

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const piece = board[row][col];
        if (piece) {
          if (piece.player === 'red') {
            redPieces++;
            if (piece.type === 'king') redKings++;
          } else {
            blackPieces++;
            if (piece.type === 'king') blackKings++;
          }
        }
      }
    }

    // Если у одного игрока все фишки стали дамками, а у другого нет - победа
    if (redKings === redPieces && redPieces > 0 && blackKings !== blackPieces) return 'red';
    if (blackKings === blackPieces && blackPieces > 0 && redKings !== redPieces) return 'black';

    // Если у обоих игроков все фишки стали дамками - ничья
    if (redKings === redPieces && blackKings === blackPieces && redPieces > 0 && blackPieces > 0) return 'draw';

    // Проверяем, если все фишки одного цвета захвачены
    if (redPieces === 0) return 'black';
    if (blackPieces === 0) return 'red';

    return null;
  };

  const debugActions = {
    currentAction: 'none' as 'none' | 'makeKing' | 'removePiece',
    makeRedWin: () => {
      const newBoard = Array(8).fill(null).map(() => Array(8).fill(null));
      newBoard[0][0] = { player: 'red', type: 'king' };
      newBoard[0][2] = { player: 'red', type: 'king' };
      newBoard[0][4] = { player: 'red', type: 'king' };
      setGameState(prev => ({
        ...prev,
        board: newBoard,
        winner: 'red'
      }));
    },
    makeBlackWin: () => {
      const newBoard = Array(8).fill(null).map(() => Array(8).fill(null));
      newBoard[7][1] = { player: 'black', type: 'king' };
      newBoard[7][3] = { player: 'black', type: 'king' };
      newBoard[7][5] = { player: 'black', type: 'king' };
      setGameState(prev => ({
        ...prev,
        board: newBoard,
        winner: 'black'
      }));
    },
    makeDraw: () => {
      const newBoard = Array(8).fill(null).map(() => Array(8).fill(null));
      newBoard[0][0] = { player: 'red', type: 'king' };
      newBoard[0][2] = { player: 'red', type: 'king' };
      newBoard[7][1] = { player: 'black', type: 'king' };
      newBoard[7][3] = { player: 'black', type: 'king' };
      setGameState(prev => ({
        ...prev,
        board: newBoard,
        winner: 'draw'
      }));
    },
    makeAllKings: () => {
      const newBoard = gameState.board.map(row =>
        row.map(piece => piece ? { ...piece, type: 'king' as PieceType } : null)
      );
      setGameState(prev => ({
        ...prev,
        board: newBoard
      }));
    },
    startMakeKing: () => {
      debugActions.currentAction = 'makeKing';
    },
    startRemovePiece: () => {
      debugActions.currentAction = 'removePiece';
    },
    cancelAction: () => {
      debugActions.currentAction = 'none';
    }
  };

  return (
    <div className="game">
      <div className="game-info">
        {gameState.winner ? (
          <div className="winner-message">
            {gameState.winner === 'draw' 
              ? 'Ничья!' 
              : `Победили ${gameState.winner === 'red' ? 'красные' : 'черные'}!`}
          </div>
        ) : (
          <div>
            Ход: <span className={`current-player ${gameState.currentPlayer}`}>
              {gameState.currentPlayer === 'red' ? 'красные' : 'черные'}
            </span>
          </div>
        )}
      </div>
      
      <div className="scores">
        <div className="score red">Красные: {gameState.redScore}</div>
        <div className="score black">Черные: {gameState.blackScore}</div>
      </div>

      <Board>
        {gameState.board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((piece, colIndex) => (
              <Square
                key={`${rowIndex}-${colIndex}`}
                isBlack={(rowIndex + colIndex) % 2 === 1}
                isSelected={gameState.selectedPiece?.[0] === rowIndex && 
                          gameState.selectedPiece?.[1] === colIndex}
                isValidMove={gameState.validMoves.some(
                  ([r, c]) => r === rowIndex && c === colIndex
                )}
                isDebugSelected={selectedDebugPiece?.[0] === rowIndex && 
                               selectedDebugPiece?.[1] === colIndex}
                onClick={() => handleSquareClick(rowIndex, colIndex)}
              >
                {piece && (
                  <div className={`piece ${piece.player} ${piece.type === 'king' ? 'king' : ''}`} />
                )}
              </Square>
            ))}
          </div>
        ))}
      </Board>

      <button 
        className="new-game-button"
        onClick={resetGame}
      >
        Новая игра
      </button>

      {showNewGameModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-title">Начать новую игру?</div>
            <div className="modal-buttons">
              <button 
                className="modal-button confirm"
                onClick={handleNewGameConfirm}
              >
                Да
              </button>
              <button 
                className="modal-button cancel"
                onClick={handleNewGameCancel}
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}

      {import.meta.env.DEV && (
        <button 
          className="debug-toggle"
          onClick={() => {
            setShowDebug(!showDebug);
            debugActions.cancelAction();
          }}
        >
          Debug
        </button>
      )}

      {showDebug && (
        <div className="debug-panel">
          <button onClick={debugActions.makeRedWin}>Красные побеждают</button>
          <button onClick={debugActions.makeBlackWin}>Черные побеждают</button>
          <button onClick={debugActions.makeDraw}>Ничья</button>
          <button onClick={debugActions.makeAllKings}>Все дамки</button>
          <button onClick={debugActions.startMakeKing}>Сделать дамкой</button>
          <button onClick={debugActions.startRemovePiece}>Удалить фишку</button>
          <button onClick={debugActions.cancelAction}>Отменить действие</button>
        </div>
      )}
    </div>
  );
}; 