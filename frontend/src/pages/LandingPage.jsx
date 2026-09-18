import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { OptionItem } from '../components/poll/OptionItem';
import { ProgressBar } from '../components/poll/ProgressBar';
import { PolloraIcon } from '../components/common/Logo';
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
  QrCodeIcon,
  ShieldIcon,
  SmartphoneIcon,
  LayersIcon,
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
    { id: 'opt-demo-1', text: 'Java', color: '#2563eb' },
    { id: 'opt-demo-2', text: 'Python', color: '#3b82f6' },
    { id: 'opt-demo-3', text: 'JavaScript', color: '#0284c7' },
    { id: 'opt-demo-4', text: 'Go', color: '#10b981' },
  ];

  return (
    <div className="landing-page">
      {/* Background ambient lighting */}
      <div className="landing-bg-glow glow-top-left" />
      <div className="landing-bg-glow glow-bottom-right" />

      {/* ====================================================================
          1. HERO SECTION
          ==================================================================== */}
      <section className="hero-section">
        {/* Left Column: Headline, Description & CTAs */}
        <div className="hero-content">
          <div className="hero-badge animate-fade-in">
            <PolloraIcon size={16} />
            <span>Meet Pollora — Real-Time Polling Engine</span>
            <SparklesIcon size={14} className="hero-badge-sparkle" />
          </div>

          <h1 className="hero-title animate-fade-in">
            Create Polls.<br />
            Collect Opinions.<br />
            <span className="hero-gradient-text">See Results Live.</span>
          </h1>

          <p className="hero-subtitle animate-fade-in">
            Pollora lets presenters, educators, and teams launch interactive polls in seconds,
            collect audience responses with a frictionless QR code, and watch votes stream in live
            with sub-second Redis Pub/Sub synchronization.
          </p>

          <div className="hero-actions animate-fade-in">
            <Button
              size="lg"
              variant="primary"
              iconRight={ArrowRightIcon}
              onClick={() => onNavigate('create-poll')}
            >
              Create a Poll Free
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => onNavigate('dashboard')}
            >
              Explore Workspace
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

        {/* Right Column: Hero Product Visual */}
        <div className="hero-visual-col animate-float">
          <div className="hero-illustration-card glass-panel glow">
            <div className="illustration-header-bar">
              <div className="mac-dots">
                <span className="mac-dot red" />
                <span className="mac-dot yellow" />
                <span className="mac-dot green" />
              </div>
              <div className="illustration-title-pill">
                <span className="pulse-dot green" /> Pollora Live Session • #6aaccd34
              </div>
              <Badge variant="live">LIVE</Badge>
            </div>

            <div className="hero-img-container">
              <img
                src="/pollora-hero.jpg"
                alt="Pollora real-time polling platform illustration showing live voting session, animated progress bars, floating participant reactions, and audience analytics dashboard"
                className="hero-illustration-img"
                loading="eager"
                width="800"
                height="600"
              />
              <div className="hero-img-overlay-glow" />
            </div>

            {/* Floating Live Badges over the illustration */}
            <div className="floating-hero-pill pill-top-left">
              <span className="pulse-dot green" />
              <span><strong>1,483</strong> live responses</span>
            </div>

            <div className="floating-hero-pill pill-bottom-right">
              <RadioIcon size={14} className="text-primary" />
              <span>Redis Pub/Sub • <strong>&lt; 50ms</strong></span>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          2. FEATURE SHOWCASE: LIVE POLLING WALL (SurveyMars Inspired)
          ==================================================================== */}
      <section className="showcase-section">
        <div className="showcase-grid">
          {/* Left Media: Live Wall on Stage */}
          <div className="showcase-media-col animate-fade-in">
            <div className="showcase-media-frame glass-panel glow">
              <div className="showcase-media-header">
                <div className="mac-dots">
                  <span className="mac-dot red" />
                  <span className="mac-dot yellow" />
                  <span className="mac-dot green" />
                </div>
                <span className="showcase-tag">FULLSCREEN PRESENTATION WALL</span>
              </div>
              <img
                src="/pollora-live-wall.jpg"
                alt="Pollora Live Polling Wall projected on a keynote stage with live voting bars and on-screen QR code"
                className="showcase-feature-img"
                loading="lazy"
                width="800"
                height="450"
              />
            </div>
          </div>

          {/* Right Copy: Live Polling Wall Features */}
          <div className="showcase-content-col">
            <Badge variant="live">PRESENTATION MODE</Badge>
            <h2 className="showcase-title">The Live Polling Wall for Stage, Events &amp; Webinars</h2>
            <p className="showcase-desc">
              Transform meetings, classes, and conferences into high-engagement experiences.
              Project the <strong>Pollora Live Wall</strong> on your keynote screen or Zoom window
              and watch hundreds of audience responses flow in dynamically.
            </p>

            <div className="showcase-points-list">
              <div className="showcase-point-item">
                <div className="point-icon-box">
                  <ZapIcon size={18} />
                </div>
                <div>
                  <h4 className="point-title">Sub-Second Redis WebSocket Broadcast</h4>
                  <p className="point-desc">Each submitted vote instantly animates bar graphs on the big screen without refreshing.</p>
                </div>
              </div>

              <div className="showcase-point-item">
                <div className="point-icon-box">
                  <QrCodeIcon size={18} />
                </div>
                <div>
                  <h4 className="point-title">On-Screen Dynamic QR Code</h4>
                  <p className="point-desc">Audiences simply aim their smartphone cameras at the screen to join in 3 seconds.</p>
                </div>
              </div>

              <div className="showcase-point-item">
                <div className="point-icon-box">
                  <ShieldIcon size={18} />
                </div>
                <div>
                  <h4 className="point-title">Presenter Controls &amp; Expiry Timers</h4>
                  <p className="point-desc">Pause voting, close polls, or hide/reveal results dynamically during your talk.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          3. FEATURE SHOWCASE: FRICTIONLESS MOBILE VOTING (SurveyMars Inspired)
          ==================================================================== */}
      <section className="showcase-section reverse-mobile">
        <div className="showcase-grid reverse-grid">
          {/* Left Copy: Mobile Voter Experience */}
          <div className="showcase-content-col">
            <Badge variant="info">AUDIENCE EXPERIENCE</Badge>
            <h2 className="showcase-title">Instant Voting From Any Device — Zero App Required</h2>
            <p className="showcase-desc">
              Removing friction maximizes participation. Pollora ensures that any attendee with an iPhone,
              Android, tablet, or laptop can cast their vote immediately.
            </p>

            <div className="showcase-points-list">
              <div className="showcase-point-item">
                <div className="point-icon-box">
                  <SmartphoneIcon size={18} />
                </div>
                <div>
                  <h4 className="point-title">Zero App Download &amp; Zero Registration</h4>
                  <p className="point-desc">No App Store downloads and no passwords required. Voters open the link and tap their choice.</p>
                </div>
              </div>

              <div className="showcase-point-item">
                <div className="point-icon-box">
                  <CheckCircleIcon size={18} />
                </div>
                <div>
                  <h4 className="point-title">Single &amp; Multiple Choice Voting</h4>
                  <p className="point-desc">Support simple binary polls, multi-option rankings, and flexible respondent preferences.</p>
                </div>
              </div>

              <div className="showcase-point-item">
                <div className="point-icon-box">
                  <ShieldIcon size={18} />
                </div>
                <div>
                  <h4 className="point-title">100% Anonymous &amp; Session Protected</h4>
                  <p className="point-desc">Safe voter sessions protect honest audience opinions while preventing vote spamming.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Media: Mobile Phone Mockup */}
          <div className="showcase-media-col animate-fade-in">
            <div className="showcase-media-frame glass-panel glow">
              <div className="showcase-media-header">
                <div className="mac-dots">
                  <span className="mac-dot red" />
                  <span className="mac-dot yellow" />
                  <span className="mac-dot green" />
                </div>
                <span className="showcase-tag">RESPONSIVE MOBILE VOTER UI</span>
              </div>
              <img
                src="/pollora-mobile-voting.jpg"
                alt="Pollora smartphone voting interface showing instant vote selection and QR card"
                className="showcase-feature-img"
                loading="lazy"
                width="800"
                height="600"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ====================================================================
          4. STEP-BY-STEP WORKFLOW: HOW POLLORA WORKS
          ==================================================================== */}
      <section className="how-it-works-section">
        <div className="section-header">
          <span className="section-eyebrow">SIMPLE 3-STEP PROCESS</span>
          <h2 className="section-title">How Pollora Works</h2>
          <p className="section-subtitle">
            From setup to live audience engagement in less than a minute.
          </p>
        </div>

        <div className="steps-grid">
          <Card className="step-card glass-panel" hover>
            <div className="step-badge">01</div>
            <h3 className="step-title">Create in 30 Seconds</h3>
            <p className="step-desc">
              Type your question, add options, and configure settings like expiration timers and multi-select.
            </p>
            <div className="step-footer-tag">
              <LayersIcon size={14} /> Quick Creator Studio
            </div>
          </Card>

          <Card className="step-card glass-panel" hover>
            <div className="step-badge">02</div>
            <h3 className="step-title">Share Instantly</h3>
            <p className="step-desc">
              Display your on-screen QR code, copy the direct link, or share in one click to WhatsApp, LinkedIn, X, or email.
            </p>
            <div className="step-footer-tag">
              <ShareIcon size={14} /> Multi-Channel Distribution
            </div>
          </Card>

          <Card className="step-card glass-panel" hover>
            <div className="step-badge">03</div>
            <h3 className="step-title">Stream Live Results</h3>
            <p className="step-desc">
              Watch real-time bar graphs update live as participants vote. Export analytics data whenever you want.
            </p>
            <div className="step-footer-tag">
              <ZapIcon size={14} /> Redis Real-Time Sync
            </div>
          </Card>
        </div>
      </section>

      {/* ====================================================================
          5. INTERACTIVE LIVE DEMO (Preserved & Styled)
          ==================================================================== */}
      <section className="interactive-demo-section">
        <div className="demo-section-header">
          <Badge variant="live">EXPERIENCE POLLORA LIVE</Badge>
          <h2 className="demo-section-title">Cast a vote and watch real-time results</h2>
          <p className="demo-section-sub">
            Try the interactive voter card below. Notice the instant sub-second response animation.
          </p>
        </div>

        <div className="interactive-demo-wrapper">
          <Card className="hero-preview-card glass-panel" glow>
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
            <p className="preview-subtext">Interactive voter preview — click to vote</p>

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

      {/* ====================================================================
          6. ENTERPRISE CAPABILITIES GRID
          ==================================================================== */}
      <section id="features" className="features-section">
        <div className="section-header">
          <span className="section-eyebrow">ENTERPRISE SAAS FEATURES</span>
          <h2 className="section-title">Everything you need to engage live audiences</h2>
          <p className="section-subtitle">
            Engineered for high-volume presentations, classrooms, webinars, and all-hands meetings.
          </p>
        </div>

        <div className="features-grid">
          {/* Feature 1 */}
          <Card className="feature-card" hover>
            <div className="feature-icon-box box-blue">
              <ZapIcon size={24} />
            </div>
            <h3 className="feature-title">Real-Time Redis Updates</h3>
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
              <QrCodeIcon size={24} />
            </div>
            <h3 className="feature-title">Universal QR Access</h3>
            <p className="feature-desc">
              Every poll generates an auto-rendered high-res QR code. Audiences scan with their phone
              camera and vote instantly without app installs or signups.
            </p>
            <div className="feature-highlight">
              <CheckCircleIcon size={14} /> Zero friction participation
            </div>
          </Card>

          {/* Feature 3 */}
          <Card className="feature-card" hover>
            <div className="feature-icon-box box-blue">
              <ShareIcon size={24} />
            </div>
            <h3 className="feature-title">One-Click Multi-Sharing</h3>
            <p className="feature-desc">
              Seamlessly broadcast polls to WhatsApp, LinkedIn, X, email, or copy direct link with
              instant preview formatting.
            </p>
            <div className="feature-highlight">
              <CheckCircleIcon size={14} /> Native brand social share buttons
            </div>
          </Card>

          {/* Feature 4 */}
          <Card className="feature-card" hover>
            <div className="feature-icon-box box-blue">
              <BarChartIcon size={24} />
            </div>
            <h3 className="feature-title">Live Analytics Dashboard</h3>
            <p className="feature-desc">
              Inspect vote margins, total turnout, response velocity, and option popularity
              in real time with clean data breakdowns.
            </p>
            <div className="feature-highlight">
              <CheckCircleIcon size={14} /> Comprehensive participation stats
            </div>
          </Card>

          {/* Feature 5 */}
          <Card className="feature-card" hover>
            <div className="feature-icon-box box-blue">
              <ShieldIcon size={24} />
            </div>
            <h3 className="feature-title">Voter Privacy &amp; Security</h3>
            <p className="feature-desc">
              Guaranteed 100% anonymous voter sessions with tamper-proof JWT authentication and
              MongoDB cloud persistence.
            </p>
            <div className="feature-highlight">
              <CheckCircleIcon size={14} /> Honest &amp; confidential feedback
            </div>
          </Card>

          {/* Feature 6 */}
          <Card className="feature-card" hover>
            <div className="feature-icon-box box-blue">
              <ClockIcon size={24} />
            </div>
            <h3 className="feature-title">Flexible Expiry &amp; Timers</h3>
            <p className="feature-desc">
              Schedule polls to conclude automatically after 1 hour, 24 hours, or a week, or manually
              toggle status anytime from your dashboard.
            </p>
            <div className="feature-highlight">
              <CheckCircleIcon size={14} /> Full presenter lifecycle control
            </div>
          </Card>
        </div>
      </section>

      {/* ====================================================================
          7. BOTTOM CTA BANNER
          ==================================================================== */}
      <section className="cta-banner-section">
        <Card className="cta-banner-card glass-panel" glow>
          <div className="cta-banner-content">
            <h2 className="cta-banner-title">Ready to launch your first live poll with Pollora?</h2>
            <p className="cta-banner-sub">
              Join thousands of creators, engineers, and educators who make meetings and presentations interactive.
            </p>
            <div className="cta-banner-buttons">
              <Button
                size="lg"
                variant="primary"
                iconRight={ArrowRightIcon}
                onClick={() => onNavigate('create-poll')}
              >
                Get Started Free
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
