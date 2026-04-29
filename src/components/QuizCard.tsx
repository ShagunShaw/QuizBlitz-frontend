import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Quiz } from '../types';
import { Calendar, Users, Hash, Settings, MoreVertical } from 'lucide-react';

interface QuizCardProps {
  quiz: Quiz;
}

export const QuizCard = ({ quiz }: QuizCardProps) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full relative group"
    >
      <div className="h-32 bg-gradient-to-br from-indigo-500 to-purple-600 p-6 relative">
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-white text-xs font-bold border border-white/30 flex items-center gap-1">
          <Hash size={12} />
          {quiz.roomCode}
        </div>
        <h3 className="text-xl font-bold text-white line-clamp-2 mt-2">
          {quiz.Title}
        </h3>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <p className="text-gray-600 text-sm flex-1 mb-4 line-clamp-3">
          {quiz.Description || "No description provided."}
        </p>

        <div className="flex flex-col gap-2 text-sm text-gray-500 font-medium">
          <div className="flex items-center gap-2">
            <Calendar size={16} className="text-indigo-400" />
            {new Date(quiz.startTime).toLocaleString()}
          </div>
          <div className="flex items-center gap-2">
            <Settings size={16} className="text-indigo-400" />
            {quiz.QuestionsCount || 0} Questions • {quiz.QuestionsCount * 10 || 0} Points
          </div>
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${quiz.isPermanent ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
              {quiz.isPermanent ? 'Permanent' : 'Scheduled'}
            </span>
          </div>
          <Link
            to={`/quiz/${quiz._id}`}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-bold rounded-lg hover:bg-gray-800 transition-colors"
          >
            Manage
          </Link>
        </div>
      </div>
    </motion.div>
  );
};
