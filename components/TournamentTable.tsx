'use client';

import { useTournament } from "@/contexts/TournamentContext";
import { getPlayerRanking } from "@/lib/tournament";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";

export default function TournamentTable() {
  const { tournament, updateMatch, startNextPhase, canAdvancePhase } = useTournament();
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  
  const rankedPlayers = getPlayerRanking(tournament);

  const getPlayerName = (playerId: string) => {
    const player = tournament.players.find(p => p.id === playerId);
    return player ? player.name : 'Unknown';
  };

  const handleScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMatch) {
      updateMatch(selectedMatch, scores.player1, scores.player2);
      setSelectedMatch(null);
      setScores({ player1: 0, player2: 0 });
    }
  };

  return (
    <div className="space-y-6">
      <ScrollArea className="w-full rounded-md border">
        <div className="p-2 sm:p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>Jogador</TableHead>
                <TableHead className="text-right">Pts</TableHead>
                <TableHead className="text-right">G+</TableHead>
                <TableHead className="text-right">G-</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankedPlayers.map((player, index) => (
                <TableRow 
                  key={player.id}
                  className={tournament.phase === 'GROUP' && index < 4 ? 'bg-green-50' : undefined}
                >
                  <TableCell className="text-center font-medium">{index + 1}º</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
                        <AvatarImage src={player.photoUrl} alt={player.name} />
                        <AvatarFallback>{player.nickname.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium text-sm sm:text-base line-clamp-1">{player.name}</div>
                        <div className="text-xs sm:text-sm text-muted-foreground line-clamp-1">{player.nickname}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-bold text-green-600">{player.points}</TableCell>
                  <TableCell className="text-right">{player.gamesWon}</TableCell>
                  <TableCell className="text-right">{player.gamesLost}</TableCell>
                  <TableCell className="text-right font-medium">{player.gamesWon - player.gamesLost}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>

      {tournament.phase === 'GROUP' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-medium">Partidas da Fase de Grupos</h3>
            {canAdvancePhase && (
              <Button onClick={startNextPhase}>
                Iniciar Finais
              </Button>
            )}
          </div>
          <div className="grid gap-3">
            {tournament.matchesDrawn ? (
              // Exibir partidas organizadas por horário e quadra
              (() => {
                const matchesByTimeSlot = tournament.matches.reduce((acc, match) => {
                  const timeSlot = match.timeSlot || 'Sem horário';
                  if (!acc[timeSlot]) acc[timeSlot] = [];
                  acc[timeSlot].push(match);
                  return acc;
                }, {} as Record<string, typeof tournament.matches>);

                return Object.entries(matchesByTimeSlot)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([timeSlot, matches]) => (
                    <div key={timeSlot} className="space-y-2">
                      <h4 className="font-medium text-sm text-muted-foreground bg-muted px-3 py-1 rounded">
                        {timeSlot}
                      </h4>
                      <div className="grid gap-2">
                        {matches
                          .sort((a, b) => (a.courtNumber || 0) - (b.courtNumber || 0))
                          .map((match) => (
                            <div key={match.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-4">
                              <div className="flex items-center gap-3 sm:gap-4 text-sm sm:text-base">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">
                                    Quadra {match.courtNumber}
                                  </span>
                                  <span className="font-medium line-clamp-1">{getPlayerName(match.player1Id)}</span>
                                </div>
                                {match.completed ? (
                                  <span className="font-mono whitespace-nowrap">
                                    {match.player1Games} - {match.player2Games}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">vs</span>
                                )}
                                <span className="font-medium line-clamp-1">{getPlayerName(match.player2Id)}</span>
                              </div>
                              
                              {!match.completed && (
                                <Dialog open={selectedMatch === match.id} onOpenChange={(open) => {
                                  if (!open) setSelectedMatch(null);
                                  else setSelectedMatch(match.id);
                                }}>
                                  <DialogTrigger asChild>
                                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                                      Lançar Resultado
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                      <DialogTitle>Lançar Resultado da Partida</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleScoreSubmit} className="space-y-4">
                                      <div className="flex items-center gap-4">
                                        <div className="flex-1 space-y-1">
                                          <label className="text-xs sm:text-sm line-clamp-1">{getPlayerName(match.player1Id)}</label>
                                          <Input
                                            type="number"
                                            min="0"
                                            value={scores.player1}
                                            onChange={(e) => setScores(prev => ({ ...prev, player1: parseInt(e.target.value) || 0 }))}
                                            required
                                            className="text-sm"
                                          />
                                        </div>
                                        <span className="text-xl sm:text-2xl">-</span>
                                        <div className="flex-1 space-y-1">
                                          <label className="text-xs sm:text-sm line-clamp-1">{getPlayerName(match.player2Id)}</label>
                                          <Input
                                            type="number"
                                            min="0"
                                            value={scores.player2}
                                            onChange={(e) => setScores(prev => ({ ...prev, player2: parseInt(e.target.value) || 0 }))}
                                            required
                                            className="text-sm"
                                          />
                                        </div>
                                      </div>
                                      <Button type="submit" className="w-full">
                                        Salvar Resultado
                                      </Button>
                                    </form>
                                  </DialogContent>
                                </Dialog>
                              )}
                            </div>
                          ))}
                      </div>
                    </div>
                  ));
              })()
            ) : (
              // Exibir partidas na forma original quando não sorteadas
              tournament.matches.map((match) => (
                <div key={match.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 sm:gap-4 text-sm sm:text-base">
                    <span className="font-medium line-clamp-1">{getPlayerName(match.player1Id)}</span>
                    {match.completed ? (
                      <span className="font-mono whitespace-nowrap">
                        {match.player1Games} - {match.player2Games}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">vs</span>
                    )}
                    <span className="font-medium line-clamp-1">{getPlayerName(match.player2Id)}</span>
                  </div>
                  
                  {!match.completed && (
                    <Dialog open={selectedMatch === match.id} onOpenChange={(open) => {
                      if (!open) setSelectedMatch(null);
                      else setSelectedMatch(match.id);
                    }}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          Lançar Resultado
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Lançar Resultado da Partida</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleScoreSubmit} className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="flex-1 space-y-1">
                              <label className="text-xs sm:text-sm line-clamp-1">{getPlayerName(match.player1Id)}</label>
                              <Input
                                type="number"
                                min="0"
                                value={scores.player1}
                                onChange={(e) => setScores(prev => ({ ...prev, player1: parseInt(e.target.value) || 0 }))}
                                required
                                className="text-sm"
                              />
                            </div>
                            <span className="text-xl sm:text-2xl">-</span>
                            <div className="flex-1 space-y-1">
                              <label className="text-xs sm:text-sm line-clamp-1">{getPlayerName(match.player2Id)}</label>
                              <Input
                                type="number"
                                min="0"
                                value={scores.player2}
                                onChange={(e) => setScores(prev => ({ ...prev, player2: parseInt(e.target.value) || 0 }))}
                                required
                                className="text-sm"
                              />
                            </div>
                          </div>
                          <Button type="submit" className="w-full">
                            Salvar Resultado
                          </Button>
                        </form>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
} 