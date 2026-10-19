export type TetrominoType = 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface DifficultyConfig {
  id: Difficulty;
  name: string;
  nameEn: string;
  badgeColor: string;
  borderColor: string;
  description: string;
  initialSpeed: number; // in milliseconds
  minSpeed: number;
  speedStep: number;
  garbageRows: number; // number of pre-stacked rows with random holes at start
  scoreMultiplier: number;
}

export interface BlockCell {
  type: TetrominoType | 'garbage';
  color: string;
  glow: string;
  border: string;
}

export type Grid = (BlockCell | null)[][];

export interface ActivePiece {
  type: TetrominoType;
  shape: number[][];
  x: number;
  y: number;
  color: string;
  glow: string;
  border: string;
}

export interface GameStats {
  singles: number;
  doubles: number;
  triples: number;
  tetrises: number;
  maxCombo: number;
  piecesDropped: number;
  startTime: number;
  durationSeconds: number;
}

export interface FloatingNotice {
  id: number;
  text: string;
  subText?: string;
  type: 'single' | 'double' | 'triple' | 'tetris' | 'combo' | 'levelup' | 'highscore';
}

export interface HighScoreRecord {
  score: number;
  date: string;
  lines: number;
  level: number;
}
