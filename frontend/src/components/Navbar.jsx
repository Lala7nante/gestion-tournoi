import { NavLink } from 'react-router-dom';
import {
  MdDashboard,
  MdEmojiEvents,
  MdGroup,
  MdSportsSoccer,
  MdLeaderboard,
  MdBarChart,
} from 'react-icons/md';

const navItems = [
  { to: '/',             icon: <MdDashboard />,   label: 'DASHBOARD' },
  { to: '/tournois',     icon: <MdEmojiEvents />, label: 'TOURNOIS' },
  { to: '/equipes',      icon: <MdGroup />,        label: 'ÉQUIPES' },
  { to: '/matchs',       icon: <MdSportsSoccer />, label: 'MATCHS' },
  { to: '/classement',   icon: <MdLeaderboard />, label: 'CLASSEMENT' },
  { to: '/statistiques', icon: <MdBarChart />,    label: 'STATISTIQUES' },
];

function SidebarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <rect x="1" y="1" width="16" height="16" rx="3" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="6" y1="1.75" x2="6" y2="16.25" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  );
}

export default function Navbar({ isOpen, onToggle }) {
  return (
    <div
      className="fixed top-0 left-0 h-screen z-50 flex flex-col justify-between border-r border-[#1e2130] overflow-hidden"
      style={{
        backgroundColor: '#080810',
        width: isOpen ? '240px' : '0px',
        transition: 'width 0.25s ease',
        minWidth: 0,
      }}
    >
      <div style={{ width: '240px' }}>
        {/* Logo + bouton fermer */}
        <div className="flex items-center justify-between mb-10 px-4 pt-6">
          <div className="flex items-center gap-2">
            <MdEmojiEvents className="text-3xl flex-shrink-0" style={{ color: '#00d4ff' }} />
            <div>
              <p
                className="font-bold text-lg leading-none"
                style={{
                  backgroundImage: 'linear-gradient(to right, #00d4ff, #a855f7)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                TOURNOI
              </p>
              <p className="text-gray-400 text-xs">Gestion de tournoi</p>
            </div>
          </div>

          <button
            onClick={onToggle}
            title="Fermer la barre latérale"
            className="text-gray-500 hover:text-gray-200 hover:bg-white/10 rounded-md p-1 transition-all duration-150 flex-shrink-0"
          >
            <SidebarIcon />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col gap-1 px-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 whitespace-nowrap
                ${isActive
                  ? 'bg-[#00d4ff]/10 border-l-2 border-[#00d4ff]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                }`
              }
              style={({ isActive }) => ({ color: isActive ? '#00d4ff' : undefined })}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <p className="text-gray-600 text-xs px-6 pb-6 whitespace-nowrap" style={{ width: '240px' }}>
        Gestion Tournoi de Football v1.0
      </p>
    </div>
  );
}