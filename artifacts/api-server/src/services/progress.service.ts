import { progressRepository, type ProgressData } from "../repositories/progress.repository";

export class ProgressService {
  async getProgress(userId: string): Promise<Record<string, ProgressData>> {
    return progressRepository.getProgressByUserId(userId);
  }

  async saveProgress(params: {
    userId: string;
    patternId: string;
    attempts: number;
    correct: number;
    box: number;
    note: string;
  }) {
    return progressRepository.upsertProgress(params);
  }

  async getBookmarks(userId: string): Promise<string[]> {
    return progressRepository.getBookmarksByUserId(userId);
  }

  async toggleBookmark(userId: string, patternId: string) {
    return progressRepository.toggleBookmark(userId, patternId);
  }
}

export const progressService = new ProgressService();
