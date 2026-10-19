import { Difficulty, DifficultyConfig, TetrominoType } from '../types/tetris';

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export interface PieceDefinition {
  shape: number[][];
  color: string;
  glow: string;
  border: string;
  previewOffset?: { x: number; y: number };
}

export const TETROMINOES: Record<TetrominoType, PieceDefinition> = {
  I: {
    shape: [
      [0, 0, 0, 0],
      [1, 1, 1, 1],
      [0, 0, 0, 0],
      [0, 0, 0, 0],
    ],
    color: '#06b6d4', // Cyan
    glow: 'rgba(6, 182, 212, 0.75)',
    border: '#67e8f9',
  },
  J: {
    shape: [
      [1, 0, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#3b82f6', // Blue
    glow: 'rgba(59, 130, 246, 0.75)',
    border: '#93c5fd',
  },
  L: {
    shape: [
      [0, 0, 1],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#f97316', // Orange
    glow: 'rgba(249, 115, 22, 0.75)',
    border: '#fdba74',
  },
  O: {
    shape: [
      [1, 1],
      [1, 1],
    ],
    color: '#eab308', // Yellow
    glow: 'rgba(234, 179, 8, 0.75)',
    border: '#fef08a',
  },
  S: {
    shape: [
      [0, 1, 1],
      [1, 1, 0],
      [0, 0, 0],
    ],
    color: '#22c55e', // Green
    glow: 'rgba(34, 197, 94, 0.75)',
    border: '#86efac',
  },
  T: {
    shape: [
      [0, 1, 0],
      [1, 1, 1],
      [0, 0, 0],
    ],
    color: '#a855f7', // Purple
    glow: 'rgba(168, 85, 247, 0.75)',
    border: '#d8b4fe',
  },
  Z: {
    shape: [
      [1, 1, 0],
      [0, 1, 1],
      [0, 0, 0],
    ],
    color: '#ef4444', // Red
    glow: 'rgba(239, 68, 68, 0.75)',
    border: '#fca5a5',
  },
};

export const GARBAGE_BLOCK = {
  type: 'garbage' as const,
  color: '#475569',
  glow: 'rgba(100, 116, 139, 0.5)',
  border: '#94a3b8',
};

export const DIFFICULTIES: Record<Difficulty, DifficultyConfig> = {
  easy: {
    id: 'easy',
    name: '쉬움',
    nameEn: 'EASY',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40',
    borderColor: 'border-emerald-500',
    description: '방해 블록 0줄, 편안하고 여유로운 속도로 누구나 쉽게 즐길 수 있는 모드',
    initialSpeed: 850,
    minSpeed: 300,
    speedStep: 45,
    garbageRows: 0,
    scoreMultiplier: 1.0,
  },
  normal: {
    id: 'normal',
    name: '보통',
    nameEn: 'NORMAL',
    badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40',
    borderColor: 'border-cyan-500',
    description: '방해 블록 3줄, 표준 아케이드 속도로 긴장감과 재미를 모두 잡은 표준 모드',
    initialSpeed: 600,
    minSpeed: 180,
    speedStep: 40,
    garbageRows: 3,
    scoreMultiplier: 1.5,
  },
  hard: {
    id: 'hard',
    name: '어려움',
    nameEn: 'HARD',
    badgeColor: 'bg-rose-500/20 text-rose-400 border-rose-500/40',
    borderColor: 'border-rose-500',
    description: '방해 블록 6줄, 초고속 낙하! 고수 플레이어를 위한 극한의 도전과 2.5배 점수 배율',
    initialSpeed: 320,
    minSpeed: 80,
    speedStep: 28,
    garbageRows: 6,
    scoreMultiplier: 2.5,
  },
};

// Standard Line Clear Scores (multiplied by level and difficulty multiplier)
export const LINE_SCORES = {
  single: 100,
  double: 300,
  triple: 500,
  tetris: 800,
  softDropPerCell: 1,
  hardDropPerCell: 2,
};

// Shuffles an array using Fisher-Yates algorithm
export function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// 7-Bag Generator
export function generateBag(): TetrominoType[] {
  const pieces: TetrominoType[] = ['I', 'J', 'L', 'O', 'S', 'T', 'Z'];
  return shuffleArray(pieces);
}

// Generates starting garbage rows with 1-2 random gaps each
export function generateGarbageRows(rowCount: number): (import('../types/tetris').BlockCell | null)[][] {
  const rows: (import('../types/tetris').BlockCell | null)[][] = [];
  
  for (let r = 0; r < rowCount; r++) {
    const row = new Array(BOARD_WIDTH).fill(null);
    // 1 to 2 random hole positions per row so player can clear them
    const holePos1 = Math.floor(Math.random() * BOARD_WIDTH);
    let holePos2 = Math.floor(Math.random() * BOARD_WIDTH);
    if (Math.random() > 0.4) {
      while (holePos2 === holePos1) {
        holePos2 = Math.floor(Math.random() * BOARD_WIDTH);
      }
    } else {
      holePos2 = -1;
    }

    for (let c = 0; c < BOARD_WIDTH; c++) {
      if (c !== holePos1 && c !== holePos2) {
        row[c] = {
          type: 'garbage',
          color: '#334155',
          glow: 'rgba(71, 85, 105, 0.6)',
          border: '#64748b',
        };
      }
    }
    rows.push(row);
  }
  return rows;
}
