
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import PlayerList from './pages/PlayerList.tsx';
import Ranking from './pages/Ranking.tsx';
import CreateMatch from './pages/CreateMatch.tsx';
import Profile from './pages/Profile.tsx';
import { Page, Player, Match } from './types.ts';
import { auth, db, onAuthStateChanged, onSnapshot, collection, query, orderBy, doc, setDoc, getDoc } from './services/firebase.ts';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Login);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Garantir que o jogador existe no Firestore
        const playerDocRef = doc(db, "players", firebaseUser.uid);
        const playerDoc = await getDoc(playerDocRef);
        
        if (!playerDoc.exists()) {
          await setDoc(playerDocRef, {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || "Jogador Anônimo",
            photoUrl: firebaseUser.photoURL || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop",
            goals: 0,
            position: 'A definir',
            status: 'pendente',
            skills: { attack: 50, defense: 50, stamina: 50 }
          });
        }
        setCurrentPage(Page.Dashboard);
      } else {
        setCurrentPage(Page.Login);
      }
      setLoading(false);
    });

    // Sync Players from Firestore
    const qPlayers = query(collection(db, "players"), orderBy("goals", "desc"));
    const unsubscribePlayers = onSnapshot(qPlayers, (snapshot) => {
      const playerList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
      setPlayers(playerList);
    });

    // Sync Active Match
    const qMatches = query(collection(db, "matches"), orderBy("date", "desc"));
    const unsubscribeMatches = onSnapshot(qMatches, (snapshot) => {
      if (!snapshot.empty) {
        setCurrentMatch({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Match);
      } else {
        setCurrentMatch(null);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribePlayers();
      unsubscribeMatches();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-deep flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(237,29,35,0.3)]"></div>
          <p className="text-white/50 font-black text-[10px] tracking-[0.3em] uppercase animate-pulse">Iniciando Arena Pro...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    if (!user) return <Login onLogin={() => {}} />;

    switch (currentPage) {
      case Page.Dashboard:
        return <Dashboard match={currentMatch} />;
      case Page.PlayerList:
        return <PlayerList players={players} currentUser={user} />;
      case Page.Ranking:
        return <Ranking players={players} />;
      case Page.CreateMatch:
        return <CreateMatch onMatchCreated={() => setCurrentPage(Page.Dashboard)} />;
      case Page.Profile:
        const currentPlayer = players.find(p => p.id === user.uid) || {
          id: user.uid,
          name: user.displayName,
          photoUrl: user.photoURL,
          goals: 0,
          position: 'A definir',
          status: 'pendente',
          skills: { attack: 50, defense: 50, stamina: 50 }
        } as Player;
        return <Profile player={currentPlayer} />;
      default:
        return <Dashboard match={currentMatch} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

export default App;
