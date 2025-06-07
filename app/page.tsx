'use client';

import { TournamentProvider } from "@/contexts/TournamentContext";
import TournamentTable from "@/components/TournamentTable";
import TournamentBracket from "@/components/TournamentBracket";
import PlayerRegistration from "@/components/PlayerRegistration";
import ResetTournament from "@/components/ResetTournament";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <TournamentProvider>
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

          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Tabela do Torneio</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <TournamentTable />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <TournamentBracket />
            </CardContent>
          </Card>
        </div>
      </main>
    </TournamentProvider>
  );
}
