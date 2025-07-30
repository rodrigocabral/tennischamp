'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTournament } from '@/contexts/TournamentContext';
import { useState } from 'react';
import PlayerLimit from './PlayerLimit';

export default function PlayerRegistration() {
  const { tournament, addPlayer, playerLimit } = useTournament();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPlayer(formData);
    setFormData({ name: '', nickname: '' });
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-col gap-4">
        <div className="flex items-center gap-2">
          <PlayerLimit />
          <span className="text-sm text-muted-foreground">
            {tournament.players.length} de {playerLimit} jogadores
          </span>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              disabled={tournament.players.length >= playerLimit}
              variant="outline"
              className="w-full sm:w-auto"
            >
              {tournament.players.length >= playerLimit
                ? 'Limite de jogadores atingido'
                : 'Adicionar Jogador'}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle className="text-center">
                Adicionar Novo Jogador
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, name: e.target.value }))
                  }
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname">Apelido</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={e =>
                    setFormData(prev => ({ ...prev, nickname: e.target.value }))
                  }
                  required
                  className="w-full"
                />
              </div>
              <Button type="submit" className="w-full">
                Cadastrar
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
