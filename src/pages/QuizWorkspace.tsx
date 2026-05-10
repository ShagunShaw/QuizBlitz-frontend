import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Quiz, Question } from '../types';
import { QuestionCard } from '../components/QuestionCard';
import { Modal } from '../components/Modal';
import {
  Loader2, Edit3, Trash2, ArrowLeft, Users, PlusCircle,
  Play, Hash, Infinity, Clock, HelpCircle, Zap, Share2,
  LogOut, Copy, Check
} from 'lucide-react';
import toast from 'react-hot-toast';
import { socket, connectSocket } from '../services/socket';
import { motion } from 'framer-motion';

export default function QuizWorkspace() {
  const emptyQuestion = {
    question: '',
    options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
    correctOption: 0,
    time: 30,
  };

  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [isRunning, setIsRunning] = useState(false);

  //  NEW: track whether current user is owner
  const [isOwner, setIsOwner] = useState(false);

  const [isEditQuizModalOpen, setEditQuizModalOpen] = useState(false);
  const [isQuestionModalOpen, setQuestionModalOpen] = useState(false);
  const [isCohostModalOpen, setCohostModalOpen] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [isLeaveModalOpen, setLeaveModalOpen] = useState(false);

  const [quizFormData, setQuizFormData] = useState({ Title: '', Description: '', startTime: '', isPermanent: false });
  const [questionFormData, setQuestionFormData] = useState<Question>(emptyQuestion);
  const [cohostEmail, setCohostEmail] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => { fetchQuiz(); }, [quizId]);

  // useEffect(() => {
  //   if (!quiz?.roomCode) return;
  //   connectSocket();
  //   socket.emit('hostJoinRoom', { roomCode: quiz.roomCode });
  // }, [quiz?.roomCode]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/quiz/${quizId}/`);
      const quizData = res.data.data.quiz;
      // ✅ FIX: store isOwner from API response
      setIsOwner(res.data.data.isOwner);
      setQuiz(quizData);
      setQuestions(quizData.Questions || []);
      setQuizFormData({
        Title: quizData.Title,
        Description: quizData.Description || '',
        startTime: quizData.startTime ? new Date(quizData.startTime).toISOString().slice(0, 16) : '',
        isPermanent: quizData.isPermanent,
      });
    } catch (error) {
      console.error(error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch(`/quiz/${quizId}/`, quizFormData);
      toast.success('Quiz updated successfully');
      setEditQuizModalOpen(false);
      fetchQuiz();
    } catch (error) { console.error(error); }
  };

  const handleDeleteQuiz = async () => {
    if (!window.confirm('Are you sure you want to delete this quiz? This cannot be undone.')) return;
    try {
      await api.delete(`/quiz/${quizId}/`);
      toast.success('Quiz deleted');
      navigate('/dashboard');
    } catch (error) { console.error(error); }
  };

  // NEW: co-host leave quiz
  const handleLeaveQuiz = async () => {
    try {
      await api.delete(`/${quizId}/leave`);
      toast.success('You have left the quiz');
      navigate('/dashboard');
    } catch (error) { console.error(error); }
  };

  const handleStartQuiz = () => {
    if (!quiz || !quiz.Questions || quiz.Questions.length === 0) { alert('No questions available'); return; }
    if (isRunning) return;
    setIsRunning(true);
    runQuiz(0);
  };

  const runQuiz = (index: number) => {
    if (!quiz) return;
    if (index >= quiz.Questions.length) {
      socket.emit('endQuiz', { roomCode: quiz.roomCode });
      setIsRunning(false);
      return;
    }
    const q = quiz.Questions[index];
    const questionData = {
      question: q.question,
      options: q.options,
      correctOption: q.correctOption,
      time: q.time || 30,
      questionNo: index + 1,
    };
    socket.emit('publishQuestion', { roomCode: quiz.roomCode, questionData });
    setTimeout(() => runQuiz(index + 1), (questionData.time + 3) * 1000);
  };

  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingQuestionId) {
        await api.patch(`/quiz/questions/${quizId}/`, {
          questions: [{ _id: editingQuestionId, ...questionFormData, options: questionFormData.options.map(o => o.text) }]
        });
        toast.success('Question updated');
      } else {
        await api.post(`/quiz/questions/${quizId}/`, {
          questions: [{ ...questionFormData, options: questionFormData.options.map(o => o.text) }]
        });
        toast.success('Question added');
      }
      setQuestionModalOpen(false);
      fetchQuiz();
    } catch (error) { console.error(error); }
  };

  const handleDeleteQuestions = async () => {
    if (selectedQuestionIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedQuestionIds.size} question(s)?`)) return;
    try {
      await api.delete(`/quiz/questions/${quizId}/`, { data: { questionIds: Array.from(selectedQuestionIds) } });
      toast.success('Questions deleted');
      setSelectedQuestionIds(new Set());
      fetchQuiz();
    } catch (error) { console.error(error); }
  };

  const openQuestionModal = (q?: Question) => {
    if (q) {
      setEditingQuestionId(q._id || q.id || null);
      setQuestionFormData({
        question: q.question || '',
        options: q.options.map((opt: any) => typeof opt === 'string' ? { text: opt } : opt),
        correctOption: q.correctOption ?? 0,
        time: q.time ?? 30,
      });
    } else {
      setEditingQuestionId(null);
      setQuestionFormData(emptyQuestion);
    }
    setQuestionModalOpen(true);
  };

  const toggleQuestionSelection = (id: string, isSelected: boolean) => {
    const s = new Set(selectedQuestionIds);
    isSelected ? s.add(id) : s.delete(id);
    setSelectedQuestionIds(s);
  };

  const handleAddCohost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/co-host/${quizId}/`, { coHostEmail: cohostEmail });
      toast.success('Invite sent to co-host');
      setCohostEmail('');
      setCohostModalOpen(false);
    } catch (error) { console.error(error); }
  };

  //  NEW: share link — frontend /play/:roomCode route
  const shareLink = quiz ? `${window.location.origin}/play/${quiz.roomCode}` : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success('Link copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Could not copy link');
    }
  };

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
      <Loader2 style={{ color: '#6366f1', width: 40, height: 40 }} className="animate-spin" />
    </div>
  );
  if (!quiz) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@400;500;600;700&display=swap');

        .qw-wrap { font-family: 'Outfit', sans-serif; max-width: 900px; margin: 0 auto; padding: 0 16px 80px; }

        .qw-back {
          display: inline-flex; align-items: center; gap: 8px;
          color: #818cf8; font-size: 14px; font-weight: 600;
          text-decoration: none; margin-bottom: 28px;
          transition: color 0.2s, gap 0.2s;
        }
        .qw-back:hover { color: #a5b4fc; gap: 12px; }

        .qw-hero {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px; overflow: hidden; margin-bottom: 28px;
        }

        .qw-hero-header {
          position: relative;
          background: linear-gradient(135deg, rgba(99,102,241,0.22) 0%, rgba(168,85,247,0.14) 100%);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 32px 36px; overflow: hidden;
          display: flex; justify-content: space-between; align-items: flex-start; gap: 20px;
        }
        .qw-hero-header::before {
          content: ''; position: absolute; top: -60px; right: -60px;
          width: 220px; height: 220px; border-radius: 50%;
          background: rgba(99,102,241,0.1); pointer-events: none;
        }

        .qw-room-pill {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.12);
          color: #c7d2fe; font-size: 11px; font-weight: 700;
          letter-spacing: 1px; text-transform: uppercase;
          padding: 4px 12px; border-radius: 100px; margin-bottom: 12px;
        }

        .qw-hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(22px, 4vw, 30px); font-weight: 800;
          color: #fff; margin: 0 0 6px; line-height: 1.15;
        }
        .qw-hero-desc { font-size: 14px; color: #6b7280; margin: 0; line-height: 1.6; max-width: 520px; }

        .qw-hero-actions { display: flex; gap: 8px; flex-shrink: 0; position: relative; z-index: 1; align-items: center; }

        .qw-icon-btn {
          display: flex; align-items: center; justify-content: center;
          width: 38px; height: 38px; border-radius: 10px; border: none; cursor: pointer;
          background: rgba(255,255,255,0.08); color: #d1d5db;
          transition: background 0.2s, color 0.2s;
        }
        .qw-icon-btn:hover { background: rgba(255,255,255,0.15); color: #fff; }
        .qw-icon-btn.danger { background: rgba(239,68,68,0.12); color: #f87171; }
        .qw-icon-btn.danger:hover { background: rgba(239,68,68,0.25); }
        .qw-icon-btn.share { background: rgba(99,102,241,0.12); color: #a5b4fc; }
        .qw-icon-btn.share:hover { background: rgba(99,102,241,0.25); color: #c7d2fe; }

        /* ── Stats bar ── */
        .qw-stats-bar {
          display: flex; align-items: center; gap: 24px;
          padding: 14px 36px;
          background: rgba(0,0,0,0.2);
          font-size: 13px; font-weight: 600; color: #6b7280;
        }
        .qw-stat-val { color: #e8eaf0; font-weight: 700; margin-left: 5px; }
        .qw-status-pill {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 700; padding: 3px 10px;
          border-radius: 100px; text-transform: uppercase; letter-spacing: 0.5px;
        }
        .qw-status-pill.permanent {
          background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25); color: #86efac;
        }
        .qw-status-pill.scheduled {
          background: rgba(251,146,60,0.1); border: 1px solid rgba(251,146,60,0.2); color: #fdba74;
        }

        /* ── Role badge ── */
        .qw-role-badge {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 11px; font-weight: 700; padding: 3px 10px;
          border-radius: 100px; text-transform: uppercase; letter-spacing: 0.5px;
          background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.25); color: #a5b4fc;
        }

        /* ── Section ── */
        .qw-section-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px; gap: 12px; flex-wrap: wrap;
        }
        .qw-section-title {
          font-family: 'Syne', sans-serif;
          font-size: 22px; font-weight: 800; color: #fff; margin: 0;
        }
        .qw-section-actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }

        /* ── Buttons ── */
        .qw-btn {
          display: inline-flex; align-items: center; gap: 7px;
          font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 700;
          padding: 9px 18px; border-radius: 100px; border: none; cursor: pointer;
          transition: all 0.2s; white-space: nowrap;
        }
        .qw-btn-primary {
          background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff;
          box-shadow: 0 4px 16px rgba(99,102,241,0.25);
        }
        .qw-btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(99,102,241,0.4); }

        .qw-btn-ghost {
          background: rgba(255,255,255,0.04); color: #9ca3af;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .qw-btn-ghost:hover { background: rgba(255,255,255,0.08); color: #e8eaf0; }

        .qw-btn-danger {
          background: rgba(239,68,68,0.1); color: #f87171;
          border: 1px solid rgba(239,68,68,0.2);
        }
        .qw-btn-danger:hover { background: rgba(239,68,68,0.18); }

        .qw-btn-start {
          background: linear-gradient(135deg, #22c55e, #16a34a); color: #fff;
          box-shadow: 0 4px 16px rgba(34,197,94,0.25);
        }
        .qw-btn-start:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(34,197,94,0.4); }
        .qw-btn-start:disabled { opacity: 0.5; cursor: not-allowed; }

        /* ── Empty state ── */
        .qw-empty {
          text-align: center; padding: 60px 24px;
          background: rgba(255,255,255,0.01);
          border: 1px dashed rgba(255,255,255,0.08);
          border-radius: 20px;
        }
        .qw-empty-icon {
          width: 56px; height: 56px; border-radius: 16px;
          background: rgba(99,102,241,0.1); border: 1px solid rgba(99,102,241,0.2);
          display: flex; align-items: center; justify-content: center;
          margin: 0 auto 16px; color: #6366f1;
        }
        .qw-empty h3 { font-family: 'Syne', sans-serif; font-size: 18px; font-weight: 700; color: #fff; margin: 0 0 6px; }
        .qw-empty p { font-size: 14px; color: #4b5563; margin: 0 0 20px; }

        /* ── Modal fields ── */
        .qw-modal-field { display: flex; flex-direction: column; gap: 7px; }
        .qw-modal-label {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 1px; color: #9ca3af;
        }
        .qw-modal-input, .qw-modal-textarea, .qw-modal-select {
          width: 100%; font-family: 'Outfit', sans-serif;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 12px 14px;
          font-size: 14px; font-weight: 500; color: #e8eaf0; outline: none;
          transition: border-color 0.2s, box-shadow 0.2s; box-sizing: border-box;
        }
        .qw-modal-input::placeholder, .qw-modal-textarea::placeholder { color: #374151; }
        .qw-modal-input:focus, .qw-modal-textarea:focus, .qw-modal-select:focus {
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .qw-modal-textarea { resize: none; height: 90px; line-height: 1.6; }
        .qw-modal-select { appearance: none; cursor: pointer; }

        .qw-modal-submit {
          width: 100%; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 700;
          padding: 14px; border-radius: 14px; border: none; cursor: pointer;
          background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff;
          transition: all 0.2s; box-shadow: 0 4px 16px rgba(99,102,241,0.25);
        }
        .qw-modal-submit:hover { transform: translateY(-1px); box-shadow: 0 6px 24px rgba(99,102,241,0.4); }

        /* ── Share link box ── */
        .qw-share-box {
          display: flex; align-items: center; gap: 0;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; overflow: hidden;
        }
        .qw-share-url {
          flex: 1; padding: 12px 14px;
          font-size: 13px; font-weight: 500; color: #9ca3af;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          font-family: 'Outfit', sans-serif;
        }
        .qw-share-copy {
          display: flex; align-items: center; gap: 6px;
          padding: 12px 16px; border: none; cursor: pointer;
          background: rgba(99,102,241,0.15); color: #a5b4fc;
          font-size: 13px; font-weight: 700; font-family: 'Outfit', sans-serif;
          border-left: 1px solid rgba(255,255,255,0.08);
          transition: background 0.2s;
          white-space: nowrap;
        }
        .qw-share-copy:hover { background: rgba(99,102,241,0.25); }
        .qw-share-copy.copied { color: #86efac; background: rgba(34,197,94,0.12); }

        /* ── Leave / Owner warning ── */
        .qw-owner-warning {
          background: rgba(251,146,60,0.08);
          border: 1px solid rgba(251,146,60,0.2);
          border-radius: 14px; padding: 16px 18px;
          display: flex; align-items: flex-start; gap: 12px;
          font-size: 14px; color: #fdba74; line-height: 1.6;
        }
        .qw-owner-warning-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }

        /* ── Option cards ── */
        .qw-opt-card {
          display: flex; align-items: center; gap: 12px;
          padding: 12px 14px; border-radius: 14px;
          border: 1.5px solid rgba(255,255,255,0.07);
          background: rgba(255,255,255,0.02);
          transition: border-color 0.2s, background 0.2s;
        }
        .qw-opt-card.correct {
          border-color: rgba(34,197,94,0.4);
          background: rgba(34,197,94,0.06);
        }
        .qw-opt-input {
          flex: 1; background: transparent; border: none; outline: none;
          font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 500; color: #e8eaf0;
        }
        .qw-opt-input::placeholder { color: #374151; }
        .qw-opt-radio { accent-color: #22c55e; width: 16px; height: 16px; cursor: pointer; flex-shrink: 0; }

        @media (max-width: 600px) {
          .qw-hero-header { flex-direction: column; padding: 24px 20px; }
          .qw-stats-bar { padding: 12px 20px; flex-wrap: wrap; gap: 12px; }
        }
      `}</style>

      <div className="qw-wrap">
        <Link to="/dashboard" className="qw-back">
          <ArrowLeft size={16} /> Back to Dashboard
        </Link>

        {/* ── Hero card ── */}
        <motion.div className="qw-hero" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>
          <div className="qw-hero-header">
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="qw-room-pill">
                <Hash size={10} /> {quiz.roomCode}
              </div>
              <h1 className="qw-hero-title">{quiz.Title}</h1>
              {quiz.Description && <p className="qw-hero-desc">{quiz.Description}</p>}
            </div>

            <div className="qw-hero-actions">
              {/* Share — visible to both owner and co-host */}
              <button onClick={() => setShareModalOpen(true)} className="qw-icon-btn share" title="Share Quiz Link">
                <Share2 size={17} />
              </button>

              {/* Edit — owner only */}
              {isOwner && (
                <button onClick={() => setEditQuizModalOpen(true)} className="qw-icon-btn" title="Edit Quiz">
                  <Edit3 size={17} />
                </button>
              )}

              {/*  Co-host management — owner only */}
              {isOwner && (
                <button onClick={() => setCohostModalOpen(true)} className="qw-icon-btn" title="Manage Co-hosts">
                  <Users size={17} />
                </button>
              )}

              {/*  Delete — owner only */}
              {isOwner && (
                <button onClick={handleDeleteQuiz} className="qw-icon-btn danger" title="Delete Quiz">
                  <Trash2 size={17} />
                </button>
              )}

              {/*  Leave — co-host only */}
              {!isOwner && (
                <button onClick={() => setLeaveModalOpen(true)} className="qw-icon-btn danger" title="Leave Quiz">
                  <LogOut size={17} />
                </button>
              )}
            </div>
          </div>

          <div className="qw-stats-bar">
            <span>
              <HelpCircle size={13} style={{ display: 'inline', marginRight: 5, color: '#6366f1', verticalAlign: 'middle' }} />
              Questions<span className="qw-stat-val">{questions.length}</span>
            </span>
            <span>
              Status
              <span style={{ marginLeft: 8 }}>
                <span className={`qw-status-pill ${quiz.isPermanent ? 'permanent' : 'scheduled'}`}>
                  {quiz.isPermanent ? <><Infinity size={10} /> Permanent</> : <><Clock size={10} /> Scheduled</>}
                </span>
              </span>
            </span>
            {/*  Show role clearly */}
            <span>
              Role
              <span style={{ marginLeft: 8 }}>
                <span className="qw-role-badge">
                  {isOwner ? '👑 Owner' : '🤝 Co-host'}
                </span>
              </span>
            </span>
          </div>
        </motion.div>

        {/* ── Questions section ── */}
        <div className="qw-section-header">
          <h2 className="qw-section-title">Questions</h2>
          <div className="qw-section-actions">
            {selectedQuestionIds.size > 0 && (
              <>
                <button onClick={handleDeleteQuestions} className="qw-btn qw-btn-danger">
                  <Trash2 size={14} /> Delete ({selectedQuestionIds.size})
                </button>
                <button
                  onClick={() => setSelectedQuestionIds(new Set())}
                  className="qw-btn"
                  style={{ background: '#fff', color: '#0f172a' }}
                >
                  ✕ Clear Selection
                </button>
              </>
            )}
            {/* Start Quiz — owner only */}
            {isOwner && (
              <button
                onClick={handleStartQuiz}
                disabled={isRunning || questions.length === 0}
                className="qw-btn qw-btn-start"
              >
                {isRunning
                  ? <><Loader2 size={14} className="animate-spin" /> Running…</>
                  : <><Zap size={14} /> Start Quiz</>
                }
              </button>
            )}
            <button onClick={() => openQuestionModal()} className="qw-btn qw-btn-primary">
              <PlusCircle size={14} /> Add Question
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {questions.length === 0 ? (
            <div className="qw-empty">
              <div className="qw-empty-icon"><HelpCircle size={24} /></div>
              <h3>No questions yet</h3>
              <p>Start adding questions to your quiz!</p>
              <button onClick={() => openQuestionModal()} className="qw-btn qw-btn-primary" style={{ margin: '0 auto' }}>
                <PlusCircle size={14} /> Add First Question
              </button>
            </div>
          ) : (
            questions.map((q, i) => (
              <QuestionCard
                key={q._id || q.id}
                question={q}
                index={i}
                onEdit={openQuestionModal}
                onDelete={async (id) => {
                  if (window.confirm('Delete this question?')) {
                    try {
                      await api.delete(`/quiz/questions/${quizId}/`, { data: { questionIds: [id] } });
                      toast.success('Question deleted');
                      fetchQuiz();
                    } catch (e) { console.error(e); }
                  }
                }}
                isSelected={selectedQuestionIds.has(q._id as string || q.id as string)}
                onSelect={toggleQuestionSelection}
              />
            ))
          )}
        </div>

        {/* ════════════════ MODALS ════════════════ */}

        {/* Edit Quiz */}
        <Modal isOpen={isEditQuizModalOpen} onClose={() => setEditQuizModalOpen(false)} title="Edit Quiz Settings">
          <form onSubmit={handleUpdateQuiz} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="qw-modal-field">
              <label className="qw-modal-label">Title</label>
              <input required type="text" value={quizFormData.Title}
                onChange={e => setQuizFormData({ ...quizFormData, Title: e.target.value })}
                className="qw-modal-input" placeholder="Quiz title" />
            </div>
            <div className="qw-modal-field">
              <label className="qw-modal-label">Description</label>
              <textarea value={quizFormData.Description}
                onChange={e => setQuizFormData({ ...quizFormData, Description: e.target.value })}
                className="qw-modal-textarea" placeholder="Brief description…" />
            </div>
            <button type="submit" className="qw-modal-submit">Save Changes</button>
          </form>
        </Modal>

        {/* Co-host */}
        <Modal isOpen={isCohostModalOpen} onClose={() => setCohostModalOpen(false)} title="Add Co-host">
          <form onSubmit={handleAddCohost} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="qw-modal-field">
              <label className="qw-modal-label">Co-host Email</label>
              <input required type="email" value={cohostEmail}
                onChange={e => setCohostEmail(e.target.value)}
                className="qw-modal-input" placeholder="colleague@example.com" />
            </div>
            <button type="submit" className="qw-modal-submit">Send Invite</button>
          </form>
        </Modal>

        {/*  Share Link Modal */}
        <Modal isOpen={isShareModalOpen} onClose={() => setShareModalOpen(false)} title="Share Quiz Link">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p style={{ fontSize: 18, color: '#7a7b80', margin: 0, lineHeight: 1.6 }}>
              Share this link with participants. They can join directly without needing an account.
            </p>
            <div className="qw-share-box">
              <span className="qw-share-url">{shareLink}</span>
              <button className={`qw-share-copy ${copied ? 'copied' : ''}`} onClick={handleCopyLink}>
                {copied ? <><Check size={13} /> Copied!</> : <><Copy size={13} /> Copy</>}
              </button>
            </div>
            <p style={{ fontSize: 12, color: '#374151', margin: 0 }}>
              Room code: <strong style={{ color: '#a5b4fc', fontFamily: 'monospace' }}>{quiz.roomCode}</strong>
            </p>
          </div>
        </Modal>

        {/* Leave Quiz Modal — co-host only */}
        <Modal isOpen={isLeaveModalOpen} onClose={() => setLeaveModalOpen(false)} title="Leave Quiz">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <p style={{ fontSize: 14, color: '#9ca3af', margin: 0, lineHeight: 1.6 }}>
              Are you sure you want to leave <strong style={{ color: '#e8eaf0' }}>{quiz.Title}</strong>?
              You'll lose co-host access and won't be able to manage this quiz anymore.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setLeaveModalOpen(false)} className="qw-btn qw-btn-ghost" style={{ flex: 1, justifyContent: 'center' }}>
                Cancel
              </button>
              <button onClick={handleLeaveQuiz} className="qw-btn qw-btn-danger" style={{ flex: 1, justifyContent: 'center' }}>
                <LogOut size={14} /> Leave Quiz
              </button>
            </div>
          </div>
        </Modal>

        {/* Question */}
        <Modal isOpen={isQuestionModalOpen} onClose={() => setQuestionModalOpen(false)}
          title={editingQuestionId ? 'Edit Question' : 'Add Question'} maxWidth="max-w-2xl">
          <form onSubmit={handleSaveQuestion} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="qw-modal-field">
              <label className="qw-modal-label">Question Text</label>
              <input required type="text" value={questionFormData.question}
                onChange={e => setQuestionFormData({ ...questionFormData, question: e.target.value })}
                className="qw-modal-input" placeholder="What is 2 + 2?" />
            </div>
            <div className="qw-modal-field">
              <label className="qw-modal-label">Options — select the correct one</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {questionFormData.options.map((opt, i) => (
                  <div key={i} className={`qw-opt-card ${questionFormData.correctOption === i ? 'correct' : ''}`}>
                    <input type="radio" name="correctOption" className="qw-opt-radio"
                      checked={questionFormData.correctOption === i}
                      onChange={() => setQuestionFormData({ ...questionFormData, correctOption: i })} />
                    <input required type="text" value={opt.text}
                      className="qw-opt-input" placeholder={`Option ${i + 1}`}
                      onChange={e => {
                        const newOpts = [...questionFormData.options];
                        newOpts[i] = { ...newOpts[i], text: e.target.value };
                        setQuestionFormData({ ...questionFormData, options: newOpts });
                      }} />
                  </div>
                ))}
              </div>
            </div>
            <div className="qw-modal-field" style={{ maxWidth: 200 }}>
              <label className="qw-modal-label">Time Limit</label>
              <select value={questionFormData.time}
                onChange={e => setQuestionFormData({ ...questionFormData, time: Number(e.target.value) })}
                className="qw-modal-select">
                {[10, 20, 30, 60, 90, 120].map(t => (
                  <option key={t} value={t}>{t} seconds</option>
                ))}
              </select>
            </div>
            <button type="submit" className="qw-modal-submit">
              {editingQuestionId ? 'Update Question' : 'Add Question →'}
            </button>
          </form>
        </Modal>
      </div>
    </>
  );
}