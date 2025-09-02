import type { Component } from 'solid-js';
import { useNavigate, useLocation } from '@tanstack/solid-router';
import './Navigation.css';

interface NavigationProps {
  className?: string;
}

const Navigation: Component<NavigationProps> = (props) => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    {
      path: '/',
      label: 'Dashboard',
      icon: 'fas fa-chart-line'
    },
    {
      path: '/app/review',
      label: 'Review',
      icon: 'fas fa-layer-group'
    },
    {
      path: '/app/dict',
      label: 'Dictionary',
      icon: 'fas fa-book'
    }
  ];

  const isActive = (path: string) => {
    const currentPath = location().pathname;
    if (path === '/' && currentPath === '/') return true;
    if (path !== '/' && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <nav class={`navigation ${props.className || ''}`}>
      <div class="navigation-container">
        <div class="navigation-content">
          <div class="navigation-brand">
            <i class="navigation-brand-icon fas fa-brain"></i>
            <h1 class="navigation-brand-title">FlashTOCFL</h1>
          </div>

          <div class="navigation-menu">
            {navItems.map((item) => (
              <button
                onClick={() => navigate({ to: item.path })}
                class={`nav-item ${isActive(item.path) ? 'active' : ''}`}
              >
                <i class={`${item.icon}`}></i>
                {item.label}
              </button>
            ))}
          </div>

          <div class="navigation-user">
            <div class="streak-display">
              <i class="streak-icon fas fa-fire"></i>
              <span>7 day streak</span>
            </div>
            <div class="user-avatar">U</div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;