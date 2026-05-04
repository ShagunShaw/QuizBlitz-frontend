import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function JoinQuiz() {
    const [input, setInput] = useState("");
    const navigate = useNavigate();

    const handleJoin = () => {
        const roomCode = input.trim();

        if (!roomCode) {
            alert("Enter a room code");
            return;
        }

        navigate(`/play/${roomCode}`);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4">
            <h1 className="text-3xl font-bold">Join Quiz</h1>

            <input
                type="text"
                placeholder="Enter Room Code"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="border px-4 py-2 rounded-lg"
            />

            <button
                onClick={handleJoin}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg"
            >
                Join
            </button>
        </div>
    );
}