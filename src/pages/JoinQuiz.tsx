import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export default function JoinQuiz() {
    const [input, setInput] = useState("");
    const navigate = useNavigate();

    const handleJoin = () => {
        const roomCode = input.trim();
        if (!roomCode) return;
        navigate(`/play/${roomCode}`);
    };

    return (
        <div className="qj-root">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .qj-root {
          font-family: 'Outfit', sans-serif;
          background: #080b14;
          color: #e8eaf0;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
        }

        .qj-root::before {
          content: '';
          position: fixed;
          inset: 0;
          background-image:
            linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px);
          background-size: 60px 60px;
          pointer-events: none;
          z-index: 0;
        }

        .orb { position: fixed; border-radius: 50%; filter: blur(100px); pointer-events: none; z-index: 0; }
        .orb-1 { width: 600px; height: 600px; background: rgba(99,102,241,0.15); top: -200px; left: -200px; }
        .orb-2 { width: 500px; height: 500px; background: rgba(168,85,247,0.10); top: 30%; right: -150px; }
        .orb-3 { width: 400px; height: 400px; background: rgba(236,72,153,0.08); bottom: 0; left: 30%; }

        /* ── NAV ── */
        .nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 48px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          backdrop-filter: blur(12px);
          position: sticky;
          top: 0;
          z-index: 100;
          background: rgba(8,11,20,0.7);
        }
        .nav-logo {
          display: flex; align-items: center; gap: 8px; text-decoration: none;
        }
        .nav-logo:hover .logo-badge { transform: scale(1.05); }
        .logo-badge {
          background: #4f46e5; color: white;
          padding: 8px 10px; border-radius: 8px;
          font-weight: 700; font-size: 20px; line-height: 1;
          transition: transform 0.2s ease;
        }
        .logo-text {
          font-weight: 800; font-size: 24px; color: white;
          letter-spacing: -0.5px; line-height: 1;
        }
        .logo-text .blitz { color: #818cf8; }

        /* ── MAIN ── */
        .qj-main {
          position: relative; z-index: 1;
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 60px 24px;
        }

        .qj-card {
          width: 100%;
          max-width: 460px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 28px;
          padding: 48px 40px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 32px;
        }

        .qj-icon-wrap {
          width: 72px; height: 72px; border-radius: 20px;
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.25);
          display: flex; align-items: center; justify-content: center;
          font-size: 32px;
        }

        .qj-heading {
          display: flex; flex-direction: column; gap: 10px;
        }
        .qj-title {
          font-family: 'Syne', sans-serif;
          font-size: 32px; font-weight: 800;
          color: #fff; line-height: 1.1;
        }
        .qj-sub {
          font-size: 15px; color: #6b7280; line-height: 1.6;
        }

        .qj-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .qj-input {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 14px;
          padding: 16px 20px;
          font-family: 'Outfit', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #fff;
          text-align: center;
          letter-spacing: 4px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .qj-input::placeholder {
          color: #374151;
          letter-spacing: 3px;
          font-weight: 400;
          font-size: 16px;
        }
        .qj-input:focus {
          border-color: rgba(99,102,241,0.5);
          box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
        }

        .qj-btn {
          width: 100%;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white; border: none;
          padding: 16px 32px; border-radius: 14px;
          font-family: 'Outfit', sans-serif;
          font-size: 16px; font-weight: 700;
          cursor: pointer;
          transition: all 0.25s;
          box-shadow: 0 4px 20px rgba(99,102,241,0.3);
        }
        .qj-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(99,102,241,0.4);
        }
        .qj-btn:disabled {
          opacity: 0.4; cursor: not-allowed;
        }

        .qj-back {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 500; color: #4b5563;
          text-decoration: none;
          transition: color 0.2s;
        }
        .qj-back:hover { color: #818cf8; }

        @media (max-width: 480px) {
          .nav { padding: 16px 20px; }
          .qj-card { padding: 36px 24px; }
          .qj-title { font-size: 26px; }
        }
      `}</style>

            <div className="orb orb-1" />
            <div className="orb orb-2" />
            <div className="orb orb-3" />

            <nav className="nav">
                <Link to="/" className="nav-logo">
                    <div className="logo-badge">QB</div>
                    <span className="logo-text">Quiz<span className="blitz">Blitz</span></span>
                </Link>
            </nav>

            <main className="qj-main">
                <div className="qj-card">
                    <div className="qj-icon-wrap">🎮</div>

                    <div className="qj-heading">
                        <h1 className="qj-title">Join Quiz</h1>
                        <p className="qj-sub">Enter the room code your host shared with you to jump in instantly.</p>
                    </div>

                    <div className="qj-form">
                        <input
                            className="qj-input"
                            type="text"
                            placeholder="a3x9f2bc"
                            value={input}
                            maxLength={8}
                            onChange={(e) => setInput(e.target.value.toLowerCase())}
                            onKeyDown={(e) => e.key === 'Enter' && input.trim() && handleJoin()}
                            autoFocus
                        />
                        <button
                            className="qj-btn"
                            onClick={handleJoin}
                            disabled={!input.trim()}
                        >
                            Join Room →
                        </button>
                    </div>

                    <Link to="/" className="qj-back">← Back to home</Link>
                </div>
            </main>
        </div>
    );
}