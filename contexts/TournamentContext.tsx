import { Player, Tournament } from "@/types";
import { generateInitialMatches, getPlayerRanking } from "@/lib/tournament";
import { createContext, useContext, useEffect, useState } from "react";

interface TournamentContextType {
  tournament: Tournament;
  playerLimit: number;
  setPlayerLimit: (limit: number) => void;
  addPlayer: (player: Omit<Player, "id" | "points" | "gamesWon" | "gamesLost" | "matchesPlayed">) => void;
  updateMatch: (matchId: string, player1Games: number, player2Games: number) => void;
  resetTournament: () => void;
  startNextPhase: () => void;
  canAdvancePhase: boolean;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export function TournamentProvider({ children }: { children: React.ReactNode }) {
  const [tournament, setTournament] = useState<Tournament>({
    players: [],
    matches: [],
    phase: 'GROUP',
    bracketMatches: []
  });

  const [playerLimit, setPlayerLimit] = useState<number>(5);

  useEffect(() => {
    // Load from localStorage on mount
    const savedTournament = localStorage.getItem('tennis-tournament');
    const savedPlayerLimit = localStorage.getItem('tennis-tournament-player-limit');
    
    if (savedTournament) {
      const tournament = JSON.parse(savedTournament);
      // Migrate existing data to include points field if it doesn't exist
      tournament.players = tournament.players.map((player: Player | Omit<Player, 'points'>) => ({
        ...player,
        points: 'points' in player ? player.points : 0
      }));
      setTournament(tournament);
    }
    if (savedPlayerLimit) {
      setPlayerLimit(JSON.parse(savedPlayerLimit));
    }
  }, []);

  useEffect(() => {
    // Save to localStorage on tournament changes
    localStorage.setItem('tennis-tournament', JSON.stringify(tournament));
  }, [tournament]);

  useEffect(() => {
    // Save player limit to localStorage
    localStorage.setItem('tennis-tournament-player-limit', JSON.stringify(playerLimit));
  }, [playerLimit]);

  const addPlayer = (playerData: Omit<Player, "id" | "points" | "gamesWon" | "gamesLost" | "matchesPlayed">) => {
    if (tournament.players.length >= playerLimit) {
      throw new Error(`Limite de ${playerLimit} jogadores atingido`);
    }

    const newPlayer: Player = {
      ...playerData,
      id: crypto.randomUUID(),
      points: 0,
      gamesWon: 0,
      gamesLost: 0,
      matchesPlayed: []
    };

    setTournament(prev => {
      const newPlayers = [...prev.players, newPlayer];
      return {
        ...prev,
        players: newPlayers,
        matches: generateInitialMatches(newPlayers)
      };
    });
  };

  const updateMatch = (matchId: string, player1Games: number, player2Games: number) => {
    setTournament(prev => ({
      ...prev,
      matches: prev.matches.map(match => 
        match.id === matchId
          ? { ...match, player1Games, player2Games, completed: true }
          : match
      ),
      bracketMatches: prev.bracketMatches.map(match =>
        match.id === matchId
          ? { ...match, player1Games, player2Games, completed: true }
          : match
      )
    }));
  };

  const resetTournament = () => {
    localStorage.removeItem('tennis-tournament');
    setTournament({
      players: [],
      matches: [],
      phase: 'GROUP',
      bracketMatches: []
    });
  };

  const generateBracketMatches = (topPlayers: Player[]) => {
    // Precisamos de pelo menos 4 jogadores para ter final e disputa do terceiro lugar
    if (topPlayers.length < 4) {
      return [];
    }
    
    // Final: 1º vs 2º lugar
    const final = {
      id: 'final',
      player1Id: topPlayers[0].id, // 1º lugar
      player2Id: topPlayers[1].id, // 2º lugar
      player1Games: 0,
      player2Games: 0,
      completed: false,
      date: new Date().toISOString(),
      round: 'FINAL' as const
    };

    // Disputa do terceiro lugar: 3º vs 4º lugar
    const thirdPlace = {
      id: 'third-place',
      player1Id: topPlayers[2].id, // 3º lugar
      player2Id: topPlayers[3].id, // 4º lugar
      player1Games: 0,
      player2Games: 0,
      completed: false,
      date: new Date().toISOString(),
      round: 'THIRD_PLACE' as const
    };

    return [thirdPlace, final];
  };

  const startNextPhase = () => {
    if (tournament.phase === 'GROUP') {
      // Pegamos os 4 melhores jogadores para criar a final e disputa do terceiro lugar
      const topPlayers = getPlayerRanking(tournament).slice(0, 4);
      setTournament(prev => ({
        ...prev,
        phase: 'FINAL',
        bracketMatches: generateBracketMatches(topPlayers)
      }));
    }
  };

  const canAdvancePhase = (() => {
    if (tournament.phase === 'GROUP') {
      return tournament.matches.every(match => match.completed) && 
             tournament.players.length === playerLimit &&
             tournament.players.length >= 4; // Precisamos de pelo menos 4 jogadores
    }
    return false;
  })();

  return (
    <TournamentContext.Provider 
      value={{ 
        tournament,
        playerLimit,
        setPlayerLimit,
        addPlayer, 
        updateMatch, 
        resetTournament,
        startNextPhase,
        canAdvancePhase
      }}
    >
      {children}
    </TournamentContext.Provider>
  );
}

export function useTournament() {
  const context = useContext(TournamentContext);
  if (context === undefined) {
    throw new Error('useTournament must be used within a TournamentProvider');
  }
  return context;
} 