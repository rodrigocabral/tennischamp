export interface Player {
  id: string;
  name: string;
  nickname: string;
  photoUrl: string;
  points: number;
  gamesWon: number;
  gamesLost: number;
  matchesPlayed: string[];
}

export interface Match {
  id: string;
  player1Id: string;
  player2Id: string;
  player1Games: number;
  player2Games: number;
  completed: boolean;
  date: string;
}

export interface BracketMatch extends Match {
  round: 'SEMIFINALS' | 'FINAL';
}

export interface Tournament {
  players: Player[];
  matches: Match[];
  phase: 'GROUP' | 'SEMIFINALS' | 'FINAL';
  bracketMatches: BracketMatch[];
} 