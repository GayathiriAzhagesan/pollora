import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { OptionItem } from '../components/poll/OptionItem';
import { usePolls } from '../context/PollContext';
import { useToast } from '../context/ToastContext';
import {
  UsersIcon,
  RadioIcon,
  CheckCircleIcon,
  BarChartIcon,
  ShareIcon,
  ArrowRightIcon,
  ClockIcon,
} from '../assets/icons';

export const PublicPollPage = ({ onNavigate }) => {
  const { activePoll, votePoll, openShareModal } = usePolls();
  const { showToast } = useToast();

  const [selectedOptionId, setSelectedOptionId] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fallback to initial poll if none selected
  const poll = activePoll || {
    id: 'poll-1',
    question: "What's your favorite programming language?",
    description: "Vote for your preferred language for modern backend & frontend development.",
    status: 'active',
    totalVotes: 110,
    options: [
      { id: 'opt-1', text: 'Java', votes: 62 },
      { id: 'opt-2', text: 'Python', votes: 39 },
      { id: 'opt-3', text: 'JavaScript', votes: 19 },
      { id: 'opt-4', text: 'Go', votes: 9 },
    ],
  };

  const handleVoteSubmit = () => {
    if (!selectedOptionId) {
      showToast('Please select an option to submit your vote', 'error');
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      votePoll(poll.id, selectedOptionId);
      setSubmitting(false);
      setHasVoted(true);
      showToast('Vote submitted successfully! Thank you for participating.', 'success');
    }, 450);
  };

  return (
    <div className="public-poll-page animate-fade-in">
      {/* Background glow */}
      <div className="public-poll-bg-glow" />

      <div className="public-poll-container">
        {/* Top Poll Status & Share Bar */}
        <div className="public-poll-top-bar">
          <div className="public-status-group">
            <Badge variant={poll.status === 'active' ? 'live' : 'closed'}>
              {poll.status === 'active' ? 'LIVE' : 'CLOSED'}
            </Badge>
            <span className="public-sync-text">
              <RadioIcon size={14} className="inline-icon" /> Live Polling Session
            </span>
          </div>
          <button
            onClick={() => openShareModal(poll)}
            className="public-share-btn"
            title="Share this poll"
            aria-label="Share this poll"
          >
            <ShareIcon size={16} />
            <span>Share</span>
          </button>
        </div>

        {/* Voting Card */}
        <Card className="public-voting-card glass-panel" glow>
          <div className="voting-card-header">
            <h1 className="public-poll-title">{poll.question}</h1>
            {poll.description && (
              <p className="public-poll-description">{poll.description}</p>
            )}
            <div className="public-meta-info">
              <span className="public-meta-item">
                <UsersIcon size={14} className="inline-icon" /> {poll.totalVotes} responses recorded
              </span>
              <span className="public-meta-divider">•</span>
              <span className="public-meta-item">
                <ClockIcon size={14} className="inline-icon" /> Closes in 24 hours
              </span>
            </div>
          </div>

          {!hasVoted ? (
            <div className="voting-card-body">
              <div className="options-grid">
                {poll.options.map((opt, idx) => (
                  <OptionItem
                    key={opt.id}
                    id={opt.id}
                    text={opt.text}
                    index={idx}
                    selected={selectedOptionId === opt.id}
                    onSelect={setSelectedOptionId}
                  />
                ))}
              </div>

              <div className="voting-action-footer">
                <Button
                  size="lg"
                  variant="primary"
                  fullWidth
                  loading={submitting}
                  disabled={!selectedOptionId}
                  onClick={handleVoteSubmit}
                  iconRight={ArrowRightIcon}
                >
                  Submit Vote
                </Button>
                <p className="vote-privacy-note">
                  🔒 Votes are 100% anonymous. One response per browser session.
                </p>
              </div>
            </div>
          ) : (
            <div className="vote-confirmed-body animate-fade-in">
              <div className="vote-confirmed-badge">
                <CheckCircleIcon size={36} />
              </div>
              <h2 className="confirmed-title">Thank You! Your Vote is Counted</h2>
              <p className="confirmed-desc">
                Your response has been registered in real time. You can now view the live aggregated results.
              </p>

              <div className="confirmed-actions">
                <Button
                  size="lg"
                  variant="primary"
                  icon={BarChartIcon}
                  fullWidth
                  onClick={() => onNavigate('live-results')}
                >
                  View Live Results 🔴
                </Button>
                <Button
                  size="md"
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    setHasVoted(false);
                    setSelectedOptionId(null);
                  }}
                >
                  Change Vote / Vote Again
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Voter Footer Branding */}
        <div className="public-voter-footer">
          <span>Powered by </span>
          <strong className="footer-brand-highlight" onClick={() => onNavigate('landing')} role="button">
            LivePoll
          </strong>
          <span> • Fast, Secure & Anonymous Polling</span>
        </div>
      </div>
    </div>
  );
};
