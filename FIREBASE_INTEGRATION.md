# Integração Firebase - Presença Open

## Visão Geral

A aplicação agora está totalmente integrada com Firebase Firestore para persistência de dados em tempo real. Os dados não são mais salvos apenas no localStorage, mas sim sincronizados em tempo real com o banco de dados na nuvem.

## Estrutura do Banco de Dados

### Coleções Criadas:

#### 1. `tournaments`
Armazena os dados principais de cada torneio:
```typescript
{
  id: string;
  phase: 'GROUP' | 'FINAL';
  numberOfCourts: number;
  matchesDrawn: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

#### 2. `players`
Armazena todos os jogadores, organizados por torneio:
```typescript
{
  id: string;
  tournamentId: string;
  name: string;
  nickname: string;
  photoUrl: string;
  points: number;
  gamesWon: number;
  gamesLost: number;
  matchesPlayed: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

#### 3. `matches`
Armazena todas as partidas (normais e da fase final):
```typescript
{
  id: string;
  tournamentId: string;
  player1Id: string;
  player2Id: string;
  player1Games: number;
  player2Games: number;
  completed: boolean;
  date: string;
  courtNumber?: number;
  timeSlot?: string;
  round?: 'SEMIFINALS' | 'FINAL' | 'THIRD_PLACE'; // apenas para partidas da fase final
  createdAt: Date;
  updatedAt: Date;
}
```

#### 4. `settings`
Armazena configurações do torneio:
```typescript
{
  id: string;
  tournamentId: string;
  playerLimit: number;
  numberOfCourts: number;
  createdAt: Date;
  updatedAt: Date;
}
```

## Funcionalidades Implementadas

### 1. Gerenciamento de Torneios
- **Criar novo torneio**: Cria um novo torneio no Firebase e define como ativo
- **Resetar torneio**: Remove completamente o torneio atual do Firebase
- **Sincronização em tempo real**: Todos os dados são sincronizados automaticamente

### 2. Gerenciamento de Jogadores
- **Adicionar jogador**: Persiste no Firebase com sincronização imediata
- **Visualização em tempo real**: Jogadores aparecem instantaneamente para todos os usuários

### 3. Gerenciamento de Partidas
- **Sortear partidas**: Todas as partidas são salvas no Firebase
- **Atualizar resultados**: Resultados são persistidos e sincronizados
- **Programação de quadras**: Horários e quadras são mantidos no Firebase

### 4. Configurações
- **Limite de jogadores**: Persistido no Firebase
- **Número de quadras**: Sincronizado em tempo real

### 5. Sincronização em Tempo Real
- Todos os dados são sincronizados instantaneamente entre todos os dispositivos conectados
- Utiliza listeners do Firestore para updates automáticos
- Estado de loading e erro são gerenciados adequadamente

## Como Usar

### 1. Primeiro Acesso
- Ao abrir a aplicação, você verá o "Gerenciamento de Torneio"
- Clique em "Criar Novo Torneio" para começar

### 2. Configurando o Torneio
- Defina o limite de jogadores (padrão: 5)
- Configure o número de quadras disponíveis (padrão: 2)

### 3. Adicionando Jogadores
- Use o formulário de "Cadastro de Jogadores"
- Jogadores aparecerão imediatamente na lista

### 4. Sorteando Partidas
- Quando atingir o limite de jogadores, clique em "Sortear Partidas"
- As partidas serão programadas automaticamente nos horários e quadras

### 5. Registrando Resultados
- Na tabela de partidas, clique em "Editar" para inserir o resultado
- Os pontos e estatísticas são calculados automaticamente

### 6. Fase Final
- Quando todas as partidas da fase de grupos estiverem completas
- Clique em "Avançar para Final" para criar as partidas eliminatórias

## Vantagens da Integração Firebase

### 1. **Persistência Confiável**
- Dados nunca são perdidos (diferente do localStorage)
- Backup automático na nuvem

### 2. **Sincronização Multi-dispositivo**
- Múltiplos usuários podem gerenciar o mesmo torneio
- Updates em tempo real para todos os conectados

### 3. **Escalabilidade**
- Suporta múltiplos torneios simultâneos
- Histórico completo de todos os torneios

### 4. **Performance**
- Carregamento otimizado com listeners seletivos
- Estados de loading apropriados

### 5. **Robustez**
- Tratamento de erros adequado
- Retry automático em caso de falhas de rede

## Configuração

A configuração do Firebase está em `lib/firebase.ts` usando as credenciais fornecidas:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyD2Iorp7xvbgEImIbuieWspAe_0yFvz2v4",
  authDomain: "presenca-open.firebaseapp.com",
  projectId: "presenca-open",
  storageBucket: "presenca-open.firebasestorage.app",
  messagingSenderId: "167081822431",
  appId: "1:167081822431:web:3f1055e9af9cb084d6816a"
};
```

## Estrutura de Arquivos

- `lib/firebase.ts` - Configuração do Firebase
- `lib/firestore.ts` - Funções de CRUD e listeners
- `lib/useTournamentId.ts` - Hook para gerenciar torneio ativo
- `contexts/TournamentContext.tsx` - Contexto atualizado com Firebase
- `components/TournamentManager.tsx` - Componente de gerenciamento

## Próximos Passos Possíveis

1. **Autenticação**: Adicionar login para torneios privados
2. **Compartilhamento**: URLs únicos para cada torneio
3. **Histórico**: Listagem de torneios anteriores
4. **Estatísticas**: Métricas avançadas de performance
5. **Notificações**: Push notifications para updates importantes

A integração está completa e pronta para uso em produção! 