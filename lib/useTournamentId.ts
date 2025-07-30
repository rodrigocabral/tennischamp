import { useEffect, useState } from 'react';

export function useTournamentId() {
  const [tournamentId, setTournamentId] = useState<string | null>(null);

  useEffect(() => {
    // First, check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlTournamentId = urlParams.get('tournament');

    if (urlTournamentId) {
      setTournamentId(urlTournamentId);
      // Also save to localStorage for future visits
      localStorage.setItem('current-tournament-id', urlTournamentId);
      // Update URL to remove the parameter (clean URL)
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('tournament');
      window.history.replaceState({}, '', newUrl.toString());
    } else {
      // If no URL parameter, fall back to localStorage
      const savedTournamentId = localStorage.getItem('current-tournament-id');
      if (savedTournamentId) {
        setTournamentId(savedTournamentId);
      }
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
    setCurrentTournament,
  };
}
