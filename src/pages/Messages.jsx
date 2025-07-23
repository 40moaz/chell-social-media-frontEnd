// Messages.jsx
import { useEffect, useRef, useState } from "react";
import moment from "moment";
import {
  connectWebSocket,
  sendMessage,
  listenMessages,
  listenOnlineUsers,
  listenTyping,
  sendTyping,
} from "../socket/socket";
import { getMessages, sendMessageAPI, markAsSeen } from "../axios/messages";
import messageSound from "../assets/sounds/message.mp3";
import { FaPaperclip } from "react-icons/fa";
import { useParams, useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

const Messages = ({ currentUser, users = [] }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [onlineUserIds, setOnlineUserIds] = useState([]);
  const bottomRef = useRef(null);
  const notificationSound = useRef(null);
  const [unreadCounts, setUnreadCounts] = useState({});
  const { userId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (users.length > 0 && userId) {
      const targetUser = users.find((u) => u._id === userId);
      if (targetUser) {
        setSelectedUser(targetUser);
      } else {
        navigate("/messages");
      }
    }
  }, [users, userId, navigate]);

  useEffect(() => {
    if (currentUser) connectWebSocket(currentUser._id);
  }, [currentUser]);

  useEffect(() => {
    notificationSound.current = new Audio(messageSound);
  }, []);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (!currentUser || !selectedUser) return;
        const res = await getMessages(currentUser._id, selectedUser._id);
        setMessages(res.data);
      } catch (err) {
        console.error("❌ Error fetching messages", err);
      }
    };
    if (currentUser && selectedUser) fetchMessages();
  }, [currentUser, selectedUser]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (currentUser && selectedUser) {
        getMessages(currentUser._id, selectedUser._id).then((res) =>
          setMessages(res.data)
        );
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [currentUser, selectedUser]);

  useEffect(() => {
    listenMessages((message) => {
      if (!currentUser) return;

      const isCurrentChat = selectedUser && selectedUser._id === message.sender;

      if (
        message.receiver === currentUser._id &&
        (!selectedUser || selectedUser._id !== message.sender)
      ) {
        setUnreadCounts((prev) => ({
          ...prev,
          [message.sender]: (prev[message.sender] || 0) + 1,
        }));
        notificationSound.current?.play().catch(() => {});
        return;
      }

      setMessages((prev) => [...prev, message]);

      if (
        isCurrentChat &&
        message.receiver === currentUser._id &&
        !message.seen
      ) {
        markAsSeen(message._id);
      }
    });

    listenTyping((senderId) => {
      if (selectedUser && senderId === selectedUser._id) {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }
    });

    listenOnlineUsers((ids) => setOnlineUserIds(ids));
  }, [currentUser, selectedUser]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const markUnseenMessages = async () => {
      if (!currentUser || !selectedUser) return;
      const unseenMsgs = messages.filter(
        (msg) =>
          msg.receiver === currentUser._id &&
          msg.sender === selectedUser._id &&
          !msg.seen
      );
      for (const msg of unseenMsgs) {
        await markAsSeen(msg._id);
      }

      if (unseenMsgs.length > 0) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.receiver === currentUser._id &&
            msg.sender === selectedUser._id &&
            !msg.seen
              ? { ...msg, seen: true }
              : msg
          )
        );
      }
    };

    if (messages.length > 0 && selectedUser) {
      markUnseenMessages();
    }
  }, [messages, currentUser, selectedUser]);

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    navigate(`/messages/${user._id}`);

    setUnreadCounts((prev) => {
      const updated = { ...prev };
      delete updated[user._id];
      return updated;
    });

    if (currentUser) {
      const unseenMsgs = messages.filter(
        (msg) =>
          msg.sender === user._id &&
          msg.receiver === currentUser._id &&
          !msg.seen
      );
      for (const msg of unseenMsgs) {
        await markAsSeen(msg._id);
      }
      setMessages((prev) =>
        prev.map((msg) =>
          msg.sender === user._id && msg.receiver === currentUser._id
            ? { ...msg, seen: true }
            : msg
        )
      );
    }
  };

  const handleSend = async () => {
    if (!content.trim() || !selectedUser || !currentUser) return;
    const newMessage = {
      sender: currentUser._id,
      receiver: selectedUser._id,
      content,
    };
    setMessages((prev) => [...prev, { ...newMessage, createdAt: new Date() }]);
    sendMessage(newMessage);
    await sendMessageAPI(newMessage);
    setContent("");
  };

  const handleTyping = () => {
    sendTyping(currentUser._id);
  };
  return (
    <div className="h-[85vh] border rounded-lg shadow overflow-hidden bg-white">
      <BackButton onClick={() => navigate(-1)} />

      {userId ? (
        <div className="flex flex-col h-full">
          <div className="px-4 py-3 border-b bg-white font-semibold text-lg flex items-center gap-4">
            <BackButton onClick={() => navigate(-1)} />
            <span className="text-blue-600">{selectedUser?.fullName}</span>
            {isTyping && (
              <span className="ml-2 text-sm text-gray-400">typing...</span>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
            {(() => {
              const firstUnreadIndex = messages.findIndex(
                (msg) =>
                  msg.sender === selectedUser?._id &&
                  msg.receiver === currentUser._id &&
                  !msg.seen
              );
              return messages.map((msg, i) => {
                const isMine = msg.sender === currentUser._id;
                const showUnreadDivider = i === firstUnreadIndex;

                return (
                  <div key={i}>
                    {showUnreadDivider && (
                      <div className="text-center text-xs text-gray-500 my-2">
                        ـــ New Unread Messages ـــ
                      </div>
                    )}
                    <div
                      className={`w-full flex ${
                        isMine ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`mb-2 px-4 py-2 rounded-lg max-w-[70%] text-sm text-white ${
                          isMine ? "bg-green-500" : "bg-gray-500"
                        }`}
                      >
                        <div>{msg.content}</div>
                        <div className="text-[10px] text-gray-200 mt-1 flex justify-between">
                          <span>{moment(msg.createdAt).calendar()}</span>
                          {msg.seen && isMine && (
                            <span className="text-blue-200 ml-2">✓ Seen</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              });
            })()}

            <div ref={bottomRef} />
          </div>

          <div className="border-t bg-white px-4 py-2 flex items-center gap-2">
            <button className="text-gray-500">
              <FaPaperclip />
            </button>
            <input
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                handleTyping();
              }}
              placeholder="type your message..."
              className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm"
            />
            <button
              onClick={handleSend}
              className="bg-green-600 text-white text-sm px-4 py-2 rounded-lg"
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <div className="h-full overflow-y-auto">
          <div className="p-4 text-center text-xl font-semibold text-gray-800 border-b">
            💬 Chats
          </div>
          {(users || []).map((user) => {
            const hasUnread = unreadCounts[user._id] > 0;

            return (
              <div
                key={user._id}
                onClick={() => handleSelectUser(user)}
                className={`relative flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200 ${
                  selectedUser && selectedUser._id === user._id
                    ? "bg-green-100"
                    : "hover:bg-gray-100"
                }`}
              >
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt="avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm uppercase">
                    {user.fullName?.charAt(0)}
                  </div>
                )}

                <div className="flex flex-col">
                  <span className="font-medium text-gray-800">
                    {user.fullName}
                  </span>
                  <span className="text-sm text-gray-500">
                    @{user.username}
                  </span>
                  <span className="text-xs text-green-600">
                    {onlineUserIds.includes(user._id) ? "🟢 Online" : "Offline"}
                  </span>
                </div>

                {hasUnread && (
                  <span className="absolute right-4 top-4 w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ✅ الصوت */}
      <div style={{ display: "none" }}>
        <audio ref={notificationSound} src={messageSound} preload="auto" />
      </div>
    </div>
  );
};

export default Messages;
