import React, { useState } from 'react';
import Board from './Board';
import './game.css';

// تابع بررسی برنده - تمام حالت‌های ممکن برای برنده شدن را چک می‌کند
const calculateWinner = (squares) => {
  // تمام ترکیب‌های ممکن برای برنده شدن
  const lines = [
    [0, 1, 2], // سطر اول
    [3, 4, 5], // سطر دوم
    [6, 7, 8], // سطر سوم
    [0, 3, 6], // ستون اول
    [1, 4, 7], // ستون دوم
    [2, 5, 8], // ستون سوم
    [0, 4, 8], // قطر اصلی
    [2, 4, 6]  // قطر فرعی
  ];

  // بررسی هر یک از حالت‌های برنده
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return squares[a]; // برگرداندن نماد برنده (X یا O)
    }
  }
  return null; // اگر برنده‌ای نباشد
};

// کامپوننت اصلی بازی
const Game = () => {
  // تعریف state های مورد نیاز
  const [board, setBoard] = useState(Array(9).fill(null)); // وضعیت تخته بازی
  const [isXNext, setIsXNext] = useState(true); // تعیین نوبت بازیکن
  const [difficulty, setDifficulty] = useState('easy'); // سطح سختی بازی
  const [gameStatus, setGameStatus] = useState(''); // وضعیت فعلی بازی

  // تابع تعیین حرکت AI بر اساس سطح سختی
  const getAIMove = (currentBoard) => {
    // پیدا کردن خانه‌های خالی
    const emptySquares = currentBoard.map((square, index) => 
      square === null ? index : null
    ).filter(val => val !== null);

    // اگر خانه خالی نباشد
    if (emptySquares.length === 0) return null;

    // انتخاب حرکت بر اساس سطح سختی
    switch(difficulty) {
      case 'easy':
        // در حالت آسان: انتخاب تصادفی
        return emptySquares[Math.floor(Math.random() * emptySquares.length)];
      case 'medium':
        // در حالت متوسط: ترکیبی از هوشمند و تصادفی
        if (Math.random() < 0.5) {
          return findBestMove(currentBoard);
        } else {
          return emptySquares[Math.floor(Math.random() * emptySquares.length)];
        }
      case 'hard':
        // در حالت سخت: استفاده از الگوریتم مینیمکس
        return findBestMove(currentBoard);
      default:
        return emptySquares[Math.floor(Math.random() * emptySquares.length)];
    }
  };

  // مدیریت کلیک روی خانه‌ها
  const handleClick = (i) => {
    // اگر خانه پر باشد یا بازی تمام شده باشد
    if (board[i] || calculateWinner(board)) {
      return;
    }

    // ایجاد کپی از تخته بازی
    const newBoard = [...board];
    
    // ثبت حرکت بازیکن
    newBoard[i] = 'X';
    setBoard(newBoard);
    
    // بررسی برنده بعد از حرکت بازیکن
    const winner = calculateWinner(newBoard);
    if (winner) {
      setGameStatus(`برنده: ${winner}`);
      return;
    }

    // بررسی مساوی
    if (!newBoard.includes(null)) {
      setGameStatus('مساوی!');
      return;
    }

    // حرکت AI با تأخیر 500 میلی‌ثانیه
    setTimeout(() => {
      const aiMove = getAIMove(newBoard);
      if (aiMove !== null) {
        newBoard[aiMove] = 'O';
        setBoard([...newBoard]);

        // بررسی برنده بعد از حرکت AI
        const aiWinner = calculateWinner(newBoard);
        if (aiWinner) {
          setGameStatus(`برنده: ${aiWinner}`);
        } else if (!newBoard.includes(null)) {
          setGameStatus('مساوی!');
        }
      }
    }, 500);
  };

  // تابع شروع مجدد بازی
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setGameStatus('');
  };

  // تابع تغییر سطح سختی
  const changeDifficulty = (newDifficulty) => {
    setDifficulty(newDifficulty);
    resetGame();
  };

  // رندر کامپوننت
  return (
    <div className="game">
      {/* انتخاب سطح سختی */}
      <div className="difficulty-selector">
        <select 
          value={difficulty} 
          onChange={(e) => changeDifficulty(e.target.value)}
        >
          <option value="easy">آسان</option>
          <option value="medium">متوسط</option>
          <option value="hard">سخت</option>
        </select>
      </div>

      {/* نمایش وضعیت بازی */}
      <div className="status">
        {gameStatus ? gameStatus : `نوبت: ${isXNext ? 'X' : 'O'}`}
      </div>

      {/* تخته بازی */}
      <Board squares={board} onClick={handleClick} />

      {/* دکمه شروع مجدد */}
      <button className="reset-button" onClick={resetGame}>
        شروع مجدد
      </button>
    </div>
  );
};

// الگوریتم مینیمکس برای AI هوشمند
function minimax(board, depth, isMaximizing) {
  const winner = calculateWinner(board);
  // شرایط پایانی
  if (winner === 'O') return 10 - depth;
  if (winner === 'X') return depth - 10;
  if (!board.includes(null)) return 0;

  if (isMaximizing) {
    // حداکثرسازی برای AI
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        bestScore = Math.max(bestScore, minimax(board, depth + 1, false));
        board[i] = null;
      }
    }
    return bestScore;
  } else {
    // حداقل‌سازی برای بازیکن
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = 'X';
        bestScore = Math.min(bestScore, minimax(board, depth + 1, true));
        board[i] = null;
      }
    }
    return bestScore;
  }
}

// تابع پیدا کردن بهترین حرکت برای AI
function findBestMove(board) {
  let bestScore = -Infinity;
  let bestMove = null;

  // بررسی تمام حرکت‌های ممکن
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      board[i] = 'O';
      let score = minimax(board, 0, false);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

export default Game;