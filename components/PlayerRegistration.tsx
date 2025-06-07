'use client';

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTournament } from "@/contexts/TournamentContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import AvatarSelector from "./AvatarSelector";
import PlayerLimit from "./PlayerLimit";

export default function PlayerRegistration() {
  const { tournament, addPlayer, playerLimit } = useTournament();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    photoUrl: ''
  });

  // Initialize avatar URL when the form opens
  useEffect(() => {
    if (open && !formData.photoUrl) {
      const initialAvatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${Math.random().toString(36).substring(7)}`;
      setFormData(prev => ({ ...prev, photoUrl: initialAvatarUrl }));
    }
  }, [open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addPlayer(formData);
    setFormData({ name: '', nickname: '', photoUrl: '' });
    setOpen(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
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
                ? "Limite de jogadores atingido"
                : "Adicionar Jogador"}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] w-[95vw] sm:w-full">
            <DialogHeader>
              <DialogTitle className="text-center">Adicionar Novo Jogador</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname">Apelido</Label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-center block">Avatar</Label>
                <AvatarSelector
                  value={formData.photoUrl}
                  onChange={(url) => setFormData(prev => ({ ...prev, photoUrl: url }))}
                  nickname={formData.nickname}
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