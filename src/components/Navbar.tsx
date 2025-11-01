import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AuthModal } from './AuthModal';
import { Ticket, MessageSquare, User, LogOut, Menu, X } from 'lucide-react';

// prettier + cleaner + no framer-motion
// Dark neon glass aesthetic

export const Navbar = ({ currentPage, onNavigate }) => {
  const { user, profile, signOut } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const gradient = 'from-red-600 via-fuchsia-600 to-purple-600';

  const navBtn = (page, label, Icon) => (
    <button
      onClick={() => {
        onNavigate(page);
        setMobileOpen(false);
      }}
      className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all
      ${currentPage === page
        ? `text-white bg-gradient-to-r ${gradient} shadow-md shadow-red-900/40`
        : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
    >
      <span className="inline-flex items-center gap-2">
        {Icon && <Icon size={18} />}
        {label}
      </span>
    </button>
  );

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 py-3 backdrop-blur-xl border-b border-white/10 bg-black/40 shadow-[0_8px_30px_rgba(0,0,0,0.45)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Brand */}
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center gap-3 group"
          >
            <div className={`h-10 w-10 grid place-items-center rounded-xl bg-gradient-to-br ${gradient} shadow-lg shadow-red-900/40`}>
              <Ticket className="text-white" size={18} />
            </div>
            <div className="text-left leading-tight">
              <h1 className={`text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r ${gradient}`}>
                NeoTix
              </h1>
              <span className="text-[10px] text-gray-400 tracking-wider uppercase">Events • Tickets • Chats</span>
            </div>
          </button>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-3">
            {user && (
              <>
                {navBtn('home', 'Events')}
                {navBtn('tickets', 'My Tickets', Ticket)}
                {navBtn('chat', 'Chats', MessageSquare)}
              </>
            )}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-white/5 border border-white/10">
                  <div className={`h-8 w-8 grid place-items-center rounded-full bg-gradient-to-br ${gradient}`}>
                    <User size={14} className="text-white" />
                  </div>
                  <span className="text-sm text-white/90 max-w-[160px] truncate">{profile?.full_name}</span>
                </div>

                <button
                  onClick={signOut}
                  className="text-gray-300 hover:text-white hover:bg-white/5 px-3 py-2 rounded-xl transition"
                >
                  <LogOut size={18} />
                </button>
              </>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className={`px-5 py-2 rounded-xl font-semibold text-white bg-gradient-to-r ${gradient} shadow-lg shadow-red-900/40 hover:opacity-90 transition`}
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg bg-white/10 text-gray-200 hover:text-white"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden px-4 pt-3 pb-4 border-t border-white/10 bg-black/60 backdrop-blur-xl">
            {user ? (
              <div className="flex flex-col gap-2">
                {navBtn('home', 'Events')}
                {navBtn('tickets', 'My Tickets', Ticket)}
                {navBtn('chat', 'Chats', MessageSquare)}

                <div className="flex items-center justify-between mt-3 p-2 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2">
                    <div className={`h-8 w-8 grid place-items-center rounded-full bg-gradient-to-br ${gradient}`}>
                      <User size={14} className="text-white" />
                    </div>
                    <span className="text-sm text-white/90">{profile?.full_name}</span>
                  </div>
                  <button onClick={signOut} className="text-sm text-gray-300 hover:text-white py-1 px-2 rounded-lg hover:bg-white/5">
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className={`w-full mt-2 p-2 rounded-xl bg-gradient-to-r ${gradient} text-white font-semibold shadow-lg shadow-red-900/40`}
              >
                Sign In
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Auto spacing under navbar */}
      <div className="h-20" />

      {showAuthModal && <AuthModal onClose={() => setShowAuthModal(false)} />}
    </>
  );
};