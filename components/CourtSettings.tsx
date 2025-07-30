import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTournament } from "@/contexts/TournamentContext";

export default function CourtSettings() {
  const { numberOfCourts, setNumberOfCourts, tournament } = useTournament();

  const handleCourtsChange = (value: string) => {
    const courts = Math.max(1, Math.min(10, parseInt(value) || 1));
    setNumberOfCourts(courts);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Configuração das Quadras</CardTitle>
        <CardDescription className="text-sm">
          Defina quantas quadras estão disponíveis para o torneio
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="courts" className="text-sm font-medium">
            Número de Quadras
          </Label>
          <Input
            id="courts"
            type="number"
            min="1"
            max="10"
            value={numberOfCourts}
            onChange={(e) => handleCourtsChange(e.target.value)}
            disabled={tournament.matchesDrawn}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Mínimo: 1 quadra | Máximo: 10 quadras
          </p>
        </div>
        
        {tournament.matchesDrawn && (
          <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded">
            ⚠️ As partidas já foram sorteadas. Para alterar o número de quadras, 
            você precisa resetar o torneio.
          </div>
        )}
      </CardContent>
    </Card>
  );
} 