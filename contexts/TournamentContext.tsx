import {
  addBracketMatch,
  addMatch,
  addPlayer as addPlayerToFirestore,
  createTournament,
  createTournamentSettings,
  deleteAllMatches,
  deleteTournament,
  getBracketMatches,
  getMatches,
  getPlayers,
  getTournament,
  getTournamentSettings,
  subscribeMatches,
  subscribePlayers,
  subscribeSettings,
  updateMatch as updateMatchInFirestore,
  updateTournament,
  updateTournamentSettings,
  type FirestoreBracketMatch,
  type FirestoreMatch,
  type FirestorePlayer,
  type TournamentSettings,
} from '@/lib/firestore';
import { generateInitialMatches, getPlayerRanking } from '@/lib/tournament';
import { useTournamentId } from '@/lib/useTournamentId';
import { Match, Player, Tournament } from '@/types';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

interface TournamentContextType {
  tournament: Tournament;
  tournamentId: string | null;
  playerLimit: number;
  setPlayerLimit: (limit: number) => void;
  numberOfCourts: number;
  setNumberOfCourts: (courts: number) => void;
  addPlayer: (
    player: Omit<
      Player,
      'id' | 'points' | 'gamesWon' | 'gamesLost' | 'matchesPlayed'
    >
  ) => Promise<void>;
  updateMatch: (
    matchId: string,
    player1Games: number,
    player2Games: number
  ) => Promise<void>;
  resetTournament: () => Promise<void>;
  createNewTournament: () => Promise<void>;
  startNextPhase: () => Promise<void>;
  canAdvancePhase: boolean;
  drawMatches: () => Promise<void>;
  canDrawMatches: boolean;
  loading: boolean;
  error: string | null;
}

const TournamentContext = createContext<TournamentContextType | undefined>(
  undefined
);

export function TournamentProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { tournamentId, setCurrentTournament } = useTournamentId();
  const [tournament, setTournament] = useState<Tournament>({
    players: [],
    matches: [],
    phase: 'GROUP',
    bracketMatches: [],
    numberOfCourts: 2,
    matchesDrawn: false,
  });

  const [playerLimit, setPlayerLimit] = useState<number>(5);
  const [numberOfCourts, setNumberOfCourts] = useState<number>(2);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Carrega dados do torneio atual quando tournamentId muda
  useEffect(() => {
    if (!tournamentId) {
      // Reset tournament data when no tournament is selected
      setTournament({
        players: [],
        matches: [],
        phase: 'GROUP',
        bracketMatches: [],
        numberOfCourts: 2,
        matchesDrawn: false,
      });
      return;
    }

    const loadTournamentData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Carrega dados do torneio
        const tournamentData = await getTournament(tournamentId);
        if (!tournamentData) {
          throw new Error('Torneio não encontrado');
        }

        // Carrega configurações
        const settings = await getTournamentSettings(tournamentId);
        if (settings) {
          setPlayerLimit(settings.playerLimit);
          setNumberOfCourts(settings.numberOfCourts);
        }

        // Carrega jogadores
        const players = await getPlayers(tournamentId);

        // Carrega partidas
        const matches = await getMatches(tournamentId);
        const bracketMatches = await getBracketMatches(tournamentId);

        // Converte FirestorePlayer para Player
        const convertedPlayers: Player[] = players.map(p => ({
          id: p.id,
          name: p.name,
          nickname: p.nickname,
          points: p.points,
          gamesWon: p.gamesWon,
          gamesLost: p.gamesLost,
          matchesPlayed: p.matchesPlayed,
        }));

        // Converte FirestoreMatch para Match
        const convertedMatches: Match[] = matches.map(m => ({
          id: m.id,
          player1Id: m.player1Id,
          player2Id: m.player2Id,
          player1Games: m.player1Games,
          player2Games: m.player2Games,
          completed: m.completed,
          date: m.date,
          courtNumber: m.courtNumber,
          timeSlot: m.timeSlot,
        }));

        // Converte FirestoreBracketMatch para BracketMatch
        const convertedBracketMatches = bracketMatches.map(m => ({
          id: m.id,
          player1Id: m.player1Id,
          player2Id: m.player2Id,
          player1Games: m.player1Games,
          player2Games: m.player2Games,
          completed: m.completed,
          date: m.date,
          courtNumber: m.courtNumber,
          timeSlot: m.timeSlot,
          round: m.round,
        }));

        setTournament({
          ...tournamentData,
          players: convertedPlayers,
          matches: convertedMatches,
          bracketMatches: convertedBracketMatches,
        });
      } catch (error) {
        console.error('Erro ao carregar torneio:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    };

    loadTournamentData();
  }, [tournamentId]);

  // Configura listeners em tempo real
  useEffect(() => {
    if (!tournamentId) return;

    const unsubscribers: Array<() => void> = [];

    // Listener para jogadores
    const unsubscribePlayers = subscribePlayers(
      tournamentId,
      (players: FirestorePlayer[]) => {
        const convertedPlayers: Player[] = players.map(p => ({
          id: p.id,
          name: p.name,
          nickname: p.nickname,
          points: p.points,
          gamesWon: p.gamesWon,
          gamesLost: p.gamesLost,
          matchesPlayed: p.matchesPlayed,
        }));

        setTournament(prev => ({
          ...prev,
          players: convertedPlayers,
        }));
      }
    );
    unsubscribers.push(unsubscribePlayers);

    // Listener para partidas
    const unsubscribeMatches = subscribeMatches(
      tournamentId,
      (matches: FirestoreMatch[], bracketMatches: FirestoreBracketMatch[]) => {
        const convertedMatches: Match[] = matches.map(m => ({
          id: m.id,
          player1Id: m.player1Id,
          player2Id: m.player2Id,
          player1Games: m.player1Games,
          player2Games: m.player2Games,
          completed: m.completed,
          date: m.date,
          courtNumber: m.courtNumber,
          timeSlot: m.timeSlot,
        }));

        const convertedBracketMatches = bracketMatches.map(m => ({
          id: m.id,
          player1Id: m.player1Id,
          player2Id: m.player2Id,
          player1Games: m.player1Games,
          player2Games: m.player2Games,
          completed: m.completed,
          date: m.date,
          courtNumber: m.courtNumber,
          timeSlot: m.timeSlot,
          round: m.round,
        }));

        setTournament(prev => ({
          ...prev,
          matches: convertedMatches,
          bracketMatches: convertedBracketMatches,
        }));
      }
    );
    unsubscribers.push(unsubscribeMatches);

    // Listener para configurações
    const unsubscribeSettings = subscribeSettings(
      tournamentId,
      (settings: TournamentSettings | null) => {
        if (settings) {
          setPlayerLimit(settings.playerLimit);
          setNumberOfCourts(settings.numberOfCourts);
        }
      }
    );
    unsubscribers.push(unsubscribeSettings);

    // Cleanup
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [tournamentId]);

  const createNewTournament = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const newTournamentId = await createTournament({
        phase: 'GROUP',
        numberOfCourts: 2,
        matchesDrawn: false,
      });

      await createTournamentSettings(newTournamentId, {
        playerLimit: 5,
        numberOfCourts: 2,
      });

      setCurrentTournament(newTournamentId);
    } catch (error) {
      console.error('Erro ao criar torneio:', error);
      setError(
        error instanceof Error ? error.message : 'Erro ao criar torneio'
      );
    } finally {
      setLoading(false);
    }
  }, [setCurrentTournament]);

  const addPlayerToTournament = useCallback(
    async (
      playerData: Omit<
        Player,
        'id' | 'points' | 'gamesWon' | 'gamesLost' | 'matchesPlayed'
      >
    ) => {
      if (!tournamentId) {
        throw new Error('Nenhum torneio selecionado');
      }

      if (tournament.players.length >= playerLimit) {
        throw new Error(`Limite de ${playerLimit} jogadores atingido`);
      }

      try {
        setError(null);
        await addPlayerToFirestore(tournamentId, {
          ...playerData,
          points: 0,
          gamesWon: 0,
          gamesLost: 0,
          matchesPlayed: [],
        });

        // Se as partidas já foram sorteadas, regenerar
        if (tournament.matchesDrawn) {
          await deleteAllMatches(tournamentId);
          const newMatches = generateInitialMatches(tournament.players);
          const scheduledMatches = assignMatchesToCourts(
            newMatches,
            numberOfCourts
          );

          for (const match of scheduledMatches) {
            await addMatch(tournamentId, match);
          }
        }
      } catch (error) {
        console.error('Erro ao adicionar jogador:', error);
        setError(
          error instanceof Error ? error.message : 'Erro ao adicionar jogador'
        );
        throw error;
      }
    },
    [
      tournamentId,
      tournament.players,
      tournament.matchesDrawn,
      playerLimit,
      numberOfCourts,
    ]
  );

  const updateMatchResult = useCallback(
    async (matchId: string, player1Games: number, player2Games: number) => {
      try {
        setError(null);
        await updateMatchInFirestore(matchId, {
          player1Games,
          player2Games,
          completed: true,
        });
      } catch (error) {
        console.error('Erro ao atualizar partida:', error);
        setError(
          error instanceof Error ? error.message : 'Erro ao atualizar partida'
        );
        throw error;
      }
    },
    []
  );

  const resetTournament = useCallback(async () => {
    if (!tournamentId) return;

    try {
      setLoading(true);
      setError(null);
      await deleteTournament(tournamentId);
      setCurrentTournament(null);
    } catch (error) {
      console.error('Erro ao resetar torneio:', error);
      setError(
        error instanceof Error ? error.message : 'Erro ao resetar torneio'
      );
    } finally {
      setLoading(false);
    }
  }, [tournamentId, setCurrentTournament]);

  const generateBracketMatches = (topPlayers: Player[]) => {
    if (topPlayers.length < 4) {
      return [];
    }

    const final = {
      id: 'final',
      player1Id: topPlayers[0].id,
      player2Id: topPlayers[1].id,
      player1Games: 0,
      player2Games: 0,
      completed: false,
      date: new Date().toISOString(),
      round: 'FINAL' as const,
    };

    const thirdPlace = {
      id: 'third-place',
      player1Id: topPlayers[2].id,
      player2Id: topPlayers[3].id,
      player1Games: 0,
      player2Games: 0,
      completed: false,
      date: new Date().toISOString(),
      round: 'THIRD_PLACE' as const,
    };

    return [thirdPlace, final];
  };

  const startNextPhase = useCallback(async () => {
    if (!tournamentId || tournament.phase !== 'GROUP') return;

    try {
      setError(null);
      const topPlayers = getPlayerRanking(tournament).slice(0, 4);
      const bracketMatches = generateBracketMatches(topPlayers);

      // Atualiza fase do torneio
      await updateTournament(tournamentId, { phase: 'FINAL' });

      // Adiciona partidas da fase final
      for (const match of bracketMatches) {
        await addBracketMatch(tournamentId, match);
      }
    } catch (error) {
      console.error('Erro ao avançar fase:', error);
      setError(error instanceof Error ? error.message : 'Erro ao avançar fase');
    }
  }, [tournamentId, tournament]);

  const canAdvancePhase = (() => {
    if (tournament.phase === 'GROUP') {
      return (
        tournament.matches.every(match => match.completed) &&
        tournament.players.length === playerLimit &&
        tournament.players.length >= 4
      );
    }
    return false;
  })();

  const canDrawMatches = (() => {
    return (
      tournament.players.length === playerLimit &&
      tournament.players.length >= 4 &&
      !tournament.matchesDrawn &&
      numberOfCourts > 0
    );
  })();

  const assignMatchesToCourts = (matches: Match[], courts: number) => {
    const timeSlots = [
      '08:00',
      '08:30',
      '09:00',
      '09:30',
      '10:00',
      '10:30',
      '11:00',
      '11:30',
      '12:00',
      '12:30',
      '13:00',
      '13:30',
      '14:00',
      '14:30',
      '15:00',
      '15:30',
      '16:00',
      '16:30',
      '17:00',
      '17:30',
      '18:00',
      '18:30',
      '19:00',
      '19:30',
      '20:00',
      '20:30',
      '21:00',
    ];
    const scheduledMatches: Match[] = [];

    const busyPlayers: { [timeSlot: string]: Set<string> } = {};
    const playerMatchCount: { [playerId: string]: number } = {};

    timeSlots.forEach(slot => {
      busyPlayers[slot] = new Set<string>();
    });

    const allPlayers = new Set<string>();
    matches.forEach(match => {
      allPlayers.add(match.player1Id);
      allPlayers.add(match.player2Id);
    });
    allPlayers.forEach(playerId => {
      playerMatchCount[playerId] = 0;
    });

    const calculateMatchPriority = (match: Match) => {
      const player1Count = playerMatchCount[match.player1Id];
      const player2Count = playerMatchCount[match.player2Id];
      const maxPossibleMatches = matches.length;
      const priority =
        maxPossibleMatches - player1Count + (maxPossibleMatches - player2Count);
      return priority + Math.random() * 0.1;
    };

    const remainingMatches = [...matches];

    for (const timeSlot of timeSlots) {
      let matchesInThisSlot = 0;

      while (matchesInThisSlot < courts && remainingMatches.length > 0) {
        remainingMatches.sort(
          (a, b) => calculateMatchPriority(b) - calculateMatchPriority(a)
        );

        let matchScheduled = false;

        for (let i = 0; i < remainingMatches.length; i++) {
          const match = remainingMatches[i];

          const player1Busy = busyPlayers[timeSlot].has(match.player1Id);
          const player2Busy = busyPlayers[timeSlot].has(match.player2Id);

          if (!player1Busy && !player2Busy) {
            const courtNumber = matchesInThisSlot + 1;

            scheduledMatches.push({
              ...match,
              courtNumber,
              timeSlot,
            });

            busyPlayers[timeSlot].add(match.player1Id);
            busyPlayers[timeSlot].add(match.player2Id);

            playerMatchCount[match.player1Id]++;
            playerMatchCount[match.player2Id]++;

            remainingMatches.splice(i, 1);

            matchesInThisSlot++;
            matchScheduled = true;
            break;
          }
        }

        if (!matchScheduled) {
          break;
        }
      }
    }

    let extraTimeSlotIndex = 18;
    while (remainingMatches.length > 0) {
      const extraTimeSlot = `${extraTimeSlotIndex}:00`;
      busyPlayers[extraTimeSlot] = new Set<string>();

      let matchesInThisSlot = 0;

      while (matchesInThisSlot < courts && remainingMatches.length > 0) {
        remainingMatches.sort(
          (a, b) => calculateMatchPriority(b) - calculateMatchPriority(a)
        );

        let matchScheduled = false;

        for (let i = 0; i < remainingMatches.length; i++) {
          const match = remainingMatches[i];

          const player1Busy = busyPlayers[extraTimeSlot].has(match.player1Id);
          const player2Busy = busyPlayers[extraTimeSlot].has(match.player2Id);

          if (!player1Busy && !player2Busy) {
            const courtNumber = matchesInThisSlot + 1;

            scheduledMatches.push({
              ...match,
              courtNumber,
              timeSlot: extraTimeSlot,
            });

            busyPlayers[extraTimeSlot].add(match.player1Id);
            busyPlayers[extraTimeSlot].add(match.player2Id);

            playerMatchCount[match.player1Id]++;
            playerMatchCount[match.player2Id]++;

            remainingMatches.splice(i, 1);
            matchesInThisSlot++;
            matchScheduled = true;
            break;
          }
        }

        if (!matchScheduled) {
          break;
        }
      }

      extraTimeSlotIndex++;

      if (extraTimeSlotIndex > 24) {
        remainingMatches.forEach((match, index) => {
          const timeSlot = `${18 + Math.floor(index / courts)}:00`;
          const courtNumber = (index % courts) + 1;

          scheduledMatches.push({
            ...match,
            courtNumber,
            timeSlot,
          });
        });
        break;
      }
    }

    return scheduledMatches;
  };

  const drawMatches = useCallback(async () => {
    if (!tournamentId || !canDrawMatches || tournament.players.length === 0)
      return;

    try {
      setError(null);
      const matches = generateInitialMatches(tournament.players);
      const matchesWithSchedule = assignMatchesToCourts(
        matches,
        numberOfCourts
      );

      // Adiciona todas as partidas no Firebase
      for (const match of matchesWithSchedule) {
        await addMatch(tournamentId, match);
      }

      // Atualiza o torneio
      await updateTournament(tournamentId, {
        numberOfCourts,
        matchesDrawn: true,
      });
    } catch (error) {
      console.error('Erro ao sortear partidas:', error);
      setError(
        error instanceof Error ? error.message : 'Erro ao sortear partidas'
      );
    }
  }, [tournamentId, canDrawMatches, tournament.players, numberOfCourts]);

  const updatePlayerLimitHandler = useCallback(
    async (limit: number) => {
      if (!tournamentId) return;

      setPlayerLimit(limit);
      try {
        await updateTournamentSettings(tournamentId, { playerLimit: limit });
      } catch (error) {
        console.error('Erro ao atualizar limite de jogadores:', error);
      }
    },
    [tournamentId]
  );

  const updateNumberOfCourtsHandler = useCallback(
    async (courts: number) => {
      if (!tournamentId) return;

      setNumberOfCourts(courts);
      try {
        await updateTournamentSettings(tournamentId, {
          numberOfCourts: courts,
        });
      } catch (error) {
        console.error('Erro ao atualizar número de quadras:', error);
      }
    },
    [tournamentId]
  );

  return (
    <TournamentContext.Provider
      value={{
        tournament,
        tournamentId,
        playerLimit,
        setPlayerLimit: updatePlayerLimitHandler,
        numberOfCourts,
        setNumberOfCourts: updateNumberOfCourtsHandler,
        addPlayer: addPlayerToTournament,
        updateMatch: updateMatchResult,
        resetTournament,
        createNewTournament,
        startNextPhase,
        canAdvancePhase,
        drawMatches,
        canDrawMatches,
        loading,
        error,
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
