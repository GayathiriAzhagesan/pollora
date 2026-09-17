import React from 'react';
import {
  BarChartIcon,
  TrendingUpIcon,
  PlusIcon,
  UserIcon,
  SettingsIcon,
  LogOutIcon,
  RadioIcon,
  ClockIcon,
} from '../../assets/icons';

export const Sidebar = ({ currentView, onNavigate, onFilterChange, currentFilter }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChartIcon, action: () => onNavigate('dashboard') },
    { id: 'my-polls', label: 'My Polls', icon: ClockIcon, action: () => { onNavigate('dashboard'); if (onFilterChange) onFilterChange('all'); } },
    { id: 'create-poll', label: 'Create Poll', icon: PlusIcon, action: () => onNavigate('create-poll') },
    { id: 'analytics', label: 'Analytics', icon: TrendingUpIcon, action: () => onNavigate('analytics') },
  ];

  const bottomItems = [
    { id: 'profile', label: 'Profile', icon: UserIcon, action: () => onNavigate('dashboard') },
    { id: 'settings', label: 'Settings', icon: SettingsIcon, action: () => onNavigate('dashboard') },
    { id: 'logout', label: 'Logout', icon: LogOutIcon, action: () => onNavigate('login'), danger: true },
  ];

  return (
    <aside className="app-sidebar glass-panel">
      {/* Sidebar Header */}
      <div className="sidebar-brand" onClick={() => onNavigate('landing')} role="button" tabIndex={0}>
        <div className="brand-icon-wrapper">
          <RadioIcon size={20} className="brand-icon" />
        </div>
        <div className="sidebar-brand-text">
          <span className="brand-name">
            Live<span className="brand-gradient">Poll</span>
          </span>
          <span className="sidebar-brand-sub">Workspace</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="sidebar-section">
        <span className="sidebar-section-title">MAIN MENU</span>
        <ul className="sidebar-menu">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id || (item.id === 'my-polls' && currentView === 'dashboard');
            return (
              <li key={item.id}>
                <button
                  onClick={item.action}
                  className={`sidebar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} className="sidebar-link-icon" />
                  <span className="sidebar-link-text">{item.label}</span>
                  {item.id === 'create-poll' && (
                    <span className="sidebar-pill">NEW</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Account / Preferences */}
      <div className="sidebar-section sidebar-bottom">
        <span className="sidebar-section-title">PREFERENCES</span>
        <ul className="sidebar-menu">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id}>
                <button
                  onClick={item.action}
                  className={`sidebar-link ${item.danger ? 'sidebar-link-danger' : ''}`}
                >
                  <Icon size={18} className="sidebar-link-icon" />
                  <span className="sidebar-link-text">{item.label}</span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* User Card */}
        <div className="sidebar-user-card">
          <div className="sidebar-avatar">
            <span>JD</span>
            <span className="avatar-status-dot" />
          </div>
          <div className="sidebar-user-info">
            <span className="user-name">John Doe</span>
            <span className="user-role">john@example.com</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
