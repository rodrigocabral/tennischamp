import { Player, Tournament, Match } from "@/types";
import { generateInitialMatches, getPlayerRanking } from "@/lib/tournament";
import { createContext, useContext, useEffect, useState } from "react";

interface TournamentContextType {
  tournament: Tournament;
  playerLimit: number;
  setPlayerLimit: (limit: number) => void;
  numberOfCourts: number;
  setNumberOfCourts: (courts: number) => void;
  addPlayer: (player: Omit<Player, "id" | "points" | "gamesWon" | "gamesLost" | "matchesPlayed">) => void;
  updateMatch: (matchId: string, player1Games: number, player2Games: number) => void;
  resetTournament: () => void;
  startNextPhase: () => void;
  canAdvancePhase: boolean;
  drawMatches: () => void;
  canDrawMatches: boolean;
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined);

export function TournamentProvider({ children }: { children: React.ReactNode }) {
  const [tournament, setTournament] = useState<Tournament>({
    players: [],
    matches: [],
    phase: 'GROUP',
    bracketMatches: [],
    numberOfCourts: 2,
    matchesDrawn: false
  });

  const [playerLimit, setPlayerLimit] = useState<number>(5);
  const [numberOfCourts, setNumberOfCourts] = useState<number>(2);

  useEffect(() => {
    // Load from localStorage on mount
    const savedTournament = localStorage.getItem('tennis-tournament');
    const savedPlayerLimit = localStorage.getItem('tennis-tournament-player-limit');
    const savedNumberOfCourts = localStorage.getItem('tennis-tournament-courts');
    
    if (savedTournament) {
      const tournament = JSON.parse(savedTournament);
      // Migrate existing data to include new fields if they don't exist
      tournament.players = tournament.players.map((player: Player | Omit<Player, 'points'>) => ({
        ...player,
        points: 'points' in player ? player.points : 0
      }));
      
      // Migrate tournament to include new fields
      if (!('numberOfCourts' in tournament)) {
        tournament.numberOfCourts = 2;
      }
      if (!('matchesDrawn' in tournament)) {
        tournament.matchesDrawn = false;
      }
      
      setTournament(tournament);
      if (tournament.numberOfCourts) {
        setNumberOfCourts(tournament.numberOfCourts);
      }
    }
    if (savedPlayerLimit) {
      setPlayerLimit(JSON.parse(savedPlayerLimit));
    }
    if (savedNumberOfCourts) {
      setNumberOfCourts(JSON.parse(savedNumberOfCourts));
    }
  }, []);

  useEffect(() => {
    // Save to localStorage on tournament changes
    localStorage.setItem('tennis-tournament', JSON.stringify(tournament));
  }, [tournament]);

  useEffect(() => {
    // Save playerLimit to localStorage
    localStorage.setItem('tennis-tournament-player-limit', JSON.stringify(playerLimit));
  }, [playerLimit]);

  useEffect(() => {
    // Save numberOfCourts to localStorage
    localStorage.setItem('tennis-tournament-courts', JSON.stringify(numberOfCourts));
  }, [numberOfCourts]);

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
        // Só gera partidas se já foram sorteadas antes (para não quebrar tournaments existentes)
        matches: prev.matchesDrawn ? generateInitialMatches(newPlayers) : []
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
      bracketMatches: [],
      numberOfCourts: 2,
      matchesDrawn: false
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

  const canDrawMatches = (() => {
    return tournament.players.length === playerLimit && 
           tournament.players.length >= 4 && 
           !tournament.matchesDrawn &&
           numberOfCourts > 0;
  })();

  const drawMatches = () => {
    if (!canDrawMatches) return;

    const matches = generateInitialMatches(tournament.players);
    const matchesWithSchedule = assignMatchesToCourts(matches, numberOfCourts);
    
    setTournament(prev => ({
      ...prev,
      matches: matchesWithSchedule,
      numberOfCourts,
      matchesDrawn: true
    }));
  };

  const assignMatchesToCourts = (matches: Match[], courts: number) => {
    const timeSlots = ['09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'];
    const scheduledMatches: Match[] = [];
    
    // Objeto para rastrear jogadores ocupados por horário
    const busyPlayers: { [timeSlot: string]: Set<string> } = {};
    
    // Inicializar conjuntos de jogadores ocupados para cada horário
    timeSlots.forEach(slot => {
      busyPlayers[slot] = new Set<string>();
    });
    
    // Embaralhar partidas para distribuição mais equilibrada
    const shuffledMatches = [...matches].sort(() => Math.random() - 0.5);
    
    // Tentar agendar cada partida
    for (const match of shuffledMatches) {
      let scheduled = false;
      
      // Tentar cada horário até encontrar um disponível
      for (const timeSlot of timeSlots) {
        // Verificar se algum dos jogadores já está ocupado neste horário
        const player1Busy = busyPlayers[timeSlot].has(match.player1Id);
        const player2Busy = busyPlayers[timeSlot].has(match.player2Id);
        
        if (!player1Busy && !player2Busy) {
          // Contar quantas partidas já foram agendadas neste horário
          const matchesInSlot = scheduledMatches.filter(m => m.timeSlot === timeSlot).length;
          
          // Se ainda há quadras disponíveis neste horário
          if (matchesInSlot < courts) {
            const courtNumber = matchesInSlot + 1;
            
            // Agendar a partida
            scheduledMatches.push({
              ...match,
              courtNumber,
              timeSlot
            });
            
            // Marcar jogadores como ocupados neste horário
            busyPlayers[timeSlot].add(match.player1Id);
            busyPlayers[timeSlot].add(match.player2Id);
            
            scheduled = true;
            break;
          }
        }
      }
      
      // Se não conseguiu agendar em nenhum horário padrão, usar horários extras
      if (!scheduled) {
        const extraTimeSlot = `${18 + Math.floor(scheduledMatches.length / courts)}:00`;
        const courtNumber = (scheduledMatches.length % courts) + 1;
        
        scheduledMatches.push({
          ...match,
          courtNumber,
          timeSlot: extraTimeSlot
        });
      }
    }
    
    return scheduledMatches;
  };

  return (
    <TournamentContext.Provider 
      value={{ 
        tournament,
        playerLimit,
        setPlayerLimit,
        numberOfCourts,
        setNumberOfCourts,
        addPlayer, 
        updateMatch, 
        resetTournament,
        startNextPhase,
        canAdvancePhase,
        drawMatches,
        canDrawMatches
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