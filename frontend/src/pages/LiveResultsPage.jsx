import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { ProgressBar } from '../components/poll/ProgressBar';
import { usePolls } from '../context/PollContext';
import { useToast } from '../context/ToastContext';
import {
  RadioIcon,
  RefreshCwIcon,
  ShareIcon,
  UsersIcon,
  TrendingUpIcon,
  ClockIcon,
  BarChartIcon,
  CheckCircleIcon,
} from '../assets/icons';
import { WS_URL } from '../config';

export const LiveResultsPage = ({ onNavigate }) => {
  const { activePoll, polls, getPollById, fetchPollById, openShareModal, setActivePollId } = usePolls();
  const { showToast } = useToast();
  const { pollId: paramPollId } = useParams() || {};
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('Just now');
  const [wsConnected, setWsConnected] = useState(false);

  // Extract hash parameter if opened via #results-... or #poll-...
  const hash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
  const pollIdFromHash = hash.startsWith('results-')
    ? hash.replace('results-', '')
    : hash.startsWith('poll-')
    ? hash.replace('poll-', '')
    : null;

  const targetId = paramPollId || pollIdFromHash;

  // Resolve target poll from route param, hash parameter, activePoll, or available polls
  const poll =
    (targetId ? (getPollById(targetId) || getPollById(`poll-${targetId}`)) : null) ||
    activePoll ||
    (polls && polls.length > 0 ? polls[0] : null);

  const pollId = poll?.id || targetId;

  // Fetch poll from backend if not yet in state
  useEffect(() => {
    if (targetId && !getPollById(targetId) && fetchPollById) {
      fetchPollById(targetId);
    }
  }, [targetId, getPollById, fetchPollById]);

  // Synchronize activePollId if opened directly via URL route or hash
  useEffect(() => {
    if (poll && setActivePollId && (!activePoll || activePoll.id !== poll.id)) {
      setActivePollId(poll.id);
    }
  }, [poll, activePoll, setActivePollId]);

  // Initial Data: Fetch latest poll results from MongoDB on mount
  useEffect(() => {
    if (pollId && fetchPollById) {
      fetchPollById(pollId);
    }
  }, [pollId]);

  // Real-Time Transport: Establish WebSocket connection to Go/Gin backend
  useEffect(() => {
    if (!pollId) return;

    let isMounted = true;
    let ws = null;
    let reconnectTimer = null;

    const wsUrl = `${WS_URL}/ws/polls/${pollId}`;

    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          if (!isMounted) return;
          setWsConnected(true);
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'poll_results_updated' && data.pollId === pollId) {
              // MongoDB is the single source of truth: re-fetch latest poll state
              fetchPollById(pollId);
              setLastSyncTime(
                new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })
              );
            }
          } catch (err) {
            console.error('Error processing WebSocket message:', err);
          }
        };

        ws.onerror = () => {
          if (isMounted) setWsConnected(false);
        };

        ws.onclose = () => {
          if (!isMounted) return;
          setWsConnected(false);
          // Reconnect with backoff
          reconnectTimer = setTimeout(connect, 3000);
        };
      } catch (err) {
        if (isMounted) {
          setWsConnected(false);
          reconnectTimer = setTimeout(connect, 3000);
        }
      }
    };

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) {
        ws.onclose = null; // Prevent reconnect callback on unmount
        ws.close();
      }
    };
  }, [pollId, fetchPollById]);

  if (!poll) {
    return (
      <div className="live-results-page animate-fade-in">
        <div className="results-header-container">
          <h1>No Poll Selected</h1>
          <p>Please select or open a poll to view real-time results.</p>
          <Button variant="primary" onClick={() => onNavigate('dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  // Find leader option
  const sortedOptions = [...(poll.options || [])].sort((a, b) => (b.votes || 0) - (a.votes || 0));
  const leaderOption = sortedOptions[0];
  const runnerUpOption = sortedOptions[1];
  const leadingMargin = leaderOption && runnerUpOption
    ? Math.max(0, (leaderOption.percentage || 0) - (runnerUpOption.percentage || 0))
    : (leaderOption?.percentage || 0);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    if (pollId && fetchPollById) {
      await fetchPollById(pollId);
    }
    setIsRefreshing(false);
    setLastSyncTime(
      new Date().toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    );
    showToast('Live results synchronized with MongoDB!', 'info');
  };

  return (
    <div className="live-results-page animate-fade-in">
      {/* Header with Title and Realtime Pulse */}
      <div className="results-header-container">
        <div className="results-header-left">
          <div className="results-badge-row">
            <span className="live-results-badge">
              <span className="pulse-dot" /> LIVE RESULTS 🔴
            </span>
            <span className="sync-status-badge">
              <RadioIcon size={14} className="inline-icon" />{' '}
              {wsConnected ? 'Real-time active' : 'Connecting real-time...'}
            </span>
          </div>
          <h1 className="results-poll-title">{poll.question}</h1>
          <p className="results-poll-subtitle">
            Responses update automatically as participants cast their votes across sessions.
          </p>
        </div>

        <div className="results-header-actions">
          <Button
            variant="secondary"
            icon={RefreshCwIcon}
            loading={isRefreshing}
            onClick={handleManualRefresh}
            title="Force refresh data stream"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            icon={ShareIcon}
            onClick={() => openShareModal(poll)}
          >
            Share Poll
          </Button>
        </div>
      </div>

      {/* Realtime Stream Status Banner */}
      <div className="realtime-indicator-banner glass-panel">
        <div className="indicator-left">
          <div className="indicator-pulse-ring">
            <span className="pulse-ping" />
            <span className="pulse-core" />
          </div>
          <div className="indicator-text">
            <span className="indicator-heading">
              {wsConnected
                ? 'Auto-refresh active • WebSocket channel open'
                : 'Connecting to Real-time Stream...'}
            </span>
            <span className="indicator-sub">
              Sub-second response delivery • Last synced: {lastSyncTime}
            </span>
          </div>
        </div>
        <div className="indicator-right">
          <span className="indicator-votes-total">
            <strong>{poll.totalVotes || 0}</strong> total votes
          </span>
        </div>
      </div>

      {/* Main Results Grid */}
      <div className="results-grid-layout">
        {/* Left: Animated Horizontal Progress Bars */}
        <Card className="results-main-card glass-panel" glow>
          <div className="results-card-header">
            <div className="results-card-title-group">
              <h3 className="results-card-title">Vote Breakdown</h3>
              <span className="results-options-count">{poll.options?.length || 0} Options</span>
            </div>
            <div className="results-total-pill">
              <UsersIcon size={14} className="inline-icon" /> {poll.totalVotes || 0} total votes
            </div>
          </div>

          <div className="results-bars-list">
            {(poll.options || []).map((option) => (
              <ProgressBar
                key={option.id}
                label={option.text}
                percentage={option.percentage || 0}
                votes={option.votes || 0}
                color={option.color || '#8b5cf6'}
                isLeader={leaderOption && leaderOption.id === option.id && (poll.totalVotes || 0) > 0}
              />
            ))}
          </div>

          {/* Quick Summary Footer */}
          <div className="results-card-footer">
            <div className="results-leader-summary">
              <CheckCircleIcon size={16} className="text-success" />
              <span>
                {(poll.totalVotes || 0) > 0 && leaderOption ? (
                  <>
                    <strong>{leaderOption.text}</strong> is currently leading with{' '}
                    <strong>{leaderOption.percentage}%</strong> of all votes.
                  </>
                ) : (
                  'No votes recorded yet. Be the first to participate!'
                )}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigate('public-poll')}
            >
              Go to Voting Page
            </Button>
          </div>
        </Card>

        {/* Right: Key Stats Sidebar */}
        <div className="results-sidebar-col">
          <Card className="summary-stat-card glass-panel">
            <span className="summary-stat-label">Total Participation</span>
            <div className="summary-stat-number">{poll.totalVotes || 0}</div>
            <p className="summary-stat-sub">{poll.totalVotes || 0} total votes recorded so far</p>
            <div className="summary-stat-divider" />
            <div className="summary-stat-metric">
              <span>Leading Margin:</span>
              <strong className="text-primary">
                +{(poll.totalVotes || 0) > 0 ? leadingMargin : 0}%
              </strong>
            </div>
          </Card>

          <Card className="summary-stat-card glass-panel">
            <h4 className="summary-stat-label">Poll Status</h4>
            <div className="poll-status-row">
              <Badge variant={poll.status === 'closed' ? 'closed' : 'live'}>
                {poll.status === 'closed' ? 'CLOSED' : 'LIVE & ACCEPTING'}
              </Badge>
            </div>
            <p className="summary-stat-sub mt-2">
              Audience access is unrestricted. Direct URL and QR codes are active.
            </p>
            <Button
              variant="secondary"
              fullWidth
              size="sm"
              className="mt-3"
              icon={BarChartIcon}
              onClick={() => onNavigate('analytics')}
            >
              View In-Depth Analytics
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};
