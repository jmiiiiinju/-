import { Difficulty, HighScoreRecord } from '../types/tetris';

const STORAGE_KEY_PREFIX = 'neon_tetris_highscore_v2_';

const DEFAULT_SCORES: Record<Difficulty, HighScoreRecord> = {
  easy: { score: 0, date: '', lines: 0, level: 1 },
  normal: { score: 0, date: '', lines: 0, level: 1 },
  hard: { score: 0, date: '', lines: 0, level: 1 },
};

export function getHighScores(): Record<Difficulty, HighScoreRecord> {
  const result: Record<Difficulty, HighScoreRecord> = { ...DEFAULT_SCORES };

  (['easy', 'normal', 'hard'] as Difficulty[]).forEach((diff) => {
    try {
      const data = localStorage.getItem(`${STORAGE_KEY_PREFIX}${diff}`);
      if (data) {
        const parsed = JSON.parse(data);
        if (typeof parsed.score === 'number') {
          result[diff] = parsed;
        }
      }
    } catch {
      // In case localStorage is blocked
    }
  });

  return result;
}

export function saveHighScore(
  difficulty: Difficulty,
  score: number,
  lines: number,
  level: number
): { isNewHighScore: boolean; previousHigh: number } {
  const currentRecords = getHighScores();
  const currentRecord = currentRecords[difficulty];
  const previousHigh = currentRecord.score;

  if (score > previousHigh) {
    const newRecord: HighScoreRecord = {
      score,
      date: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
      lines,
      level,
    };

    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}${difficulty}`, JSON.stringify(newRecord));
    } catch {
      // Ignore
    }

    return { isNewHighScore: true, previousHigh };
  }

  return { isNewHighScore: false, previousHigh };
}
