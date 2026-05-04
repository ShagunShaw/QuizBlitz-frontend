import { motion } from 'framer-motion';
import { useAuthStore } from '../store/useAuthStore';
import { Navigate } from 'react-router-dom';

export default function Landing() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/auth/google/`;
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col justify-center items-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-gray-900 rounded-3xl shadow-xl p-8 text-center"
      >
        <div className="mb-8">
          <div className="bg-indigo-600 text-white w-20 h-20 rounded-2xl mx-auto flex items-center justify-center font-bold text-4xl shadow-lg mb-6 transform -rotate-6">
            QB
          </div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
            Quiz<span className="text-indigo-400">Blitz</span>
          </h1>
          <p className="text-gray-400 font-medium">Create, play, and share interactive quizzes</p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full cursor-pointer bg-gray-900 border-2 border-gray-700 text-gray-200 font-bold text-lg py-4 px-6 rounded-xl flex items-center justify-center gap-3 hover:bg-gray-800 hover:border-gray-500 transition-all shadow-sm group"
        >
          <img
            src="https://www.svgrepo.com/show/475656/google-color.svg"
            className="w-6 h-6 group-hover:scale-110 transition-transform"
            alt="Google Logo"
          />
          Sign in with Google
        </button>
      </motion.div>

      {/* Decorative background blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob pointer-events-none" />
      <div className="fixed top-[-10%] right-[-10%] w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000 pointer-events-none" />
      <div className="fixed bottom-[-20%] left-[20%] w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000 pointer-events-none" />
    </div>
  );
}
