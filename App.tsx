
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout.tsx';
import Login from './pages/Login.tsx';
import Onboarding from './pages/Onboarding.tsx';
import Dashboard from './pages/Dashboard.tsx';
import PlayerList from './pages/PlayerList.tsx';
import Ranking from './pages/Ranking.tsx';
import CreateMatch from './pages/CreateMatch.tsx';
import Profile from './pages/Profile.tsx';
import { Page, Player, Match } from './types.ts';
import { MASTER_ADMIN_EMAIL } from './constants.tsx';
import { auth, db, onAuthStateChanged, onSnapshot, collection, query, orderBy, doc, getDoc, updateDoc } from './services/firebase.ts';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Login);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const playerDocRef = doc(db, "players", firebaseUser.uid);
          const playerDoc = await getDoc(playerDocRef);
          
          // Se for o MASTER_ADMIN, garante que o role seja admin no banco também
          if (firebaseUser.email === MASTER_ADMIN_EMAIL) {
            if (!playerDoc.exists() || playerDoc.data().role !== 'admin') {
               await updateDoc(playerDocRef, { role: 'admin' }).catch(async () => {
                 // Caso o documento não exista (primeiro login)
               });
            }
          }

          if (!playerDoc.exists()) {
            setCurrentPage(Page.Onboarding);
          } else {
            setCurrentPage(Page.Dashboard);
          }
        } catch (err) { 
          console.error(err); 
          setCurrentPage(Page.Dashboard);
        }
      } else {
        setUser(null);
        setCurrentPage(Page.Login);
      }
      setLoading(false);
    });

    const qPlayers = query(collection(db, "players"), orderBy("goals", "desc"));
    const unsubscribePlayers = onSnapshot(qPlayers, (snapshot) => {
      const playerList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
      setPlayers(playerList);
    });

    const qMatches = query(collection(db, "matches"), orderBy("createdAt", "desc"));
    const unsubscribeMatches = onSnapshot(qMatches, (snapshot) => {
      if (!snapshot.empty) {
        setCurrentMatch({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Match);
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
          <p className="text-navy font-black text-[10px] tracking-[0.4em] uppercase">CARREGANDO ARENA...</p>
        </div>
      </div>
    );
  }

  const currentPlayer = players.find(p => p.id === user?.uid);
  
  // Forçar role admin para o Master se o banco ainda não atualizou
  const effectiveRole = user?.email === MASTER_ADMIN_EMAIL ? 'admin' : currentPlayer?.role;

  const renderPage = () => {
    if (!user) return <Login />;
    if (currentPage === Page.Onboarding) {
      return <Onboarding user={user} onComplete={() => setCurrentPage(Page.Dashboard)} />;
    }

    const commonProps = { onPageChange: setCurrentPage };

    switch (currentPage) {
      case Page.Dashboard:
        return <Dashboard match={currentMatch} players={players} user={user} {...commonProps} />;
      case Page.PlayerList:
        return <PlayerList players={players} currentUser={user} match={currentMatch} {...commonProps} />;
      case Page.Ranking:
        return <Ranking players={players} currentUser={user} {...commonProps} />;
      case Page.CreateMatch:
        return <CreateMatch players={players} currentUser={user} {...commonProps} />;
      case Page.Profile:
        const playerProfile = currentPlayer || { id: user.uid, name: user.displayName, photoUrl: user.photoURL, goals: 0, assists: 0, position: 'A definir', status: 'pendente', role: effectiveRole } as Player;
        return <Profile player={playerProfile} currentUserEmail={user?.email} {...commonProps} />;
      default:
        return <Dashboard match={currentMatch} players={players} user={user} {...commonProps} />;
    }
  };

  return (
    <Layout 
      currentPage={currentPage} 
      onPageChange={setCurrentPage} 
      currentUserRole={effectiveRole}
    >
      {renderPage()}
    </Layout>
  );
};

export default App;
