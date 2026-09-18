import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
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
  AlertCircleIcon,
  CheckIcon,
} from '../assets/icons';
import { PolloraIcon } from '../components/common/Logo';

export const PublicPollPage = ({ onNavigate }) => {
  const { activePoll, polls, getPollById, fetchPollById, votePoll, openShareModal, setActivePollId } = usePolls();
  const { showToast } = useToast();
  const { pollId: paramPollId } = useParams() || {};

  const [selectedOptionIds, setSelectedOptionIds] = useState([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Extract hash parameter if opened via #poll-...
  const hash = typeof window !== 'undefined' ? window.location.hash.replace('#', '') : '';
  const pollIdFromHash = hash.startsWith('poll-') ? hash.replace('poll-', '') : null;
  const targetId = paramPollId || pollIdFromHash;

  // Resolve target poll from activePoll, route param, hash parameter, or available polls
  const poll =
    (targetId ? (getPollById(targetId) || getPollById(`poll-${targetId}`)) : null) ||
    activePoll ||
    (polls && polls.length > 0 ? polls[0] : null);

  // Fetch poll from backend if not yet in context state
  useEffect(() => {
    if (targetId && !getPollById(targetId) && fetchPollById) {
      fetchPollById(targetId);
    }
  }, [targetId, getPollById, fetchPollById]);

  // Synchronize active poll ID if resolved
  useEffect(() => {
    if (poll && setActivePollId && (!activePoll || activePoll.id !== poll.id)) {
      setActivePollId(poll.id);
    }
  }, [poll, activePoll, setActivePollId]);

  // Handle empty / not found state
  if (!poll) {
    return (
      <div className="public-poll-page animate-fade-in">
        <div className="public-poll-bg-glow" />
        <div className="public-poll-container">
          <div className="public-poll-brand-bar pollora-brand" onClick={() => onNavigate('landing')} role="button" tabIndex={0}>
            <div className="brand-icon-wrapper pollora-icon-wrapper">
              <PolloraIcon size={20} />
            </div>
            <span className="brand-name">
              Poll<span className="brand-gradient">ora</span>
            </span>
          </div>

          <Card className="public-empty-card glass-panel" glow>
            <div className="empty-state-icon">
              <AlertCircleIcon size={48} />
            </div>
            <h1 className="public-poll-title">Poll Not Found</h1>
            <p className="public-poll-description">
              The poll you are attempting to view could not be located. It may have been removed or the link is invalid.
            </p>
            <Button size="lg" variant="primary" onClick={() => onNavigate('landing')}>
              Return to Home
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const isClosed = poll.status === 'closed';
  const isExpired = Boolean(poll.isExpired || (poll.expiresAt && new Date(poll.expiresAt) < new Date()));
  const isInactive = isClosed || isExpired;
  const isMultiple = Boolean(poll.allowMultiple);

  const handleOptionToggle = (optionId) => {
    if (isInactive || hasVoted || submitting) return;

    if (isMultiple) {
      setSelectedOptionIds((prev) =>
        prev.includes(optionId)
          ? prev.filter((id) => id !== optionId)
          : [...prev, optionId]
      );
    } else {
      setSelectedOptionIds([optionId]);
    }
  };

  const handleVoteSubmit = async () => {
    if (selectedOptionIds.length === 0 || isInactive || submitting) return;

    setSubmitting(true);
    try {
      for (const optId of selectedOptionIds) {
        await votePoll(poll.id, optId);
      }
      setHasVoted(true);
      showToast('Vote submitted successfully! Thank you for participating.', 'success');
    } catch (err) {
      console.error('Failed to submit vote:', err);
      showToast(err.message || 'Failed to submit vote. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewResults = () => {
    if (setActivePollId) setActivePollId(poll.id);
    if (onNavigate) {
      onNavigate(`/results/${poll.id}`);
    }
  };

  const optionLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  return (
    <div className="public-poll-page animate-fade-in">
      {/* Ambient background glow */}
      <div className="public-poll-bg-glow" />

      <div className="public-poll-container">
        {/* Top Application Branding */}
        <div className="public-poll-brand-bar pollora-brand" onClick={() => onNavigate('landing')} role="button" tabIndex={0}>
          <div className="brand-icon-wrapper pollora-icon-wrapper">
            <PolloraIcon size={20} />
          </div>
          <span className="brand-name">
            Poll<span className="brand-gradient">ora</span>
          </span>
          <span className="badge badge-live-nav">PRO</span>
        </div>

        {/* Top Bar with Live Badge & Share Button */}
        <div className="public-poll-top-bar">
          <div className="public-status-group">
            <Badge variant={isInactive ? 'closed' : 'live'}>
              {isClosed ? 'CLOSED' : isExpired ? 'ENDED' : 'LIVE'}
            </Badge>
            <span className="public-sync-text">
              <RadioIcon size={14} className="inline-icon" />
              {isInactive ? 'Polling Concluded' : 'Live Audience Session'}
            </span>
          </div>

          <button
            onClick={() => openShareModal(poll)}
            className="public-share-btn"
            title="Share this poll"
            aria-label="Share this poll"
          >
            <ShareIcon size={15} />
            <span>Share</span>
          </button>
        </div>

        {/* Voting Card */}
        <Card className="public-voting-card glass-panel" glow>
          {/* Closed / Expired Alert Banner */}
          {isClosed && (
            <div className="poll-status-banner closed">
              <AlertCircleIcon size={18} />
              <span>This poll is closed and is no longer accepting new votes.</span>
            </div>
          )}
          {!isClosed && isExpired && (
            <div className="poll-status-banner warning">
              <ClockIcon size={18} />
              <span>This poll has ended. Voting is now closed.</span>
            </div>
          )}

          {/* Poll Header */}
          <div className="voting-card-header">
            <h1 className="public-poll-title">{poll.question}</h1>
            {poll.description && (
              <p className="public-poll-description">{poll.description}</p>
            )}

            <div className="public-meta-info">
              <span className="public-meta-item">
                <UsersIcon size={14} className="inline-icon" /> {poll.totalVotes || 0} responses recorded
              </span>
              <span className="public-meta-divider">•</span>
              <span className="public-meta-item">
                <ClockIcon size={14} className="inline-icon" />{' '}
                {poll.expiry ? `Closes in ${poll.expiry}` : isInactive ? 'Session finished' : 'Active poll'}
              </span>
              {isMultiple && (
                <>
                  <span className="public-meta-divider">•</span>
                  <span className="multi-choice-badge">
                    <CheckIcon size={12} /> Select multiple
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Voting State */}
          {!hasVoted && !isInactive ? (
            <div className="voting-card-body">
              <div className="options-grid" role={isMultiple ? 'group' : 'radiogroup'} aria-label="Poll options">
                {(poll.options || []).map((opt, idx) => {
                  const isSelected = selectedOptionIds.includes(opt.id);
                  const letter = optionLetters[idx % optionLetters.length];

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleOptionToggle(opt.id)}
                      className={`voting-option-card ${isSelected ? 'selected' : ''}`}
                      role={isMultiple ? 'checkbox' : 'radio'}
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') {
                          e.preventDefault();
                          handleOptionToggle(opt.id);
                        }
                      }}
                    >
                      <div className="option-indicator-wrap">
                        <span className="option-letter">{letter}</span>
                      </div>
                      <span className="option-text">{opt.text}</span>
                      <div className={`option-check-circle ${isSelected ? 'checked' : ''}`}>
                        {isSelected && <CheckIcon size={14} className="check-icon" />}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="voting-action-footer">
                <Button
                  size="lg"
                  variant="primary"
                  fullWidth
                  loading={submitting}
                  disabled={selectedOptionIds.length === 0 || submitting}
                  onClick={handleVoteSubmit}
                  iconRight={ArrowRightIcon}
                >
                  {selectedOptionIds.length > 1 ? `Submit ${selectedOptionIds.length} Votes` : 'Submit Vote'}
                </Button>
                <p className="vote-privacy-note">
                  🔒 Votes are 100% anonymous. One response per participant session.
                </p>
              </div>
            </div>
          ) : isInactive && !hasVoted ? (
            /* Inactive (Closed / Expired) State */
            <div className="vote-confirmed-body animate-fade-in">
              <div className="vote-confirmed-badge" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b' }}>
                <ClockIcon size={36} />
              </div>
              <h2 className="confirmed-title">Poll Has Ended</h2>
              <p className="confirmed-desc">
                Voting is currently closed for this poll. You can inspect the final live results below.
              </p>
              <div className="confirmed-actions">
                <Button
                  size="lg"
                  variant="primary"
                  icon={BarChartIcon}
                  fullWidth
                  onClick={handleViewResults}
                >
                  View Live Results
                </Button>
                <Button
                  size="md"
                  variant="secondary"
                  fullWidth
                  onClick={() => onNavigate('landing')}
                >
                  Explore More Polls
                </Button>
              </div>
            </div>
          ) : (
            /* Confirmed Vote State */
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
                  onClick={handleViewResults}
                >
                  View Live Results 🔴
                </Button>
                <Button
                  size="md"
                  variant="secondary"
                  fullWidth
                  onClick={() => {
                    setHasVoted(false);
                    setSelectedOptionIds([]);
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
          <strong className="footer-brand-highlight" onClick={() => onNavigate('landing')} role="button" tabIndex={0}>
            Pollora
          </strong>
          <span> • Fast, Secure & Anonymous Polling</span>
        </div>
      </div>
    </div>
  );
};
