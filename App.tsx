
import React, { useState } from 'react';
import Layout from './components/Layout.tsx';
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import PlayerList from './pages/PlayerList.tsx';
import Ranking from './pages/Ranking.tsx';
import CreateMatch from './pages/CreateMatch.tsx';
import Profile from './pages/Profile.tsx';
import { Page } from './types.ts';
import { MOCK_PLAYERS, CURRENT_MATCH } from './constants.tsx';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>(Page.Login);

  const handleLogin = () => {
    setIsLoggedIn(true);
    setCurrentPage(Page.Dashboard);
  };

  const renderPage = () => {
    if (!isLoggedIn) return <Login onLogin={handleLogin} />;

    switch (currentPage) {
      case Page.Dashboard:
        return <Dashboard match={CURRENT_MATCH} />;
      case Page.PlayerList:
        return <PlayerList players={MOCK_PLAYERS} />;
      case Page.Ranking:
        return <Ranking players={MOCK_PLAYERS} />;
      case Page.CreateMatch:
        return <CreateMatch />;
      case Page.Profile:
        return <Profile player={MOCK_PLAYERS[0]} />;
      default:
        return <Dashboard match={CURRENT_MATCH} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      {renderPage()}
    </Layout>
  );
};

export default App;
