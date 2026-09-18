import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { Toggle } from '../components/common/Toggle';
import { QRCodeCard } from '../components/poll/QRCodeCard';
import { usePolls } from '../context/PollContext';
import { useToast } from '../context/ToastContext';
import {
  PlusIcon,
  TrashIcon,
  CopyIcon,
  CheckIcon,
  ShareIcon,
  GlobeIcon,
  SparklesIcon,
} from '../assets/icons';

export const CreatePollPage = ({ onNavigate }) => {
  const { createPoll, openShareModal } = usePolls();
  const { showToast } = useToast();

  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [options, setOptions] = useState([
    'Option 1',
    'Option 2',
    'Option 3',
  ]);
  const [expiry, setExpiry] = useState('24 hours');
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [showLiveResults, setShowLiveResults] = useState(true);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const [createdPoll, setCreatedPoll] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleAddOption = () => {
    if (options.length >= 8) {
      showToast(
        'Maximum 8 options allowed per poll',
        'info'
      );
      return;
    }

    setOptions([
      ...options,
      `Option ${options.length + 1}`,
    ]);
  };

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const handleDeleteOption = (index) => {
    if (options.length <= 2) {
      showToast(
        'A poll must have at least 2 options',
        'error'
      );
      return;
    }

    const updated = options.filter(
      (_, i) => i !== index
    );

    setOptions(updated);
  };

  const validate = () => {
    const errs = {};

    if (!question.trim()) {
      errs.question = 'Poll question is required';
    } else if (question.trim().length < 5) {
      errs.question =
        'Question must be at least 5 characters';
    }

    const cleanedOptions = options
      .map((option) => option.trim())
      .filter(Boolean);

    if (cleanedOptions.length < 2) {
      errs.options =
        'A poll must have at least 2 options';
    }

    if (cleanedOptions.length !== options.length) {
      errs.options =
        'All option choices must have text';
    }

    setErrors(errs);

    return Object.keys(errs).length === 0;
  };

  // -----------------------------------
  // CREATE POLL
  // -----------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setLoading(true);

      const newPoll = await createPoll({
        question: question.trim(),
        description: description.trim(),
        options,
        expiry,
        allowMultiple,
        showLiveResults,
      });

      setCreatedPoll(newPoll);

      showToast(
        'Poll created successfully!',
        'success'
      );
    } catch (error) {
      console.error(
        'Create poll error:',
        error
      );

      showToast(
        error.message ||
          'Failed to create poll. Please try again.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const origin =
    typeof window !== 'undefined'
      ? window.location.origin
      : '';

  const shareableUrl = createdPoll
    ? `${origin}/poll/${createdPoll.id}`
    : '';

  // -----------------------------------
  // COPY LINK
  // -----------------------------------
  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(
          shareableUrl
        );
      }

      setCopied(true);

      showToast(
        'Shareable link copied to clipboard!',
        'success'
      );

      setTimeout(
        () => setCopied(false),
        2000
      );
    } catch (error) {
      console.error(
        'Copy link error:',
        error
      );

      setCopied(true);

      showToast(
        'Link copied!',
        'success'
      );

      setTimeout(
        () => setCopied(false),
        2000
      );
    }
  };

  // -----------------------------------
  // SUCCESS SCREEN
  // -----------------------------------
  if (createdPoll) {
    return (
      <div className="create-poll-container animate-fade-in">
        <Card
          className="poll-success-card glass-panel"
          glow
        >
          <div className="success-badge-wrapper">
            <span className="success-icon-circle">
              🎉
            </span>
          </div>

          <h2 className="success-title">
            Poll Created Successfully
          </h2>

          <p className="success-subtitle">
            Your live poll is active and ready to
            accept responses from anywhere in the
            world.
          </p>

          <div className="success-poll-details">
            <span className="success-question-label">
              Question:
            </span>

            <h3 className="success-question-text">
              "{createdPoll.question}"
            </h3>
          </div>

          {/* SHAREABLE URL */}
          <div className="success-url-box">
            <div className="success-url-wrapper">
              <GlobeIcon
                size={16}
                className="success-url-icon"
              />

              <input
                type="text"
                readOnly
                value={shareableUrl}
                className="success-url-input"
                onClick={(e) =>
                  e.target.select()
                }
              />
            </div>

            <Button
              variant={
                copied
                  ? 'secondary'
                  : 'primary'
              }
              icon={
                copied
                  ? CheckIcon
                  : CopyIcon
              }
              onClick={handleCopyLink}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>

            <Button
              variant="secondary"
              icon={ShareIcon}
              onClick={() =>
                openShareModal(createdPoll)
              }
            >
              Share
            </Button>
          </div>

          {/* QR CODE */}
          <div className="success-qr-box">
            <h4 className="success-qr-title">
              Instant QR Code
            </h4>

            <QRCodeCard
              value={shareableUrl}
              size={150}
            />

            <p className="success-qr-desc">
              Audience can scan with their phone
              camera to vote without signing up
            </p>
          </div>

          {/* ACTIONS */}
          <div className="success-actions-row">
            <Button
              variant="primary"
              size="lg"
              onClick={() =>
                onNavigate(`/poll/${createdPoll.id}`)
              }
            >
              Test Vote on Public Poll
            </Button>

            <Button
              variant="secondary"
              size="lg"
              onClick={() =>
                onNavigate('dashboard')
              }
            >
              Return to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // -----------------------------------
  // CREATE FORM
  // -----------------------------------
  return (
    <div className="create-poll-container animate-fade-in">
      <div className="create-poll-header">
        <h1 className="create-poll-title">
          Create a New Poll
        </h1>

        <p className="create-poll-subtitle">
          Configure questions, interactive choices,
          and distribution settings in seconds.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="create-poll-form"
        noValidate
      >
        {/* QUESTION + OPTIONS */}
        <Card
          className="create-poll-card glass-panel"
          glow
        >
          <div className="form-section-header">
            <h3 className="form-section-title">
              1. Poll Question
            </h3>

            <span className="section-step-pill">
              Step 1 of 2
            </span>
          </div>

          <Input
            label="What would you like to ask?"
            placeholder="e.g. What's your favorite programming language?"
            value={question}
            onChange={(e) => {
              setQuestion(e.target.value);

              if (errors.question) {
                setErrors({
                  ...errors,
                  question: '',
                });
              }
            }}
            error={errors.question}
            required
          />

          <div className="input-group">
            <label className="input-label">
              Optional Description / Context
            </label>

            <textarea
              rows={2}
              className="input-textarea"
              placeholder="Add additional guidance, instructions, or meeting context..."
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
            />
          </div>

          {/* OPTIONS */}
          <div className="options-section">
            <div className="options-section-header">
              <label className="input-label">
                Poll Options{' '}
                <span className="text-danger">
                  *
                </span>
              </label>

              <span className="options-counter-text">
                {options.length} / 8 options
              </span>
            </div>

            {errors.options && (
              <p className="input-error-msg mb-2">
                {errors.options}
              </p>
            )}

            <div className="options-input-list">
              {options.map((opt, idx) => (
                <div
                  key={idx}
                  className="option-row animate-fade-in"
                >
                  <span className="option-index-badge">
                    {String.fromCharCode(
                      65 + idx
                    )}
                  </span>

                  <input
                    type="text"
                    value={opt}
                    onChange={(e) =>
                      handleOptionChange(
                        idx,
                        e.target.value
                      )
                    }
                    placeholder={`Option ${idx + 1}`}
                    className="option-input-field"
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      handleDeleteOption(idx)
                    }
                    className="delete-option-btn"
                    disabled={
                      options.length <= 2
                    }
                    title={
                      options.length <= 2
                        ? 'Minimum 2 options required'
                        : 'Delete option'
                    }
                    aria-label="Delete option"
                  >
                    <TrashIcon size={16} />
                  </button>
                </div>
              ))}
            </div>

            <div className="add-option-row">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                icon={PlusIcon}
                onClick={handleAddOption}
                disabled={options.length >= 8}
              >
                Add Option
              </Button>
            </div>
          </div>
        </Card>

        {/* SETTINGS */}
        <Card
          className="create-poll-card glass-panel"
        >
          <div className="form-section-header">
            <h3 className="form-section-title">
              2. Settings & Privacy
            </h3>

            <span className="section-step-pill">
              Step 2 of 2
            </span>
          </div>

          <div className="poll-settings-list">
            <div className="setting-select-group">
              <div className="setting-text">
                <label className="toggle-label">
                  Poll Expiry
                </label>

                <p className="toggle-description">
                  Automatically close the poll
                  after a specified time frame
                </p>
              </div>

              <select
                value={expiry}
                onChange={(e) =>
                  setExpiry(e.target.value)
                }
                className="select-dropdown"
              >
                <option value="1 hour">
                  1 hour
                </option>

                <option value="24 hours">
                  24 hours
                </option>

                <option value="7 days">
                  7 days
                </option>

                <option value="Never">
                  Never (manual close)
                </option>
              </select>
            </div>

            <div className="setting-divider" />

            <Toggle
              label="Allow multiple selections"
              description="Permit voters to select more than one choice"
              checked={allowMultiple}
              onChange={setAllowMultiple}
            />

            <div className="setting-divider" />

            <Toggle
              label="Show live results"
              description="Allow voters to see real-time vote percentage breakdown immediately after submitting"
              checked={showLiveResults}
              onChange={setShowLiveResults}
            />
          </div>
        </Card>

        {/* ACTIONS */}
        <div className="form-actions-bar">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={() =>
              onNavigate('dashboard')
            }
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            icon={SparklesIcon}
          >
            Create Poll
          </Button>
        </div>
      </form>
    </div>
  );
};

