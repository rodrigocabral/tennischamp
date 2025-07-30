'use client';

import { useTournament } from "@/contexts/TournamentContext";
import { BracketMatch } from "@/types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Trophy } from "lucide-react";

export default function TournamentBracket() {
  const { tournament, updateMatch } = useTournament();
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [scores, setScores] = useState({ player1: 0, player2: 0 });

  const getPlayer = (playerId: string) => {
    return tournament.players.find(p => p.id === playerId);
  };

  const handleScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMatch) {
      updateMatch(selectedMatch, scores.player1, scores.player2);
      setSelectedMatch(null);
      setScores({ player1: 0, player2: 0 });
    }
  };

  const getTournamentWinner = () => {
    if (tournament.phase !== 'FINAL' || !final?.completed) return null;
    
    const winningPlayerId = final.player1Games > final.player2Games 
      ? final.player1Id 
      : final.player2Id;
    
    return getPlayer(winningPlayerId);
  };

  const renderMatchCard = (match: BracketMatch) => {
    const player1 = getPlayer(match.player1Id);
    const player2 = getPlayer(match.player2Id);

    if (!player1 || !player2) return null;

    return (
      <div className="w-full max-w-[300px] bg-white rounded-lg border shadow-sm">
        <div className="p-2 sm:p-3 border-b">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
              <AvatarImage src={player1.photoUrl} alt={player1.name} />
              <AvatarFallback>{player1.nickname.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-xs sm:text-sm truncate">{player1.name}</div>
              <div className="text-xs text-muted-foreground truncate hidden sm:block">{player1.nickname}</div>
            </div>
            {match.completed ? (
              <div className="font-mono text-xs sm:text-sm font-medium">
                {match.player1Games}
              </div>
            ) : null}
          </div>
        </div>
        <div className="p-2 sm:p-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
              <AvatarImage src={player2.photoUrl} alt={player2.name} />
              <AvatarFallback>{player2.nickname.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-xs sm:text-sm truncate">{player2.name}</div>
              <div className="text-xs text-muted-foreground truncate hidden sm:block">{player2.nickname}</div>
            </div>
            {match.completed ? (
              <div className="font-mono text-xs sm:text-sm font-medium">
                {match.player2Games}
              </div>
            ) : null}
          </div>
        </div>
        <div className="p-2 sm:p-3 border-t">
          <Dialog open={selectedMatch === match.id} onOpenChange={(open) => {
            if (!open) setSelectedMatch(null);
            else setSelectedMatch(match.id);
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">
                {match.completed ? 'Editar Resultado' : 'Lançar Resultado'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] mx-4 sm:mx-0">
              <DialogHeader>
                <DialogTitle className="text-base sm:text-lg">
                  {match.completed ? 'Editar Resultado da Partida' : 'Lançar Resultado da Partida'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleScoreSubmit} className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1 space-y-1">
                    <label className="text-xs sm:text-sm line-clamp-1">{player1.name}</label>
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
                    <label className="text-xs sm:text-sm line-clamp-1">{player2.name}</label>
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
        </div>
      </div>
    );
  };

  if (tournament.phase === 'GROUP') return null;

  const final = tournament.bracketMatches.find(m => m.round === 'FINAL');
  const thirdPlace = tournament.bracketMatches.find(m => m.round === 'THIRD_PLACE');

  const winner = getTournamentWinner();

  return (
    <div className="space-y-8">
      {thirdPlace && (
        <div>
          <h3 className="text-base sm:text-lg font-medium mb-4 sm:mb-6">Disputa do Terceiro Lugar</h3>
          <div className="flex justify-center">
            {renderMatchCard(thirdPlace)}
          </div>
        </div>
      )}

      {final && (
        <div>
          <h3 className="text-base sm:text-lg font-medium mb-4 sm:mb-6">Final</h3>
          <div className="flex justify-center">
            {renderMatchCard(final)}
          </div>
          {winner && (
            <div className="mt-6 sm:mt-8 flex flex-col items-center gap-3 sm:gap-4 p-4 sm:p-6 bg-green-50 rounded-lg mx-4 sm:mx-0">
              <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-500" />
              <div className="text-center">
                <h4 className="text-lg sm:text-xl font-bold mb-1">Campeão do Torneio</h4>
                <p className="text-base sm:text-lg">{winner.name}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
} 