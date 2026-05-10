import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      const origin = window.location.origin;
      setTimeout(() => {
        window.location.href = `${import.meta.env.VITE_API_URL}/accept/${token}?origin=${encodeURIComponent(origin)}`
      }, 5000)
    } else {
      navigate('/dashboard');
    }
  }, [token, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Loader2 className="w-12 h-12 text-indigo-400 animate-spin mb-4" />
      <h2 className="text-2xl font-bold text-white">Setting up your account...</h2>
      <p className="text-gray-400 mt-2">Please wait while we process your invitation.</p>
    </div>
  );
}
