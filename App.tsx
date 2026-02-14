
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
            if (!playerDoc.exists() || playerDoc.data().role !== 'admin') updates.role = 'admin';
            if (playerDoc.exists() && playerDoc.data().email !== MASTER_ADMIN_EMAIL) updates.email = MASTER_ADMIN_EMAIL;
            if (Object.keys(updates).length > 0) await updateDoc(playerDocRef, updates).catch(() => {});
          }

          if (!playerDoc.exists()) setCurrentPage(Page.Onboarding);
          else setCurrentPage(Page.Dashboard);
        } catch (err) { 
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
      
      const currentPlayerRecord = playerList.find(p => p.id === auth.currentUser?.uid);
      const isAdmin = currentPlayerRecord?.role === 'admin' || auth.currentUser?.email === MASTER_ADMIN_EMAIL;

      if (isAdmin && !isFirstLoad.current && currentMatch) {
        snapshot.docChanges().forEach((change) => {
          const playerData = change.doc.data() as Player;
          // Fix: Cast oldPlayerData to Player | undefined to fix line 75 error where property 'status' doesn't exist on 'unknown'
          const oldPlayerData = prevPlayersState.current[change.doc.id] as Player | undefined;

          if (change.type === "added") {
            sendPushNotification("🆕 NOVO ATLETA!", `${playerData.name} entrou na Elite!`);
          } 
          
          if (change.type === "modified" && oldPlayerData) {
            if (oldPlayerData.status !== playerData.status) {
              if (playerData.status === 'presente') {
                // Verificar se entrou na principal ou espera
                // Fix: Cast Object.values to Player[] to ensure p has the correct type in filter and subsequent filter calls
                const confirmedBefore = (Object.values(prevPlayersState.current) as Player[]).filter(p => p.status === 'presente');
                const isGK = playerData.position === 'Goleiro';
                const limit = isGK ? currentMatch.gkSlots : currentMatch.fieldSlots;
                const countSamePos = confirmedBefore.filter(p => p.position === (isGK ? 'Goleiro' : p.position !== 'Goleiro')).length;
                
                if (countSamePos >= limit) {
                  sendPushNotification("⏳ LISTA DE ESPERA", `${playerData.name} entrou na fila de espera.`);
                } else {
                  sendPushNotification("✅ CONFIRMAÇÃO!", `${playerData.name} confirmou presença!`);
                }
              } else {
                sendPushNotification("❌ DESISTÊNCIA!", `${playerData.name} saiu do jogo.`);
                // Lógica de "Subida" da lista de espera
                // Fix: Cast Object.values to Player[] to avoid 'unknown' type error on op.id and op.status on line 88
                const nextInWaitlist = playerList.find(p => p.status === 'presente' && !(Object.values(prevPlayersState.current) as Player[]).some(op => op.id === p.id && op.status === 'presente'));
                if (nextInWaitlist) {
                   sendPushNotification("⚡ FILA ANDOU!", `Uma vaga abriu e o próximo da fila é ${nextInWaitlist.name}!`);
                }
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
  }, [players.length, currentMatch?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-navy font-black text-[10px] tracking-[0.4em] uppercase animate-pulse">SINCRONIZANDO ARENA...</p>
        </div>
      </div>
    );
  }

  const currentPlayer = players.find(p => p.id === user?.uid);
  const effectiveRole = user?.email === MASTER_ADMIN_EMAIL ? 'admin' : currentPlayer?.role;

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage} currentUserRole={effectiveRole}>
      <div className="animate-fade-in">
        {currentPage === Page.Onboarding && <Onboarding user={user} onComplete={() => setCurrentPage(Page.Dashboard)} />}
        {currentPage === Page.Dashboard && <Dashboard match={currentMatch} players={players} user={user} onPageChange={setCurrentPage} />}
        {currentPage === Page.PlayerList && <PlayerList players={players} currentUser={user} match={currentMatch} onPageChange={setCurrentPage} />}
        {currentPage === Page.Ranking && <Ranking players={players} currentUser={user} onPageChange={setCurrentPage} />}
        {currentPage === Page.CreateMatch && <CreateMatch players={players} currentUser={user} onPageChange={setCurrentPage} />}
        {currentPage === Page.Profile && (
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
