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
  ExternalLinkIcon,
  GlobeIcon,
} from '../../assets/icons';

export const ShareModal = ({ isOpen, onClose, poll }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const { showToast } = useToast();

  if (!poll) return null;

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://livepoll.example.com';
  const shareUrl = `${origin}/#poll-${poll.id}`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
      }
      setCopied(true);
      showToast('Poll link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Poll link copied!', 'success');
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: poll.question,
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
            />
          </div>
          <Button
            variant={copied ? 'secondary' : 'primary'}
            icon={copied ? CheckIcon : CopyIcon}
            onClick={handleCopy}
            className="share-copy-btn"
          >
            {copied ? 'Copied!' : 'Copy Link'}
          </Button>
        </div>

        {/* Action Buttons: Share & QR Code */}
        <div className="share-actions-row">
          <Button
            variant="secondary"
            icon={ShareIcon}
            fullWidth
            onClick={handleNativeShare}
          >
            Share to Apps
          </Button>
          <Button
            variant={showQR ? 'outline' : 'secondary'}
            icon={QrCodeIcon}
            fullWidth
            onClick={() => setShowQR(!showQR)}
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

        {/* Social Quick Share Shortcuts */}
        <div className="share-social-row">
          <span className="share-social-title">Quick Share:</span>
          <a
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`Vote in this poll: ${poll.question}`)}&url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-social-btn"
            title="Share on X / Twitter"
          >
            X (Twitter)
          </a>
          <a
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-social-btn"
            title="Share on LinkedIn"
          >
            LinkedIn
          </a>
          <a
            href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Vote on LivePoll: ${poll.question} - ${shareUrl}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="share-social-btn"
            title="Share on WhatsApp"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </Modal>
  );
};
