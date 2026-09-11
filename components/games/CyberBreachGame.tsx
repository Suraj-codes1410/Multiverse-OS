'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Terminal,
  ShieldAlert,
  CheckCircle2,
  RotateCcw,
  Trophy,
  Delete,
  CornerDownLeft,
} from 'lucide-react';

const WORD_LIST = [
  'ASYNC',
  'PROXY',
  'REDIS',
  'KAFKA',
  'BUILD',
  'OAUTH',
  'QUERY',
  'CACHE',
  'STACK',
  'TOKEN',
  'REACT',
  'FETCH',
  'MUTEX',
  'PATCH',
  'ROUTE',
  'PARSE',
  'RESET',
  'INDEX',
  'TYPED',
  'CLONE',
];

const MAX_ATTEMPTS = 6;
const WORD_LENGTH = 5;
const HIGH_SCORE_KEY = 'hs_cyber-breach';

type LetterStatus = 'correct' | 'present' | 'absent' | 'empty';

interface GuessAttempt {
  word: string;
  evaluations: LetterStatus[];
}

function evaluateGuess(guess: string, target: string): LetterStatus[] {
  const result: LetterStatus[] = Array(WORD_LENGTH).fill('absent');
  const targetChars = target.split('');
  const guessChars = guess.split('');

  // 1. Exact matches (correct position)
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessChars[i] === targetChars[i]) {
      result[i] = 'correct';
      targetChars[i] = '#';
      guessChars[i] = '*';
    }
  }

  // 2. Partial matches (wrong position)
  for (let i = 0; i < WORD_LENGTH; i++) {
    if (guessChars[i] !== '*') {
      const idx = targetChars.indexOf(guessChars[i]);
      if (idx !== -1) {
        result[i] = 'present';
        targetChars[idx] = '#';
      }
    }
  }

  return result;
}

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACK'],
];

export function CyberBreachGame() {
  const [targetWord, setTargetWord] = useState<string>('');
  const [guesses, setGuesses] = useState<GuessAttempt[]>([]);
  const [currentGuess, setCurrentGuess] = useState<string>('');
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>(
    'playing'
  );
  const [highScore, setHighScore] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Initialize random word and high score
  const initGame = useCallback(() => {
    const randomWord = WORD_LIST[Math.floor(Math.random() * WORD_LIST.length)];
    setTargetWord(randomWord);
    setGuesses([]);
    setCurrentGuess('');
    setGameStatus('playing');
    setErrorMsg(null);
  }, []);

  useEffect(() => {
    initGame();
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(HIGH_SCORE_KEY);
      if (stored) {
        setHighScore(parseInt(stored, 10));
      }
    }
  }, [initGame]);

  const handleCharInput = useCallback(
    (char: string) => {
      if (gameStatus !== 'playing') return;
      if (currentGuess.length < WORD_LENGTH) {
        setCurrentGuess((prev) => prev + char.toUpperCase());
        setErrorMsg(null);
      }
    },
    [currentGuess, gameStatus]
  );

  const handleDelete = useCallback(() => {
    if (gameStatus !== 'playing') return;
    setCurrentGuess((prev) => prev.slice(0, -1));
    setErrorMsg(null);
  }, [gameStatus]);

  const handleEnter = useCallback(() => {
    if (gameStatus !== 'playing') return;

    if (currentGuess.length < WORD_LENGTH) {
      setErrorMsg('INSUFFICIENT BITS // 5 CHARACTERS REQUIRED');
      return;
    }

    const evaluations = evaluateGuess(currentGuess, targetWord);
    const newAttempt: GuessAttempt = {
      word: currentGuess,
      evaluations,
    };

    const newGuesses = [...guesses, newAttempt];
    setGuesses(newGuesses);
    setCurrentGuess('');

    // Check win condition
    if (currentGuess === targetWord) {
      setGameStatus('won');
      const attemptsCount = newGuesses.length;
      setHighScore((prev) => {
        const nextBest =
          prev === null || attemptsCount < prev ? attemptsCount : prev;
        if (typeof window !== 'undefined') {
          localStorage.setItem(HIGH_SCORE_KEY, nextBest.toString());
        }
        return nextBest;
      });
    } else if (newGuesses.length >= MAX_ATTEMPTS) {
      setGameStatus('lost');
    }
  }, [currentGuess, gameStatus, guesses, targetWord]);

  // Physical Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')
      ) {
        return;
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        handleEnter();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleDelete();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        e.preventDefault();
        handleCharInput(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCharInput, handleDelete, handleEnter]);

  // Determine keyboard key status map
  const keyStatusMap: Record<string, LetterStatus> = {};
  guesses.forEach((guess) => {
    guess.word.split('').forEach((char, idx) => {
      const currentEval = guess.evaluations[idx];
      const prevEval = keyStatusMap[char];

      if (currentEval === 'correct') {
        keyStatusMap[char] = 'correct';
      } else if (currentEval === 'present' && prevEval !== 'correct') {
        keyStatusMap[char] = 'present';
      } else if (currentEval === 'absent' && !prevEval) {
        keyStatusMap[char] = 'absent';
      }
    });
  });

  return (
    <div className="w-full h-full p-4 flex flex-col items-center justify-between select-none overflow-y-auto scrollbar-thin bg-bg-panel text-text-primary font-mono">
      {/* Top Header & Cyberpunk Telemetry */}
      <div className="w-full max-w-md flex items-center justify-between border-b border-border-subtle pb-2.5 mb-2">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-accent-cyan animate-pulse" />
          <div>
            <h2 className="font-bold text-xs md:text-sm tracking-wider text-accent-cyan">
              CYBER_BREACH // PROTOCOL
            </h2>
            <span className="text-[9px] text-text-secondary">
              ATTEMPT [{guesses.length}/{MAX_ATTEMPTS}]
            </span>
          </div>
        </div>

        {/* High Score / Best attempts */}
        <div className="flex items-center gap-1.5 bg-bg-primary/40 border border-border-subtle px-2.5 py-1 rounded-lg">
          <Trophy className="w-3 h-3 text-warning-amber" />
          <span className="text-[10px] text-text-secondary">BEST:</span>
          <span className="text-xs font-bold text-warning-amber">
            {highScore !== null ? `${highScore} tries` : '--'}
          </span>
        </div>
      </div>

      {/* Error / Status prompt banner */}
      {errorMsg && (
        <div className="w-full max-w-md bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] py-1 px-2 rounded mb-2 text-center animate-pulse">
          {errorMsg}
        </div>
      )}

      {/* 6x5 Word Guessing Grid */}
      <div className="w-full max-w-xs flex flex-col gap-1.5 my-auto">
        {Array.from({ length: MAX_ATTEMPTS }).map((_, rowIndex) => {
          const attempt = guesses[rowIndex];
          const isCurrentRow = rowIndex === guesses.length;

          return (
            <div key={rowIndex} className="grid grid-cols-5 gap-1.5 w-full">
              {Array.from({ length: WORD_LENGTH }).map((_, colIndex) => {
                let char = '';
                let status: LetterStatus = 'empty';

                if (attempt) {
                  char = attempt.word[colIndex] || '';
                  status = attempt.evaluations[colIndex] || 'empty';
                } else if (isCurrentRow) {
                  char = currentGuess[colIndex] || '';
                }

                // Cyberpunk styling based on status
                let tileClass =
                  'bg-bg-primary/20 border-border-subtle text-text-primary';
                if (status === 'correct') {
                  tileClass =
                    'bg-accent-cyan border-accent-cyan text-white shadow-[0_0_8px_var(--accent-cyan)]';
                } else if (status === 'present') {
                  tileClass =
                    'bg-warning-amber border-warning-amber text-white shadow-[0_0_8px_var(--warning-amber)]';
                } else if (status === 'absent') {
                  tileClass =
                    'bg-bg-primary/50 border-border-subtle text-text-secondary opacity-50';
                } else if (char) {
                  tileClass =
                    'bg-bg-primary/40 border-accent-cyan/60 text-accent-cyan';
                }

                return (
                  <div
                    key={colIndex}
                    className={`aspect-square rounded-lg border-2 flex items-center justify-center font-bold text-sm md:text-base transition-all duration-200 select-none ${tileClass}`}
                  >
                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Win / Loss Status Overlay */}
      {gameStatus !== 'playing' && (
        <div className="w-full max-w-md my-2 p-3 rounded-xl border backdrop-blur-md flex items-center justify-between animate-in zoom-in-95 duration-200 shadow-lg bg-bg-panel/95">
          {gameStatus === 'won' ? (
            <div className="flex items-center gap-2.5 text-accent-cyan">
              <CheckCircle2 className="w-5 h-5 text-accent-cyan flex-shrink-0 animate-bounce" />
              <div>
                <p className="font-bold text-xs tracking-wider">
                  SYSTEM BREACH SUCCESSFUL
                </p>
                <p className="text-[10px] text-text-secondary">
                  Key decrypted in {guesses.length} attempts
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 text-red-500">
              <ShieldAlert className="w-5 h-5 text-red-500 flex-shrink-0 animate-pulse" />
              <div>
                <p className="font-bold text-xs tracking-wider">
                  ACCESS DENIED — LOCKOUT INITIATED
                </p>
                <p className="text-[10px] text-text-secondary">
                  Target Keyword:{' '}
                  <span className="font-bold text-accent-cyan">
                    {targetWord}
                  </span>
                </p>
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={initGame}
            className="flex items-center gap-1 font-mono text-xs font-semibold px-3 py-1.5 rounded-lg bg-accent-cyan text-white hover:opacity-90 transition-opacity cursor-pointer shadow-sm ml-2 flex-shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>RESET</span>
          </button>
        </div>
      )}

      {/* Cyberpunk On-Screen Virtual Keyboard */}
      <div className="w-full max-w-md flex flex-col gap-1 mt-2">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1">
            {row.map((key) => {
              const isSpecial = key === 'ENTER' || key === 'BACK';
              const status = keyStatusMap[key];

              let keyClass =
                'bg-bg-primary/40 border-border-subtle text-text-primary hover:border-accent-cyan';
              if (status === 'correct') {
                keyClass = 'bg-accent-cyan border-accent-cyan text-white';
              } else if (status === 'present') {
                keyClass = 'bg-warning-amber border-warning-amber text-white';
              } else if (status === 'absent') {
                keyClass =
                  'bg-bg-primary/70 border-border-subtle text-text-secondary opacity-40';
              }

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (key === 'ENTER') handleEnter();
                    else if (key === 'BACK') handleDelete();
                    else handleCharInput(key);
                  }}
                  className={`py-2 rounded-md border font-mono font-bold text-[10px] md:text-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
                    isSpecial
                      ? 'px-2 md:px-3 text-[9px] md:text-[10px]'
                      : 'w-7 md:w-8'
                  } ${keyClass}`}
                  aria-label={key}
                >
                  {key === 'BACK' ? (
                    <Delete className="w-3 h-3" />
                  ) : key === 'ENTER' ? (
                    <CornerDownLeft className="w-3 h-3" />
                  ) : (
                    key
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default CyberBreachGame;
