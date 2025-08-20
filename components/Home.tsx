'use client';

import MatchDraw from '@/components/MatchDraw';
import PlayerRegistration from '@/components/PlayerRegistration';
import ResetTournament from '@/components/ResetTournament';
import ShareTournament from '@/components/ShareTournament';
import TournamentBracket from '@/components/TournamentBracket';
import { TournamentManager } from '@/components/TournamentManager';
import TournamentSettings from '@/components/TournamentSettings';
import TournamentTable from '@/components/TournamentTable';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTournament } from '@/contexts/TournamentContext';
import { Calendar } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function Home() {
  const { tournament, tournamentId } = useTournament();
  return (
    <main className="container mx-auto py-4 px-2 sm:py-8 sm:px-4 max-w-3xl">
      <div className="flex items-center justify-between mb-4 sm:mb-8">
        <div className="flex items-center gap-3 sm:gap-4">
          <Image
            src="/logo_presenca_open.png"
            alt="Presença Open Logo"
            width={60}
            height={60}
            className="sm:w-[70px] sm:h-[100px]"
          />
          <div className="flex flex-col items-start gap-1">
            <h1 className="text-2xl sm:text-4xl font-bold">Presença Open</h1>
            <span className="text-xs">
              #{tournamentId}
            </span>
          </div>
        </div>
        {tournamentId && (
          <div className="flex items-center gap-2">
            <TournamentSettings />
            <ShareTournament />
            <ResetTournament />
          </div>
        )}
      </div>

      {/* Link para o Cronograma */}
      <div className="mb-4 sm:mb-6">
        <Link href="/schedule">
          <Button
            variant="outline"
            className="w-full sm:w-auto flex items-center gap-2"
          >
            <Calendar className="w-4 h-4" />
            📅 Ver Cronograma Oficial
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:gap-8">
        <TournamentManager />

        {tournamentId && (
          <>
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">
                  Cadastro de Jogadores
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <PlayerRegistration />
              </CardContent>
            </Card>

            <MatchDraw />

            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">
                  Tabela do Torneio
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6">
                <TournamentTable />
              </CardContent>
            </Card>

            {tournament.phase === 'FINAL' && (
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <TournamentBracket />
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </main>
  );
}
