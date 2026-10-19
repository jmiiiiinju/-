import { ActivePiece, Difficulty, Grid, TetrominoType } from '../types/tetris';
import { BOARD_HEIGHT, BOARD_WIDTH, DIFFICULTIES, LINE_SCORES, TETROMINOES } from './tetrisConstants';

// Rotates an N x N matrix clockwise
export function rotateMatrixClockwise(matrix: number[][]): number[][] {
  const n = matrix.length;
  const result: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      result[c][n - 1 - r] = matrix[r][c];
    }
  }
  return result;
}

// Rotates an N x N matrix counter-clockwise
export function rotateMatrixCounterClockwise(matrix: number[][]): number[][] {
  const n = matrix.length;
  const result: number[][] = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      result[n - 1 - c][r] = matrix[r][c];
    }
  }
  return result;
}

// Creates an empty grid (BOARD_HEIGHT x BOARD_WIDTH)
export function createEmptyGrid(): Grid {
  return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(null));
}

// Checks if a piece collides with walls, floor, or existing blocks
export function checkCollision(
  piece: { shape: number[][]; x: number; y: number },
  grid: Grid,
  offsetX = 0,
  offsetY = 0
): boolean {
  const { shape, x, y } = piece;
  const targetX = x + offsetX;
  const targetY = y + offsetY;

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] !== 0) {
        const boardX = targetX + c;
        const boardY = targetY + r;

        // Check horizontal boundaries
        if (boardX < 0 || boardX >= BOARD_WIDTH) {
          return true;
        }

        // Check bottom boundary
        if (boardY >= BOARD_HEIGHT) {
          return true;
        }

        // If above board (spawn area), only allow if boardY >= 0 for block check
        if (boardY >= 0 && grid[boardY] && grid[boardY][boardX] !== null) {
          return true;
        }
      }
    }
  }

  return false;
}

// Computes the ghost piece position (how far down it can drop without collision)
export function getGhostY(piece: ActivePiece, grid: Grid): number {
  let ghostY = piece.y;
  while (!checkCollision(piece, grid, 0, ghostY - piece.y + 1)) {
    ghostY++;
  }
  return ghostY;
}

// Attempts rotation with wall kicks
export function tryRotate(
  piece: ActivePiece,
  grid: Grid,
  clockwise = true
): { newShape: number[][]; newX: number; newY: number } | null {
  const newShape = clockwise
    ? rotateMatrixClockwise(piece.shape)
    : rotateMatrixCounterClockwise(piece.shape);

  // Wall kick tests (offsets in x, y to test)
  const kicks = [
    { x: 0, y: 0 },
    { x: -1, y: 0 },
    { x: 1, y: 0 },
    { x: -2, y: 0 },
    { x: 2, y: 0 },
    { x: 0, y: -1 },
    { x: -1, y: -1 },
    { x: 1, y: -1 },
  ];

  for (const kick of kicks) {
    const testPiece = {
      shape: newShape,
      x: piece.x + kick.x,
      y: piece.y + kick.y,
    };
    if (!checkCollision(testPiece, grid, 0, 0)) {
      return {
        newShape,
        newX: piece.x + kick.x,
        newY: piece.y + kick.y,
      };
    }
  }

  return null;
}

// Merges active piece into grid
export function mergePieceToGrid(piece: ActivePiece, grid: Grid): Grid {
  const newGrid = grid.map((row) => [...row]);
  const { shape, x, y, color, glow, border, type } = piece;

  for (let r = 0; r < shape.length; r++) {
    for (let c = 0; c < shape[r].length; c++) {
      if (shape[r][c] !== 0) {
        const boardX = x + c;
        const boardY = y + r;
        if (boardY >= 0 && boardY < BOARD_HEIGHT && boardX >= 0 && boardX < BOARD_WIDTH) {
          newGrid[boardY][boardX] = {
            type,
            color,
            glow,
            border,
          };
        }
      }
    }
  }

  return newGrid;
}

// Checks and clears full rows, returns new grid and cleared row count/indices
export function checkLineClears(grid: Grid): { newGrid: Grid; clearedIndices: number[]; count: number } {
  const clearedIndices: number[] = [];
  const remainingRows: (import('../types/tetris').BlockCell | null)[][] = [];

  for (let r = 0; r < BOARD_HEIGHT; r++) {
    const isFull = grid[r].every((cell) => cell !== null);
    if (isFull) {
      clearedIndices.push(r);
    } else {
      remainingRows.push([...grid[r]]);
    }
  }

  const count = clearedIndices.length;
  if (count === 0) {
    return { newGrid: grid, clearedIndices: [], count: 0 };
  }

  // Prepend empty rows at top
  const newRows: (import('../types/tetris').BlockCell | null)[][] = Array.from(
    { length: count },
    () => Array(BOARD_WIDTH).fill(null)
  );

  return {
    newGrid: [...newRows, ...remainingRows],
    clearedIndices,
    count,
  };
}

// Spawns a new active piece given type
export function createNewPiece(type: TetrominoType): ActivePiece {
  const def = TETROMINOES[type];
  const shape = def.shape.map((row) => [...row]);
  // Center horizontally
  const x = Math.floor((BOARD_WIDTH - shape[0].length) / 2);
  const y = type === 'I' ? -1 : 0; // standard spawn row

  return {
    type,
    shape,
    x,
    y,
    color: def.color,
    glow: def.glow,
    border: def.border,
  };
}

// Calculate score for cleared lines
export function calculateLineScore(
  linesCleared: number,
  level: number,
  difficulty: Difficulty,
  combo: number
): { points: number; label: string; isTetris: boolean } {
  if (linesCleared === 0) return { points: 0, label: '', isTetris: false };

  const multiplier = DIFFICULTIES[difficulty].scoreMultiplier;
  let basePoints = 0;
  let label = '';
  let isTetris = false;

  switch (linesCleared) {
    case 1:
      basePoints = LINE_SCORES.single;
      label = 'SINGLE!';
      break;
    case 2:
      basePoints = LINE_SCORES.double;
      label = 'DOUBLE!!';
      break;
    case 3:
      basePoints = LINE_SCORES.triple;
      label = 'TRIPLE!!!';
      break;
    case 4:
      basePoints = LINE_SCORES.tetris;
      label = 'TETRIS!!!!';
      isTetris = true;
      break;
    default:
      basePoints = linesCleared * 200;
      label = `${linesCleared} LINES!`;
  }

  const comboBonus = combo > 1 ? (combo - 1) * 50 * level : 0;
  const totalPoints = Math.round((basePoints * level + comboBonus) * multiplier);

  return { points: totalPoints, label, isTetris };
}

// Calculates drop interval (ms) for given level and difficulty
export function getDropSpeed(level: number, difficulty: Difficulty): number {
  const config = DIFFICULTIES[difficulty];
  const speed = config.initialSpeed - (level - 1) * config.speedStep;
  return Math.max(config.minSpeed, speed);
}
