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
    const numSemiFinals = Math.floor(playerLimit * 0.8); // 80% dos jogadores vão para as semifinais
    
    // Generate semifinals matches
    const semiFinals = [];
    for (let i = 0; i < numSemiFinals; i += 2) {
      if (i + 1 < numSemiFinals) {
        semiFinals.push({
          id: `semi${(i/2)+1}`,
          player1Id: topPlayers[i].id,
          player2Id: topPlayers[i + 1].id,
          player1Games: 0,
          player2Games: 0,
          completed: false,
          date: new Date().toISOString(),
          round: 'SEMIFINALS' as const
        });
      }
    }

    // Generate final match (players will be determined after semifinals)
    const final = {
      id: 'final',
      player1Id: '',
      player2Id: '',
      player1Games: 0,
      player2Games: 0,
      completed: false,
      date: new Date().toISOString(),
      round: 'FINAL' as const
    };

    return [...semiFinals, final];
  };

  const startNextPhase = () => {
    if (tournament.phase === 'GROUP') {
      const numSemiFinals = Math.floor(playerLimit * 0.8);
      const topPlayers = getPlayerRanking(tournament).slice(0, numSemiFinals);
      setTournament(prev => ({
        ...prev,
        phase: 'SEMIFINALS',
        bracketMatches: generateBracketMatches(topPlayers)
      }));
    } else if (tournament.phase === 'SEMIFINALS') {
      // Find winners of semifinals
      const semiFinals = tournament.bracketMatches.filter(m => m.round === 'SEMIFINALS');
      const winners = semiFinals.map(match => {
        return match.player1Games > match.player2Games ? match.player1Id : match.player2Id;
      });

      setTournament(prev => ({
        ...prev,
        phase: 'FINAL',
        bracketMatches: prev.bracketMatches.map(match =>
          match.id === 'final'
            ? { ...match, player1Id: winners[0], player2Id: winners[1] }
            : match
        )
      }));
    }
  };

  const canAdvancePhase = (() => {
    if (tournament.phase === 'GROUP') {
      return tournament.matches.every(match => match.completed) && 
             tournament.players.length === playerLimit;
    } else if (tournament.phase === 'SEMIFINALS') {
      return tournament.bracketMatches
        .filter(match => match.round === 'SEMIFINALS')
        .every(match => match.completed);
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