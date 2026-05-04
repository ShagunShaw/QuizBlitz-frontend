import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Loader2, Calendar as CalendarIcon, Infinity, Clock } from 'lucide-react';
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
      const payload = {
        ...formData,
        startTime: formData.startTime
          ? new Date(formData.startTime).toISOString()
          : new Date().toISOString(),
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
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@400;500;600;700&display=swap');

        .cq-wrap {
          font-family: 'Outfit', sans-serif;
          max-width: 680px;
          margin: 0 auto;
          padding: 0 16px 80px;
        }

        /* ── Back link ── */
        .cq-back {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          color: #818cf8;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          margin-bottom: 28px;
          transition: color 0.2s, gap 0.2s;
        }
        .cq-back:hover { color: #a5b4fc; gap: 12px; }

        /* ── Card ── */
        .cq-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 24px;
          overflow: hidden;
        }

        /* ── Card header ── */
        .cq-header {
          position: relative;
          padding: 36px 40px 32px;
          background: linear-gradient(135deg, rgba(99,102,241,0.22) 0%, rgba(168,85,247,0.14) 100%);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          overflow: hidden;
        }
        .cq-header::before {
          content: '';
          position: absolute;
          top: -60px; right: -60px;
          width: 220px; height: 220px;
          border-radius: 50%;
          background: rgba(99,102,241,0.1);
          pointer-events: none;
        }
        .cq-header::after {
          content: '';
          position: absolute;
          bottom: -40px; left: 30%;
          width: 160px; height: 160px;
          border-radius: 50%;
          background: rgba(168,85,247,0.07);
          pointer-events: none;
        }
        .cq-header-label {
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #a5b4fc;
          margin-bottom: 10px;
        }
        .cq-header-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(26px, 5vw, 34px);
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          margin: 0 0 8px;
        }
        .cq-header-sub {
          font-size: 14px;
          color: #6b7280;
          margin: 0;
        }

        /* ── Form body ── */
        .cq-form {
          padding: 36px 40px;
          display: flex;
          flex-direction: column;
          gap: 28px;
        }

        /* ── Field ── */
        .cq-field { display: flex; flex-direction: column; gap: 8px; }

        .cq-label {
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #9ca3af;
        }
        .cq-label span {
          font-weight: 400;
          text-transform: none;
          letter-spacing: 0;
          color: #4b5563;
          font-size: 12px;
        }

        .cq-input,
        .cq-textarea {
          width: 100%;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          padding: 14px 16px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: #e8eaf0;
          outline: none;
          transition: border-color 0.2s, background 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
        }
        .cq-input::placeholder, .cq-textarea::placeholder { color: #374151; }
        .cq-input:focus, .cq-textarea:focus {
          border-color: rgba(99,102,241,0.5);
          background: rgba(99,102,241,0.05);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }
        .cq-input:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        /* datetime-local calendar icon color */
        .cq-input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(0.5);
          cursor: pointer;
        }

        .cq-textarea {
          resize: none;
          height: 100px;
          line-height: 1.6;
        }

        .cq-char-count {
          font-size: 11px;
          color: #374151;
          font-weight: 600;
          text-align: right;
          margin-top: -4px;
        }

        /* ── Two-col grid ── */
        .cq-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        @media (max-width: 560px) {
          .cq-grid { grid-template-columns: 1fr; }
          .cq-form { padding: 28px 24px; }
          .cq-header { padding: 28px 24px; }
        }

        /* ── Permanent toggle ── */
        .cq-toggle-wrap {
          display: flex;
          align-items: center;
          gap: 14px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 14px 16px;
          cursor: pointer;
          transition: border-color 0.2s;
          user-select: none;
        }
        .cq-toggle-wrap:hover { border-color: rgba(99,102,241,0.3); }

        .cq-toggle-track {
          position: relative;
          width: 44px;
          height: 24px;
          border-radius: 100px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.1);
          flex-shrink: 0;
          transition: background 0.25s, border-color 0.25s;
        }
        .cq-toggle-track.on {
          background: rgba(99,102,241,0.7);
          border-color: rgba(99,102,241,0.5);
        }
        .cq-toggle-thumb {
          position: absolute;
          top: 3px; left: 3px;
          width: 16px; height: 16px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.4);
          transition: transform 0.25s;
        }
        .cq-toggle-track.on .cq-toggle-thumb { transform: translateX(20px); }

        .cq-toggle-info { flex: 1; }
        .cq-toggle-title {
          font-size: 13px;
          font-weight: 600;
          color: #d1d5db;
          line-height: 1;
          margin-bottom: 3px;
        }
        .cq-toggle-sub {
          font-size: 11.5px;
          color: #4b5563;
        }
        .cq-toggle-icon {
          color: #6366f1;
          flex-shrink: 0;
        }

        /* ── Divider ── */
        .cq-divider {
          height: 1px;
          background: rgba(255,255,255,0.05);
          margin: 0 -40px;
        }
        @media (max-width: 560px) {
          .cq-divider { margin: 0 -24px; }
        }

        /* ── Submit button ── */
        .cq-submit {
          width: 100%;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          font-family: 'Outfit', sans-serif;
          font-size: 15px;
          font-weight: 700;
          padding: 16px 24px;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.25s;
          box-shadow: 0 4px 24px rgba(99,102,241,0.3);
          letter-spacing: 0.3px;
        }
        .cq-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(99,102,241,0.45);
        }
        .cq-submit:active:not(:disabled) { transform: translateY(0); }
        .cq-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>

      <div className="cq-wrap">
        {/* Back */}
        <Link to="/dashboard" className="cq-back">
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="cq-card"
        >
          {/* Header */}
          <div className="cq-header">
            <div className="cq-header-label">Quiz Builder</div>
            <h1 className="cq-header-title">Create New Quiz</h1>
            <p className="cq-header-sub">Set up the details for your live session.</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="cq-form">

            {/* Title */}
            <div className="cq-field">
              <label className="cq-label">Quiz Title <span>*</span></label>
              <input
                required
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="cq-input"
                placeholder="e.g. JavaScript Fundamentals"
              />
            </div>

            {/* Description */}
            <div className="cq-field">
              <label className="cq-label">
                Description <span>(max 150 chars)</span>
              </label>
              <textarea
                maxLength={150}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="cq-textarea"
                placeholder="Brief description of what the quiz covers…"
              />
              <div className="cq-char-count">{formData.description.length}/150</div>
            </div>

            {/* Grid: Start Time + Permanent */}
            <div className="cq-grid">
              <div className="cq-field">
                <label className="cq-label">Start Time</label>
                <input
                  type="datetime-local"
                  required={!formData.isPermanent}
                  disabled={formData.isPermanent}
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="cq-input"
                />
              </div>

              <div className="cq-field">
                <label className="cq-label">Availability</label>
                <div
                  className="cq-toggle-wrap"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      isPermanent: !formData.isPermanent,
                      startTime: !formData.isPermanent ? '' : formData.startTime,
                    })
                  }
                >
                  <div className={`cq-toggle-track ${formData.isPermanent ? 'on' : ''}`}>
                    <div className="cq-toggle-thumb" />
                  </div>
                  <div className="cq-toggle-info">
                    <div className="cq-toggle-title">
                      {formData.isPermanent ? 'Permanent' : 'Scheduled'}
                    </div>
                    <div className="cq-toggle-sub">
                      {formData.isPermanent ? 'Always open' : 'Opens at set time'}
                    </div>
                  </div>
                  {formData.isPermanent
                    ? <Infinity size={16} className="cq-toggle-icon" />
                    : <Clock size={16} className="cq-toggle-icon" />
                  }
                </div>
              </div>
            </div>

            <div className="cq-divider" />

            {/* Submit */}
            <button type="submit" disabled={loading} className="cq-submit">
              {loading
                ? <><Loader2 size={18} className="animate-spin" /> Creating…</>
                : 'Create Quiz →'
              }
            </button>

          </form>
        </motion.div>
      </div>
    </>
  );
}