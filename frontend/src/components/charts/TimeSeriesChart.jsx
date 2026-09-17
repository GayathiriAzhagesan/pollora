import React, { useState } from 'react';

export const TimeSeriesChart = ({ data = [], height = 220 }) => {
  const [hoveredPoint, setHoveredPoint] = useState(null);

  if (!data || data.length === 0) return null;

  const width = 600;
  const paddingX = 40;
  const paddingY = 30;

  const maxVotes = Math.max(...data.map((d) => d.votes), 10);
  const minVotes = 0;

  // Coordinate mapping
  const points = data.map((d, index) => {
    const x = paddingX + (index / (data.length - 1)) * (width - paddingX * 2);
    const y = height - paddingY - ((d.votes - minVotes) / (maxVotes - minVotes)) * (height - paddingY * 2);
    return { ...d, x, y };
  });

  // Construct SVG bezier path
  const linePath = points.reduce((acc, point, i, arr) => {
    if (i === 0) return `M ${point.x},${point.y}`;
    const prev = arr[i - 1];
    const cx = (prev.x + point.x) / 2;
    return `${acc} C ${cx},${prev.y} ${cx},${point.y} ${point.x},${point.y}`;
  }, '');

  // Area closed path for gradient fill
  const areaPath = `${linePath} L ${points[points.length - 1].x},${height - paddingY} L ${points[0].x},${height - paddingY} Z`;

  return (
    <div className="chart-container">
      <div className="chart-header-row">
        <div>
          <h4 className="chart-title">Votes Over Time</h4>
          <p className="chart-subtitle">Realtime hourly response velocity</p>
        </div>
        <span className="chart-badge">Past 24 Hours</span>
      </div>

      <div className="svg-chart-wrapper">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="time-series-svg"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="strokeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#3b82f6" />
            </linearGradient>
          </defs>

          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = height - paddingY - ratio * (height - paddingY * 2);
            return (
              <line
                key={ratio}
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="var(--border-subtle)"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
            );
          })}

          {/* Gradient Filled Area */}
          <path d={areaPath} fill="url(#areaGradient)" />

          {/* Smooth Line Curve */}
          <path
            d={linePath}
            fill="none"
            stroke="url(#strokeGradient)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Interactive Data Points */}
          {points.map((p, idx) => (
            <g key={idx} className="chart-point-group">
              <circle
                cx={p.x}
                cy={p.y}
                r="4"
                fill="#ffffff"
                stroke="#8b5cf6"
                strokeWidth="2.5"
                className="chart-dot"
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
              <circle
                cx={p.x}
                cy={p.y}
                r="16"
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHoveredPoint(p)}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="chart-tooltip animate-fade-in"
            style={{
              left: `${(hoveredPoint.x / width) * 100}%`,
              top: `${(hoveredPoint.y / height) * 100}%`,
            }}
          >
            <span className="tooltip-time">{hoveredPoint.label}</span>
            <span className="tooltip-votes">
              <strong>{hoveredPoint.votes}</strong> votes
            </span>
          </div>
        )}
      </div>

      {/* X-Axis Labels */}
      <div className="chart-xaxis">
        {points.filter((_, i) => i % 2 === 0).map((p, idx) => (
          <span key={idx} className="xaxis-label">
            {p.label}
          </span>
        ))}
      </div>
    </div>
  );
};
