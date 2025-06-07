'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useTournament } from "@/contexts/TournamentContext";
import { useState } from "react";
import { TrashIcon } from "@radix-ui/react-icons";

export default function ResetTournament() {
  const { resetTournament } = useTournament();
  const [open, setOpen] = useState(false);

  const handleReset = () => {
    resetTournament();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="sm"
          className="flex items-center gap-2"
        >
          <TrashIcon className="h-4 w-4" />
          Limpar Torneio
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Limpar Torneio</DialogTitle>
          <DialogDescription>
            Tem certeza que deseja limpar todos os dados do torneio? Esta ação não pode ser desfeita.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="w-full sm:w-auto"
          >
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleReset}
            className="w-full sm:w-auto"
          >
            Sim, limpar torneio
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 