import React, { useState, useEffect } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { ShareModal } from './components/poll/ShareModal';
import { usePolls } from './context/PollContext';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreatePollPage } from './pages/CreatePollPage';
import { PublicPollPage } from './pages/PublicPollPage';
import { LiveResultsPage } from './pages/LiveResultsPage';
import { AnalyticsPage } from './pages/AnalyticsPage';

function App() {
  const [currentView, setCurrentView] = useState('landing');
  const { shareModalData, closeShareModal, setActivePollId, getPollById } = usePolls();

  // URL Hash handling for direct sharing (e.g. #poll-poll-1)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('poll-')) {
        const pollId = hash.replace('poll-', '');
        const targetPoll = getPollById(pollId) || getPollById(hash);
        if (targetPoll) {
          setActivePollId(targetPoll.id);
        }
        setCurrentView('public-poll');
      } else if (hash.startsWith('results-')) {
        const pollId = hash.replace('results-', '');
        const targetPoll = getPollById(pollId);
        if (targetPoll) {
          setActivePollId(targetPoll.id);
        }
        setCurrentView('live-results');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [getPollById, setActivePollId]);

  const handleNavigate = (view) => {
    setCurrentView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine if current view uses the SaaS Sidebar layout
  const isDashboardLayout = currentView === 'dashboard' || currentView === 'analytics';

  return (
    <div className="app-shell">
      {/* Top Navigation Bar */}
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <main className="app-main-content">
        {isDashboardLayout ? (
          <div className="dashboard-layout-shell">
            <Sidebar currentView={currentView} onNavigate={handleNavigate} />
            <div className="dashboard-main-area">
              {currentView === 'dashboard' && <DashboardPage onNavigate={handleNavigate} />}
              {currentView === 'analytics' && <AnalyticsPage onNavigate={handleNavigate} />}
            </div>
          </div>
        ) : (
          <>
            {currentView === 'landing' && <LandingPage onNavigate={handleNavigate} />}
            {currentView === 'login' && <LoginPage onNavigate={handleNavigate} />}
            {currentView === 'signup' && <SignupPage onNavigate={handleNavigate} />}
            {currentView === 'create-poll' && <CreatePollPage onNavigate={handleNavigate} />}
            {currentView === 'public-poll' && <PublicPollPage onNavigate={handleNavigate} />}
            {currentView === 'live-results' && <LiveResultsPage onNavigate={handleNavigate} />}
          </>
        )}
      </main>

      {/* Footer on public views */}
      {!isDashboardLayout && currentView !== 'login' && currentView !== 'signup' && (
        <Footer onNavigate={handleNavigate} />
      )}

      {/* Global Share Modal */}
      {shareModalData?.isOpen && (
        <ShareModal
          isOpen={shareModalData.isOpen}
          onClose={closeShareModal}
          poll={shareModalData.poll}
        />
      )}
    </div>
  );
}

export default App;