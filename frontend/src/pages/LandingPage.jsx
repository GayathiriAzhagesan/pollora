import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { OptionItem } from '../components/poll/OptionItem';
import { ProgressBar } from '../components/poll/ProgressBar';
import {
  ZapIcon,
  ShareIcon,
  BarChartIcon,
  ArrowRightIcon,
  SparklesIcon,
  UsersIcon,
  RadioIcon,
  CheckCircleIcon,
  ClockIcon,
} from '../assets/icons';

export const LandingPage = ({ onNavigate }) => {
  // Interactive Live Preview State
  const [selectedDemo, setSelectedDemo] = useState('opt-demo-2');
  const [demoVoted, setDemoVoted] = useState(false);
  const [demoVotes, setDemoVotes] = useState({
    'opt-demo-1': 62, // Java
    'opt-demo-2': 39, // Python
    'opt-demo-3': 19, // JavaScript
    'opt-demo-4': 9,  // Go
  });

  const totalDemoVotes = Object.values(demoVotes).reduce((a, b) => a + b, 0);

  const handleDemoVote = () => {
    if (!demoVoted && selectedDemo) {
      setDemoVotes((prev) => ({
        ...prev,
        [selectedDemo]: prev[selectedDemo] + 1,
      }));
      setDemoVoted(true);
    }
  };

  const demoOptions = [
    { id: 'opt-demo-1', text: 'Java', color: '#3b82f6' },
    { id: 'opt-demo-2', text: 'Python', color: '#8b5cf6' },
    { id: 'opt-demo-3', text: 'JavaScript', color: '#ec4899' },
    { id: 'opt-demo-4', text: 'Go', color: '#10b981' },
  ];

  return (
    <div className="landing-page">
      {/* Background glowing gradients */}
      <div className="landing-bg-glow glow-top-left" />
      <div className="landing-bg-glow glow-bottom-right" />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge animate-fade-in">
            <span className="pulse-dot green" />
            <span>Next-Gen Realtime Polling Engine</span>
            <SparklesIcon size={14} className="hero-badge-sparkle" />
          </div>

          <h1 className="hero-title animate-fade-in">
            Create Polls.<br />
            Get Answers. <span className="hero-gradient-text">Live.</span>
          </h1>

          <p className="hero-subtitle animate-fade-in">
            Create beautiful polls, share them instantly, and watch responses appear in real time.
            Built for modern product teams, webinars, conferences, and classroom engagement.
          </p>

          <div className="hero-actions animate-fade-in">
            <Button
              size="lg"
              variant="primary"
              iconRight={ArrowRightIcon}
              onClick={() => onNavigate('create-poll')}
            >
              Create a Poll
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => onNavigate('dashboard')}
            >
              Explore Polls
            </Button>
          </div>

          {/* Social Proof Stats */}
          <div className="hero-stats-row">
            <div className="hero-stat-item">
              <span className="hero-stat-number">50K+</span>
              <span className="hero-stat-label">Votes Counted</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <span className="hero-stat-number">99.9%</span>
              <span className="hero-stat-label">Uptime SLA</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat-item">
              <span className="hero-stat-number">&lt; 50ms</span>
              <span className="hero-stat-label">Sync Latency</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive Preview Card on the Right */}
        <div className="hero-preview-col animate-float">
          <Card className="hero-preview-card" glow>
            <div className="preview-card-header">
              <div className="preview-header-left">
                <Badge variant="live">LIVE</Badge>
                <span className="preview-live-indicator">
                  <RadioIcon size={14} className="inline-icon" /> Realtime Sync
                </span>
              </div>
              <span className="preview-votes-count">
                <UsersIcon size={13} className="inline-icon" /> {totalDemoVotes} votes
              </span>
            </div>

            <h3 className="preview-question">
              What's your favorite programming language?
            </h3>
            <p className="preview-subtext">Interactive voter preview — try voting now</p>

            {!demoVoted ? (
              <div className="preview-options-list">
                {demoOptions.map((opt, idx) => (
                  <OptionItem
                    key={opt.id}
                    id={opt.id}
                    text={opt.text}
                    index={idx}
                    selected={selectedDemo === opt.id}
                    onSelect={setSelectedDemo}
                  />
                ))}
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleDemoVote}
                  className="preview-vote-btn"
                >
                  Submit Vote
                </Button>
              </div>
            ) : (
              <div className="preview-results-list animate-fade-in">
                <div className="preview-success-banner">
                  <CheckCircleIcon size={16} />
                  <span>Vote submitted! Showing live results:</span>
                </div>
                {demoOptions.map((opt) => {
                  const votes = demoVotes[opt.id];
                  const pct = Math.round((votes / totalDemoVotes) * 100);
                  const isLeader = opt.id === 'opt-demo-1';
                  return (
                    <ProgressBar
                      key={opt.id}
                      label={opt.text}
                      votes={votes}
                      percentage={pct}
                      color={opt.color}
                      isLeader={isLeader}
                    />
                  );
                })}
                <button
                  onClick={() => setDemoVoted(false)}
                  className="preview-reset-btn"
                >
                  ↺ Reset demo vote
                </button>
              </div>
            )}
          </Card>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="features-section">
        <div className="section-header">
          <span className="section-eyebrow">DESIGNED FOR SPEED & IMPACT</span>
          <h2 className="section-title">Everything you need to engage live audiences</h2>
          <p className="section-subtitle">
            Say goodbye to clunky presentation plugins and delayed polling widgets.
          </p>
        </div>

        <div className="features-grid">
          {/* Feature 1 */}
          <Card className="feature-card" hover>
            <div className="feature-icon-box box-purple">
              <ZapIcon size={24} />
            </div>
            <h3 className="feature-title">Real-time Results</h3>
            <p className="feature-desc">
              Watch votes flow in as animated charts update dynamically without page reloads.
              Sub-second response delivery keeps your audience glued to the screen.
            </p>
            <div className="feature-highlight">
              <CheckCircleIcon size={14} /> Zero-delay animation transitions
            </div>
          </Card>

          {/* Feature 2 */}
          <Card className="feature-card" hover>
            <div className="feature-icon-box box-blue">
              <ShareIcon size={24} />
            </div>
            <h3 className="feature-title">Easy Sharing</h3>
            <p className="feature-desc">
              Instantly share polls with a direct link, QR code scanner for mobile users, or 1-click
              distribute across Slack, Twitter, and Zoom chat without requiring voter accounts.
            </p>
            <div className="feature-highlight">
              <CheckCircleIcon size={14} /> Instant QR code generation included
            </div>
          </Card>

          {/* Feature 3 */}
          <Card className="feature-card" hover>
            <div className="feature-icon-box box-pink">
              <BarChartIcon size={24} />
            </div>
            <h3 className="feature-title">Poll Analytics</h3>
            <p className="feature-desc">
              Gain actionable insights with detailed participation timelines, response velocities,
              and voter distribution breakdowns exportable in one click.
            </p>
            <div className="feature-highlight">
              <CheckCircleIcon size={14} /> Deep engagement breakdown metrics
            </div>
          </Card>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="cta-banner-section">
        <Card className="cta-banner-card glass-panel" glow>
          <div className="cta-banner-content">
            <h2 className="cta-banner-title">Ready to launch your first live poll?</h2>
            <p className="cta-banner-sub">
              Join thousands of creators, engineers, and educators who make meetings interactive.
            </p>
            <div className="cta-banner-buttons">
              <Button
                size="lg"
                variant="primary"
                iconRight={ArrowRightIcon}
                onClick={() => onNavigate('create-poll')}
              >
                Get Started Now — It's Free
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => onNavigate('login')}
              >
                Sign In to Workspace
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
};
