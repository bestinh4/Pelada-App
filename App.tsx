
import React, { useState, useEffect } from 'https://esm.sh/react@18.2.0';
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

    const qPlayers = query(collection(db, "players"), orderBy("goals", "desc"));
    const unsubscribePlayers = onSnapshot(qPlayers, (snapshot) => {
      const playerList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
      setPlayers(playerList);
    });

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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-navy font-black text-[10px] tracking-[0.3em] uppercase">CARREGANDO ARENA...</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    if (!user) return <Login />;

    switch (currentPage) {
      case Page.Dashboard:
        return <Dashboard match={currentMatch} players={players} user={user} onPageChange={setCurrentPage} />;
      case Page.PlayerList:
        return <PlayerList players={players} currentUser={user} onPageChange={setCurrentPage} />;
      case Page.Ranking:
        return <Ranking players={players} onPageChange={setCurrentPage} />;
      case Page.CreateMatch:
        return <CreateMatch onMatchCreated={() => setCurrentPage(Page.Dashboard)} onPageChange={setCurrentPage} />;
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
        return <Profile player={currentPlayer} onPageChange={setCurrentPage} />;
      default:
        return <Dashboard match={currentMatch} players={players} user={user} onPageChange={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

export default App;
