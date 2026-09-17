import React from 'react';
import { Card } from '../common/Card';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import {
  BarChartIcon,
  ShareIcon,
  EditIcon,
  TrashIcon,
  UsersIcon,
  ClockIcon,
  ChevronRightIcon,
} from '../../assets/icons';

export const PollCard = ({
  poll,
  onViewResults,
  onShare,
  onVote,
  onDelete,
  onToggleStatus,
}) => {
  const isLive = poll.status === 'active';

  return (
    <Card className="poll-dashboard-card" hover>
      <div className="poll-card-top">
        <div className="poll-card-badge-row">
          <Badge variant={isLive ? 'live' : 'closed'}>
            {isLive ? 'LIVE' : 'CLOSED'}
          </Badge>
          <span className="poll-card-date">
            <ClockIcon size={13} className="inline-icon" /> {poll.createdAt || poll.createdDate}
          </span>
        </div>
      </div>

      <h3 className="poll-card-question" onClick={onViewResults} title={poll.question}>
        {poll.question}
      </h3>

      {poll.description && (
        <p className="poll-card-desc">{poll.description}</p>
      )}

      {/* Mini Options Preview Bar */}
      <div className="poll-options-preview">
        <span className="options-count-badge">
          {poll.options?.length || 0} Options
        </span>
        <span className="votes-count-badge">
          <UsersIcon size={14} className="inline-icon" /> {poll.totalVotes.toLocaleString()} votes
        </span>
      </div>

      {/* Top 2 Options Progress Peek */}
      <div className="poll-card-bars-peek">
        {poll.options.slice(0, 2).map((opt) => (
          <div key={opt.id} className="peek-bar-item">
            <div className="peek-bar-info">
              <span className="peek-bar-text">{opt.text}</span>
              <span className="peek-bar-pct">{opt.percentage}%</span>
            </div>
            <div className="peek-bar-track">
              <div
                className="peek-bar-fill"
                style={{ width: `${opt.percentage}%`, background: opt.color || 'var(--primary)' }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Actions Footer */}
      <div className="poll-card-actions">
        <div className="card-actions-left">
          <Button
            size="sm"
            variant="primary"
            icon={BarChartIcon}
            onClick={onViewResults}
          >
            View Results
          </Button>
          <Button
            size="sm"
            variant="secondary"
            icon={ShareIcon}
            onClick={onShare}
          >
            Share
          </Button>
        </div>

        <div className="card-actions-right">
          <button
            onClick={onToggleStatus}
            className="action-icon-btn"
            title={isLive ? 'Close Poll' : 'Re-open Poll'}
            aria-label={isLive ? 'Close Poll' : 'Re-open Poll'}
          >
            <EditIcon size={16} />
          </button>
          <button
            onClick={onDelete}
            className="action-icon-btn action-danger"
            title="Delete Poll"
            aria-label="Delete Poll"
          >
            <TrashIcon size={16} />
          </button>
        </div>
      </div>
    </Card>
  );
};
