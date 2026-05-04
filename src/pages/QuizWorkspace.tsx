import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import type { Quiz, Question } from '../types';
import { QuestionCard } from '../components/QuestionCard';
import { Modal } from '../components/Modal';
import { Loader2, Plus, Edit3, Trash2, ArrowLeft, Users, Settings, PlusCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { socket, connectSocket } from "../services/socket";

export default function QuizWorkspace() {
  const emptyQuestion = {
    question: '',
    options: [{ text: '' }, { text: '' }, { text: '' }, { text: '' }],
    correctOption: 0,
    time: 0,
  };

  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<Set<string>>(new Set());
  const [isRunning, setIsRunning] = useState(false);

  // Modals state
  const [isEditQuizModalOpen, setEditQuizModalOpen] = useState(false);
  const [isQuestionModalOpen, setQuestionModalOpen] = useState(false);
  const [isCohostModalOpen, setCohostModalOpen] = useState(false);

  // Forms state
  const [quizFormData, setQuizFormData] = useState({ Title: '', Description: '', startTime: '', isPermanent: false });
  const [questionFormData, setQuestionFormData] = useState<Question>(emptyQuestion);
  const [cohostEmail, setCohostEmail] = useState('');
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  useEffect(() => {
    if (!quiz?.roomCode) return;

    connectSocket();

    socket.emit("hostJoinRoom", { roomCode: quiz.roomCode });

    console.log("Host joined:", quiz.roomCode);

  }, [quiz?.roomCode]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/quiz/${quizId}/`);
      console.log("QUIZ API:", res.data);

      const quizData = res.data.data.quiz;

      setQuiz(quizData);

      setQuestions(quizData.Questions || []);

      setQuizFormData({
        Title: quizData.Title,
        Description: quizData.Description || '',
        startTime: quizData.startTime
          ? new Date(quizData.startTime).toISOString().slice(0, 16)
          : '',
        isPermanent: quizData.isPermanent,
      });

    } catch (error) {
      console.error(error);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };



  // --- Quiz Handlers ---
  const handleUpdateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...quizFormData,
        // startTime: quizFormData.startTime ? new Date(quizFormData.startTime).toISOString() : new Date().toISOString(),
      };

      await api.patch(`/quiz/${quizId}/`, payload);
      toast.success('Quiz updated successfully');
      setEditQuizModalOpen(false);
      fetchQuiz();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteQuiz = async () => {
    if (!window.confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await api.delete(`/quiz/${quizId}/`);
      toast.success('Quiz deleted');
      navigate('/dashboard');
    } catch (error) {
      console.error(error);
    }
  };
  const handleStartQuiz = () => {
    if (!quiz || !quiz.Questions || quiz.Questions.length === 0) {
      alert("No questions available");
      return;
    }

    if (isRunning) return; // prevent double start
    setIsRunning(true);

    runQuiz(0);
  };
  const runQuiz = (index: number) => {
    if (!quiz) return;

    // 🏁 End condition
    if (index >= quiz.Questions.length) {
      console.log("🏁 Quiz finished");

      socket.emit("endQuiz", {
        roomCode: quiz.roomCode
      });

      setIsRunning(false);
      return;
    }

    const q = quiz.Questions[index];

    const questionData = {
      question: q.question,
      options: q.options,
      correctOption: q.correctOption,
      time: q.time || 30,
      questionNo: index + 1
    };

    // 🚀 Send question
    socket.emit("publishQuestion", {
      roomCode: quiz.roomCode,
      questionData
    });

    console.log("📤 Sent Q:", index + 1);

    // ⏱ WAIT → then next question
    const delay = (questionData.time + 3) * 1000;

    setTimeout(() => {
      runQuiz(index + 1);
    }, delay);
  };
  // --- Question Handlers ---
  const handleSaveQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingQuestionId) {
        // Edit existing
        await api.patch(`/quiz/questions/${quizId}/`, {
          questions: [
            {
              _id: editingQuestionId,
              ...questionFormData,
              options: questionFormData.options.map(opt => opt.text)
            }
          ]
        });
        toast.success('Question updated');
      } else {
        const formattedQuestion = {
          ...questionFormData,
          options: questionFormData.options.map(opt => opt.text),
        };

        await api.post(`/quiz/questions/${quizId}/`, {
          questions: [formattedQuestion],
        });
        toast.success('Question added');
      }
      setQuestionModalOpen(false);
      fetchQuiz();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteQuestions = async () => {
    if (selectedQuestionIds.size === 0) return;
    if (!window.confirm(`Delete ${selectedQuestionIds.size} questions?`)) return;
    try {
      await api.delete(`/quiz/questions/${quizId}/`, { data: { questionIds: Array.from(selectedQuestionIds) } });
      toast.success('Questions deleted');
      setSelectedQuestionIds(new Set());
      fetchQuiz();
    } catch (error) {
      console.error(error);
    }
  };

  const openQuestionModal = (q?: Question) => {
    if (q) {
      setEditingQuestionId(q._id || q.id || null);
      setQuestionFormData({
        question: q.question || '',
        options: q.options.map((opt: any) =>
          typeof opt === 'string' ? { text: opt } : opt
        ),
        correctOption: q.correctOption ?? 0,
        time: q.time ?? 30
      });
    } else {
      setEditingQuestionId(null);
      setQuestionFormData(emptyQuestion);
    }
    setQuestionModalOpen(true);
  };

  const toggleQuestionSelection = (id: string, isSelected: boolean) => {
    const newSet = new Set(selectedQuestionIds);
    if (isSelected) newSet.add(id);
    else newSet.delete(id);
    setSelectedQuestionIds(newSet);
  };

  // --- Cohost Handlers ---
  const handleAddCohost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/co-host/${quizId}/`, { coHostEmail: cohostEmail });
      toast.success('Invite sent to co-host');
      setCohostEmail('');
      setCohostModalOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className="flex h-64 justify-center items-center"><Loader2 className="w-10 h-10 animate-spin text-indigo-400" /></div>;
  if (!quiz) return null;

  return (
    <div>
      <div className="mb-4">
        <Link to="/dashboard" className="text-indigo-400 hover:text-indigo-800 flex items-center gap-2 font-medium w-fit">
          <ArrowLeft size={20} /> Back
        </Link>
      </div>

      <div className="bg-gray-900 rounded-2xl shadow-sm border border-gray-700 overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white flex justify-between items-start">
          <div>
            <div className="inline-block bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-bold border border-white/30 mb-3">
              Room Code: {quiz.roomCode}
            </div>
            <h1 className="text-3xl font-extrabold mb-2">{quiz.Title}</h1>
            <p className="text-indigo-100 max-w-2xl">{quiz.Description}</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setEditQuizModalOpen(true)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors" title="Edit Quiz">
              <Edit3 size={20} />
            </button>
            <button onClick={() => setCohostModalOpen(true)} className="p-2 bg-white/10 hover:bg-white/20 rounded-lg backdrop-blur-sm transition-colors" title="Manage Co-hosts">
              <Users size={20} />
            </button>
            <button onClick={handleDeleteQuiz} className="p-2 bg-red-500/80 hover:bg-red-500 rounded-lg backdrop-blur-sm transition-colors" title="Delete Quiz">
              <Trash2 size={20} />
            </button>
          </div>
        </div>
        <div className="bg-gray-950 p-4 flex gap-6 text-sm font-medium text-gray-300 border-t border-gray-800">
          <div>Questions: <span className="text-white font-bold">{questions.length}</span></div>
          {/* <div>Total Points: <span className="text-white font-bold">{questions.length * 10 || 0}</span></div> */}
          <div>Status: <span className={`px-2 py-0.5 rounded text-xs font-bold ${quiz.isPermanent ? 'bg-green-100 text-green-300' : 'bg-orange-900/50 text-orange-300'}`}>{quiz.isPermanent ? 'Permanent' : 'Scheduled'}</span></div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          Questions
        </h2>
        <div className="flex gap-3">
          {selectedQuestionIds.size > 0 && (
            <button onClick={handleDeleteQuestions} className="px-4 py-2 bg-red-900/30 text-red-400 font-bold rounded-lg hover:bg-red-100 flex items-center gap-2 transition-colors">
              <Trash2 size={18} /> Delete Selected ({selectedQuestionIds.size})
            </button>
          )}
          <button onClick={() => openQuestionModal()} className="px-4 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 flex items-center gap-2 transition-colors shadow-sm">
            <PlusCircle size={18} /> Add Question
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <button
          onClick={handleStartQuiz}
          disabled={isRunning || questions.length === 0}
          className="px-5 py-2.5 bg-green-600 text-white font-bold rounded-lg shadow-sm 
             hover:bg-green-700 active:scale-95 transition-all 
             disabled:opacity-50 disabled:cursor-not-allowed 
             flex items-center gap-2"
        >
          {isRunning ? "Quiz Running..." : " Start Quiz"}
        </button>
        {questions.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 rounded-2xl border border-dashed border-gray-600">
            <h3 className="text-lg font-bold text-white mb-1">No questions yet</h3>
            <p className="text-gray-400 mb-4">Start adding questions to your quiz!</p>

            <button onClick={() => openQuestionModal()} className="px-4 py-2 bg-indigo-900/30 text-indigo-300 font-bold rounded-lg hover:bg-indigo-100 transition-colors">
              Add First Question
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

      {/* MODALS */}
      <Modal isOpen={isEditQuizModalOpen} onClose={() => setEditQuizModalOpen(false)} title="Edit Quiz Settings">
        <form onSubmit={handleUpdateQuiz} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-200 mb-1">Title</label>
            <input required type="text" value={quizFormData.Title} onChange={e => setQuizFormData({ ...quizFormData, Title: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-200 mb-1">Description</label>
            <textarea value={quizFormData.Description} onChange={e => setQuizFormData({ ...quizFormData, Description: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700">Save Changes</button>
        </form>
      </Modal>

      <Modal isOpen={isCohostModalOpen} onClose={() => setCohostModalOpen(false)} title="Add Co-host">
        <form onSubmit={handleAddCohost} className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-200 mb-1">Co-host Email</label>
            <input required type="email" value={cohostEmail} onChange={e => setCohostEmail(e.target.value)} placeholder="colleague@example.com" className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700">Send Invite</button>
        </form>
      </Modal>

      <Modal isOpen={isQuestionModalOpen} onClose={() => setQuestionModalOpen(false)} title={editingQuestionId ? 'Edit Question' : 'Add Question'} maxWidth="max-w-2xl">
        <form onSubmit={handleSaveQuestion} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-200 mb-1">Question Text</label>
            <input required type="text" value={questionFormData.question} onChange={e => setQuestionFormData({ ...questionFormData, question: e.target.value })} className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium text-lg" placeholder="What is 2 + 2?" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {questionFormData.options.map((opt, i) => (
              <div key={i} className={`p-3 border-2 rounded-xl flex items-center gap-3 transition-colors ${questionFormData.correctOption === i ? 'border-green-500 bg-green-900/30' : 'border-gray-700'}`}>
                <input type="radio" name="correctOption" checked={questionFormData.correctOption === i} onChange={() => setQuestionFormData({ ...questionFormData, correctOption: i })} className="w-5 h-5 text-green-400" />
                <input required type="text" value={opt.text} onChange={e => {
                  const newOpts = [...questionFormData.options];
                  newOpts[i].text = e.target.value;
                  setQuestionFormData({ ...questionFormData, options: newOpts });
                }} className="flex-1 bg-transparent border-none outline-none font-medium" placeholder={`Option ${i + 1}`} />
              </div>
            ))}
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-200 mb-1">Time Limit (s)</label>
              <select
                value={questionFormData.time}
                onChange={e =>
                  setQuestionFormData(prev => ({
                    ...prev,
                    time: Number(e.target.value)
                  }))
                }
              >
                <option value="">Select Time</option>
                {[10, 20, 30, 60, 90, 120].map(t => (
                  <option key={t} value={t}>{t} seconds</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700">
            {editingQuestionId ? 'Update Question' : 'Add Question'}
          </button>
        </form>
      </Modal>

    </div>
  );
}
