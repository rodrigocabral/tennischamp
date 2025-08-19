'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  TournamentProvider,
  useTournament,
} from '@/contexts/TournamentContext';
import { Match, Player } from '@/types';
import { ArrowLeft, Clock, Info, Trophy, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Função auxiliar para obter o nome do jogador
function getPlayerName(playerId: string, players: Player[]): string {
  const player = players.find(p => p.id === playerId);
  return player ? player.name : 'Jogador Desconhecido';
}

// Função para organizar partidas por horário e quadra
function organizeMatchesByTimeAndCourt(matches: Match[]) {
  const organized: { [timeSlot: string]: { [court: number]: Match | null } } =
    {};

  matches.forEach(match => {
    const timeSlot = match.timeSlot || 'Sem horário';
    const court = match.courtNumber || 1;

    if (!organized[timeSlot]) {
      organized[timeSlot] = {};
    }
    organized[timeSlot][court] = match;
  });

  return organized;
}

// Função para renderizar uma partida
function renderMatch(match: Match | null, players: Player[]): string {
  if (!match) return 'Livre';

  const player1Name = getPlayerName(match.player1Id, players);
  const player2Name = getPlayerName(match.player2Id, players);

  return `${player1Name} 🆚 ${player2Name}`;
}

// Componente interno que usa o contexto do torneio
function ScheduleContent() {
  const { tournament, tournamentId } = useTournament();
  const { matches, players, numberOfCourts } = tournament;

  // Organizar partidas por horário e quadra
  const organizedMatches = organizeMatchesByTimeAndCourt(matches);

  // Horários da manhã (08:00 - 12:30)
  const morningSlots = [
    '08:00',
    '08:30',
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
  ];

  // Horários da tarde/noite (16:00 - 21:00)
  const afternoonSlots = [
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
  ];

  return (
    <main className="container mx-auto py-4 px-2 sm:py-8 sm:px-4 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <Image
            src="/logo_presenca_open.png"
            alt="Presença Open Logo"
            width={60}
            height={60}
            className="sm:w-[70px] sm:h-[100px]"
          />
          <div>
            <h1 className="text-2xl sm:text-4xl font-bold">
              📅 Cronograma Oficial
            </h1>
            <p className="text-muted-foreground">Presença Open</p>
          </div>
        </div>
        <Link href="/">
          <Button variant="outline" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Voltar
          </Button>
        </Link>
      </div>

      {!tournamentId && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">⚠️ Nenhum torneio ativo</p>
              <p>
                Crie ou selecione um torneio na página inicial para visualizar o
                cronograma.
              </p>
              <Link href="/" className="mt-4 inline-block">
                <Button>Ir para Página Inicial</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {tournamentId && !tournament.matchesDrawn && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">
              <p className="text-lg mb-2">
                🎲 Partidas ainda não foram sorteadas
              </p>
              <p>
                Faça o sorteio das partidas na página inicial para visualizar o
                cronograma.
              </p>
              <Link href="/" className="mt-4 inline-block">
                <Button>Ir fazer sorteio</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 sm:gap-6">
        {/* Chegada e Preparação */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Users className="w-5 h-5" />
              Chegada e Preparação
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Horário</th>
                    <th className="text-left p-3 font-semibold">Atividade</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="p-3 font-medium">07h30 – 07h50</td>
                    <td className="p-3">
                      Chegada de todos os jogadores, fotos, alongamento,
                      aquecimento livre nas quadras
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-medium">07h50 – 08h00</td>
                    <td className="p-3">
                      Briefing rápido: regras, formato, tempo de jogo e sorteios
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Manhã */}
        {tournamentId && tournament.matchesDrawn && (
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Clock className="w-5 h-5" />
                Manhã (08h00 – 12h30)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Horário</th>
                      {Array.from({ length: numberOfCourts }, (_, i) => (
                        <th key={i + 1} className="text-left p-3 font-semibold">
                          Quadra {i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {morningSlots.map((timeSlot, index) => {
                      const courtMatches = organizedMatches[timeSlot] || {};
                      return (
                        <tr
                          key={timeSlot}
                          className={
                            index < morningSlots.length - 1 ? 'border-b' : ''
                          }
                        >
                          <td className="p-3 font-medium">
                            {timeSlot} – {timeSlot.slice(0, 2)}:30
                          </td>
                          {Array.from({ length: numberOfCourts }, (_, i) => {
                            const court = i + 1;
                            const match = courtMatches[court];
                            return (
                              <td
                                key={court}
                                className={`p-3 ${match?.completed ? 'text-green-600 font-medium' : ''}`}
                              >
                                {renderMatch(match, players)}
                                {match?.completed && ' ✅'}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Almoço */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              🍽️ Almoço e Descanso
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Horário</th>
                    <th className="text-left p-3 font-semibold">Atividade</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-3 font-medium">12:30 – 16:00</td>
                    <td className="p-3">
                      Pausa para almoço, hidratação e descanso
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Tarde/Noite */}
        {tournamentId && tournament.matchesDrawn && (
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Trophy className="w-5 h-5" />
                Tarde / Noite (16h00 – 21h00)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-semibold">Horário</th>
                      {Array.from({ length: numberOfCourts }, (_, i) => (
                        <th key={i + 1} className="text-left p-3 font-semibold">
                          Quadra {i + 1}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {afternoonSlots.map((timeSlot, index) => {
                      const courtMatches = organizedMatches[timeSlot] || {};

                      // Horários especiais para finais e premiação
                      const isThirdPlaceTime = timeSlot === '17:00';
                      const isFinalTime =
                        timeSlot === '17:30' || timeSlot === '18:00';
                      const isAwardTime = timeSlot === '18:30';
                      const isFreeTime =
                        timeSlot === '19:00' ||
                        timeSlot === '19:30' ||
                        timeSlot === '20:00' ||
                        timeSlot === '20:30';

                      return (
                        <tr
                          key={timeSlot}
                          className={
                            index < afternoonSlots.length - 1 ? 'border-b' : ''
                          }
                        >
                          <td className="p-3 font-medium">
                            {timeSlot} – {timeSlot.slice(0, 2)}:30
                          </td>
                          {Array.from({ length: numberOfCourts }, (_, i) => {
                            const court = i + 1;
                            const match = courtMatches[court];

                            // Conteúdo especial para horários de finais
                            let content = renderMatch(match, players);
                            let className = 'p-3';

                            if (
                              isThirdPlaceTime &&
                              court === 1 &&
                              tournament.phase === 'FINAL'
                            ) {
                              const thirdPlaceMatch =
                                tournament.bracketMatches.find(
                                  m => m.round === 'THIRD_PLACE'
                                );
                              if (thirdPlaceMatch) {
                                content = `🥉 3º lugar - ${getPlayerName(thirdPlaceMatch.player1Id, players)} 🆚 ${getPlayerName(thirdPlaceMatch.player2Id, players)}`;
                                className += ' text-amber-600 font-semibold';
                              }
                            } else if (
                              isFinalTime &&
                              court === 1 &&
                              tournament.phase === 'FINAL'
                            ) {
                              const finalMatch = tournament.bracketMatches.find(
                                m => m.round === 'FINAL'
                              );
                              if (finalMatch) {
                                content = `🏆 Final - ${getPlayerName(finalMatch.player1Id, players)} 🆚 ${getPlayerName(finalMatch.player2Id, players)}`;
                                className += ' text-yellow-600 font-bold';
                              }
                            } else if (isAwardTime && court === 1) {
                              content = '🏅 Premiação e fotos';
                              className += ' text-green-600 font-semibold';
                            } else if (
                              isFreeTime ||
                              (isThirdPlaceTime && court > 1) ||
                              (isFinalTime && court > 1) ||
                              (isAwardTime && court > 1)
                            ) {
                              content = 'Livre';
                              className += ' text-muted-foreground';
                            }

                            return (
                              <td key={court} className={className}>
                                {content}
                                {match?.completed && ' ✅'}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Observações */}
        <Card>
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Info className="w-5 h-5" />
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm">
                  <strong>Ranking:</strong> O ranking para a disputa do 1º, 2º e
                  3º será calculado pelas vitórias na fase de grupos. Em caso de
                  empate, saldo de games decide. Se persistir o empate,
                  confronto direto.
                </p>
              </div>

              <div className="p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg border-l-4 border-yellow-500">
                <p className="text-sm">
                  <strong>Arbitragem:</strong> Não haverá presença de juízes
                  dentro de quadra. Portanto, cada um é responsável pela
                  marcação no seu lado da quadra. Não será aceita nenhum tipo de
                  reclamação ou pedido de revisão por terceiros.
                </p>
              </div>

              <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border-l-4 border-green-500">
                <p className="text-sm">
                  <strong>Formato:</strong> As partidas serão disputadas em 01
                  (um) set de 06 (seis) games sem vantagem, em caso de empate
                  5x5 (cinco a cinco), o jogo será decidido em 01 &quot;tie
                  break&quot; (7 pontos)
                </p>
              </div>

              <div className="p-4 bg-purple-50 dark:bg-purple-950 rounded-lg border-l-4 border-purple-500">
                <p className="text-sm">
                  <strong>Link oficial:</strong>{' '}
                  <a
                    href="https://tennischamp.vercel.app?tournament=hklWRkxN2LfUvT2a0NDb"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-purple-600 dark:text-purple-400 hover:underline font-medium"
                  >
                    https://tennischamp.vercel.app?tournament=hklWRkxN2LfUvT2a0NDb
                  </a>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function SchedulePage() {
  return (
    <TournamentProvider>
      <ScheduleContent />
    </TournamentProvider>
  );
}
