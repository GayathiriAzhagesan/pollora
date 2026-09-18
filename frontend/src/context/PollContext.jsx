import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';
import { INITIAL_POLLS } from '../services/mockData';
import { API_URL } from '../config';

const PollContext = createContext();

export const PollProvider = ({ children }) => {
  const [polls, setPolls] = useState([]);
  const [activePollId, setActivePollId] = useState(null);
  const [filter, setFilter] = useState('all');
  const [shareModalData, setShareModalData] = useState(null);

  // --------------------------------------------------
  // Helper: get JWT token
  // --------------------------------------------------
  const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token || token === 'null' || token === 'undefined' || !token.trim()) {
      return null;
    }
    return token;
  };

  // --------------------------------------------------
  // Convert backend poll to frontend poll format
  // --------------------------------------------------
  const formatPoll = (poll) => {
    const totalVotes =
      poll.options?.reduce(
        (sum, option) => sum + (option.votes || 0),
        0
      ) || 0;

    const colors = [
      '#3b82f6',
      '#8b5cf6',
      '#ec4899',
      '#10b981',
      '#f59e0b',
      '#06b6d4',
      '#6366f1',
      '#14b8a6',
    ];

    const formattedOptions = (poll.options || []).map(
      (option, index) => ({
        id: option.id,
        text: option.text,
        votes: option.votes || 0,
        percentage:
          totalVotes > 0
            ? Math.round((option.votes / totalVotes) * 100)
            : 0,
        color: colors[index % colors.length],
      })
    );

    return {
      ...poll,
      status: 'active',
      createdAt: poll.created_at
        ? new Date(poll.created_at).toLocaleString()
        : 'Just now',
      createdDate: poll.created_at
        ? new Date(poll.created_at).toLocaleDateString(
            'en-US',
            {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            }
          )
        : '',
      totalVotes,
      options: formattedOptions,
    };
  };

  // --------------------------------------------------
  // GET ALL POLLS
  // --------------------------------------------------
  const fetchPolls = async () => {
    try {
      const response = await fetch(`${API_URL}/polls`);

      if (!response.ok) {
        throw new Error('Failed to fetch polls');
      }

      const data = await response.json();

      const formattedPolls = Array.isArray(data)
        ? data.map(formatPoll)
        : [];

      setPolls(formattedPolls);

      if (
        formattedPolls.length > 0 &&
        !activePollId
      ) {
        setActivePollId(formattedPolls[0].id);
      }

      return formattedPolls;
    } catch (error) {
      console.error('Error fetching polls:', error);
      setPolls([]);
      return [];
    }
  };

  // --------------------------------------------------
  // FETCH POLLS WHEN APP STARTS
  // --------------------------------------------------
  useEffect(() => {
    fetchPolls();
  }, []);

  // --------------------------------------------------
  // GET ACTIVE POLL
  // --------------------------------------------------
  const activePoll =
    polls.find((poll) => poll.id === activePollId) ||
    null;

  // --------------------------------------------------
  // GET POLL BY ID
  // --------------------------------------------------
  const getPollById = (id) => {
    return polls.find((poll) => poll.id === id);
  };

  // --------------------------------------------------
  // FETCH ONE POLL FROM BACKEND
  // --------------------------------------------------
  const fetchPollById = async (pollId) => {
    try {
      const response = await fetch(
        `${API_URL}/polls/${pollId}`
      );

      if (!response.ok) {
        throw new Error('Poll not found');
      }

      const data = await response.json();

      const formattedPoll = formatPoll(data);

      setPolls((prev) => {
        const exists = prev.some(
          (poll) => poll.id === formattedPoll.id
        );

        if (exists) {
          return prev.map((poll) =>
            poll.id === formattedPoll.id
              ? formattedPoll
              : poll
          );
        }

        return [formattedPoll, ...prev];
      });

      setActivePollId(formattedPoll.id);

      return formattedPoll;
    } catch (error) {
      console.error('Error fetching poll:', error);
      return null;
    }
  };

  // --------------------------------------------------
  // CREATE POLL
  // --------------------------------------------------
  const createPoll = async ({
    question,
    description = '',
    options,
    expiry = '24 hours',
    allowMultiple = false,
    showLiveResults = true,
  }) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Please sign in to create a poll.');
      }

      const response = await fetch(`${API_URL}/polls`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          question: question.trim(),
          options: options
            .filter((option) => option.trim() !== '')
            .map((option) => option.trim()),
        }),
      });

      if (!response.ok) {
        let errorMessage = 'Failed to create poll';
        try {
          const errorJson = await response.json();
          if (errorJson && errorJson.error) errorMessage = errorJson.error;
        } catch {
          const errorText = await response.text().catch(() => '');
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();

      const newPoll = formatPoll(data);

      setPolls((prev) => [newPoll, ...prev]);
      setActivePollId(newPoll.id);

      return newPoll;
    } catch (error) {
      console.error('Error creating poll:', error);
      throw error;
    }
  };

  // --------------------------------------------------
  // VOTE POLL
  // --------------------------------------------------
  const votePoll = async (pollId, optionId) => {
    try {
      const token = getToken();
      const headers = {
        'Content-Type': 'application/json',
      };

      // Only attach Authorization header if a valid token exists
      if (token && token !== 'null' && token !== 'undefined') {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(
        `${API_URL}/polls/${pollId}/vote`,
        {
          method: 'PATCH',
          headers,
          body: JSON.stringify({
            option_id: optionId,
          }),
        }
      );

      if (!response.ok) {
        let errorMessage = 'Failed to record vote';
        try {
          const errorJson = await response.json();
          if (errorJson && errorJson.error) {
            errorMessage = errorJson.error;
          }
        } catch {
          const errorText = await response.text().catch(() => '');
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      // Optimistically update poll options count in local state
      setPolls((prev) =>
        prev.map((poll) => {
          if (poll.id !== pollId) return poll;
          const updatedOptions = (poll.options || []).map((opt) =>
            opt.id === optionId ? { ...opt, votes: (opt.votes || 0) + 1 } : opt
          );
          const totalVotes = updatedOptions.reduce((sum, o) => sum + (o.votes || 0), 0);
          return {
            ...poll,
            totalVotes,
            options: updatedOptions.map((opt) => ({
              ...opt,
              percentage: totalVotes > 0 ? Math.round((opt.votes / totalVotes) * 100) : 0,
            })),
          };
        })
      );

      // Re-fetch latest poll details from backend asynchronously
      fetchPollById(pollId);

      return true;
    } catch (error) {
      console.error('Error voting:', error);
      throw error;
    }
  };

  // --------------------------------------------------
  // DELETE POLL
  // --------------------------------------------------
  const deletePoll = async (pollId) => {
    try {
      const token = getToken();
      if (!token) {
        throw new Error('Please sign in to delete a poll.');
      }

      const response = await fetch(
        `${API_URL}/polls/${pollId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        let errorMessage = 'Failed to delete poll';
        try {
          const errorJson = await response.json();
          if (errorJson && errorJson.error) errorMessage = errorJson.error;
        } catch {
          const errorText = await response.text().catch(() => '');
          if (errorText) errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      setPolls((prev) =>
        prev.filter((poll) => poll.id !== pollId)
      );

      if (activePollId === pollId) {
        setActivePollId(null);
      }

      return true;
    } catch (error) {
      console.error('Error deleting poll:', error);
      throw error;
    }
  };

  // --------------------------------------------------
  // TOGGLE POLL STATUS
  // --------------------------------------------------
  const togglePollStatus = (pollId) => {
    setPolls((prev) =>
      prev.map((poll) => {
        if (poll.id === pollId) {
          return {
            ...poll,
            status:
              poll.status === 'active'
                ? 'closed'
                : 'active',
          };
        }

        return poll;
      })
    );
  };

  // --------------------------------------------------
  // SHARE MODAL
  // --------------------------------------------------
  const openShareModal = (poll) => {
    setShareModalData({
      isOpen: true,
      poll,
    });
  };

  const closeShareModal = () => {
    setShareModalData(null);
  };

  // --------------------------------------------------
  // FILTER POLLS
  // --------------------------------------------------
  const filteredPolls = polls.filter((poll) => {
    if (filter === 'active') {
      return poll.status === 'active';
    }

    if (filter === 'closed') {
      return poll.status === 'closed';
    }

    return true;
  });

  // --------------------------------------------------
  // CONTEXT
  // --------------------------------------------------
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
        fetchPolls,
        fetchPollById,

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

// --------------------------------------------------
// CUSTOM HOOK
// --------------------------------------------------
export const usePolls = () => {
  const context = useContext(PollContext);

  if (!context) {
    throw new Error(
      'usePolls must be used within a PollProvider'
    );
  }

  return context;
};