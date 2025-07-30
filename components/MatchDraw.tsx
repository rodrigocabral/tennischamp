import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTournament } from "@/contexts/TournamentContext";
import { Shuffle, CheckCircle, AlertTriangle } from "lucide-react";

export default function MatchDraw() {
  const { canDrawMatches, drawMatches, tournament, playerLimit, numberOfCourts } = useTournament();

  // Função para validar se há conflitos no sorteio
  const validateSchedule = () => {
    const conflicts: string[] = [];
    const timeSlotGroups: { [timeSlot: string]: typeof tournament.matches } = {};
    
    // Agrupar partidas por horário
    tournament.matches.forEach(match => {
      const timeSlot = match.timeSlot || 'Sem horário';
      if (!timeSlotGroups[timeSlot]) {
        timeSlotGroups[timeSlot] = [];
      }
      timeSlotGroups[timeSlot].push(match);
    });

    // Verificar conflitos em cada horário
    Object.entries(timeSlotGroups).forEach(([timeSlot, matches]) => {
      const playersInSlot = new Set<string>();
      
      matches.forEach(match => {
        if (playersInSlot.has(match.player1Id)) {
          conflicts.push(`Jogador ${match.player1Id} tem conflito no horário ${timeSlot}`);
        }
        if (playersInSlot.has(match.player2Id)) {
          conflicts.push(`Jogador ${match.player2Id} tem conflito no horário ${timeSlot}`);
        }
        
        playersInSlot.add(match.player1Id);
        playersInSlot.add(match.player2Id);
      });
    });

    return {
      hasConflicts: conflicts.length > 0,
      conflicts,
      totalTimeSlots: Object.keys(timeSlotGroups).length,
      timeSlotGroups
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
          <div className={`p-3 rounded flex items-start gap-2 ${
            validation.hasConflicts 
              ? 'bg-red-50 text-red-700' 
              : 'bg-green-50 text-green-700'
          }`}>
            {validation.hasConflicts ? (
              <AlertTriangle className="h-4 w-4 mt-0.5 text-red-500" />
            ) : (
              <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
            )}
            <div className="text-xs">
              <p className="font-medium">
                {validation.hasConflicts 
                  ? '⚠️ Conflitos Detectados' 
                  : '✅ Nenhum Conflito Detectado'
                }
              </p>
              <p>
                {validation.hasConflicts 
                  ? 'Alguns jogadores estão em partidas simultâneas' 
                  : 'Todos os jogadores têm apenas uma partida por horário'
                }
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
                  <div key={timeSlot} className="flex justify-between items-center text-xs bg-gray-50 px-2 py-1 rounded">
                    <span className="font-mono">{timeSlot}</span>
                    <span className="text-gray-600">
                      {matches.length} partida{matches.length !== 1 ? 's' : ''} 
                      em {Math.max(...matches.map(m => m.courtNumber || 1))} quadra{Math.max(...matches.map(m => m.courtNumber || 1)) !== 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
            </div>
          </div>
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
            <p className="text-muted-foreground">{tournament.players.length} / {playerLimit}</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Quadras</p>
            <p className="text-muted-foreground">{numberOfCourts} disponíveis</p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Total de Partidas</p>
            <p className="text-muted-foreground">
              {tournament.players.length >= 2 
                ? (tournament.players.length * (tournament.players.length - 1)) / 2 
                : 0} partidas
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
                <li>Complete o cadastro de todos os jogadores ({playerLimit} jogadores)</li>
              )}
              {numberOfCourts <= 0 && (
                <li>Configure pelo menos 1 quadra</li>
              )}
            </ul>
          </div>
        )}

        <Button 
          onClick={drawMatches} 
          disabled={!canDrawMatches}
          className="w-full"
          size="lg"
        >
          <Shuffle className="h-4 w-4 mr-2" />
          Sortear Partidas
        </Button>

        <div className="text-xs text-blue-600 bg-blue-50 p-3 rounded">
          <p className="font-medium">🎯 Nova Funcionalidade:</p>
          <p>O sistema agora garante que nenhum jogador tenha partidas simultâneas!</p>
        </div>
      </CardContent>
    </Card>
  );
} 