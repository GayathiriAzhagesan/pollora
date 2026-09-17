import React, { useState, useEffect } from 'react';
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

export const LiveResultsPage = ({ onNavigate }) => {
  const { activePoll, openShareModal } = usePolls();
  const { showToast } = useToast();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState('Just now');

  // Use active poll or reference values from prompt
  const poll = activePoll || {
    id: 'poll-1',
    question: "What's your favorite programming language?",
    totalVotes: 110,
    options: [
      { id: 'opt-1', text: 'Java', votes: 62, percentage: 48, color: '#3b82f6' },
      { id: 'opt-2', text: 'Python', votes: 39, percentage: 30, color: '#8b5cf6' },
      { id: 'opt-3', text: 'JavaScript', votes: 19, percentage: 15, color: '#ec4899' },
      { id: 'opt-4', text: 'Go', votes: 9, percentage: 7, color: '#10b981' },
    ],
  };

  // Find leader option
  const leaderOption = [...(poll.options || [])].sort((a, b) => b.votes - a.votes)[0];

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastSyncTime('Just now');
      showToast('Live results synchronized!', 'info');
    }, 600);
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
              <RadioIcon size={14} className="inline-icon" /> Real-time active
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

      {/* Realtime Stream Status Banner (Visual indicator for future WebSocket/Redis connection) */}
      <div className="realtime-indicator-banner glass-panel">
        <div className="indicator-left">
          <div className="indicator-pulse-ring">
            <span className="pulse-ping" />
            <span className="pulse-core" />
          </div>
          <div className="indicator-text">
            <span className="indicator-heading">Auto-refresh active • WebSocket channel open</span>
            <span className="indicator-sub">Sub-second response delivery • Last synced: {lastSyncTime}</span>
          </div>
        </div>
        <div className="indicator-right">
          <span className="indicator-votes-total">
            <strong>{poll.totalVotes}</strong> total votes
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
              <UsersIcon size={14} className="inline-icon" /> {poll.totalVotes} total votes
            </div>
          </div>

          <div className="results-bars-list">
            {poll.options.map((option) => (
              <ProgressBar
                key={option.id}
                label={option.text}
                percentage={option.percentage}
                votes={option.votes}
                color={option.color || '#8b5cf6'}
                isLeader={leaderOption && leaderOption.id === option.id}
              />
            ))}
          </div>

          {/* Quick Summary Footer */}
          <div className="results-card-footer">
            <div className="results-leader-summary">
              <CheckCircleIcon size={16} className="text-success" />
              <span>
                <strong>{leaderOption?.text}</strong> is currently leading with{' '}
                <strong>{leaderOption?.percentage}%</strong> of all votes.
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
            <div className="summary-stat-number">{poll.totalVotes}</div>
            <p className="summary-stat-sub">110 total votes recorded so far</p>
            <div className="summary-stat-divider" />
            <div className="summary-stat-metric">
              <span>Leading Margin:</span>
              <strong className="text-primary">
                +{leaderOption ? leaderOption.percentage - (poll.options[1]?.percentage || 0) : 0}%
              </strong>
            </div>
          </Card>

          <Card className="summary-stat-card glass-panel">
            <h4 className="summary-stat-label">Poll Status</h4>
            <div className="poll-status-row">
              <Badge variant="live">LIVE & ACCEPTING</Badge>
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
