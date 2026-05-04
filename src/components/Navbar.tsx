import { LogOut, Zap } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <>
      <style>{`
        .qb-nav {
          background: rgba(8, 11, 20, 0.85);
          backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          position: sticky;
          top: 0;
          z-index: 50;
        }

        .qb-nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 0 24px;
          height: 64px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        /* ── Logo (identical to Landing) ── */
        .qb-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }
        .qb-logo:hover .qb-logo-badge { transform: scale(1.05); }
        .qb-logo-badge {
          background: #4f46e5;
          color: white;
          padding: 8px 10px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 20px;
          line-height: 1;
          transition: transform 0.2s ease;
        }
        .qb-logo-text {
          font-weight: 800;
          font-size: 24px;
          color: white;
          letter-spacing: -0.5px;
          line-height: 1;
        }
        .qb-logo-text .blitz { color: #818cf8; }

        /* ── Right side ── */
        .qb-nav-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        /* Avatar pill */
        .qb-avatar-pill {
          display: flex;
          align-items: center;
          gap: 10px;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 6px 14px 6px 6px;
          border-radius: 100px;
          transition: border-color 0.2s;
        }
        .qb-avatar-pill:hover { border-color: rgba(255, 255, 255, 0.15); }
        .qb-avatar {
          width: 32px; height: 32px;
          border-radius: 50%;
          background: #111827;
          border: 1.5px solid rgba(99, 102, 241, 0.4);
          flex-shrink: 0;
        }
        .qb-username {
          font-size: 13px;
          font-weight: 600;
          color: #d1d5db;
          white-space: nowrap;
        }

        /* Join Quiz button */
        .qb-join-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          padding: 8px 18px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 16px rgba(99, 102, 241, 0.25);
          text-decoration: none;
        }
        .qb-join-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(99, 102, 241, 0.4);
        }

        /* Logout button */
        .qb-logout-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.07);
          color: #6b7280;
          padding: 8px 14px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .qb-logout-btn:hover {
          color: #f87171;
          background: rgba(239, 68, 68, 0.08);
          border-color: rgba(239, 68, 68, 0.2);
        }

        @media (max-width: 480px) {
          .qb-username { display: none; }
          .qb-logout-text { display: none; }
          .qb-nav-inner { padding: 0 16px; }
        }
      `}</style>

      <nav className="qb-nav">
        <div className="qb-nav-inner">

          {/* Logo — identical markup to Landing page */}
          <Link to="/dashboard" className="qb-logo">
            <div className="qb-logo-badge">QB</div>
            <span className="qb-logo-text">
              Quiz<span className="blitz">Blitz</span>
            </span>
          </Link>

          {user && (
            <div className="qb-nav-right">

              {/* Avatar pill */}
              <div className="qb-avatar-pill">
                <img
                  src={`https://api.dicebear.com/9.x/fun-emoji/svg?seed=${user.name || user.email}`}
                  alt="avatar"
                  className="qb-avatar"
                />
                <span className="qb-username">
                  {user.name || user.email.split('@')[0]}
                </span>
              </div>

              {/* Join Quiz */}
              <Link to="/join" className="qb-join-btn">
                <Zap size={14} />
                Join Quiz
              </Link>

              {/* Logout */}
              <button onClick={handleLogout} className="qb-logout-btn" title="Logout">
                <LogOut size={15} />
                <span className="qb-logout-text">Logout</span>
              </button>

            </div>
          )}

        </div>
      </nav>
    </>
  );
};