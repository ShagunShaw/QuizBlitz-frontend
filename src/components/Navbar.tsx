import { LogOut } from 'lucide-react';
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
    <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="bg-indigo-600 text-white p-2 rounded-lg font-bold text-xl transform group-hover:scale-105 transition-transform">
              QB
            </div>
            <span className="font-extrabold text-2xl text-gray-900 tracking-tight">
              Quiz<span className="text-indigo-600">Blitz</span>
            </span>
          </Link>

          {user && (

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                <img
                  src={`https://api.dicebear.com/9.x/fun-emoji/svg?seed=${user.name || user.email}`}
                  alt="avatar"
                  className="w-8 h-8 rounded-full bg-white shadow-sm"
                />
                <span className="font-semibold text-gray-700 text-sm hidden sm:block">
                  {user.name || user.email.split('@')[0]}
                </span>
              </div>
              <Link to="/join">
                <button className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold">
                  Join Quiz
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold"
                title="Logout"
              >
                <LogOut size={18} />
                <span >Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};
