import React, { useEffect } from 'react';
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from 'react-router-dom';
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

// Protected Route component to guard authenticated views
const ProtectedRoute = ({ children }) => {
  // Check for incoming OAuth token callback directly on /dashboard (?oauth_token=...)
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('error');
    if (oauthError) {
      return <Navigate to={`/login?error=${encodeURIComponent(oauthError)}`} replace />;
    }

    const oauthToken = params.get('oauth_token');
    if (oauthToken) {
      const user = {
        id: params.get('user_id') || '',
        name: params.get('user_name') || 'User',
        email: params.get('user_email') || '',
      };
      localStorage.setItem('token', oauthToken);
      localStorage.setItem('user', JSON.stringify(user));
      sessionStorage.setItem('oauth_welcome', '1');
      window.dispatchEvent(new Event('authChange'));

      // Clean query parameters from URL without reloading the page
      const cleanUrl = window.location.pathname;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }

  const token = localStorage.getItem('token');
  if (!token || token === 'null' || token === 'undefined') {
    return <Navigate to="/login" replace />;
  }
  return children;
};

// Hash redirector for backwards compatibility with #poll-... and #results-...
const HashRedirector = () => {
  const navigate = useNavigate();
  const { getPollById, setActivePollId } = usePolls();

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash.startsWith('poll-')) {
        const pollId = hash.replace('poll-', '');
        const targetPoll = getPollById(pollId) || getPollById(hash);
        if (targetPoll && setActivePollId) {
          setActivePollId(targetPoll.id);
        }
        navigate(`/poll/${pollId}`, { replace: true });
      } else if (hash.startsWith('results-')) {
        const pollId = hash.replace('results-', '');
        const targetPoll = getPollById(pollId);
        if (targetPoll && setActivePollId) {
          setActivePollId(targetPoll.id);
        }
        navigate(`/results/${pollId}`, { replace: true });
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [navigate, getPollById, setActivePollId]);

  return null;
};

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { shareModalData, closeShareModal, activePoll } = usePolls();

  // Map route path to legacy view identifiers for Navbar / Sidebar compatibility
  const getEffectiveView = (pathname) => {
    if (pathname === '/' || pathname === '') return 'landing';
    if (pathname.startsWith('/login')) return 'login';
    if (pathname.startsWith('/signup')) return 'signup';
    if (pathname.startsWith('/dashboard')) return 'dashboard';
    if (pathname.startsWith('/create-poll')) return 'create-poll';
    if (pathname.startsWith('/analytics')) return 'analytics';
    if (pathname.startsWith('/poll')) return 'public-poll';
    if (pathname.startsWith('/results')) return 'live-results';
    return 'landing';
  };

  const currentView = getEffectiveView(location.pathname);

  // Navigation adapter supporting both view aliases and path strings
  const handleNavigate = (view) => {
    if (!view) return;

    if (view === 'landing' || view === 'home') {
      navigate('/');
    } else if (view === 'login') {
      navigate('/login');
    } else if (view === 'signup') {
      navigate('/signup');
    } else if (view === 'dashboard') {
      navigate('/dashboard');
    } else if (view === 'create-poll') {
      navigate('/create-poll');
    } else if (view === 'analytics') {
      navigate('/analytics');
    } else if (view === 'public-poll') {
      navigate(activePoll ? `/poll/${activePoll.id}` : '/');
    } else if (view === 'live-results') {
      navigate(activePoll ? `/results/${activePoll.id}` : '/');
    } else if (view.startsWith('/')) {
      navigate(view);
    } else {
      navigate(`/${view}`);
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isDashboardLayout = currentView === 'dashboard' || currentView === 'analytics';

  return (
    <div className="app-shell">
      {/* Backward-compatibility handler for legacy #poll- and #results- hash URLs */}
      <HashRedirector />

      {/* Top Navigation Bar */}
      <Navbar currentView={currentView} onNavigate={handleNavigate} />

      {/* Main Content Area */}
      <main className="app-main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage onNavigate={handleNavigate} />} />
          <Route path="/login" element={<LoginPage onNavigate={handleNavigate} />} />
          <Route path="/signup" element={<SignupPage onNavigate={handleNavigate} />} />
          <Route path="/poll/:pollId" element={<PublicPollPage onNavigate={handleNavigate} />} />
          <Route path="/results/:pollId" element={<LiveResultsPage onNavigate={handleNavigate} />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div className="dashboard-layout-shell">
                  <Sidebar currentView="dashboard" onNavigate={handleNavigate} />
                  <div className="dashboard-main-area">
                    <DashboardPage onNavigate={handleNavigate} />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <div className="dashboard-layout-shell">
                  <Sidebar currentView="analytics" onNavigate={handleNavigate} />
                  <div className="dashboard-main-area">
                    <AnalyticsPage onNavigate={handleNavigate} />
                  </div>
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-poll"
            element={
              <ProtectedRoute>
                <CreatePollPage onNavigate={handleNavigate} />
              </ProtectedRoute>
            }
          />

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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