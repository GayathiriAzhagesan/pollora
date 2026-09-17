import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { TimeSeriesChart } from '../components/charts/TimeSeriesChart';
import { DonutChart } from '../components/charts/DonutChart';
import { usePolls } from '../context/PollContext';
import { useToast } from '../context/ToastContext';
import { ANALYTICS_DATA } from '../services/mockData';
import {
  BarChartIcon,
  TrendingUpIcon,
  UsersIcon,
  ClockIcon,
  CheckCircleIcon,
  RadioIcon,
  ExternalLinkIcon,
} from '../assets/icons';

export const AnalyticsPage = ({ onNavigate }) => {
  const { activePoll, polls, setActivePollId } = usePolls();
  const { showToast } = useToast();
  const [dateRange, setDateRange] = useState('24h');

  const poll = activePoll || polls[0];
  const leaderOption = [...(poll.options || [])].sort((a, b) => b.votes - a.votes)[0];

  const handleExport = () => {
    showToast('Analytics summary exported as CSV successfully!', 'success');
  };

  return (
    <div className="analytics-page animate-fade-in">
      {/* Analytics Page Top Header */}
      <div className="analytics-header-row">
        <div>
          <div className="analytics-badge-row">
            <span className="analytics-badge">
              <TrendingUpIcon size={14} className="inline-icon" /> PERFORMANCE INTELLIGENCE
            </span>
          </div>
          <h1 className="analytics-title">Poll Analytics</h1>
          <p className="analytics-subtitle">
            Track voter engagement trends, peak participation hours, and distribution patterns.
          </p>
        </div>

        {/* Controls: Poll Picker & Export */}
        <div className="analytics-controls-row">
          <select
            value={poll.id}
            onChange={(e) => setActivePollId(e.target.value)}
            className="analytics-poll-select select-dropdown"
          >
            {polls.map((p) => (
              <option key={p.id} value={p.id}>
                {p.question.length > 35 ? `${p.question.substring(0, 35)}...` : p.question}
              </option>
            ))}
          </select>

          <Button
            variant="secondary"
            size="md"
            onClick={handleExport}
          >
            Export CSV
          </Button>
        </div>
      </div>

      {/* 4 Analytics KPI Cards */}
      <div className="analytics-kpi-grid">
        {/* Card 1: Total Votes */}
        <Card className="kpi-card glass-panel" hover>
          <div className="kpi-header">
            <span className="kpi-label">Total Votes</span>
            <div className="kpi-icon-wrap stat-purple">
              <UsersIcon size={18} />
            </div>
          </div>
          <div className="kpi-value">{poll.totalVotes.toLocaleString()}</div>
          <div className="kpi-footer">
            <span className="kpi-trend positive">
              <TrendingUpIcon size={12} /> +14.2%
            </span>
            <span className="kpi-sub">vs previous session</span>
          </div>
        </Card>

        {/* Card 2: Participation Rate */}
        <Card className="kpi-card glass-panel" hover>
          <div className="kpi-header">
            <span className="kpi-label">Participation Rate</span>
            <div className="kpi-icon-wrap stat-green">
              <CheckCircleIcon size={18} />
            </div>
          </div>
          <div className="kpi-value">94.8%</div>
          <div className="kpi-footer">
            <span className="kpi-sub">Views to votes conversion</span>
          </div>
        </Card>

        {/* Card 3: Most Selected Option */}
        <Card className="kpi-card glass-panel" hover>
          <div className="kpi-header">
            <span className="kpi-label">Top Choice</span>
            <div className="kpi-icon-wrap stat-blue">
              <BarChartIcon size={18} />
            </div>
          </div>
          <div className="kpi-value kpi-value-text">{leaderOption?.text || 'None'}</div>
          <div className="kpi-footer">
            <span className="kpi-trend positive">{leaderOption?.percentage || 0}% share</span>
            <span className="kpi-sub">({leaderOption?.votes || 0} votes)</span>
          </div>
        </Card>

        {/* Card 4: Poll Status */}
        <Card className="kpi-card glass-panel" hover>
          <div className="kpi-header">
            <span className="kpi-label">Poll Status</span>
            <div className="kpi-icon-wrap stat-amber">
              <RadioIcon size={18} />
            </div>
          </div>
          <div className="kpi-badge-wrap">
            <Badge variant={poll.status === 'active' ? 'live' : 'closed'}>
              {poll.status === 'active' ? 'ACTIVE & LIVE' : 'CLOSED'}
            </Badge>
          </div>
          <div className="kpi-footer">
            <span className="kpi-sub">Created {poll.createdAt || poll.createdDate}</span>
          </div>
        </Card>
      </div>

      {/* Visual Charts Grid */}
      <div className="analytics-charts-grid">
        {/* Votes Over Time Chart */}
        <Card className="chart-card glass-panel" glow>
          <TimeSeriesChart data={ANALYTICS_DATA.votesOverTime} height={240} />
        </Card>

        {/* Option Distribution Donut Chart */}
        <Card className="chart-card glass-panel" glow>
          <DonutChart
            items={poll.options}
            title="Option Distribution"
            totalLabel="All Options"
          />
        </Card>
      </div>

      {/* Bottom Insights Row */}
      <div className="analytics-insights-grid">
        <Card className="insights-card glass-panel">
          <h4 className="insights-card-title">Top Traffic Channels</h4>
          <div className="traffic-sources-list">
            {ANALYTICS_DATA.sources.map((src, i) => (
              <div key={i} className="traffic-source-item">
                <div className="source-info">
                  <span className="source-name">{src.channel}</span>
                  <span className="source-pct">{src.percentage}%</span>
                </div>
                <div className="source-track">
                  <div className="source-fill" style={{ width: `${src.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="insights-card glass-panel">
          <h4 className="insights-card-title">Device Breakdown</h4>
          <div className="device-distribution-list">
            {ANALYTICS_DATA.devices.map((device, i) => (
              <div key={i} className="device-item">
                <div className="device-bullet" style={{ background: device.color }} />
                <div className="device-info">
                  <span className="device-name">{device.name}</span>
                  <span className="device-count">{device.count.toLocaleString()} responses</span>
                </div>
                <span className="device-pct">{device.percentage}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
