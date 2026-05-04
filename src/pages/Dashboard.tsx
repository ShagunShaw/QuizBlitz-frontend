import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { QuizCard } from '../components/QuizCard';
import type { Quiz } from '../types';

export default function Dashboard() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await api.get('/quiz/');
        console.log("API:", response.data);

        setQuizzes(Array.isArray(response.data.data) ? response.data.data : []);
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Your Quizzes</h1>
          <p className="text-gray-400 mt-1">Manage and create new interactive experiences.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {quizzes.map((quiz) => (
          <QuizCard key={quiz._id} quiz={quiz} />
        ))}
        
        <motion.div
          whileHover={{ y: -5 }}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Link
            to="/quiz/create"
            className="bg-gray-700 border-2 border-dashed border-indigo-800 rounded-2xl h-full min-h-[320px] flex flex-col items-center justify-center text-indigo-400 hover:bg-indigo-100 hover:border-indigo-300 transition-all group"
          >
            <div className="bg-gray-700 p-4 rounded-full shadow-sm mb-4 group-hover:scale-110 transition-transform">
              <Plus size={32} />
            </div>
            <span className="font-bold text-lg">Create New Quiz</span>
          </Link>
        </motion.div>
      </div>

      {quizzes.length === 0 && !loading && (
        <div className="text-center mt-20">
          <div className="bg-gray-800 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">📭</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No quizzes yet</h3>
          <p className="text-gray-400 max-w-sm mx-auto">
            You haven't created any quizzes. Click the create button to get started!
          </p>
        </div>
      )}
    </div>
  );
}
