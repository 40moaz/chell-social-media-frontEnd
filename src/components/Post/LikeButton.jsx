import React, { useEffect, useState } from "react";
import instance from "../../axios/instance";
import { toast } from "react-toastify";

const REACTIONS = [
  { label: "like", emoji: "👍" },
  { label: "love", emoji: "❤️" },
  { label: "haha", emoji: "😂" },
  { label: "wow", emoji: "😮" },
  { label: "sad", emoji: "😢" },
  { label: "angry", emoji: "😡" },
];
import { FaThumbsUp } from "react-icons/fa";

const LikeButton = ({ postId, currentUserId }) => {
  const [likes, setLikes] = useState([]);
  const [userReaction, setUserReaction] = useState(null);
  const [showReactions, setShowReactions] = useState(false);
  const longPressTimer = React.useRef(null);

  useEffect(() => {
    const fetchLikes = async () => {
      try {
        const res = await instance.get(`/likes/${postId}`);
        setLikes(res.data);
        const existing = res.data.find((l) => l.userId === currentUserId);
        if (existing) setUserReaction(existing.reaction);
      } catch (err) {
        console.log("Error fetching likes");
      }
    };
    fetchLikes();
  }, [postId, currentUserId]);

  const handleReaction = async (reaction) => {
    try {
      const existing = likes.find((l) => l.userId === currentUserId);
      if (existing) {
        if (existing.reaction === reaction) {
          await instance.delete("/likes", {
            data: { userId: currentUserId, postId },
          });
          setLikes((prev) => prev.filter((l) => l.userId !== currentUserId));
          setUserReaction(null);
        } else {
          await instance.delete("/likes", {
            data: { userId: currentUserId, postId },
          });
          const res = await instance.post("/likes", {
            userId: currentUserId,
            postId,
            reaction,
          });
          setLikes((prev) => [
            ...prev.filter((l) => l.userId !== currentUserId),
            res.data,
          ]);
          setUserReaction(reaction);
        }
      } else {
        const res = await instance.post("/likes", {
          userId: currentUserId,
          postId,
          reaction,
        });
        setLikes((prev) => [...prev, res.data]);
        setUserReaction(reaction);
      }
    } catch (err) {
      toast.error("Failed to react");
    }
  };

  const handleMouseEnter = () => {
    setShowReactions(true);
  };

  const handleMouseLeave = () => {
    setShowReactions(false);
  };

  const groupedReactions = REACTIONS.map((r) => {
    const count = likes.filter((l) => l.reaction === r.label).length;
    return { ...r, count };
  });

  const formatLikes = (num) => {
    if (num >= 1000000)
      return (num / 1000000).toFixed(1).replace(".0", "") + "M";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(".0", "") + "K";
    return num.toString();
  };
  useEffect(() => {
    return () => clearTimeout(longPressTimer.current);
  }, []);

  if (!postId || !currentUserId) return null;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={() => {
        longPressTimer.current = setTimeout(() => {
          setShowReactions(true);
        }, 600);
      }}
      onTouchEnd={() => {
        clearTimeout(longPressTimer.current);
        if (!showReactions) {
          handleReaction("like");
        }
      }}
    >
      {/* Main Button */}
      <div
        onClick={() => {
          if (userReaction === "like") {
            handleReaction("like");
          } else {
            handleReaction("like");
          }
        }}
        className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-md hover:bg-gray-100 transition"
      >
        <span className="text-xl">
          {REACTIONS.find((r) => r.label === userReaction)?.emoji || (
            <FaThumbsUp size={27} className="text-gray-400" />
          )}
        </span>
        <span className="text-gray-700 font-medium capitalize">
          {userReaction || "Like"}
        </span>
      </div>

      {showReactions && (
        <div className="absolute bottom-full left-0 flex gap-3 p-4 bg-white rounded-xl shadow-xl z-10 animate-bounce-in">
          {REACTIONS.map((r, index) => (
            <button
              key={r.label}
              onClick={() => handleReaction(r.label)}
              className={`text-2xl transition-transform transform hover:scale-125 duration-200 ${
                r.label === userReaction
                  ? "ring-2 ring-blue-500 rounded-full"
                  : ""
              }`}
              title={r.label}
              style={{
                animation: `popIn 0.2s ease ${index * 0.05}s forwards`,
                opacity: 0,
              }}
            >
              {r.emoji}
            </button>
          ))}
        </div>
      )}

      {/* Summary */}
      <div className="flex gap-2 text-xs text-gray-600 mt-1 flex-wrap">
        {groupedReactions
          .filter((r) => r.count > 0)
          .map((r) => (
            <div key={r.label} className="flex items-center gap-1">
              <span>{r.emoji}</span>
              <span>{formatLikes(r.count)}</span>
            </div>
          ))}
      </div>

      {/* Animation Styles */}
      <style jsx="true">{`
        @keyframes popIn {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-bounce-in {
          animation: bounce-in 0.25s ease-out;
        }
        @keyframes bounce-in {
          0% {
            transform: scale(0.9);
            opacity: 0;
          }
          60% {
            transform: scale(1.05);
            opacity: 1;
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
};

export default LikeButton;
