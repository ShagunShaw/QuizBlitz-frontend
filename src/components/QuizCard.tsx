import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Quiz } from '../types';
import { Calendar, Hash, HelpCircle, Infinity, Clock } from 'lucide-react';

interface QuizCardProps {
  quiz: Quiz;
}

export const QuizCard = ({ quiz }: QuizCardProps) => {
  const questionCount = quiz.QuestionsCount || 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@400;500;600;700&display=swap');

        .qb-card {
          font-family: 'Outfit', sans-serif;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.07);
          border-radius: 20px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 100%;
          position: relative;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          cursor: default;
        }
        .qb-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 0% 0%, rgba(99,102,241,0.07) 0%, transparent 60%);
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          border-radius: 20px;
        }
        .qb-card:hover {
          border-color: rgba(99, 102, 241, 0.35);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(99,102,241,0.1);
        }
        .qb-card:hover::before { opacity: 1; }

        /* ── Header band ── */
        .qb-card-header {
          position: relative;
          padding: 24px 24px 20px;
          background: linear-gradient(135deg, rgba(99,102,241,0.18) 0%, rgba(168,85,247,0.12) 100%);
          border-bottom: 1px solid rgba(255,255,255,0.05);
          overflow: hidden;
        }
        .qb-card-header::after {
          content: '';
          position: absolute;
          top: -30px; right: -30px;
          width: 120px; height: 120px;
          border-radius: 50%;
          background: rgba(99,102,241,0.12);
          pointer-events: none;
        }

        .qb-room-code {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.12);
          backdrop-filter: blur(8px);
          color: #c7d2fe;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 100px;
          margin-bottom: 12px;
        }

        .qb-card-title {
          font-family: 'Syne', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #fff;
          line-height: 1.25;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          margin: 0;
        }

        /* ── Body ── */
        .qb-card-body {
          padding: 20px 24px;
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .qb-card-desc {
          font-size: 13.5px;
          color: #4b5563;
          line-height: 1.65;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .qb-card-meta {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .qb-meta-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12.5px;
          color: #6b7280;
          font-weight: 500;
        }
        .qb-meta-row svg {
          color: #6366f1;
          flex-shrink: 0;
        }

        /* ── Footer ── */
        .qb-card-footer {
          padding: 14px 24px;
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .qb-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 100px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .qb-badge-permanent {
          background: rgba(34,197,94,0.1);
          border: 1px solid rgba(34,197,94,0.25);
          color: #86efac;
        }
        .qb-badge-scheduled {
          background: rgba(251,146,60,0.1);
          border: 1px solid rgba(251,146,60,0.2);
          color: #fdba74;
        }

        .qb-manage-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 600;
          padding: 8px 18px;
          border-radius: 100px;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 4px 16px rgba(99,102,241,0.25);
          white-space: nowrap;
        }
        .qb-manage-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 24px rgba(99,102,241,0.4);
        }

        /* Questions pill inside header */
        .qb-q-count {
          position: absolute;
          bottom: 20px;
          right: 20px;
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 12px;
          font-weight: 600;
          color: #a5b4fc;
          background: rgba(99,102,241,0.15);
          border: 1px solid rgba(99,102,241,0.25);
          padding: 4px 10px;
          border-radius: 100px;
        }
      `}</style>

      <motion.div
        whileHover={{ y: -6 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="qb-card"
      >
        {/* Header */}
        <div className="qb-card-header">
          <div className="qb-room-code">
            <Hash size={10} />
            {quiz.roomCode}
          </div>
          <h3 className="qb-card-title">{quiz.Title}</h3>
          <div className="qb-q-count">
            <HelpCircle size={11} />
            {questionCount} Q
          </div>
        </div>

        {/* Body */}
        <div className="qb-card-body">
          <p className="qb-card-desc">
            {quiz.Description || 'No description provided.'}
          </p>

          <div className="qb-card-meta">
            <div className="qb-meta-row">
              <Calendar size={13} />
              {new Date(quiz.startTime).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </div>
            <div className="qb-meta-row">
              <HelpCircle size={13} />
              {questionCount} question{questionCount !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="qb-card-footer">
          <span className={`qb-badge ${quiz.isPermanent ? 'qb-badge-permanent' : 'qb-badge-scheduled'}`}>
            {quiz.isPermanent ? (
              <><Infinity size={10} /> Permanent</>
            ) : (
              <><Clock size={10} /> Scheduled</>
            )}
          </span>

          <Link to={`/quiz/${quiz._id}`} className="qb-manage-btn">
            Manage →
          </Link>
        </div>
      </motion.div>
    </>
  );
};