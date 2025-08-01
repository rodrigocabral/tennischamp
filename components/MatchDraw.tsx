import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useTournament } from '@/contexts/TournamentContext';
import {
  AlertTriangle,
  CheckCircle,
  Loader2,
  RotateCcw,
  Shuffle,
} from 'lucide-react';
import { useState } from 'react';

export default function MatchDraw() {
  const {
    canDrawMatches,
    drawMatches,
    redrawMatches,
    canRedrawMatches,
    tournament,
    playerLimit,
    numberOfCourts,
  } = useTournament();
  const [isDrawing, setIsDrawing] = useState(false);
  const [isRedrawing, setIsRedrawing] = useState(false);
  // Função para validar se há conflitos no sorteio
  const validateSchedule = () => {
    const conflicts: string[] = [];
    const timeSlotGroups: { [timeSlot: string]: typeof tournament.matches } =
      {};
    const playerStats: {
      [playerId: string]: {
        name: string;
        matches: number;
        timeSlots: string[];
      };
    } = {};

    // Inicializar estatísticas dos jogadores
    tournament.players.forEach(player => {
      playerStats[player.id] = {
        name: player.name,
        matches: 0,
        timeSlots: [],
      };
    });

    // Agrupar partidas por horário e calcular estatísticas dos jogadores
    tournament.matches.forEach(match => {
      const timeSlot = match.timeSlot || 'Sem horário';
      if (!timeSlotGroups[timeSlot]) {
        timeSlotGroups[timeSlot] = [];
      }
      timeSlotGroups[timeSlot].push(match);

      // Atualizar estatísticas dos jogadores
      if (playerStats[match.player1Id]) {
        playerStats[match.player1Id].matches++;
        if (!playerStats[match.player1Id].timeSlots.includes(timeSlot)) {
          playerStats[match.player1Id].timeSlots.push(timeSlot);
        }
      }
      if (playerStats[match.player2Id]) {
        playerStats[match.player2Id].matches++;
        if (!playerStats[match.player2Id].timeSlots.includes(timeSlot)) {
          playerStats[match.player2Id].timeSlots.push(timeSlot);
        }
      }
    });

    // Verificar conflitos em cada horário
    Object.entries(timeSlotGroups).forEach(([timeSlot, matches]) => {
      const playersInSlot = new Set<string>();

      matches.forEach(match => {
        if (playersInSlot.has(match.player1Id)) {
          conflicts.push(
            `Jogador ${match.player1Id} tem conflito no horário ${timeSlot}`
          );
        }
        if (playersInSlot.has(match.player2Id)) {
          conflicts.push(
            `Jogador ${match.player2Id} tem conflito no horário ${timeSlot}`
          );
        }

        playersInSlot.add(match.player1Id);
        playersInSlot.add(match.player2Id);
      });
    });

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      totalTimeSlots: Object.keys(timeSlotGroups).length,
      timeSlotGroups,
      playerStats,
    };
  };

  if (tournament.matchesDrawn) {
    const validation = validateSchedule();

    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base sm:text-lg flex items-center gap-2">
            <Shuffle className="h-5 w-5" />
            Sorteio das Partidas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-green-600 bg-green-50 p-3 rounded">
            ✅ Partidas já foram sorteadas e organizadas nas quadras!
          </div>

          {/* Estatísticas do Sorteio */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Estatísticas do Sorteio:</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-blue-50 p-2 rounded">
                <p className="font-medium text-blue-800">Total de Partidas</p>
                <p className="text-blue-600">{tournament.matches.length}</p>
              </div>
              <div className="bg-purple-50 p-2 rounded">
                <p className="font-medium text-purple-800">Horários Usados</p>
                <p className="text-purple-600">{validation.totalTimeSlots}</p>
              </div>
              <div className="bg-orange-50 p-2 rounded">
                <p className="font-medium text-orange-800">Quadras</p>
                <p className="text-orange-600">{numberOfCourts}</p>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <p className="font-medium text-gray-800">Partidas/Horário</p>
                <p className="text-gray-600">≤ {numberOfCourts}</p>
              </div>
            </div>
          </div>

          {/* Validação de Conflitos */}
          <div
            className={`p-3 rounded flex items-start gap-2 ${
              validation.hasConflicts
                ? 'bg-red-50 text-red-700'
                : 'bg-green-50 text-green-700'
            }`}
          >
            {validation.hasConflicts ? (
              <AlertTriangle className="h-4 w-4 mt-0.5 text-red-500" />
            ) : (
              <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
            )}
            <div className="text-xs">
              <p className="font-medium">
                {validation.hasConflicts
                  ? '⚠️ Conflitos Detectados'
                  : '✅ Nenhum Conflito Detectado'}
              </p>
              <p>
                {validation.hasConflicts
                  ? 'Alguns jogadores estão em partidas simultâneas'
                  : 'Todos os jogadores têm apenas uma partida por horário'}
              </p>
            </div>
          </div>

          {/* Distribuição por Horário */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Distribuição por Horário:</h4>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {Object.entries(validation.timeSlotGroups)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([timeSlot, matches]) => (
                  <div
                    key={timeSlot}
                    className="flex justify-between items-center text-xs bg-gray-50 px-2 py-1 rounded"
                  >
                    <span className="font-mono">{timeSlot}</span>
                    <span className="text-gray-600">
                      {matches.length} partida{matches.length !== 1 ? 's' : ''}
                      em {Math.max(
                        ...matches.map(m => m.courtNumber || 1)
                      )}{' '}
                      quadra
                      {Math.max(...matches.map(m => m.courtNumber || 1)) !== 1
                        ? 's'
                        : ''}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Estatísticas por Jogador */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              🎯 Distribuição por Jogador (Otimizada):
            </h4>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {Object.values(validation.playerStats)
                .sort((a, b) => a.matches - b.matches) // Ordenar por número de partidas (menor primeiro)
                .map(player => {
                  const totalPlayers = tournament.players.length;
                  const expectedMatches = totalPlayers - 1; // Cada jogador deve jogar contra todos os outros
                  const percentage = Math.round(
                    (player.matches / expectedMatches) * 100
                  );

                  return (
                    <div
                      key={player.name}
                      className="flex justify-between items-center text-xs bg-gray-50 px-2 py-1 rounded"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{player.name}</span>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            player.matches <= expectedMatches * 0.6
                              ? 'bg-green-500' // Poucos jogos = verde
                              : player.matches <= expectedMatches * 0.8
                                ? 'bg-yellow-500' // Médios = amarelo
                                : 'bg-blue-500' // Muitos = azul
                          }`}
                          title={`${percentage}% das partidas agendadas`}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">
                          {player.matches}/{expectedMatches} partidas
                        </span>
                        <span className="text-xs text-gray-500">
                          ({player.timeSlots.length} horários)
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
            <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>Início (priorizados)</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span>Meio</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <span>Mais jogos</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botão de Refazer Sorteio */}
          {canRedrawMatches && (
            <div className="space-y-3 pt-2 border-t border-gray-200">
              <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded">
                <p className="font-medium">🔄 Refazer Sorteio Disponível</p>
                <p>
                  Você pode refazer o sorteio enquanto nenhuma partida foi
                  jogada. Isso gerará uma nova distribuição aleatória.
                </p>
              </div>

              <Button
                onClick={async () => {
                  setIsRedrawing(true);
                  await redrawMatches();
                  setIsRedrawing(false);
                }}
                disabled={isRedrawing}
                variant="outline"
                className="w-full"
                size="lg"
              >
                {isRedrawing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4 mr-2" />
                )}
                {isRedrawing ? 'Refazendo...' : 'Refazer Sorteio'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg flex items-center gap-2">
          <Shuffle className="h-5 w-5" />
          Sorteio das Partidas
        </CardTitle>
        <CardDescription className="text-sm">
          Sorteie as partidas e organize-as nas quadras disponíveis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="space-y-1">
            <p className="font-medium">Jogadores</p>
            <p className="text-muted-foreground">
              {tournament.players.length} / {playerLimit}
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Quadras</p>
            <p className="text-muted-foreground">
              {numberOfCourts} disponíveis
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Total de Partidas</p>
            <p className="text-muted-foreground">
              {tournament.players.length >= 2
                ? (tournament.players.length *
                    (tournament.players.length - 1)) /
                  2
                : 0}{' '}
              partidas
            </p>
          </div>
        </div>

        {!canDrawMatches && (
          <div className="text-xs text-amber-600 bg-amber-50 p-3 rounded space-y-1">
            <p className="font-medium">⚠️ Requisitos para sortear:</p>
            <ul className="list-disc list-inside space-y-1">
              {tournament.players.length < 4 && (
                <li>Cadastre pelo menos 4 jogadores</li>
              )}
              {tournament.players.length !== playerLimit && (
                <li>
                  Complete o cadastro de todos os jogadores ({playerLimit}{' '}
                  jogadores)
                </li>
              )}
              {numberOfCourts <= 0 && <li>Configure pelo menos 1 quadra</li>}
            </ul>
          </div>
        )}

        <Button
          onClick={async () => {
            setIsDrawing(true);
            await drawMatches();
            setIsDrawing(false);
          }}
          disabled={!canDrawMatches || isDrawing}
          className="w-full"
          size="lg"
        >
          {isDrawing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Shuffle className="h-4 w-4 mr-2" />
          )}
          Sortear Partidas
        </Button>

        <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded">
          <p className="font-medium">🎯 Otimizações Ativas:</p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Nenhum jogador em partidas simultâneas</li>
            <li>Prioridade para jogadores com menos partidas agendadas</li>
            <li>Distribuição equilibrada ao longo dos horários</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
