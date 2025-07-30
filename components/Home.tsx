'use client';

import CourtSettings from '@/components/CourtSettings';
import MatchDraw from '@/components/MatchDraw';
import PlayerRegistration from '@/components/PlayerRegistration';
import ResetTournament from '@/components/ResetTournament';
import ShareTournament from '@/components/ShareTournament';
import TournamentBracket from '@/components/TournamentBracket';
import { TournamentManager } from '@/components/TournamentManager';
import TournamentTable from '@/components/TournamentTable';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useTournament } from '@/contexts/TournamentContext';
import Image from 'next/image';

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
          <h1 className="text-2xl sm:text-4xl font-bold">Presença Open</h1>
        </div>
        {tournamentId && (
          <div className="flex items-center gap-2">
            <ShareTournament />
            <ResetTournament />
          </div>
        )}
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

            <CourtSettings />

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
