import { Match, Player, Tournament } from "@/types";

export function generateInitialMatches(players: Player[]): Match[] {
  const matches: Match[] = [];
  
  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      matches.push({
        id: `${i}-${j}`,
        player1Id: players[i].id,
        player2Id: players[j].id,
        player1Games: 0,
        player2Games: 0,
        completed: false,
        date: new Date().toISOString(),
      });
    }
  }
  
  return matches;
}

export function calculatePlayerStats(player: Player, matches: Match[]): Player {
  const playerMatches = matches.filter(
    (match) => match.player1Id === player.id || match.player2Id === player.id
  );
  
  let gamesWon = 0;
  let gamesLost = 0;
  
  playerMatches.forEach((match) => {
    if (match.completed) {
      if (match.player1Id === player.id) {
        gamesWon += match.player1Games;
        gamesLost += match.player2Games;
      } else {
        gamesWon += match.player2Games;
        gamesLost += match.player1Games;
      }
    }
  });
  
  return {
    ...player,
    gamesWon,
    gamesLost,
    matchesPlayed: playerMatches
      .filter((m) => m.completed)
      .map((m) => m.id),
  };
}

export function getPlayerRanking(tournament: Tournament): Player[] {
  return tournament.players
    .map((player) => calculatePlayerStats(player, tournament.matches))
    .sort((a, b) => {
      const aDiff = a.gamesWon - a.gamesLost;
      const bDiff = b.gamesWon - b.gamesLost;
      return bDiff - aDiff;
    });
} 