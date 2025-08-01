'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTournament } from '@/contexts/TournamentContext';
import { Plus, Settings, Trash2 } from 'lucide-react';
import { useState } from 'react';

export default function TournamentSettings() {
  const {
    playerLimit,
    setPlayerLimit,
    numberOfCourts,
    setNumberOfCourts,
    timeSlots,
    setTimeSlots,
    tournament,
  } = useTournament();

  const [isOpen, setIsOpen] = useState(false);
  const [newPlayerLimit, setNewPlayerLimit] = useState(playerLimit);
  const [newNumberOfCourts, setNewNumberOfCourts] = useState(numberOfCourts);
  const [newTimeSlots, setNewTimeSlots] = useState(timeSlots);
  const [newTimeSlot, setNewTimeSlot] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validação do limite de jogadores
    if (newPlayerLimit < 4) {
      setError('O limite mínimo é de 4 jogadores');
      return;
    }

    if (newPlayerLimit < tournament.players.length) {
      setError(
        `Não é possível definir um limite menor que o número atual de jogadores (${tournament.players.length})`
      );
      return;
    }

    // Validação do número de quadras
    if (newNumberOfCourts < 1 || newNumberOfCourts > 10) {
      setError('O número de quadras deve estar entre 1 e 10');
      return;
    }

    // Validação dos timeSlots
    if (newTimeSlots.length === 0) {
      setError('É necessário pelo menos um horário');
      return;
    }

    // Aplicar alterações
    setPlayerLimit(newPlayerLimit);
    setNumberOfCourts(newNumberOfCourts);
    setTimeSlots(newTimeSlots);
    setIsOpen(false);
  };

  const addTimeSlot = () => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(newTimeSlot)) {
      setError('Formato de horário inválido. Use HH:MM (ex: 08:30)');
      return;
    }

    if (newTimeSlots.includes(newTimeSlot)) {
      setError('Este horário já existe');
      return;
    }

    setNewTimeSlots([...newTimeSlots, newTimeSlot].sort());
    setNewTimeSlot('');
    setError(null);
  };

  const removeTimeSlot = (slot: string) => {
    setNewTimeSlots(newTimeSlots.filter(s => s !== slot));
  };

  const handleCancel = () => {
    setNewPlayerLimit(playerLimit);
    setNewNumberOfCourts(numberOfCourts);
    setNewTimeSlots(timeSlots);
    setNewTimeSlot('');
    setError(null);
    setIsOpen(false);
  };

  // Sincronizar valores quando o modal for aberto
  const handleOpenChange = (open: boolean) => {
    if (open) {
      setNewPlayerLimit(playerLimit);
      setNewNumberOfCourts(numberOfCourts);
      setNewTimeSlots(timeSlots);
      setNewTimeSlot('');
      setError(null);
    }
    setIsOpen(open);
  };

  const canModifySettings =
    tournament.phase === 'GROUP' && !tournament.matchesDrawn;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" className="gap-2">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Configurações do Torneio</DialogTitle>
          <DialogDescription>
            Configure os parâmetros do torneio: limite de jogadores, quadras e
            horários.
            {!canModifySettings && (
              <span className="block text-amber-600 mt-2">
                ⚠️ Algumas configurações só podem ser alteradas durante a fase
                de grupos antes do sorteio das partidas.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Limite de Jogadores */}
          <div className="space-y-2">
            <Label htmlFor="playerLimit" className="text-sm font-medium">
              Limite de Jogadores
            </Label>
            <Input
              id="playerLimit"
              type="number"
              min="4"
              value={newPlayerLimit}
              onChange={e => {
                setNewPlayerLimit(parseInt(e.target.value) || 4);
                setError(null);
              }}
              disabled={!canModifySettings}
            />
            <p className="text-xs text-muted-foreground">
              Mínimo: 4 jogadores | Atual: {tournament.players.length} jogadores
            </p>
          </div>

          {/* Número de Quadras */}
          <div className="space-y-2">
            <Label htmlFor="numberOfCourts" className="text-sm font-medium">
              Número de Quadras
            </Label>
            <Input
              id="numberOfCourts"
              type="number"
              min="1"
              max="10"
              value={newNumberOfCourts}
              onChange={e => {
                setNewNumberOfCourts(parseInt(e.target.value) || 1);
                setError(null);
              }}
              disabled={tournament.matchesDrawn}
            />
            <p className="text-xs text-muted-foreground">
              Mínimo: 1 quadra | Máximo: 10 quadras
            </p>
          </div>

          {/* Horários */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Horários Disponíveis</Label>

            {/* Adicionar novo horário */}
            <div className="flex gap-2">
              <Input
                placeholder="HH:MM (ex: 08:30)"
                value={newTimeSlot}
                onChange={e => {
                  setNewTimeSlot(e.target.value);
                  setError(null);
                }}
                onKeyPress={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTimeSlot();
                  }
                }}
              />
              <Button
                type="button"
                onClick={addTimeSlot}
                size="sm"
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            {/* Lista de horários */}
            <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
              {newTimeSlots.map(slot => (
                <div
                  key={slot}
                  className="flex items-center justify-between bg-gray-50 p-2 rounded text-sm"
                >
                  <span>{slot}</span>
                  <Button
                    type="button"
                    onClick={() => removeTimeSlot(slot)}
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-red-100"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Total de horários: {newTimeSlots.length}
            </p>
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit">Salvar Configurações</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
