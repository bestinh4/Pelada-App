
import React, { useState, useEffect, useRef } from 'react';
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
import { requestNotificationPermission, sendPushNotification } from './services/notificationService.ts';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Login);
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  
  const isFirstLoad = useRef(true);
  const prevPlayersState = useRef<Record<string, Player>>({});

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        requestNotificationPermission(firebaseUser.uid);

        try {
          const playerDocRef = doc(db, "players", firebaseUser.uid);
          const playerDoc = await getDoc(playerDocRef);
          
          if (firebaseUser.email === MASTER_ADMIN_EMAIL) {
            const updates: any = {};
            if (!playerDoc.exists() || playerDoc.data()?.role !== 'admin') updates.role = 'admin';
            if (playerDoc.exists() && playerDoc.data()?.email !== MASTER_ADMIN_EMAIL) updates.email = MASTER_ADMIN_EMAIL;
            if (Object.keys(updates).length > 0) await updateDoc(playerDocRef, updates).catch(() => {});
          }

          if (!playerDoc.exists()) {
            setCurrentPage(Page.Onboarding);
          } else {
            setCurrentPage(Page.Dashboard);
          }
        } catch (err) { 
          setCurrentPage(Page.Dashboard);
        }
      } else {
        setUser(null);
        setCurrentPage(Page.Login);
      }
      setLoading(false);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!user) return;

    // Listener de Jogadores
    const qPlayers = query(collection(db, "players"), orderBy("goals", "desc"));
    const unsubscribePlayers = onSnapshot(qPlayers, (snapshot) => {
      const playerList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Player));
      
      const currentPlayerRecord = playerList.find(p => p.id === user?.uid);
      const isAdmin = currentPlayerRecord?.role === 'admin' || user?.email === MASTER_ADMIN_EMAIL;

      if (isAdmin && !isFirstLoad.current) {
        snapshot.docChanges().forEach((change) => {
          const playerData = change.doc.data() as Player;
          const oldPlayerData = prevPlayersState.current[change.doc.id] as Player | undefined;

          if (change.type === "added") {
            sendPushNotification("🆕 NOVO ATLETA!", `${playerData.name} entrou na Elite!`);
          } 
          
          if (change.type === "modified" && oldPlayerData) {
            if (oldPlayerData.status !== playerData.status) {
              if (playerData.status === 'presente') {
                sendPushNotification("✅ CONFIRMAÇÃO!", `${playerData.name} confirmou presença!`);
              } else {
                sendPushNotification("❌ DESISTÊNCIA!", `${playerData.name} saiu do jogo.`);
              }
            }
          }
        });
      }

      const newState: Record<string, Player> = {};
      playerList.forEach(p => newState[p.id] = p);
      prevPlayersState.current = newState;
      isFirstLoad.current = false;
      setPlayers(playerList);
    });

    // Listener de Partidas
    const qMatches = query(collection(db, "matches"), orderBy("createdAt", "desc"));
    const unsubscribeMatches = onSnapshot(qMatches, (snapshot) => {
      if (!snapshot.empty) {
        setCurrentMatch({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Match);
      }
    });

    return () => {
      unsubscribePlayers();
      unsubscribeMatches();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-navy font-black text-[10px] tracking-[0.4em] uppercase animate-pulse">Sincronizando Arena...</p>
        </div>
      </div>
    );
  }

  const currentPlayer = players.find(p => p.id === user?.uid);
  const effectiveRole = user?.email === MASTER_ADMIN_EMAIL ? 'admin' : currentPlayer?.role;

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage} currentUserRole={effectiveRole}>
      <div className="animate-fade-in">
        {!user && <Login />}
        {user && currentPage === Page.Onboarding && <Onboarding user={user} onComplete={() => setCurrentPage(Page.Dashboard)} />}
        {user && currentPage === Page.Dashboard && <Dashboard match={currentMatch} players={players} user={user} onPageChange={setCurrentPage} />}
        {user && currentPage === Page.PlayerList && <PlayerList players={players} currentUser={user} match={currentMatch} onPageChange={setCurrentPage} />}
        {user && currentPage === Page.Ranking && <Ranking players={players} currentUser={user} onPageChange={setCurrentPage} />}
        {user && currentPage === Page.CreateMatch && <CreateMatch players={players} currentUser={user} onPageChange={setCurrentPage} />}
        {user && currentPage === Page.Profile && (
          <Profile 
            player={currentPlayer || { id: user.uid, name: user.displayName, email: user.email, photoUrl: user.photoURL, goals: 0, assists: 0, position: 'A definir', status: 'pendente', role: effectiveRole } as Player} 
            currentUserEmail={user?.email} 
            onPageChange={setCurrentPage} 
          />
        )}
      </div>
    </Layout>
  );
};

export default App;
