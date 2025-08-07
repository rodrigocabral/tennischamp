'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useTournament } from '@/contexts/TournamentContext';
import { getPlayerRanking } from '@/lib/tournament';
import { Match } from '@/types';
import { Copy } from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { toast } from 'sonner';

// Define the item type for drag and drop
const MATCH_ITEM_TYPE = 'match';

// Interface for the draggable match item
interface DragItem {
  id: string;
  timeSlot: string;
  index: number;
}

export default function TournamentTable() {
  const {
    tournament,
    updateMatch,
    updateMatchesOrder,
    startNextPhase,
    canAdvancePhase,
  } = useTournament();
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [scores, setScores] = useState({ player1: 0, player2: 0 });

  const rankedPlayers = getPlayerRanking(tournament).filter(
    player => player.id
  );

  const getPlayerName = (playerId: string) => {
    const player = tournament.players.find(p => p.id === playerId);
    return player ? player.name : 'Unknown';
  };

  const formatMatchesForClipboard = () => {
    const matchesByTimeSlot = tournament.matches.reduce(
      (acc, match) => {
        const timeSlot = match.timeSlot || 'Sem horário';
        if (!acc[timeSlot]) acc[timeSlot] = [];
        acc[timeSlot].push(match);
        return acc;
      },
      {} as Record<string, typeof tournament.matches>
    );

    let formattedText = '🎾 LISTA DE PARTIDAS\n\n';

    Object.entries(matchesByTimeSlot)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([timeSlot, matches]) => {
        formattedText += `⏰ ${timeSlot}\n`;
        formattedText += '─'.repeat(30) + '\n';

        matches
          .sort((a, b) => (a.courtNumber || 0) - (b.courtNumber || 0))
          .forEach(match => {
            const player1 = getPlayerName(match.player1Id);
            const player2 = getPlayerName(match.player2Id);
            const court = match.courtNumber
              ? `Quadra ${match.courtNumber}`
              : 'Sem quadra';

            if (match.completed) {
              formattedText += `${court}: ${player1} ${match.player1Games} x ${match.player2Games} ${player2} ✅\n`;
            } else {
              formattedText += `${court}: ${player1} vs ${player2}\n`;
            }
          });

        formattedText += '\n';
      });

    return formattedText;
  };

  const copyMatchesToClipboard = async () => {
    try {
      const formattedMatches = formatMatchesForClipboard();
      await navigator.clipboard.writeText(formattedMatches);
      toast.success('Lista de partidas copiada para a área de transferência!');
    } catch (error) {
      toast.error('Erro ao copiar lista de partidas');
      console.error('Error copying to clipboard:', error);
    }
  };

  const handleScoreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedMatch) {
      updateMatch(selectedMatch, scores.player1, scores.player2);
      setSelectedMatch(null);
      setScores({ player1: 0, player2: 0 });
    }
  };

  // Function to handle match swapping
  const moveMatch = useCallback(
    (
      dragTimeSlot: string,
      dragIndex: number,
      hoverTimeSlot: string,
      hoverIndex: number,
      updateFirestore: boolean = false
    ) => {
      // Find the matches by time slot
      const matchesByTimeSlot = tournament.matches.reduce(
        (acc, match) => {
          const timeSlot = match.timeSlot || 'Sem horário';
          if (!acc[timeSlot]) acc[timeSlot] = [];
          acc[timeSlot].push(match);
          return acc;
        },
        {} as Record<string, typeof tournament.matches>
      );

      // Get the matches for the drag and hover time slots
      const dragMatches = [...(matchesByTimeSlot[dragTimeSlot] || [])];
      const hoverMatches = [...(matchesByTimeSlot[hoverTimeSlot] || [])];

      // Get the matches being swapped
      const dragMatch = { ...dragMatches[dragIndex] };
      const hoverMatch = { ...hoverMatches[hoverIndex] };

      // If dragging within the same time slot
      if (dragTimeSlot === hoverTimeSlot) {
        // Simple swap within the same time slot
        dragMatches[dragIndex] = {
          ...hoverMatch,
          courtNumber: dragMatch.courtNumber, // Keep original court number
        };
        dragMatches[hoverIndex] = {
          ...dragMatch,
          courtNumber: hoverMatch.courtNumber, // Keep original court number
        };

        // Update the matchesByTimeSlot with the swapped matches
        matchesByTimeSlot[dragTimeSlot] = dragMatches;
      } else {
        // Swap between different time slots
        const updatedDragMatch = {
          ...dragMatch,
          timeSlot: hoverTimeSlot,
          courtNumber: hoverMatch.courtNumber, // Take the hover match's court number
        };

        const updatedHoverMatch = {
          ...hoverMatch,
          timeSlot: dragTimeSlot,
          courtNumber: dragMatch.courtNumber, // Take the drag match's court number
        };

        // Replace the matches in their new positions
        dragMatches[dragIndex] = updatedHoverMatch;
        hoverMatches[hoverIndex] = updatedDragMatch;

        // Update the matchesByTimeSlot with the swapped matches
        matchesByTimeSlot[dragTimeSlot] = dragMatches;
        matchesByTimeSlot[hoverTimeSlot] = hoverMatches;
      }

      // Flatten the matchesByTimeSlot back to an array
      const newMatches = Object.values(matchesByTimeSlot).flat();

      // Only update Firestore if updateFirestore is true
      if (updateFirestore) {
        updateMatchesOrder(newMatches)
          .then(() => {
            toast.success('Partidas trocadas com sucesso!');
          })
          .catch(error => {
            toast.error('Erro ao trocar partidas');
            console.error('Error swapping matches:', error);
          });
      }
    },
    [tournament, updateMatchesOrder]
  );

  return (
    <DndProvider backend={HTML5Backend}>
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
                    key={`player-${player.id}-${index}`}
                    className={
                      tournament.phase === 'GROUP' && index < 4
                        ? 'bg-green-50'
                        : undefined
                    }
                  >
                    <TableCell className="text-center font-medium">
                      {index + 1}º
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div>
                          <div className="font-medium text-sm sm:text-base line-clamp-1">
                            {player.name}
                          </div>
                          <div className="text-xs sm:text-sm text-muted-foreground line-clamp-1">
                            {player.nickname}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      {player.points}
                    </TableCell>
                    <TableCell className="text-right">
                      {player.gamesWon}
                    </TableCell>
                    <TableCell className="text-right">
                      {player.gamesLost}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {player.gamesWon - player.gamesLost}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </ScrollArea>

        {tournament.matchesDrawn && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-medium">
                Partidas da Fase de Grupos
              </h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyMatchesToClipboard}
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copiar Lista
                </Button>
                {canAdvancePhase && (
                  <Button onClick={startNextPhase}>Iniciar Finais</Button>
                )}
              </div>
            </div>
            <div className="grid gap-3">
              {
                // Exibir partidas organizadas por horário e quadra
                (() => {
                  const matchesByTimeSlot = tournament.matches.reduce(
                    (acc, match) => {
                      const timeSlot = match.timeSlot || 'Sem horário';
                      if (!acc[timeSlot]) acc[timeSlot] = [];
                      acc[timeSlot].push(match);
                      return acc;
                    },
                    {} as Record<string, typeof tournament.matches>
                  );

                  return Object.entries(matchesByTimeSlot)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([timeSlot, matches]) => (
                      <div key={`timeslot-${timeSlot}`} className="space-y-2">
                        <h4 className="font-medium text-sm text-muted-foreground bg-muted px-3 py-1 rounded">
                          {timeSlot}
                        </h4>
                        <div className="grid gap-2">
                          {matches
                            .sort(
                              (a, b) =>
                                (a.courtNumber || 0) - (b.courtNumber || 0)
                            )
                            .map((match, matchIndex) => (
                              <MatchCard
                                key={`match-${match.id}-${timeSlot}-${matchIndex}`}
                                match={match}
                                matchIndex={matchIndex}
                                timeSlot={timeSlot}
                                getPlayerName={getPlayerName}
                                selectedMatch={selectedMatch}
                                setSelectedMatch={setSelectedMatch}
                                scores={scores}
                                setScores={setScores}
                                handleScoreSubmit={handleScoreSubmit}
                                moveMatch={moveMatch}
                              />
                            ))}
                        </div>
                      </div>
                    ));
                })()
              }
            </div>
          </div>
        )}
      </div>
    </DndProvider>
  );
}

// MatchCard component for drag and drop functionality
interface MatchCardProps {
  match: Match;
  matchIndex: number;
  timeSlot: string;
  getPlayerName: (playerId: string) => string;
  selectedMatch: string | null;
  setSelectedMatch: (matchId: string | null) => void;
  scores: { player1: number; player2: number };
  setScores: React.Dispatch<
    React.SetStateAction<{ player1: number; player2: number }>
  >;
  handleScoreSubmit: (e: React.FormEvent) => void;
  moveMatch: (
    dragTimeSlot: string,
    dragIndex: number,
    hoverTimeSlot: string,
    hoverIndex: number,
    updateFirestore?: boolean
  ) => void;
}

function MatchCard({
  match,
  matchIndex,
  timeSlot,
  getPlayerName,
  selectedMatch,
  setSelectedMatch,
  scores,
  setScores,
  handleScoreSubmit,
  moveMatch,
}: MatchCardProps) {
  // Set up drag source
  const [{ isDragging }, dragRef] = useDrag({
    type: MATCH_ITEM_TYPE,
    item: () =>
      ({
        id: match.id,
        timeSlot,
        index: matchIndex,
        originalTimeSlot: timeSlot,
        originalIndex: matchIndex,
      }) as DragItem & { originalTimeSlot: string; originalIndex: number },
    collect: monitor => ({
      isDragging: monitor.isDragging(),
    }),
  });

  // Reference to the card element
  const ref = useRef<HTMLDivElement>(null);

  // Set up drop target
  const [{ isOver }, dropRef] = useDrop({
    accept: MATCH_ITEM_TYPE,
    collect: monitor => ({
      isOver: monitor.isOver(),
    }),
    hover: (
      item: DragItem & { originalTimeSlot?: string; originalIndex?: number }
    ) => {
      if (!ref.current) return;

      const dragIndex = item.index;
      const hoverIndex = matchIndex;
      const dragTimeSlot = item.timeSlot;
      const hoverTimeSlot = timeSlot;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex && dragTimeSlot === hoverTimeSlot) {
        return;
      }

      // For swapping, we only want to show preview during hover
      // The actual swap will happen on drop via the end callback
      // No need to call moveMatch here for preview
    },
    drop: (
      item: DragItem & { originalTimeSlot?: string; originalIndex?: number }
    ) => {
      const dragIndex = item.originalIndex || item.index;
      const hoverIndex = matchIndex;
      const dragTimeSlot = item.originalTimeSlot || item.timeSlot;
      const hoverTimeSlot = timeSlot;

      // Don't swap items with themselves
      if (dragIndex === hoverIndex && dragTimeSlot === hoverTimeSlot) {
        return;
      }

      // Perform the actual swap
      moveMatch(dragTimeSlot, dragIndex, hoverTimeSlot, hoverIndex, true);
    },
  });

  // Combine drag and drop refs
  dragRef(dropRef(ref));

  return (
    <div
      ref={ref}
      className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border rounded-lg gap-3 sm:gap-4 transition-all duration-200 ${
        isDragging
          ? 'opacity-50 cursor-move transform scale-105'
          : isOver
            ? 'border-blue-400 bg-blue-50 shadow-md cursor-move'
            : 'cursor-move hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-3 sm:gap-4 text-sm sm:text-base">
        <div className="flex items-center gap-2">
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">
            Quadra {match.courtNumber}
          </span>
          <span className="font-medium line-clamp-1">
            {getPlayerName(match.player1Id)}
          </span>
        </div>
        {match.completed ? (
          <span className="font-mono whitespace-nowrap">
            {match.player1Games} - {match.player2Games}
          </span>
        ) : (
          <span className="text-muted-foreground">vs</span>
        )}
        <span className="font-medium line-clamp-1">
          {getPlayerName(match.player2Id)}
        </span>
      </div>

      {!match.completed && (
        <Dialog
          open={selectedMatch === match.id}
          onOpenChange={open => {
            if (!open) setSelectedMatch(null);
            else setSelectedMatch(match.id);
          }}
        >
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
                  <label className="text-xs sm:text-sm line-clamp-1">
                    {getPlayerName(match.player1Id)}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={scores.player1}
                    onChange={e =>
                      setScores(prev => ({
                        ...prev,
                        player1: parseInt(e.target.value) || 0,
                      }))
                    }
                    required
                    className="text-sm"
                  />
                </div>
                <span className="text-xl sm:text-2xl">-</span>
                <div className="flex-1 space-y-1">
                  <label className="text-xs sm:text-sm line-clamp-1">
                    {getPlayerName(match.player2Id)}
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={scores.player2}
                    onChange={e =>
                      setScores(prev => ({
                        ...prev,
                        player2: parseInt(e.target.value) || 0,
                      }))
                    }
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
  );
}
