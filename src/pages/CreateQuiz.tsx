import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import toast from 'react-hot-toast';

export default function CreateQuiz() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    isPermanent: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Ensure startTime is an ISO string if provided
      const payload = {
        ...formData,
        startTime: formData.startTime ? new Date(formData.startTime).toISOString() : new Date().toISOString(),
      };

      await api.post('/quiz/', payload);
      toast.success('Quiz created successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error creating quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <Link to="/dashboard" className="text-indigo-400 hover:text-indigo-800 flex items-center gap-2 font-medium w-fit">
          <ArrowLeft size={20} /> Back to Dashboard
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gray-900 rounded-2xl shadow-sm border border-gray-800 overflow-hidden"
      >
        <div className="bg-indigo-600 p-6 sm:p-8 text-white">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Create New Quiz</h1>
          <p className="text-indigo-100">Set up the details for your new interactive session.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-200 mb-2">Quiz Title *</label>
            <input
              required
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-gray-950 focus:bg-white"
              placeholder="e.g. JavaScript Fundamentals"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-200 mb-2">
              Description <span className="text-gray-400 font-normal">(Max 150 chars)</span>
            </label>
            <textarea
              maxLength={150}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow bg-gray-950 focus:bg-white resize-none h-24"
              placeholder="Brief description of what the quiz covers..."
            />
            <div className="text-right text-xs text-gray-400 mt-1 font-medium">
              {formData.description.length}/150
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-200 mb-2">Start Time</label>
              <div className="relative">
                <input
                  type="datetime-local"
                  required={!formData.isPermanent}
                  disabled={formData.isPermanent}
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className={`w-full px-4 py-3 rounded-xl border border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow ${formData.isPermanent ? 'bg-gray-800 text-gray-400 cursor-not-allowed' : 'bg-gray-950 focus:bg-white'}`}
                />
                {!formData.isPermanent && !formData.startTime && (
                  <CalendarIcon className="absolute right-4 top-3.5 text-gray-400 pointer-events-none" size={20} />
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-200 mb-2">Permanent Quiz</label>
              <div className="flex items-center h-[50px]">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formData.isPermanent}
                    onChange={(e) => {
                      setFormData({ 
                        ...formData, 
                        isPermanent: e.target.checked,
                        startTime: e.target.checked ? '' : formData.startTime 
                      });
                    }}
                  />
                  <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-indigo-600"></div>
                  <span className="ml-3 text-sm font-medium text-gray-200">
                    {formData.isPermanent ? 'Yes (Always open)' : 'No (Scheduled)'}
                  </span>
                </label>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-800">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white font-bold text-lg py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? <Loader2 className="animate-spin" size={24} /> : 'Create Quiz'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
