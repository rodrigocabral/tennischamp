import { BracketMatch, Match, Player, Tournament } from '@/types';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';

// Collections references
const TOURNAMENTS_COLLECTION = 'tournaments';
const PLAYERS_COLLECTION = 'players';
const MATCHES_COLLECTION = 'matches';
const SETTINGS_COLLECTION = 'settings';

export interface TournamentSettings {
  id: string;
  tournamentId: string;
  playerLimit: number;
  numberOfCourts: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreTournament
  extends Omit<Tournament, 'players' | 'matches' | 'bracketMatches'> {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestorePlayer extends Player {
  tournamentId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreMatch extends Match {
  tournamentId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreBracketMatch extends BracketMatch {
  tournamentId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FirestoreAllMatch {
  id: string;
  player1Id: string;
  player2Id: string;
  player1Games: number;
  player2Games: number;
  completed: boolean;
  date: string;
  courtNumber?: number;
  timeSlot?: string;
  tournamentId: string;
  createdAt: Date;
  updatedAt: Date;
  round?: 'SEMIFINALS' | 'FINAL' | 'THIRD_PLACE';
}

// Tournament operations
export const createTournament = async (
  tournament: Omit<Tournament, 'players' | 'matches' | 'bracketMatches'>
): Promise<string> => {
  const now = new Date();
  const tournamentData: FirestoreTournament = {
    ...tournament,
    id: '',
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(
    collection(db, TOURNAMENTS_COLLECTION),
    tournamentData
  );
  await updateDoc(docRef, { id: docRef.id });

  return docRef.id;
};

export const getTournament = async (
  tournamentId: string
): Promise<FirestoreTournament | null> => {
  const docRef = doc(db, TOURNAMENTS_COLLECTION, tournamentId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    const data = docSnap.data();
    return {
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as FirestoreTournament;
  }

  return null;
};

export const updateTournament = async (
  tournamentId: string,
  updates: Partial<Tournament>
): Promise<void> => {
  const docRef = doc(db, TOURNAMENTS_COLLECTION, tournamentId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date(),
  });
};

export const deleteTournament = async (tournamentId: string): Promise<void> => {
  const batch = writeBatch(db);

  // Delete tournament
  const tournamentRef = doc(db, TOURNAMENTS_COLLECTION, tournamentId);
  batch.delete(tournamentRef);

  // Delete all players
  const playersSnapshot = await getDocs(
    query(
      collection(db, PLAYERS_COLLECTION),
      where('tournamentId', '==', tournamentId)
    )
  );
  playersSnapshot.docs.forEach(doc => batch.delete(doc.ref));

  // Delete all matches
  const matchesSnapshot = await getDocs(
    query(
      collection(db, MATCHES_COLLECTION),
      where('tournamentId', '==', tournamentId)
    )
  );
  matchesSnapshot.docs.forEach(doc => batch.delete(doc.ref));

  // Delete settings
  const settingsSnapshot = await getDocs(
    query(
      collection(db, SETTINGS_COLLECTION),
      where('tournamentId', '==', tournamentId)
    )
  );
  settingsSnapshot.docs.forEach(doc => batch.delete(doc.ref));

  await batch.commit();
};

// Player operations
export const addPlayer = async (
  tournamentId: string,
  player: Omit<Player, 'id'>
): Promise<string> => {
  const now = new Date();
  const playerData: Omit<FirestorePlayer, 'id'> = {
    ...player,
    tournamentId,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, PLAYERS_COLLECTION), playerData);
  await updateDoc(docRef, { id: docRef.id });

  return docRef.id;
};

export const getPlayers = async (
  tournamentId: string
): Promise<FirestorePlayer[]> => {
  const q = query(
    collection(db, PLAYERS_COLLECTION),
    where('tournamentId', '==', tournamentId),
    orderBy('createdAt', 'asc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => {
    const data = doc.data();
    return {
      ...data,
      createdAt: data.createdAt.toDate(),
      updatedAt: data.updatedAt.toDate(),
    } as FirestorePlayer;
  });
};

export const updatePlayer = async (
  playerId: string,
  updates: Partial<Player>
): Promise<void> => {
  const docRef = doc(db, PLAYERS_COLLECTION, playerId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date(),
  });
};

export const deletePlayer = async (playerId: string): Promise<void> => {
  const docRef = doc(db, PLAYERS_COLLECTION, playerId);
  await deleteDoc(docRef);
};

// Match operations
export const addMatch = async (
  tournamentId: string,
  match: Omit<Match, 'id'>
): Promise<string> => {
  const now = new Date();
  const matchData: Omit<FirestoreMatch, 'id'> = {
    ...match,
    tournamentId,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, MATCHES_COLLECTION), matchData);
  await updateDoc(docRef, { id: docRef.id });

  return docRef.id;
};

export const addBracketMatch = async (
  tournamentId: string,
  match: Omit<BracketMatch, 'id'>
): Promise<string> => {
  const now = new Date();
  const matchData: Omit<FirestoreBracketMatch, 'id'> = {
    ...match,
    tournamentId,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(collection(db, MATCHES_COLLECTION), matchData);
  await updateDoc(docRef, { id: docRef.id });

  return docRef.id;
};

export const getMatches = async (
  tournamentId: string
): Promise<FirestoreMatch[]> => {
  const q = query(
    collection(db, MATCHES_COLLECTION),
    where('tournamentId', '==', tournamentId),
    orderBy('createdAt', 'asc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .filter(doc => !doc.data().round) // Filter out bracket matches
    .map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as FirestoreMatch;
    });
};

export const getBracketMatches = async (
  tournamentId: string
): Promise<FirestoreBracketMatch[]> => {
  const q = query(
    collection(db, MATCHES_COLLECTION),
    where('tournamentId', '==', tournamentId),
    orderBy('createdAt', 'asc')
  );

  const querySnapshot = await getDocs(q);
  return querySnapshot.docs
    .filter(doc => doc.data().round) // Filter only bracket matches
    .map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as FirestoreBracketMatch;
    });
};

export const updateMatch = async (
  matchId: string,
  updates: Partial<Match>
): Promise<void> => {
  const docRef = doc(db, MATCHES_COLLECTION, matchId);
  await updateDoc(docRef, {
    ...updates,
    updatedAt: new Date(),
  });
};

export const deleteMatch = async (matchId: string): Promise<void> => {
  const docRef = doc(db, MATCHES_COLLECTION, matchId);
  await deleteDoc(docRef);
};

export const deleteAllMatches = async (tournamentId: string): Promise<void> => {
  const q = query(
    collection(db, MATCHES_COLLECTION),
    where('tournamentId', '==', tournamentId)
  );

  const querySnapshot = await getDocs(q);
  const batch = writeBatch(db);

  querySnapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });

  await batch.commit();
};

// Settings operations
export const createTournamentSettings = async (
  tournamentId: string,
  settings: Omit<
    TournamentSettings,
    'id' | 'tournamentId' | 'createdAt' | 'updatedAt'
  >
): Promise<string> => {
  const now = new Date();
  const settingsData: Omit<TournamentSettings, 'id'> = {
    ...settings,
    tournamentId,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await addDoc(
    collection(db, SETTINGS_COLLECTION),
    settingsData
  );
  await updateDoc(docRef, { id: docRef.id });

  return docRef.id;
};

export const getTournamentSettings = async (
  tournamentId: string
): Promise<TournamentSettings | null> => {
  const q = query(
    collection(db, SETTINGS_COLLECTION),
    where('tournamentId', '==', tournamentId)
  );

  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    return null;
  }

  const data = querySnapshot.docs[0].data();
  return {
    ...data,
    createdAt: data.createdAt.toDate(),
    updatedAt: data.updatedAt.toDate(),
  } as TournamentSettings;
};

export const updateTournamentSettings = async (
  tournamentId: string,
  updates: Partial<TournamentSettings>
): Promise<void> => {
  const q = query(
    collection(db, SETTINGS_COLLECTION),
    where('tournamentId', '==', tournamentId)
  );

  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const docRef = querySnapshot.docs[0].ref;
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  }
};

// Real-time listeners
export const subscribeTournament = (
  tournamentId: string,
  callback: (tournament: FirestoreTournament | null) => void
) => {
  const docRef = doc(db, TOURNAMENTS_COLLECTION, tournamentId);

  return onSnapshot(docRef, doc => {
    if (doc.exists()) {
      const data = doc.data();
      callback({
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as FirestoreTournament);
    } else {
      callback(null);
    }
  });
};

export const subscribePlayers = (
  tournamentId: string,
  callback: (players: FirestorePlayer[]) => void
) => {
  const q = query(
    collection(db, PLAYERS_COLLECTION),
    where('tournamentId', '==', tournamentId),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(q, querySnapshot => {
    const players = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as FirestorePlayer;
    });
    callback(players);
  });
};

export const subscribeMatches = (
  tournamentId: string,
  callback: (
    matches: FirestoreMatch[],
    bracketMatches: FirestoreBracketMatch[]
  ) => void
) => {
  const matchesQuery = query(
    collection(db, MATCHES_COLLECTION),
    where('tournamentId', '==', tournamentId),
    orderBy('createdAt', 'asc')
  );

  return onSnapshot(matchesQuery, querySnapshot => {
    const allMatches: FirestoreAllMatch[] = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as FirestoreAllMatch;
    });

    // Separate regular matches from bracket matches
    const regularMatches = allMatches.filter(
      match => !match.round
    ) as FirestoreMatch[];
    const bracketMatches = allMatches.filter(
      match => match.round
    ) as FirestoreBracketMatch[];

    callback(regularMatches, bracketMatches);
  });
};

export const subscribeSettings = (
  tournamentId: string,
  callback: (settings: TournamentSettings | null) => void
) => {
  const q = query(
    collection(db, SETTINGS_COLLECTION),
    where('tournamentId', '==', tournamentId)
  );

  return onSnapshot(q, querySnapshot => {
    if (querySnapshot.empty) {
      callback(null);
    } else {
      const data = querySnapshot.docs[0].data();
      callback({
        ...data,
        createdAt: data.createdAt.toDate(),
        updatedAt: data.updatedAt.toDate(),
      } as TournamentSettings);
    }
  });
};
