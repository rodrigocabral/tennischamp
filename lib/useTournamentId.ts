import { useState, useEffect } from 'react';

export function useTournamentId() {
  const [tournamentId, setTournamentId] = useState<string | null>(null);

  useEffect(() => {
    // Carrega do localStorage
    const savedTournamentId = localStorage.getItem('current-tournament-id');
    if (savedTournamentId) {
      setTournamentId(savedTournamentId);
    }
  }, []);

  const setCurrentTournament = (id: string | null) => {
    setTournamentId(id);
    if (id) {
      localStorage.setItem('current-tournament-id', id);
    } else {
      localStorage.removeItem('current-tournament-id');
    }
  };

  return {
    tournamentId,
    setCurrentTournament
  };
} 