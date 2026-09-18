import React, { useEffect } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { PollCard } from '../components/poll/PollCard';
import { usePolls } from '../context/PollContext';
import { useToast } from '../context/ToastContext';
import {
  PlusIcon,
  BarChartIcon,
  RadioIcon,
  UsersIcon,
  ClockIcon,
  TrendingUpIcon,
  FilterIcon,
} from '../assets/icons';

export const DashboardPage = ({ onNavigate }) => {
  const {
    filteredPolls,
    filter,
    setFilter,
    polls,
    setActivePollId,
    deletePoll,
    togglePollStatus,
    openShareModal,
  } = usePolls();
  const { showToast } = useToast();

  // Show welcome toast if redirected here from OAuth login
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('oauth_welcome')) {
      sessionStorage.removeItem('oauth_welcome');
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        showToast(`Welcome back, ${user.name || 'User'}! Signed in successfully.`, 'success');
      } catch {
        showToast('Signed in successfully!', 'success');
      }
    }
  }, [showToast]);

  const handleViewResults = (pollId) => {
    setActivePollId(pollId);
    onNavigate(`/results/${pollId}`);
  };

  const handleVote = (pollId) => {
    setActivePollId(pollId);
    onNavigate(`/poll/${pollId}`);
  };

  const handleDelete = (pollId, question) => {
    if (window.confirm(`Are you sure you want to delete "${question}"?`)) {
      deletePoll(pollId);
      showToast('Poll deleted successfully', 'info');
    }
  };

  const handleToggleStatus = (pollId) => {
    togglePollStatus(pollId);
    showToast('Poll status updated', 'success');
  };

  // Dynamic calculations directly from real poll data
  const totalPolls = polls.length;
  const activeCount = polls.filter((p) => p.status === 'active').length;
  const closedCount = polls.filter((p) => p.status === 'closed').length;
  const totalVotes = polls.reduce((sum, p) => {
    if (typeof p.totalVotes === 'number') return sum + p.totalVotes;
    if (Array.isArray(p.options)) {
      return sum + p.options.reduce((s, o) => s + (o.votes || 0), 0);
    }
    return sum;
  }, 0);

  // Safely parse current user for greeting
  const user = (() => {
    try {
      const u = localStorage.getItem('user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  return (
    <div className="dashboard-content animate-fade-in">
      {/* Dashboard Top Greeting Header */}
      <div className="dashboard-header-row">
        <div>
          <h1 className="dashboard-title">
            Welcome back{user?.name ? `, ${user.name}` : ''} 👋
          </h1>
          <p className="dashboard-subtitle">
            Create, distribute, and manage your real-time audience polls.
          </p>
        </div>
        <Button
          size="lg"
          variant="primary"
          icon={PlusIcon}
          onClick={() => onNavigate('create-poll')}
        >
          + Create New Poll
        </Button>
      </div>

      {/* Stats KPI Cards */}
      <div className="stats-grid">
        <Card className="stat-card" hover>
          <div className="stat-header">
            <span className="stat-label">Total Polls</span>
            <div className="stat-icon-wrapper stat-purple">
              <BarChartIcon size={18} />
            </div>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{totalPolls}</span>
            <span className="stat-subtext">Polls in workspace</span>
          </div>
        </Card>

        <Card className="stat-card" hover>
          <div className="stat-header">
            <span className="stat-label">Active Polls</span>
            <div className="stat-icon-wrapper stat-green">
              <RadioIcon size={18} />
            </div>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{activeCount}</span>
            <span className="stat-subtext">Currently collecting votes</span>
          </div>
        </Card>

        <Card className="stat-card" hover>
          <div className="stat-header">
            <span className="stat-label">Total Votes</span>
            <div className="stat-icon-wrapper stat-blue">
              <UsersIcon size={18} />
            </div>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{totalVotes.toLocaleString()}</span>
            <span className="stat-subtext">Participant submissions</span>
          </div>
        </Card>

        <Card className="stat-card" hover>
          <div className="stat-header">
            <span className="stat-label">Recent Polls</span>
            <div className="stat-icon-wrapper stat-amber">
              <ClockIcon size={18} />
            </div>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{totalPolls > 0 ? totalPolls : 0}</span>
            <span className="stat-subtext">Live synchronized</span>
          </div>
        </Card>
      </div>

      {/* My Polls Section Header with Filter Tabs */}
      <div className="my-polls-header-row">
        <div className="my-polls-title-group">
          <h2 className="my-polls-title">Recent Polls</h2>
          <span className="polls-total-badge">{totalPolls} total</span>
        </div>

        {/* Filter Tabs: All, Active/Live, Closed */}
        <div className="poll-filters-segmented">
          <button
            onClick={() => setFilter('all')}
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          >
            All ({totalPolls})
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`filter-btn ${filter === 'active' ? 'active' : ''}`}
          >
            <span className="pulse-dot" /> Live ({activeCount})
          </button>
          <button
            onClick={() => setFilter('closed')}
            className={`filter-btn ${filter === 'closed' ? 'active' : ''}`}
          >
            Closed ({closedCount})
          </button>
        </div>
      </div>

      {/* Polls Grid or Professional Empty State */}
      {totalPolls === 0 ? (
        <Card className="empty-state-card glass-panel" glow>
          <div className="empty-state-icon">
            <BarChartIcon size={44} />
          </div>
          <h3 className="empty-state-title">No polls created yet</h3>
          <p className="empty-state-desc">
            Create your first poll to start collecting responses in real time.
          </p>
          <Button
            size="lg"
            variant="primary"
            icon={PlusIcon}
            onClick={() => onNavigate('create-poll')}
          >
            + Create New Poll
          </Button>
        </Card>
      ) : filteredPolls.length > 0 ? (
        <div className="polls-grid">
          {filteredPolls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              onViewResults={() => handleViewResults(poll.id)}
              onVote={() => handleVote(poll.id)}
              onShare={() => openShareModal(poll)}
              onDelete={() => handleDelete(poll.id, poll.question)}
              onToggleStatus={() => handleToggleStatus(poll.id)}
            />
          ))}
        </div>
      ) : (
        <Card className="empty-state-card glass-panel">
          <div className="empty-state-icon">
            <FilterIcon size={36} />
          </div>
          <h3 className="empty-state-title">No {filter} polls found</h3>
          <p className="empty-state-desc">
            There are currently no polls matching the "{filter}" filter criteria.
          </p>
          <Button
            variant="secondary"
            onClick={() => setFilter('all')}
          >
            Show All Polls
          </Button>
        </Card>
      )}
    </div>
  );
};
