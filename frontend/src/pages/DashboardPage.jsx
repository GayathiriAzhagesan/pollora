import React from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { PollCard } from '../components/poll/PollCard';
import { usePolls } from '../context/PollContext';
import { useToast } from '../context/ToastContext';
import { DASHBOARD_STATS } from '../services/mockData';
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

  const handleViewResults = (pollId) => {
    setActivePollId(pollId);
    onNavigate('live-results');
  };

  const handleVote = (pollId) => {
    setActivePollId(pollId);
    onNavigate('public-poll');
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

  const activeCount = polls.filter((p) => p.status === 'active').length;
  const closedCount = polls.filter((p) => p.status === 'closed').length;

  return (
    <div className="dashboard-content animate-fade-in">
      {/* Dashboard Top Greeting Header */}
      <div className="dashboard-header-row">
        <div>
          <h1 className="dashboard-title">Good morning 👋</h1>
          <p className="dashboard-subtitle">Create and manage your live polls.</p>
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
            <span className="stat-value">{DASHBOARD_STATS.totalPolls}</span>
            <span className="stat-pill stat-pill-positive">
              <TrendingUpIcon size={12} /> +2 this week
            </span>
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
            <span className="stat-value">{DASHBOARD_STATS.activePolls}</span>
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
            <span className="stat-value">{DASHBOARD_STATS.totalVotes}</span>
            <span className="stat-pill stat-pill-positive">
              <TrendingUpIcon size={12} /> +18.4%
            </span>
          </div>
        </Card>

        <Card className="stat-card" hover>
          <div className="stat-header">
            <span className="stat-label">Responses Today</span>
            <div className="stat-icon-wrapper stat-amber">
              <ClockIcon size={18} />
            </div>
          </div>
          <div className="stat-value-row">
            <span className="stat-value">{DASHBOARD_STATS.responsesToday}</span>
            <span className="stat-subtext">Peak 14:00 - 16:00</span>
          </div>
        </Card>
      </div>

      {/* My Polls Section Header with Filter Tabs */}
      <div className="my-polls-header-row">
        <div className="my-polls-title-group">
          <h2 className="my-polls-title">My Polls</h2>
          <span className="polls-total-badge">{polls.length} total</span>
        </div>

        {/* Filter Tabs: All, Active/Live, Closed */}
        <div className="poll-filters-segmented">
          <button
            onClick={() => setFilter('all')}
            className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          >
            All ({polls.length})
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

      {/* Polls Grid or Empty State */}
      {filteredPolls.length > 0 ? (
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
        <Card className="empty-state-card">
          <div className="empty-state-icon">
            <BarChartIcon size={36} />
          </div>
          <h3 className="empty-state-title">No polls found in this filter</h3>
          <p className="empty-state-desc">
            Try switching your filter or create a new live poll to begin collecting real-time votes.
          </p>
          <Button
            variant="primary"
            icon={PlusIcon}
            onClick={() => onNavigate('create-poll')}
          >
            Create a New Poll
          </Button>
        </Card>
      )}
    </div>
  );
};
