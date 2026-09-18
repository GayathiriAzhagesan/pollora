import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { QRCodeCard } from './QRCodeCard';
import { useToast } from '../../context/ToastContext';
import {
  CopyIcon,
  CheckIcon,
  QrCodeIcon,
  ShareIcon,
  GlobeIcon,
} from '../../assets/icons';
import {
  WhatsAppIcon,
  LinkedInIcon,
  FacebookIcon,
  XTwitterIcon,
  EmailShareIcon,
  CopyShareIcon,
} from '../common/Logo';

export const ShareModal = ({ isOpen, onClose, poll }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { showToast } = useToast();

  if (!poll) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  // Generate clean React Router URL, while preserving backward compatibility
  const shareUrl = `${origin}/poll/${poll.id}`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      showToast('Link copied!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      showToast('Link copied!', 'success');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Pollora: ${poll.question}`,
          text: `Vote on this live poll: "${poll.question}"`,
          url: shareUrl,
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          handleCopy();
        }
      }
    } else {
      handleCopy();
    }
  };

  // Pre-configured dynamic social share links
  const socialChannels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: WhatsAppIcon,
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(`Vote on this live poll: "${poll.question}" — ${shareUrl}`)}`,
      ariaLabel: 'Share poll on WhatsApp',
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      icon: LinkedInIcon,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
      ariaLabel: 'Share poll on LinkedIn',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: FacebookIcon,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      ariaLabel: 'Share poll on Facebook',
    },
    {
      id: 'x',
      name: 'X',
      icon: XTwitterIcon,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Vote on this live poll: "${poll.question}"`)}&url=${encodeURIComponent(shareUrl)}`,
      ariaLabel: 'Share poll on X',
    },
    {
      id: 'email',
      name: 'Email',
      icon: EmailShareIcon,
      url: `mailto:?subject=${encodeURIComponent(`Live Poll: ${poll.question}`)}&body=${encodeURIComponent(`Hi,\n\nPlease cast your vote in this live poll:\n"${poll.question}"\n\nLink to vote: ${shareUrl}\n\nThank you!`)}`,
      ariaLabel: 'Share poll via Email',
    },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share your poll"
      subtitle="Distribute this poll link with your audience to gather instant responses."
    >
      <div className="share-modal-body">
        {/* Poll Question Preview */}
        <div className="share-poll-preview">
          <span className="share-preview-label">Active Poll</span>
          <p className="share-preview-question">{poll.question}</p>
        </div>

        {/* URL Field with Copy Button */}
        <div className="share-url-container">
          <div className="share-url-input-wrapper">
            <GlobeIcon size={16} className="share-url-icon" />
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="share-url-input"
              onClick={(e) => e.target.select()}
              aria-label="Poll URL"
            />
          </div>
          <Button
            variant={copied ? 'secondary' : 'primary'}
            icon={copied ? CheckIcon : CopyIcon}
            onClick={handleCopy}
            className="share-copy-btn"
            aria-label="Copy poll link"
          >
            {copied ? 'Link copied!' : 'Copy Link'}
          </Button>
        </div>

        {/* Social Channels Row */}
        <div className="share-social-platform-section">
          <span className="share-social-title">Share to Channels</span>
          <div className="share-social-grid" role="group" aria-label="Social media sharing options">
            {socialChannels.map((channel) => {
              const ChannelIcon = channel.icon;
              return (
                <a
                  key={channel.id}
                  href={channel.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`share-channel-btn share-channel-${channel.id}`}
                  title={`Share on ${channel.name}`}
                  aria-label={channel.ariaLabel}
                >
                  <div className="share-channel-icon-wrapper">
                    <ChannelIcon size={20} />
                  </div>
                  <span className="share-channel-name">{channel.name}</span>
                </a>
              );
            })}

            {/* Dedicated Copy Button in the Social Grid */}
            <button
              type="button"
              onClick={handleCopy}
              className={`share-channel-btn share-channel-copy ${copied ? 'copied' : ''}`}
              title="Copy poll URL to clipboard"
              aria-label="Copy poll URL to clipboard"
            >
              <div className="share-channel-icon-wrapper">
                {copied ? <CheckIcon size={20} /> : <CopyShareIcon size={20} />}
              </div>
              <span className="share-channel-name">{copied ? 'Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons: Native Share & QR Code */}
        <div className="share-actions-row">
          <Button
            variant="secondary"
            icon={ShareIcon}
            fullWidth
            onClick={handleNativeShare}
            aria-label="Open mobile system share sheet"
          >
            System Share Sheet
          </Button>
          <Button
            variant={showQR ? 'outline' : 'secondary'}
            icon={QrCodeIcon}
            fullWidth
            onClick={() => setShowQR(!showQR)}
            aria-label={showQR ? 'Hide QR Code' : 'Display QR Code for mobile scanning'}
          >
            {showQR ? 'Hide QR Code' : 'Show QR Code'}
          </Button>
        </div>

        {/* Expandable QR Code Section */}
        {showQR && (
          <div className="share-qr-section animate-fade-in">
            <QRCodeCard value={shareUrl} size={160} />
            <p className="share-qr-hint">Scan with any mobile camera to open instant voting</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
