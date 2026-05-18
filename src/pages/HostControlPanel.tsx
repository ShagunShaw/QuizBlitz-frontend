import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import type { Quiz } from '../types';
import { socket, connectSocket, disconnectSocket, resetSocketListeners } from '../services/socket';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Play, Trophy, ChevronRight, Users, Hash, ArrowLeft, Crown, Medal, Award } from 'lucide-react';
import toast from 'react-hot-toast';

interface Participant {
  username: string;
  score: number;
  rank?: number;
}

export default function HostControlPanel() {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [isQuestionActive, setIsQuestionActive] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [totalResponses, setTotalResponses] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [endsAt, setEndsAt] = useState<number | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);

  // Fetch quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/quiz/${quizId}/`);
        setQuiz(res.data.data.quiz);
      } catch {
        toast.error('Failed to load quiz');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [quizId, navigate]);

  // Connect socket on mount, disconnect on unmount
  useEffect(() => {
    if (!quiz?.roomCode) return;

    connectSocket();

    socket.emit('hostJoinRoom', {
      roomCode: quiz.roomCode
    });

    socket.on("displayScoreBoard", (data) => {

      const participants =
        data.top7?.map(
          (name: string, index: number) => ({
            username: name,
            score: data.topPoints[index]
          })
        ) || [];

      setParticipants(participants);

    });

    socket.on("quizEnded", (data) => {

      const finalParticipants =
        data.finalTop7?.map(
          (name: string, index: number) => ({
            username: name,
            score: data.finalTopPoints[index]
          })
        ) || [];

      setParticipants(finalParticipants);

      setQuizFinished(true);

    });

    return () => {
      resetSocketListeners();
      disconnectSocket();
    };

  }, [quiz?.roomCode]);

  // Timer countdown
  useEffect(() => {

    if (!isQuestionActive || !endsAt) return;

    const updateTimer = () => {

      const remaining = Math.max(
        0,
        Math.ceil((endsAt - Date.now()) / 1000)
      );

      setTimer(remaining);

      if (remaining <= 0) {

        if (timerRef.current) {
          clearInterval(timerRef.current);
        }

        setIsQuestionActive(false);
        setShowLeaderboard(true);

        if (quiz?.roomCode) {
          socket.emit('showLeaderboard', {
            roomCode: quiz.roomCode
          });
        }
      }
    };

    // run instantly instead of waiting 1 second
    updateTimer();

    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };

  }, [isQuestionActive, endsAt, quiz?.roomCode]);

  const totalQuestions = quiz?.Questions?.length || 0;
  const currentQuestion = quiz?.Questions?.[currentQuestionIndex];

  const handleForceEndQuiz = () => {

    if (quiz?.roomCode) {
      socket.emit('endQuiz', {
        roomCode: quiz.roomCode
      });
    }

    setShowLeaveConfirm(false);
  };

  const handlePublishQuestion = useCallback(() => {
    if (!quiz || !currentQuestion) return;

    const questionData = {
      question: currentQuestion.question,
      options: currentQuestion.options,
      correctOption: currentQuestion.correctOption,
      time: currentQuestion.time || 30,
      questionNo: currentQuestionIndex + 1,
    };

    socket.emit('publishQuestion', {
      roomCode: quiz.roomCode,
      questionData
    });

    setIsQuestionActive(true);
setQuizStarted(true);
setShowLeaderboard(false);
    setEndsAt(Date.now() + (questionData.time * 1000));

  }, [quiz, currentQuestion, currentQuestionIndex]);

  const handleNextQuestion = useCallback(() => {

    if (currentQuestionIndex + 1 >= totalQuestions) {

      if (quiz?.roomCode) {

        socket.emit('endQuiz', {
          roomCode: quiz.roomCode
        });

      }

      return;
    }

    setCurrentQuestionIndex(prev => prev + 1);
    setShowLeaderboard(false);
    setTotalResponses(0);

  }, [currentQuestionIndex, totalQuestions, quiz?.roomCode]);

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <Loader2 size={40} className="animate-spin" style={{ color: '#6366f1' }} />
    </div>
  );
  if (!quiz) return null;

  // Timer progress percentage
  const maxTime = currentQuestion?.time || 30;
  const timerPct = maxTime > 0 ? (timer / maxTime) * 100 : 0;
  const timerColor = timerPct > 50 ? '#22c55e' : timerPct > 20 ? '#f59e0b' : '#ef4444';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@400;500;600;700&display=swap');
        .hcp-wrap { font-family:'Outfit',sans-serif; max-width:880px; margin:0 auto; padding:0 16px 80px; }
        .hcp-back { display:inline-flex; align-items:center; gap:8px; color:#818cf8; font-size:14px; font-weight:600; cursor:pointer; background:none; border:none; margin-bottom:28px; transition:color .2s,gap .2s; }
        .hcp-back:hover { color:#a5b4fc; gap:12px; }
        .hcp-card { background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.07); border-radius:24px; overflow:hidden; }
        .hcp-header { position:relative; background:linear-gradient(135deg,rgba(99,102,241,.22),rgba(168,85,247,.14)); border-bottom:1px solid rgba(255,255,255,.06); padding:28px 32px; display:flex; justify-content:space-between; align-items:center; gap:16px; }
        .hcp-header::before { content:''; position:absolute; top:-60px; right:-60px; width:220px; height:220px; border-radius:50%; background:rgba(99,102,241,.1); pointer-events:none; }
        .hcp-title { font-family:'Syne',sans-serif; font-size:clamp(20px,3.5vw,28px); font-weight:800; color:#fff; margin:0; position:relative; z-index:1; }
        .hcp-room { display:inline-flex; align-items:center; gap:6px; background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.12); color:#c7d2fe; font-size:11px; font-weight:700; letter-spacing:1px; text-transform:uppercase; padding:4px 12px; border-radius:100px; position:relative; z-index:1; }
        .hcp-body { padding:32px; }
        .hcp-question-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(99,102,241,.1); border:1px solid rgba(99,102,241,.2); color:#a5b4fc; font-size:12px; font-weight:700; letter-spacing:.5px; text-transform:uppercase; padding:5px 14px; border-radius:100px; margin-bottom:20px; }
        .hcp-question-text { font-family:'Syne',sans-serif; font-size:clamp(18px,3vw,24px); font-weight:800; color:#fff; margin:0 0 24px; line-height:1.3; }
        .hcp-options { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:28px; }
        .hcp-opt { padding:14px 18px; border-radius:14px; border:1.5px solid rgba(255,255,255,.07); background:rgba(255,255,255,.02); font-size:14px; font-weight:500; color:#d1d5db; display:flex; align-items:center; gap:10px; transition:all .2s; }
        .hcp-opt-label { width:26px; height:26px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:12px; font-weight:700; color:#fff; flex-shrink:0; }
        .hcp-opt.correct { border-color:rgba(34,197,94,.4); background:rgba(34,197,94,.06); color:#86efac; }
        .hcp-timer-wrap { margin-bottom:28px; }
        .hcp-timer-bar { height:8px; border-radius:100px; background:rgba(255,255,255,.06); overflow:hidden; }
        .hcp-timer-fill { height:100%; border-radius:100px; transition:width .3s linear, background .5s; }
        .hcp-timer-text { display:flex; justify-content:space-between; align-items:center; margin-top:8px; font-size:13px; font-weight:600; color:#6b7280; }
        .hcp-timer-num { font-size:20px; font-weight:800; font-family:'Syne',sans-serif; }
        .hcp-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; font-family:'Outfit',sans-serif; font-size:15px; font-weight:700; padding:14px 28px; border-radius:100px; border:none; cursor:pointer; transition:all .2s; white-space:nowrap; width:100%; }
        .hcp-btn-publish { background:linear-gradient(135deg,#6366f1,#8b5cf6); color:#fff; box-shadow:0 4px 20px rgba(99,102,241,.3); }
        .hcp-btn-publish:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(99,102,241,.45); }
        .hcp-btn-next { background:linear-gradient(135deg,#22c55e,#16a34a); color:#fff; box-shadow:0 4px 20px rgba(34,197,94,.3); }
        .hcp-btn-next:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(34,197,94,.45); }
        .hcp-btn-finish { background:linear-gradient(135deg,#f59e0b,#d97706); color:#fff; box-shadow:0 4px 20px rgba(245,158,11,.3); }
        .hcp-btn-finish:hover { transform:translateY(-2px); box-shadow:0 8px 30px rgba(245,158,11,.45); }
        .hcp-leaderboard { margin-top:8px; }
        .hcp-lb-header { display:flex; align-items:center; justify-content:space-between; margin-bottom:20px; flex-wrap:wrap; gap:12px; }
        .hcp-lb-title { font-family:'Syne',sans-serif; font-size:22px; font-weight:800; color:#fff; margin:0; display:flex; align-items:center; gap:10px; }
        .hcp-lb-stats { display:flex; gap:16px; font-size:13px; font-weight:600; color:#6b7280; }
        .hcp-lb-stats span { display:flex; align-items:center; gap:5px; }
        .hcp-lb-stats strong { color:#e8eaf0; }
        .hcp-lb-row { display:flex; align-items:center; gap:14px; padding:14px 18px; border-radius:14px; border:1px solid rgba(255,255,255,.06); background:rgba(255,255,255,.02); margin-bottom:8px; transition:background .2s; }
        .hcp-lb-row:hover { background:rgba(255,255,255,.04); }
        .hcp-lb-row.gold { border-color:rgba(245,158,11,.3); background:rgba(245,158,11,.06); }
        .hcp-lb-row.silver { border-color:rgba(192,192,192,.25); background:rgba(192,192,192,.04); }
        .hcp-lb-row.bronze { border-color:rgba(205,127,50,.25); background:rgba(205,127,50,.04); }
        .hcp-lb-rank { width:32px; height:32px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:800; color:#fff; flex-shrink:0; }
        .hcp-lb-name { flex:1; font-size:15px; font-weight:600; color:#e8eaf0; }
        .hcp-lb-score { font-size:15px; font-weight:800; color:#a5b4fc; font-family:'Syne',sans-serif; }
        .hcp-empty-lb { text-align:center; padding:40px 20px; color:#4b5563; font-size:14px; border:1px dashed rgba(255,255,255,.08); border-radius:16px; }
        .hcp-finished-wrap { text-align:center; padding:20px 0 0; }
        .hcp-finished-icon { width:72px; height:72px; border-radius:50%; background:linear-gradient(135deg,rgba(245,158,11,.15),rgba(234,88,12,.1)); border:2px solid rgba(245,158,11,.3); display:flex; align-items:center; justify-content:center; margin:0 auto 20px; color:#f59e0b; }
        .hcp-finished-title { font-family:'Syne',sans-serif; font-size:28px; font-weight:800; color:#fff; margin:0 0 8px; }
        .hcp-finished-sub { font-size:15px; color:#6b7280; margin:0 0 32px; }
        @media(max-width:600px) { .hcp-options { grid-template-columns:1fr; } .hcp-header { flex-direction:column; align-items:flex-start; } }
      `}</style>

      <div className="hcp-wrap">
        <button
  className="hcp-back"
  onClick={() => {

    // from first publish till final leaderboard
    if (quizStarted && !quizFinished) {
      setShowLeaveConfirm(true);
      return;
    }

    navigate(`/quiz/${quizId}`);
  }}
>
          <ArrowLeft size={16} /> Back to Workspace
        </button>

        <motion.div className="hcp-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="hcp-header">
            <h1 className="hcp-title">{quiz.Title}</h1>
            <div className="hcp-room"><Hash size={10} /> {quiz.roomCode}</div>
          </div>

          <div className="hcp-body">
            <AnimatePresence mode="wait">
              {/* ── QUIZ FINISHED ── */}
              {quizFinished ? (
                <motion.div key="finished" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <div className="hcp-finished-wrap">
                    <div className="hcp-finished-icon"><Trophy size={32} /></div>
                    <h2 className="hcp-finished-title">Quiz Finished!</h2>
                    <p className="hcp-finished-sub">All {totalQuestions} questions completed</p>
                  </div>
                  <LeaderboardView
                    participants={participants}
                    totalResponses={totalResponses}
                    currentQuestion={totalQuestions}
                    totalQuestions={totalQuestions}
                    isFinal
                  />
                  <div style={{ marginTop: 24 }}>
                    <button className="hcp-btn hcp-btn-finish" onClick={() => navigate(`/quiz/${quizId}`)}>
                      Return to Workspace
                    </button>
                  </div>
                </motion.div>

                /* ── LEADERBOARD BETWEEN QUESTIONS ── */
              ) : showLeaderboard ? (
                <motion.div key="leaderboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <LeaderboardView
                    participants={participants}
                    totalResponses={totalResponses}
                    currentQuestion={currentQuestionIndex + 1}
                    totalQuestions={totalQuestions}
                  />
                  <div style={{ marginTop: 24 }}>
                    <button className="hcp-btn hcp-btn-next" onClick={handleNextQuestion}>
                      {currentQuestionIndex + 1 >= totalQuestions
                        ? <><Trophy size={16} /> Finish Quiz</>
                        : <><ChevronRight size={16} /> Next Question</>}
                    </button>
                  </div>
                </motion.div>

                /* ── QUESTION ACTIVE (timer running) ── */
              ) : isQuestionActive && currentQuestion ? (
                <motion.div key={`active-${currentQuestionIndex}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <div className="hcp-question-badge">Question {currentQuestionIndex + 1} of {totalQuestions}</div>
                  <h2 className="hcp-question-text">{currentQuestion.question}</h2>
                  <div className="hcp-options">
                    {currentQuestion.options.map((opt, i) => {
                      const colors = ['#6366f1', '#ec4899', '#f59e0b', '#22c55e'];
                      const optText = typeof opt === 'string' ? opt : opt.text;
                      return (
                        // <div key={i} className={`hcp-opt ${currentQuestion.correctOption === i ? 'correct' : ''}`}>
                        <div key={i} className="hcp-opt">
                          <div className="hcp-opt-label" style={{ background: colors[i % 4] }}>
                            {String.fromCharCode(65 + i)}
                          </div>
                          {optText}
                        </div>
                      );
                    })}
                  </div>
                  <div className="hcp-timer-wrap">
                    <div className="hcp-timer-bar">
                      <div className="hcp-timer-fill" style={{ width: `${timerPct}%`, background: timerColor }} />
                    </div>
                    <div className="hcp-timer-text">
                      <span>Time Remaining</span>
                      <span className="hcp-timer-num" style={{ color: timerColor }}>{timer}s</span>
                    </div>
                  </div>
                </motion.div>

                /* ── PRE-PUBLISH (waiting for host click) ── */
              ) : currentQuestion ? (
                <motion.div key={`pre-${currentQuestionIndex}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                  <div className="hcp-question-badge">Question {currentQuestionIndex + 1} of {totalQuestions}</div>
                  <h2 className="hcp-question-text">{currentQuestion.question}</h2>
                  <div className="hcp-options">
                    {currentQuestion.options.map((opt, i) => {
                      const colors = ['#6366f1', '#ec4899', '#f59e0b', '#22c55e'];
                      const optText = typeof opt === 'string' ? opt : opt.text;

                      return (
                        <div key={i} className="hcp-opt">
                          <div
                            className="hcp-opt-label"
                            style={{ background: colors[i % 4] }}
                          >
                            {String.fromCharCode(65 + i)}
                          </div>

                          {optText}
                        </div>
                      );
                    })}
                  </div>
                  <button className="hcp-btn hcp-btn-publish" onClick={handlePublishQuestion}>
                    <Play size={16} /> Publish Question
                  </button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
      {showLeaveConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div
            style={{
              width: '90%',
              maxWidth: 420,
              background: '#111827',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 24,
              padding: 28
            }}
          >
            <h2
              style={{
                color: '#fff',
                fontSize: 22,
                fontWeight: 800,
                marginBottom: 12
              }}
            >
              Leave Arena?
            </h2>

            <p
              style={{
                color: '#9ca3af',
                fontSize: 14,
                lineHeight: 1.6,
                marginBottom: 24
              }}
            >
              The quiz will be ended if you leave the arena.
            </p>

            <div
              style={{
                display: 'flex',
                gap: 12
              }}
            >
              <button
                onClick={() => setShowLeaveConfirm(false)}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: 14,
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.04)',
                  color: '#fff',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleForceEndQuiz}
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  borderRadius: 14,
                  border: 'none',
                  background: 'linear-gradient(135deg,#ef4444,#dc2626)',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                End Quiz
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

/* ── Leaderboard sub-component ── */
function LeaderboardView({ participants, totalResponses, currentQuestion, totalQuestions, isFinal = false }: {
  participants: Participant[];
  totalResponses: number;
  currentQuestion: number;
  totalQuestions: number;
  isFinal?: boolean;
}) {
  const sorted = [...participants].sort((a, b) => b.score - a.score);
  const rankIcons = [
    <Crown size={16} />,
    <Medal size={16} />,
    <Award size={16} />,
  ];
  const rankBgs = ['linear-gradient(135deg,#f59e0b,#d97706)', 'linear-gradient(135deg,#9ca3af,#6b7280)', 'linear-gradient(135deg,#cd7f32,#a0522d)'];
  const rowClass = ['gold', 'silver', 'bronze'];

  return (
    <div className="hcp-leaderboard">
      <div className="hcp-lb-header">
        <h3 className="hcp-lb-title">
          <Trophy size={20} style={{ color: '#f59e0b' }} />
          {isFinal ? 'Final Leaderboard' : 'Leaderboard'}
        </h3>
        <div className="hcp-lb-stats">
          <span><Hash size={13} /> Q <strong>{currentQuestion}/{totalQuestions}</strong></span>
          {/* <span><Users size={13} /> Responses <strong>{totalResponses}</strong></span> */}
        </div>
      </div>
      {sorted.length === 0 ? (
        <div className="hcp-empty-lb">No participants yet</div>
      ) : (
        sorted.map((p, i) => (
          <motion.div
            key={p.username}
            className={`hcp-lb-row ${i < 3 ? rowClass[i] : ''}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="hcp-lb-rank" style={{ background: i < 3 ? rankBgs[i] : 'rgba(255,255,255,.08)' }}>
              {i < 3 ? rankIcons[i] : i + 1}
            </div>
            <span className="hcp-lb-name">{p.username}</span>
            <span className="hcp-lb-score">{p.score}</span>
          </motion.div>
        ))
      )}
    </div>
  );
}
