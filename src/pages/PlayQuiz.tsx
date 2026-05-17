import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { socket, connectSocket } from "../services/socket";

export default function PlayQuiz() {
    const { roomCode } = useParams();

    const [status, setStatus] = useState<"waiting" | "started">("waiting");
    const [currentQuestion, setCurrentQuestion] = useState<any>(null);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [submitted, setSubmitted] = useState(false);
    const [scoreboard, setScoreboard] = useState<any>(null);
    const [attendeeCount, setAttendeeCount] = useState(0);
    const [timer, setTimer] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const [username, setUsername] = useState("");
    const [hasJoined, setHasJoined] = useState(false);
    const [endsAt, setEndsAt] = useState<number | null>(null);
    const [finalLeaderboard, setFinalLeaderboard] = useState<any>(null);

    // ── Join room ──────────────────────────────────────────────
    const handleJoin = () => {
        if (!username.trim() || !roomCode) return;

        connectSocket();

        socket.emit("attendeeJoinRoom", {
            roomCode,
            username,
        });

        setHasJoined(true);
    };

    // ── Receive events ─────────────────────────────────────────
    useEffect(() => {
        socket.on("newQuestion", (question) => {
            setStatus("started");
            setCurrentQuestion(question);
            setSelectedOption(null);
            setSubmitted(false);
            setScoreboard(null);

            setEndsAt(question.endsAt);

            const remaining = Math.max(
                0,
                Math.ceil((question.endsAt - Date.now()) / 1000)
            );

            setTimer(remaining);
        });

        socket.on("displayScoreBoard", (data) => {
            setScoreboard(data);
        });

        socket.on("AttendeeCount", ({ attendeeCount }: { attendeeCount: number }) => {
            setAttendeeCount(attendeeCount);
        });

        socket.on("quizEnded", (data) => {
            setFinalLeaderboard(data);
        });

        return () => {
            socket.off("newQuestion");
            socket.off("displayScoreBoard");
            socket.off("AttendeeCount");
        };
    }, []);

    // ── Synced Timer Countdown ───────────────────────────────────────
    useEffect(() => {
        if (!endsAt) return;

        timerRef.current = setInterval(() => {
            const remaining = Math.max(
                0,
                Math.ceil((endsAt - Date.now()) / 1000)
            );

            setTimer(remaining);

            if (remaining <= 0) {
                clearInterval(timerRef.current!);
            }
        }, 250);

        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [endsAt]);

    // ── Auto-submit when timer reaches 0 ──────────────────────
    useEffect(() => {
        if (timer === 0 && status === "started" && !submitted && currentQuestion) {
            socket.emit("submitAnswer", {
                roomCode,
                optionIndex: null,
                userName: username,
                isAutoSubmit: true,
            });
            setSubmitted(true);
        }
    }, [timer, status, submitted, currentQuestion, roomCode]);

    // ── Submit answer ──────────────────────────────────────────
    const handleSubmit = () => {
        if (selectedOption === null || !roomCode || submitted) return;

        socket.emit("submitAnswer", {
            roomCode,
            // FIX: DB stores correctOption as 0-based index, so send as-is (no + 1)
            optionIndex: selectedOption,
            userName: username,
            isAutoSubmit: false,
        });

        setSubmitted(true);
    };

    if (!hasJoined) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-950">
                <div className="bg-gray-900 p-6 rounded-2xl w-full max-w-md">
                    <h1 className="text-white text-2xl font-bold mb-4">
                        Enter Username
                    </h1>

                    <input
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Username"
                        className="w-full p-3 rounded-xl bg-gray-800 text-white mb-4"
                    />

                    <button
                        onClick={handleJoin}
                        className="w-full bg-indigo-600 text-white p-3 rounded-xl"
                    >
                        Join Quiz
                    </button>
                </div>
            </div>
        );
    }

    return (

        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-950">

            {/* ── WAITING ───────────────────────────────────── */}
            {status === "waiting" && (
                <div className="text-center space-y-3">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent
                                    rounded-full animate-spin mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-100">Waiting for host...</h1>
                    <p className="text-gray-400">
                        Room Code: <span className="font-mono font-bold text-indigo-400">{roomCode}</span>
                    </p>
                    <p className="text-sm text-gray-400">
                        {attendeeCount} player{attendeeCount !== 1 ? "s" : ""} joined
                    </p>
                </div>
            )}

            {/* ── QUIZ ──────────────────────────────────────── */}
            {status === "started" && currentQuestion && !scoreboard && (
                <div className="w-full max-w-xl">

                    {/* Timer */}
                    <div className="bg-gray-900 rounded-2xl shadow-md p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-semibold text-gray-400">Time Left</span>
                            <span className={`text-lg font-bold ${timer <= 5 ? "text-red-500" : "text-indigo-400"
                                }`}>
                                {timer}s
                            </span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-1000 ease-linear ${timer <= 5 ? "bg-red-500" : "bg-indigo-500"
                                    }`}
                                style={{ width: `${(timer / (currentQuestion.time || 30)) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Question */}
                    <div className="bg-gray-900 rounded-2xl shadow-md p-6 mb-6 text-center">
                        <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">
                            Question {currentQuestion.questionNo}
                        </span>
                        <h2 className="text-xl font-bold text-gray-100 mt-2">
                            {currentQuestion.question}
                        </h2>
                    </div>

                    {/* Options */}
                    <div className="flex flex-col gap-3 mb-6">
                        {currentQuestion.options.map((opt: string, i: number) => (
                            <button
                                key={i}
                                onClick={() => !submitted && setSelectedOption(i)}
                                disabled={submitted}
                                className={`w-full px-5 py-3 rounded-xl border-2 font-medium text-left
                                    transition-all duration-150
                                    ${submitted ? "cursor-not-allowed opacity-70" : "cursor-pointer"}
                                    ${selectedOption === i
                                        ? "bg-indigo-600 border-indigo-600 text-white shadow-md"
                                        : "bg-gray-900 border-gray-700 text-gray-200 hover:border-indigo-300 hover:bg-indigo-900/50"
                                    }`}
                            >
                                <span className="inline-flex items-center justify-center
                                                 w-6 h-6 rounded-full text-xs font-bold mr-3
                                                 bg-white/20 border border-current">
                                    {String.fromCharCode(65 + i)}
                                </span>
                                {opt}
                            </button>
                        ))}
                    </div>

                    {/* Submit */}
                    <button
                        onClick={handleSubmit}
                        disabled={selectedOption === null || submitted}
                        className={`w-full py-3 rounded-xl font-bold text-white transition-all duration-200
                            ${submitted
                                ? "bg-green-500 cursor-not-allowed"
                                : selectedOption === null
                                    ? "bg-gray-300 cursor-not-allowed"
                                    : "bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg"
                            }`}
                    >
                        {submitted ? "✓ Answer Submitted" : "Submit Answer"}
                    </button>

                    {submitted && (
                        <p className="text-center text-sm text-gray-400 mt-3">
                            Waiting for results...
                        </p>
                    )}
                </div>
            )}

            {/* ── SCOREBOARD ────────────────────────────────── */}
            {scoreboard && (
                <div className="w-full max-w-xl space-y-4">

                    {/* Correct answer banner */}
                    <div className="bg-gray-900 rounded-2xl shadow-md p-5 text-center">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            Correct Answer
                        </p>
                        <p className="text-2xl font-bold text-green-400">
                            {/* FIX: correctOption is 0-based → A=0, B=1, C=2 */}
                            Option {String.fromCharCode(65 + scoreboard.correctOption)}
                            {currentQuestion?.options?.[scoreboard.correctOption] && (
                                <span className="block text-base font-medium text-gray-300 mt-1">
                                    {/* FIX: was [correctOption - 1], now just [correctOption] */}
                                    {currentQuestion.options[scoreboard.correctOption]}
                                </span>
                            )}
                        </p>

                        {/* Your answer result */}
                        {selectedOption !== null && (
                            <p className={`text-sm mt-2 font-semibold ${selectedOption === scoreboard.correctOption
                                ? "text-green-400"
                                : "text-red-500"
                                }`}>
                                {/* FIX: compare selectedOption directly (both 0-based now) */}
                                {selectedOption === scoreboard.correctOption
                                    ? "✓ You got it right!"
                                    : "✗ Your answer was wrong"}
                            </p>
                        )}
                    </div>

                    {/* Your score */}
                    <div className="bg-indigo-600 rounded-2xl shadow-md p-5 text-center text-white">
                        <p className="text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-1">
                            Your Score
                        </p>
                        <p className="text-4xl font-bold">{scoreboard.userscore}</p>
                    </div>

                    {/* Option stats bar chart */}
                    {scoreboard.optionStats && Object.keys(scoreboard.optionStats).length > 0 && (
                        <div className="bg-gray-900 rounded-2xl shadow-md p-5">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                How everyone answered
                            </p>
                            <div className="space-y-2">
                                {currentQuestion?.options?.map((_: string, i: number) => {
                                    const pct = scoreboard.optionStats[i.toString()] ?? 0;
                                    // FIX: compare i directly against 0-based correctOption
                                    const isCorrect = i === scoreboard.correctOption;
                                    return (
                                        <div key={i} className="flex items-center gap-3">
                                            <span className="text-xs font-bold text-gray-400 w-5">
                                                {String.fromCharCode(65 + i)}
                                            </span>
                                            <div className="flex-1 bg-gray-800 rounded-full h-5 overflow-hidden">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-700 ${isCorrect ? "bg-green-500" : "bg-gray-300"
                                                        }`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                            <span className="text-xs font-semibold text-gray-400 w-8 text-right">
                                                {pct}%
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Top 7 leaderboard */}
                    {scoreboard.top7?.length > 0 && (
                        <div className="bg-gray-900 rounded-2xl shadow-md p-5">
                            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                                Leaderboard
                            </p>
                            <div className="space-y-2">
                                {scoreboard.top7.map((name: string, i: number) => {
                                    const medals = ["🥇", "🥈", "🥉"];
                                    const isMe = name === username;
                                    return (
                                        <div
                                            key={i}
                                            className={`flex items-center justify-between px-4 py-2 rounded-xl
                                                ${isMe
                                                    ? "bg-indigo-900/30 border border-indigo-800"
                                                    : "bg-gray-950"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <span className="text-base w-6 text-center">
                                                    {medals[i] ?? `${i + 1}.`}
                                                </span>
                                                <span className={`text-sm font-semibold ${isMe ? "text-indigo-300" : "text-gray-200"
                                                    }`}>
                                                    {name} {isMe && "(You)"}
                                                </span>
                                            </div>
                                            <span className="text-sm font-bold text-gray-400">
                                                {scoreboard.topPoints[i]} pts
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* See from hostControlpanel and then fix, but do fix it */}
                    <p className="text-center text-sm text-gray-400 pb-4">
                        {finalLeaderboard
                            ? "Quiz Finished"
                            : scoreboard?.questionNo === scoreboard?.totalQuestions
                                ? "All Questions are ended"
                                : "Waiting for host to proceed..."
                        }
                    </p>
                </div>
            )}

            {/* ── FINAL LEADERBOARD ───────────────────────────── */}
            {finalLeaderboard && (
                <div className="fixed inset-0 bg-gray-950 flex items-center justify-center px-4 z-50">

                    <div className="w-full max-w-2xl bg-gray-900 rounded-3xl shadow-2xl p-8">

                        {/* Heading */}
                        <div className="text-center mb-8">
                            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-[0.2em] mb-2">
                                Quiz Finished
                            </p>

                            <h1 className="text-4xl font-bold text-white">
                                Final Leaderboard
                            </h1>
                        </div>

                        {/* Leaderboard */}
                        <div className="space-y-3">
                            {finalLeaderboard.finalTop7.map((name: string, i: number) => {

                                const medals = ["🥇", "🥈", "🥉"];
                                const isMe = name === username;

                                return (
                                    <div
                                        key={i}
                                        className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all
                                ${isMe
                                                ? "bg-indigo-600/20 border border-indigo-500"
                                                : "bg-gray-950 border border-gray-800"
                                            }`}
                                    >

                                        <div className="flex items-center gap-4">

                                            <div className="text-2xl w-10 text-center">
                                                {medals[i] ?? `#${i + 1}`}
                                            </div>

                                            <div>
                                                <p className={`font-bold text-lg ${isMe
                                                    ? "text-indigo-300"
                                                    : "text-white"
                                                    }`}>
                                                    {name} {isMe && "(You)"}
                                                </p>

                                                <p className="text-sm text-gray-400">
                                                    Rank {i + 1}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <p className="text-2xl font-bold text-white">
                                                {finalLeaderboard.finalTopPoints[i]}
                                            </p>

                                            <p className="text-xs text-gray-400 uppercase">
                                                Points
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}