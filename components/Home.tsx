'use client';

import TournamentTable from "@/components/TournamentTable";
import TournamentBracket from "@/components/TournamentBracket";
import PlayerRegistration from "@/components/PlayerRegistration";
import ResetTournament from "@/components/ResetTournament";
import CourtSettings from "@/components/CourtSettings";
import MatchDraw from "@/components/MatchDraw";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTournament } from "@/contexts/TournamentContext";

export default function Home() {
  const { tournament } = useTournament();
  return (
      <main className="container mx-auto py-4 px-2 sm:py-8 sm:px-4 max-w-3xl">
        <div className="flex items-center justify-between mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold">
            Torneio de Tênis
          </h1>
          <ResetTournament />
        </div>
        
        <div className="grid gap-4 sm:gap-8">
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Cadastro de Jogadores</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <PlayerRegistration />
            </CardContent>
          </Card>

          <CourtSettings />

          <MatchDraw />

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Tabela do Torneio</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <TournamentTable />
            </CardContent>
          </Card>

          {
          tournament.phase === 'FINAL' && (
          <Card>
            <CardContent className="p-4 sm:p-6">
              <TournamentBracket />
            </CardContent>
          </Card>
          )}
        </div>
      </main>
  );
}
