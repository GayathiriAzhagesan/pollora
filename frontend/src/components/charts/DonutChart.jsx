import React, { useState } from 'react';

export const DonutChart = ({ items = [], title = 'Option Distribution', totalLabel = 'Total' }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  const total = items.reduce((sum, item) => sum + (item.percentage || item.votes || 0), 0);
  const size = 180;
  const strokeWidth = 26;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedPercent = 0;

  return (
    <div className="donut-chart-container">
      <div className="donut-chart-header">
        <h4 className="chart-title">{title}</h4>
      </div>

      <div className="donut-chart-layout">
        <div className="donut-svg-wrapper">
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut-svg">
            {/* Background ring */}
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="var(--border-subtle)"
              strokeWidth={strokeWidth}
            />

            {/* Slices */}
            {items.map((item, idx) => {
              const pct = total > 0 ? (item.percentage || (item.votes / total) * 100) : 0;
              const strokeDasharray = `${(pct / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((accumulatedPercent / 100) * circumference);
              accumulatedPercent += pct;

              const isHovered = hoveredIdx === idx;

              return (
                <circle
                  key={idx}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={item.color || '#8b5cf6'}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="donut-slice"
                  transform={`rotate(-90 ${size / 2} ${size / 2})`}
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                  style={{
                    transition: 'all 0.25s ease',
                    cursor: 'pointer',
                    opacity: hoveredIdx !== null && !isHovered ? 0.6 : 1,
                  }}
                />
              );
            })}
          </svg>

          {/* Center text */}
          <div className="donut-center-content">
            <span className="donut-center-number">
              {hoveredIdx !== null ? `${items[hoveredIdx]?.percentage || 0}%` : '100%'}
            </span>
            <span className="donut-center-label">
              {hoveredIdx !== null ? items[hoveredIdx]?.text || items[hoveredIdx]?.name : totalLabel}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="donut-legend">
          {items.map((item, idx) => (
            <div
              key={idx}
              className={`donut-legend-item ${hoveredIdx === idx ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <span className="legend-bullet" style={{ background: item.color }} />
              <span className="legend-name">{item.text || item.name}</span>
              <span className="legend-value">{item.percentage || 0}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
