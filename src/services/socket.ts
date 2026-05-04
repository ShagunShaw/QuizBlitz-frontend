import { io, Socket } from "socket.io-client";

const URL = "http://localhost:3000";

export const socket: Socket = io(URL, {
    withCredentials: true,
    transports: ["websocket"],
    autoConnect: false,
});

// Connect
export const connectSocket = () => {
    if (!socket.connected) {
        socket.connect();
        console.log("🟢 Connected:", socket.id);
    }
};

// Disconnect
export const disconnectSocket = () => {
    if (socket.connected) {
        socket.disconnect();
        console.log("🔴 Disconnected");
    }
};

// Prevent duplicate listeners
export const resetSocketListeners = () => {
    socket.removeAllListeners();
};