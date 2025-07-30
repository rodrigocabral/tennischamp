export interface Player {
  id: string;
  name: string;
  nickname: string;
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
  courtNumber?: number;
  timeSlot?: string;
}

export interface BracketMatch extends Match {
  round: 'SEMIFINALS' | 'FINAL' | 'THIRD_PLACE';
}

export interface Tournament {
  players: Player[];
  matches: Match[];
  phase: 'GROUP' | 'FINAL';
  bracketMatches: BracketMatch[];
  numberOfCourts: number;
  matchesDrawn: boolean;
}
