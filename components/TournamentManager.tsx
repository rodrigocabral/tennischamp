import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useTournament } from "@/contexts/TournamentContext";
import { Loader2, Plus, AlertCircle } from "lucide-react";

export function TournamentManager() {
  const { 
    tournamentId, 
    createNewTournament, 
    resetTournament, 
    loading, 
    error,
    tournament
  } = useTournament();
  
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateTournament = async () => {
    try {
      setIsCreating(true);
      await createNewTournament();
    } catch (error) {
      console.error("Erro ao criar torneio:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleResetTournament = async () => {
    if (window.confirm("Tem certeza que deseja resetar o torneio? Todos os dados serão perdidos.")) {
      await resetTournament();
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Carregando...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>Erro: {error}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gerenciamento de Torneio</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!tournamentId ? (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              Nenhum torneio ativo. Crie um novo torneio para começar.
            </p>
            <Button 
              onClick={handleCreateTournament} 
              disabled={isCreating}
              className="w-full"
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Novo Torneio
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Fase:</span>
                <span className="ml-2 capitalize">
                  {tournament.phase === 'GROUP' ? 'Grupos' : 'Final'}
                </span>
              </div>
              <div>
                <span className="font-medium">Jogadores:</span>
                <span className="ml-2">{tournament.players.length}</span>
              </div>
              <div>
                <span className="font-medium">Partidas:</span>
                <span className="ml-2">
                  {tournament.matches.filter(m => m.completed).length} / {tournament.matches.length}
                </span>
              </div>
              <div>
                <span className="font-medium">Quadras:</span>
                <span className="ml-2">{tournament.numberOfCourts}</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex-1">
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Torneio
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Criar Novo Torneio</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Isso criará um novo torneio. O torneio atual será mantido no Firebase.
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        onClick={handleCreateTournament} 
                        disabled={isCreating}
                        className="flex-1"
                      >
                        {isCreating ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Criando...
                          </>
                        ) : (
                          "Criar Novo"
                        )}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="destructive" className="flex-1">
                    Resetar
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Resetar Torneio</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Tem certeza que deseja resetar o torneio? Todos os dados serão permanentemente removidos do Firebase.
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        variant="destructive" 
                        onClick={handleResetTournament}
                        className="flex-1"
                      >
                        Confirmar Reset
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 