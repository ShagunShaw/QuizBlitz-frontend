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
      className={`bg-gray-900 rounded-xl shadow-sm border-2 transition-all ${isSelected ? 'border-indigo-500 shadow-md' : 'border-gray-800 hover:border-gray-600'
        } p-5 relative group`}
    >
      <div className="flex gap-4">
        {onSelect && (
          <div className="pt-1">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect(qId as string, e.target.checked)}
              className="w-5 h-5 text-indigo-400 rounded border-gray-600 focus:ring-indigo-500 cursor-pointer"
            />
          </div>
        )}

        <div className="flex-1">
          <div className="flex items-start gap-4">

            {/* Left Side */}
            <div className="flex-1 min-w-0">
              <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span className="bg-gray-800 text-gray-300 px-2.5 py-1 rounded-md text-sm shrink-0">
                  Q{index + 1}
                </span>

                <span className="break-words">
                  {question.question}
                </span>
              </h4>
            </div>

            {/* Fixed Timer */}
            <div className="shrink-0 px-3 py-1 bg-orange-900/30 text-orange-300 rounded-md text-sm font-semibold whitespace-nowrap">
              ⏱ {question.time}s
            </div>

            {/* Fixed Buttons */}
            <div className="shrink-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {onEdit && (
                <button
                  onClick={() => onEdit(question)}
                  className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-900/50 rounded-md transition-colors"
                >
                  <Edit2 size={18} />
                </button>
              )}

              {onDelete && qId && (
                <button
                  onClick={() => onDelete(qId)}
                  className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/50 rounded-md transition-colors"
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
                  ? 'bg-green-900/30 border-green-800 text-green-300 font-medium'
                  : 'bg-gray-950 border-transparent text-gray-200'
                  }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${i === question.correctOption ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300'
                  }`}>
                  {String.fromCharCode(65 + i)}
                </div>
                <span>{typeof opt === "string" ? opt : opt.text}</span>
                {i === question.correctOption && (
                  <CheckCircle2 size={18} className="text-green-400 ml-auto" />
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-400 font-medium pt-3 border-t border-gray-800">
            <div className="flex items-center gap-1.5">
              {/* <div className="w-4 h-4 rounded-full bg-yellow-100 flex items-center justify-center border border-yellow-300 text-yellow-600 text-[10px] font-bold">P</div>
              10 points */}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
