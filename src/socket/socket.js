let socket;
let messageCallback = null;
let onlineUsersCallback = null;
let typingCallback = null;

export const connectWebSocket = (userId) => {
  socket = new WebSocket(
    "wss://chell-social-media-backend-production.up.railway.app/"
  );

  console.log("🔌 Connecting to WebSocket...");

  const waitForSocketConnection = (callback) => {
    const interval = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        clearInterval(interval);
        callback();
      }
    }, 50);
  };

  waitForSocketConnection(() => {
    console.log("✅ WebSocket connected");
    socket.send(JSON.stringify({ type: "join", userId }));
  });

  socket.onclose = () => {
    console.log("❌ WebSocket disconnected");
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);

    if (data.type === "receive-message" && messageCallback) {
      messageCallback(data.message);
    }

    if (data.type === "online-users" && onlineUsersCallback) {
      onlineUsersCallback(data.users);
    }

    if (data.type === "typing" && typingCallback) {
      typingCallback(data.userId);
    }
  };

  socket.onerror = (err) => {
    console.error("❗ WebSocket error:", err);
  };
};

export const sendMessage = (data) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: "send-message", ...data }));
  }
};

export const sendTyping = (userId) => {
  if (socket && socket.readyState === WebSocket.OPEN) {
    socket.send(JSON.stringify({ type: "typing", userId }));
  }
};

export const listenMessages = (callback) => {
  messageCallback = callback;
};

export const listenOnlineUsers = (callback) => {
  onlineUsersCallback = callback;
};

export const listenTyping = (callback) => {
  typingCallback = callback;
};
