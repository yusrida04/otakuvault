import { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const NavIcon = ({ path, label, children }) => (
  <NavLink
    to={path}
    className={({ isActive }) =>
      `flex items-center gap-2 px-3 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
        isActive
          ? 'bg-primary-600/30 text-primary-400 border border-primary-500/30'
          : 'text-gray-400 hover:text-white hover:bg-white/5'
      }`
    }
  >
    {children}
    <span>{label}</span>
  </NavLink>
);

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate          = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef             = useRef(null);

  // Tutup dropdown kalau klik di luar
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [menuOpen]);

  // Tutup dropdown kalau navigasi
  const handleNav = (path) => {
    setMenuOpen(false);
    navigate(path);
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  return (
    <>
      {/* Backdrop gelap kalau dropdown buka di mobile */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/20 md:hidden"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <nav className="sticky top-0 border-b border-white/5 bg-dark-900/80 backdrop-blur-xl" style={{ zIndex: 40 }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group flex-shrink-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white font-display font-bold text-sm group-hover:scale-110 transition-transform">
                OV
              </div>
              <span className="font-display font-bold text-xl text-gradient hidden sm:block">
                OtakuVault
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              <NavIcon path="/" label="Home">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </NavIcon>
              <NavIcon path="/browse" label="Browse">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </NavIcon>
              {user && (
                <NavIcon path="/collection" label="My List">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </NavIcon>
              )}
            </div>

            {/* Right: Auth */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {user ? (
                /* User dropdown — pakai ref untuk click outside */
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setMenuOpen(prev => !prev)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl glass-hover transition-all"
                  >
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-xs font-bold text-white">
                      {user.username?.[0]?.toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-200 hidden sm:block max-w-[100px] truncate">
                      {user.username}
                    </span>
                    <svg
                      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {menuOpen && (
                    <div
                      className="absolute right-0 mt-2 w-52 rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in"
                      style={{
                        zIndex: 9999,
                        backgroundColor: '#1a1b2e',
                        top: '100%',
                      }}
                    >
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-white/5">
                        <p className="text-white font-semibold text-sm truncate">{user.username}</p>
                        <p className="text-gray-500 text-xs truncate">{user.email}</p>
                      </div>

                      {/* Menu items */}
                      <div className="py-1">
                        <button
                          onClick={() => handleNav('/profile')}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-sm text-gray-200 text-left"
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Profile
                        </button>

                        <button
                          onClick={() => handleNav('/collection')}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-sm text-gray-200 text-left md:hidden"
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                          </svg>
                          My List
                        </button>

                        <button
                          onClick={() => handleNav('/browse')}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-colors text-sm text-gray-200 text-left md:hidden"
                        >
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                          </svg>
                          Browse
                        </button>

                        <div className="border-t border-white/5 mt-1 pt-1">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 transition-colors text-sm text-red-400 text-left"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login"    className="btn-secondary text-sm py-2">Login</Link>
                  <Link to="/register" className="btn-primary  text-sm py-2">Register</Link>
                </div>
              )}
            </div>

          </div>
        </div>
      </nav>
    </>
  );
}