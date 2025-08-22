import { api } from './api';
import { Match } from '../types/profile';

interface MatchResponse {
  matches: Match[];
  hasMore: boolean;
  nextPage?: string;
}

interface MessageData {
  content: string;
  type: 'text' | 'image';
}

export const matchService = {
  async getMatches(page?: string): Promise<MatchResponse> {
    const params = page ? { page } : undefined;
    return api.get<MatchResponse>('/matches', params);
  },

  async getMatch(id: string): Promise<Match> {
    return api.get<Match>(`/matches/${id}`);
  },

  async sendMessage(matchId: string, message: MessageData): Promise<void> {
    return api.post(`/matches/${matchId}/messages`, message);
  },

  async unmatch(matchId: string): Promise<void> {
    return api.delete(`/matches/${matchId}`);
  },
};
