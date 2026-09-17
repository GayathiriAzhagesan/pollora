import React, { createContext, useContext, useState } from 'react';
import { INITIAL_POLLS } from '../services/mockData';

const PollContext = createContext();

export const PollProvider = ({ children }) => {
  const [polls, setPolls] = useState(INITIAL_POLLS);
  const [activePollId, setActivePollId] = useState('poll-1');
  const [filter, setFilter] = useState('all'); // 'all' | 'active' | 'closed'
  const [shareModalData, setShareModalData] = useState(null); // { isOpen: boolean, poll: object }

  const activePoll = polls.find((p) => p.id === activePollId) || polls[0];

  const getPollById = (id) => polls.find((p) => p.id === id);

  const createPoll = ({ question, description = '', options, expiry = '24 hours', allowMultiple = false, showLiveResults = true }) => {
    const newId = 'poll-' + (Date.now()).toString(36);
    
    // Palette colors for new options
    const colors = ['#3b82f6', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#6366f1', '#14b8a6'];
    
    const formattedOptions = options.map((opt, idx) => ({
      id: `opt-${newId}-${idx + 1}`,
      text: opt.trim(),
      votes: 0,
      percentage: 0,
      color: colors[idx % colors.length],
    }));

    const newPoll = {
      id: newId,
      question,
      description,
      status: 'active',
      createdAt: 'Just now',
      createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      expiry,
      allowMultiple,
      showLiveResults,
      totalVotes: 0,
      options: formattedOptions,
    };

    setPolls((prev) => [newPoll, ...prev]);
    setActivePollId(newId);
    return newPoll;
  };

  const votePoll = (pollId, optionId) => {
    setPolls((prevPolls) =>
      prevPolls.map((poll) => {
        if (poll.id !== pollId) return poll;

        const updatedOptions = poll.options.map((opt) => {
          if (opt.id === optionId) {
            return { ...opt, votes: opt.votes + 1 };
          }
          return opt;
        });

        const newTotalVotes = updatedOptions.reduce((sum, opt) => sum + opt.votes, 0);

        const optionsWithPercentage = updatedOptions.map((opt) => ({
          ...opt,
          percentage: newTotalVotes > 0 ? Math.round((opt.votes / newTotalVotes) * 100) : 0,
        }));

        return {
          ...poll,
          totalVotes: newTotalVotes,
          options: optionsWithPercentage,
        };
      })
    );
  };

  const deletePoll = (pollId) => {
    setPolls((prev) => prev.filter((p) => p.id !== pollId));
    if (activePollId === pollId) {
      const remaining = polls.filter((p) => p.id !== pollId);
      if (remaining.length > 0) {
        setActivePollId(remaining[0].id);
      }
    }
  };

  const togglePollStatus = (pollId) => {
    setPolls((prev) =>
      prev.map((poll) => {
        if (poll.id === pollId) {
          const nextStatus = poll.status === 'active' ? 'closed' : 'active';
          return { ...poll, status: nextStatus };
        }
        return poll;
      })
    );
  };

  const openShareModal = (poll) => {
    setShareModalData({ isOpen: true, poll });
  };

  const closeShareModal = () => {
    setShareModalData(null);
  };

  const filteredPolls = polls.filter((poll) => {
    if (filter === 'active') return poll.status === 'active';
    if (filter === 'closed') return poll.status === 'closed';
    return true;
  });

  return (
    <PollContext.Provider
      value={{
        polls,
        filteredPolls,
        activePoll,
        activePollId,
        setActivePollId,
        filter,
        setFilter,
        getPollById,
        createPoll,
        votePoll,
        deletePoll,
        togglePollStatus,
        shareModalData,
        openShareModal,
        closeShareModal,
      }}
    >
      {children}
    </PollContext.Provider>
  );
};

export const usePolls = () => {
  const context = useContext(PollContext);
  if (!context) {
    throw new Error('usePolls must be used within a PollProvider');
  }
  return context;
};
