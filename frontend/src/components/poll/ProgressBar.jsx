import React from 'react';

export const ProgressBar = ({
  label,
  percentage = 0,
  votes = 0,
  isLeader = false,
  color = '#8b5cf6',
  animated = true,
}) => {
  return (
    <div className={`result-bar-item ${isLeader ? 'is-leader' : ''}`}>
      <div className="result-bar-header">
        <div className="result-bar-label-group">
          <span className="result-bar-label">{label}</span>
          {isLeader && <span className="leader-pill">Leader</span>}
        </div>
        <div className="result-bar-stats">
          <span className="result-bar-percentage">{percentage}%</span>
          <span className="result-bar-votes">({votes} {votes === 1 ? 'vote' : 'votes'})</span>
        </div>
      </div>
      <div className="progress-track">
        <div
          className={`progress-fill ${animated ? 'progress-animated' : ''}`}
          style={{
            width: `${Math.min(Math.max(percentage, 0), 100)}%`,
            background: isLeader
              ? `linear-gradient(90deg, ${color} 0%, #a855f7 100%)`
              : color,
          }}
        />
      </div>
    </div>
  );
};
