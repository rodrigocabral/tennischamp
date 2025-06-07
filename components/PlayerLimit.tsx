'use client';

import { useTournament } from "@/contexts/TournamentContext";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Users } from "lucide-react";

export default function PlayerLimit() {
  const { playerLimit, setPlayerLimit, tournament } = useTournament();
  const [isOpen, setIsOpen] = useState(false);
  const [newLimit, setNewLimit] = useState(playerLimit);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    if (newLimit < 4) {
      setError("O limite mínimo é de 4 jogadores");
      return;
    }
    
    if (newLimit < tournament.players.length) {
      setError(`Não é possível definir um limite menor que o número atual de jogadores (${tournament.players.length})`);
      return;
    }

    if (tournament.phase !== 'GROUP') {
      setError("Só é possível alterar o limite de jogadores durante a fase de grupos");
      return;
    }

    setPlayerLimit(newLimit);
    setError(null);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-2">
          <Users className="h-4 w-4" />
          <span className="text-sm">{playerLimit} Jogadores</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Limite de Jogadores</DialogTitle>
          <DialogDescription>
            Defina o número máximo de jogadores permitidos no torneio.
            {tournament.phase !== 'GROUP' && (
              " Esta opção só está disponível durante a fase de grupos."
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Número de Jogadores
            </label>
            <Input
              type="number"
              min="4"
              value={newLimit}
              onChange={(e) => {
                setNewLimit(parseInt(e.target.value) || 4);
                setError(null);
              }}
              disabled={tournament.phase !== 'GROUP'}
            />
            {error && (
              <p className="text-sm text-red-500">{error}</p>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsOpen(false);
                setNewLimit(playerLimit);
                setError(null);
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={tournament.phase !== 'GROUP' || newLimit === playerLimit}
            >
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 