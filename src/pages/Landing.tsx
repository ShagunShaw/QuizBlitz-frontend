import { useEffect, useRef, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Navigate, Link } from 'react-router-dom';

// ── Floating particle ──────────────────────────────────────────
function Particle({ style }: { style: React.CSSProperties }) {
  return <div className="particle" style={style} />;
}

// ── Animated counter ───────────────────────────────────────────
function Counter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const step = target / 60;
      const timer = setInterval(() => {
        start += step;
        if (start >= target) { setCount(target); clearInterval(timer); }
        else setCount(Math.floor(start));
      }, 16);
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

const FEATURES = [
  {
    icon: '⚡',
    title: 'Real-time battles',
    desc: 'Sub-100ms answer sync. Every player races on the same clock.',
  },
  {
    icon: '🏆',
    title: 'Live leaderboard',
    desc: 'Streak bonuses, speed scoring, top-7 podium after every question.',
  },
  {
    icon: '🎯',
    title: 'Smart analytics',
    desc: 'See per-option stats instantly. Know exactly where players struggled.',
  },
  {
    icon: '🔒',
    title: 'Cheat-proof',
    desc: 'Server-side timer, duplicate submission guard, auto-submit on expiry.',
  },
];

const TESTIMONIALS = [
  { name: 'Ritika S.', role: 'College Fest Organiser', text: '500 players, zero lag. The crowd went absolutely insane.' },
  { name: 'Arjun M.', role: 'High School Teacher', text: 'My students actually beg me to do quizzes now. That\'s new.' },
  { name: 'Priya K.', role: 'Corporate Trainer', text: 'Replaced our boring slide decks overnight. Engagement tripled.' },
];

export default function Landing() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1'}/auth/google/`;
  };

  const particles = Array.from({ length: 24 }, (_, i) => ({
    left: `${(i * 37 + 11) % 100}%`,
    top: `${(i * 53 + 7) % 100}%`,
    width: `${4 + (i % 5) * 3}px`,
    height: `${4 + (i % 5) * 3}px`,
    animationDelay: `${(i * 0.4) % 6}s`,
    animationDuration: `${6 + (i % 4) * 2}s`,
    opacity: 0.08 + (i % 4) * 0.06,
  }));

  return (
    <div className="qb-root">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Outfit:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .qb-root {
          font-family: 'Outfit', sans-serif;
          background: #080b14;
          color: #e8eaf0;
          min-height: 100vh;
          overflow-x: hidden;
        }

        .qb-root::before {
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

        .particle {
          position: fixed; border-radius: 50%; background: #6366f1;
          pointer-events: none; z-index: 0;
          animation: floatUp linear infinite;
        }
        @keyframes floatUp {
          0%   { transform: translateY(0px) scale(1); }
          50%  { transform: translateY(-40px) scale(1.2); }
          100% { transform: translateY(0px) scale(1); }
        }

        .content { position: relative; z-index: 1; }

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

        /* ── Logo matching dashboard style exactly ── */
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
        }
        .nav-logo:hover .logo-badge { transform: scale(1.05); }
        .logo-badge {
          background: #4f46e5;         /* indigo-600 */
          color: white;
          padding: 8px 10px;
          border-radius: 8px;          /* rounded-lg */
          font-weight: 700;            /* font-bold */
          font-size: 20px;             /* text-xl */
          line-height: 1;
          transition: transform 0.2s ease;
          font-family: 'Outfit', sans-serif;
        }
        .logo-text {
          font-weight: 800;            /* font-extrabold */
          font-size: 24px;             /* text-2xl */
          color: white;
          letter-spacing: -0.5px;     /* tracking-tight */
          font-family: 'Outfit', sans-serif;
          line-height: 1;
        }
        .logo-text .blitz { color: #818cf8; } /* indigo-400 */

        .nav-cta {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 100px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 20px rgba(99,102,241,0.3);
        }
        .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 8px 30px rgba(99,102,241,0.4); }

        /* ── HERO ── */
        .hero {
          min-height: 92vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 80px 24px 60px;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(99,102,241,0.12);
          border: 1px solid rgba(99,102,241,0.3);
          color: #a5b4fc;
          font-size: 13px;
          font-weight: 500;
          padding: 6px 16px;
          border-radius: 100px;
          margin-bottom: 32px;
          animation: fadeDown 0.6s ease both;
        }
        .badge-dot {
          width: 6px; height: 6px;
          background: #6366f1; border-radius: 50%;
          animation: pulse 2s ease infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.4)} }

        .hero-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(48px, 8vw, 96px);
          font-weight: 800;
          line-height: 1.02;
          letter-spacing: -2px;
          color: #fff;
          margin-bottom: 24px;
          animation: fadeDown 0.6s 0.1s ease both;
        }
        .hero-title .accent {
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          font-size: clamp(16px, 2vw, 20px);
          color: #6b7280;
          max-width: 520px;
          line-height: 1.7;
          margin-bottom: 48px;
          animation: fadeDown 0.6s 0.2s ease both;
          font-weight: 400;
        }
        .hero-actions {
          display: flex;
          gap: 14px;
          flex-wrap: wrap;
          justify-content: center;
          animation: fadeDown 0.6s 0.3s ease both;
        }
        .btn-primary {
          display: flex; align-items: center; gap: 10px;
          background: #fff; color: #0f172a;
          border: none; padding: 16px 32px; border-radius: 14px;
          font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 600;
          cursor: pointer; transition: all 0.25s;
          box-shadow: 0 4px 30px rgba(255,255,255,0.1);
        }
        .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(255,255,255,0.15); }
        .btn-primary img { width: 22px; height: 22px; }
        .btn-secondary {
          display: flex; align-items: center; gap: 8px;
          background: rgba(255,255,255,0.05); color: #e8eaf0;
          border: 1px solid rgba(255,255,255,0.1); padding: 16px 28px; border-radius: 14px;
          font-family: 'Outfit', sans-serif; font-size: 16px; font-weight: 500;
          cursor: pointer; transition: all 0.25s;
        }
        .btn-secondary:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); }

        /* ── MOCKUP ── */
        .hero-mockup {
          margin-top: 72px; width: 100%; max-width: 900px;
          animation: fadeUp 0.8s 0.4s ease both; position: relative;
        }
        .mockup-glow {
          position: absolute; inset: -40px;
          background: radial-gradient(ellipse at 50% 0%, rgba(99,102,241,0.2) 0%, transparent 70%);
          pointer-events: none;
        }
        .mockup-frame {
          background: rgba(15,18,30,0.9);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1);
        }
        .mockup-bar {
          background: rgba(255,255,255,0.03);
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding: 14px 20px; display: flex; align-items: center; gap: 8px;
        }
        .dot { width: 10px; height: 10px; border-radius: 50%; }
        .dot-r { background: #ff5f57; } .dot-y { background: #febc2e; } .dot-g { background: #28c840; }
        .mockup-body { padding: 32px; display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

        .q-card {
          background: rgba(99,102,241,0.08);
          border: 1px solid rgba(99,102,241,0.2);
          border-radius: 16px; padding: 24px; grid-column: 1 / -1;
        }
        .q-meta { font-size: 11px; color: #6366f1; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
        .q-text { font-family: 'Syne', sans-serif; font-size: 18px; color: #fff; font-weight: 700; }

        .opt {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px; padding: 14px 18px;
          display: flex; align-items: center; gap: 12px;
          font-size: 14px; color: #9ca3af;
        }
        .opt.selected { background: rgba(99,102,241,0.2); border-color: rgba(99,102,241,0.5); color: #a5b4fc; }
        .opt.correct  { background: rgba(34,197,94,0.15); border-color: rgba(34,197,94,0.4); color: #86efac; }
        .opt-letter {
          width: 26px; height: 26px; border-radius: 8px;
          background: rgba(255,255,255,0.08);
          display: flex; align-items: center; justify-content: center;
          font-size: 12px; font-weight: 700; flex-shrink: 0;
        }

        .lb-panel {
          background: rgba(168,85,247,0.06); border: 1px solid rgba(168,85,247,0.15);
          border-radius: 16px; padding: 20px;
        }
        .lb-title { font-size: 11px; color: #a855f7; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 14px; }
        .lb-row {
          display: flex; align-items: center; gap: 10px;
          padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13px;
        }
        .lb-row:last-child { border-bottom: none; }
        .lb-rank { font-size: 16px; width: 24px; }
        .lb-name { flex: 1; color: #e8eaf0; font-weight: 500; }
        .lb-pts { color: #a855f7; font-weight: 700; }

        .timer-bar-wrap { grid-column: 1 / -1; background: rgba(255,255,255,0.04); border-radius: 8px; height: 6px; overflow: hidden; }
        .timer-bar-fill {
          height: 100%; width: 62%;
          background: linear-gradient(90deg, #6366f1, #a855f7);
          border-radius: 8px; animation: shrink 8s linear infinite;
        }
        @keyframes shrink { from { width: 100%; } to { width: 5%; } }

        /* ── STATS ── */
        .stats {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 1px; background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px; overflow: hidden;
          max-width: 700px; margin: 80px auto 0;
        }
        .stat { background: #080b14; padding: 36px 24px; text-align: center; }
        .stat-num {
          font-family: 'Syne', sans-serif; font-size: 42px; font-weight: 800;
          background: linear-gradient(135deg, #fff, #a5b4fc);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; line-height: 1; margin-bottom: 6px;
        }
        .stat-label { font-size: 13px; color: #4b5563; font-weight: 500; }

        /* ── SECTIONS ── */
        .section { padding: 120px 24px; max-width: 1100px; margin: 0 auto; }
        .section-label { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px; color: #6366f1; margin-bottom: 16px; }
        .section-title {
          font-family: 'Syne', sans-serif; font-size: clamp(32px, 5vw, 52px);
          font-weight: 800; color: #fff; line-height: 1.1; margin-bottom: 60px; max-width: 600px;
        }

        .features-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        @media (max-width: 640px) { .features-grid { grid-template-columns: 1fr; } }

        .feature-card {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 32px; transition: all 0.3s; position: relative; overflow: hidden;
        }
        .feature-card::before {
          content: ''; position: absolute; inset: 0;
          background: radial-gradient(circle at 0% 0%, rgba(99,102,241,0.08) 0%, transparent 60%);
          opacity: 0; transition: opacity 0.3s;
        }
        .feature-card:hover { border-color: rgba(99,102,241,0.3); transform: translateY(-4px); }
        .feature-card:hover::before { opacity: 1; }
        .feature-icon { font-size: 32px; margin-bottom: 16px; }
        .feature-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 10px; }
        .feature-desc { font-size: 15px; color: #4b5563; line-height: 1.7; }

        .testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        @media (max-width: 768px) { .testimonials-grid { grid-template-columns: 1fr; } }

        .testi-card {
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.07);
          border-radius: 20px; padding: 28px;
        }
        .testi-quote { font-size: 40px; line-height: 1; color: rgba(99,102,241,0.3); font-family: 'Syne', sans-serif; margin-bottom: 12px; }
        .testi-text { font-size: 15px; color: #9ca3af; line-height: 1.7; margin-bottom: 20px; }
        .testi-author { display: flex; align-items: center; gap: 12px; }
        .testi-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          display: flex; align-items: center; justify-content: center;
          font-weight: 700; font-size: 14px; color: #fff; flex-shrink: 0;
        }
        .testi-name { font-size: 14px; font-weight: 600; color: #e8eaf0; }
        .testi-role { font-size: 12px; color: #4b5563; }

        .cta-section { padding: 120px 24px; text-align: center; position: relative; }
        .cta-glow {
          position: absolute; width: 600px; height: 400px;
          background: radial-gradient(ellipse, rgba(99,102,241,0.2) 0%, transparent 70%);
          left: 50%; top: 50%; transform: translate(-50%, -50%); pointer-events: none;
        }
        .cta-card {
          max-width: 680px; margin: 0 auto;
          background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.2);
          border-radius: 28px; padding: 64px 48px; position: relative; z-index: 1;
        }
        .cta-title { font-family: 'Syne', sans-serif; font-size: clamp(32px, 5vw, 52px); font-weight: 800; color: #fff; line-height: 1.1; margin-bottom: 16px; }
        .cta-sub { font-size: 17px; color: #6b7280; margin-bottom: 40px; line-height: 1.6; }

        .footer {
          border-top: 1px solid rgba(255,255,255,0.05); padding: 32px 48px;
          display: flex; align-items: center; justify-content: space-between;
          color: #374151; font-size: 13px;
        }

        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .nav { padding: 16px 24px; }
          .mockup-body { grid-template-columns: 1fr; }
          .stats { grid-template-columns: 1fr; }
          .footer { flex-direction: column; gap: 12px; text-align: center; }
          .cta-card { padding: 40px 24px; }
        }
        @media (max-width: 640px) {
          .hero { padding: 60px 20px 40px; }
          .section { padding: 80px 20px; }
        }
      `}</style>

      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
      {particles.map((p, i) => (
        <Particle key={i} style={{ left: p.left, top: p.top, width: p.width, height: p.height, animationDelay: p.animationDelay, animationDuration: p.animationDuration, opacity: p.opacity }} />
      ))}

      <div className="content">

        {/* ── NAV ── */}
        <nav className="nav">
          {/* ✅ Logo matches dashboard style exactly */}
          <Link to="/" className="nav-logo">
            <div className="logo-badge">QB</div>
            <span className="logo-text">
              Quiz<span className="blitz">Blitz</span>
            </span>
          </Link>
          <button className="nav-cta" onClick={handleGoogleLogin}>
            Get started free
          </button>
        </nav>

        {/* ── HERO ── */}
        <section className="hero">
          <div className="hero-badge">
            <span className="badge-dot" />
            Now with real-time leaderboards
          </div>

          <h1 className="hero-title">
            Quizzes that make<br />
            <span className="accent">people feel alive</span>
          </h1>

          <p className="hero-sub">
            Host live multiplayer quizzes with real-time scoring, streak bonuses, and a leaderboard that updates every second.
          </p>

          <div className="hero-actions">
            <button className="btn-primary" onClick={handleGoogleLogin}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
              Sign in with Google
            </button>
            <button className="btn-secondary">Watch demo ▶</button>
          </div>

          {/* Mockup */}
          <div className="hero-mockup">
            <div className="mockup-glow" />
            <div className="mockup-frame">
              <div className="mockup-bar">
                <div className="dot dot-r" /><div className="dot dot-y" /><div className="dot dot-g" />
                <span style={{ marginLeft: 12, fontSize: 12, color: '#374151' }}>quizblitz.live/play/A3X9F</span>
              </div>
              <div className="mockup-body">
                <div className="timer-bar-wrap"><div className="timer-bar-fill" /></div>
                <div className="q-card">
                  <div className="q-meta">Question 3 of 10 · 20s remaining</div>
                  <div className="q-text">Which planet has the most moons in our solar system?</div>
                </div>
                {[['A', 'Jupiter', false], ['B', 'Saturn', true], ['C', 'Uranus', false], ['D', 'Neptune', false]].map(([l, t, correct]) => (
                  <div key={l as string} className={`opt ${correct ? 'correct' : l === 'A' ? 'selected' : ''}`}>
                    <span className="opt-letter">{l}</span>
                    {t}
                    {correct && <span style={{ marginLeft: 'auto' }}>✓</span>}
                  </div>
                ))}
                <div className="lb-panel">
                  <div className="lb-title">🏆 Leaderboard</div>
                  {[['🥇', 'Riya S.', '1,240'], ['🥈', 'Arun K.', '1,190'], ['🥉', 'Meha D.', '1,050'], ['4.', 'You', '980']].map(([r, n, p]) => (
                    <div key={n as string} className="lb-row">
                      <span className="lb-rank">{r}</span>
                      <span className="lb-name" style={n === 'You' ? { color: '#a5b4fc', fontWeight: 600 } : {}}>{n}</span>
                      <span className="lb-pts">{p} pts</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="stats">
            <div className="stat"><div className="stat-num"><Counter target={12400} suffix="+" /></div><div className="stat-label">Quizzes hosted</div></div>
            <div className="stat"><div className="stat-num"><Counter target={340000} suffix="+" /></div><div className="stat-label">Players competed</div></div>
            <div className="stat"><div className="stat-num"><Counter target={98} suffix="%" /></div><div className="stat-label">Uptime SLA</div></div>
          </div>
        </section>

        {/* ── FEATURES ── */}
        <div className="section">
          <div className="section-label">Why QuizBlitz</div>
          <div className="section-title">Built for the moment everyone's watching</div>
          <div className="features-grid">
            {FEATURES.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-desc">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── TESTIMONIALS ── */}
        <div className="section" style={{ paddingTop: 0 }}>
          <div className="section-label">From the community</div>
          <div className="section-title">People who've felt the difference</div>
          <div className="testimonials-grid">
            {TESTIMONIALS.map((t) => (
              <div className="testi-card" key={t.name}>
                <div className="testi-quote">"</div>
                <div className="testi-text">{t.text}</div>
                <div className="testi-author">
                  <div className="testi-avatar">{t.name[0]}</div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA ── */}
        <div className="cta-section">
          <div className="cta-glow" />
          <div className="cta-card">
            <div className="cta-title">Ready to run your first quiz?</div>
            <div className="cta-sub">Free forever for small quizzes. No credit card needed.</div>
            <button className="btn-primary" onClick={handleGoogleLogin} style={{ margin: '0 auto' }}>
              <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" />
              Continue with Google
            </button>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <footer className="footer">
          <span>© 2025 QuizBlitz. All rights reserved.</span>
          <span>Built with ♥ for live audiences</span>
        </footer>
      </div>
    </div>
  );
}