import type { Question } from '../types';
import { motion } from 'framer-motion';
import { Clock, CheckCircle2, Trash2, Edit2 } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
  index: number;
  onEdit?: (question: Question) => void;
  onDelete?: (questionId: string) => void;
  isSelected?: boolean;
  onSelect?: (questionId: string, selected: boolean) => void;
}

export const QuestionCard = ({
  question,
  index,
  onEdit,
  onDelete,
  isSelected,
  onSelect
}: QuestionCardProps) => {
  const qId = question._id || question.id;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-xl shadow-sm border-2 transition-all ${isSelected ? 'border-indigo-500 shadow-md' : 'border-gray-100 hover:border-gray-200'
        } p-5 relative group`}
    >
      <div className="flex gap-4">
        {onSelect && (
          <div className="pt-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(qId as string, e.target.checked)}
              className="w-5 h-5 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500 cursor-pointer"
            />
          </div>
        )}

        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-md text-sm">
                Q{index + 1}
              </span>
              {question.question}
            </h4>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button
                  onClick={() => onEdit(question)}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                >
                  <Edit2 size={18} />
                </button>
              )}
              {onDelete && qId && (
                <button
                  onClick={() => onDelete(qId)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {question.options.map((opt, i) => (
              <div
                key={i}
                className={`p-3 rounded-lg border-2 flex items-center gap-3 ${i === question.correctOption
                  ? 'bg-green-50 border-green-200 text-green-800 font-medium'
                  : 'bg-gray-50 border-transparent text-gray-700'
                  }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${i === question.correctOption ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span>{typeof opt === "string" ? opt : opt.text}</span>
                {i === question.correctOption && (
                  <CheckCircle2 size={18} className="text-green-500 ml-auto" />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500 font-medium pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-yellow-100 flex items-center justify-center border border-yellow-300 text-yellow-600 text-[10px] font-bold">P</div>
              10 points
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
