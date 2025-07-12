// components/PostActions.jsx
import React, { useState } from "react";
import { FaThumbsUp, FaComment, FaShare } from "react-icons/fa";

export default function PostActions({ onLike, onComment, onShare }) {
  const [liked, setLiked] = useState(false);

  const toggleLike = () => {
    setLiked((prev) => !prev);
    onLike();
  };

  return (
    <div className="flex justify-around border-t border-gray-300 pt-2 mt-2 text-gray-600 text-sm select-none">
      <button
        onClick={toggleLike}
        className={`flex items-center justify-center space-x-2 py-2 hover:bg-gray-100 rounded ${
          liked ? "text-blue-600 font-semibold" : ""
        }`}
      >
        <FaThumbsUp />
        <span>Like</span>
      </button>

      <button
        onClick={onComment}
        className="flex items-center justify-center space-x-2 py-2 hover:bg-gray-100 rounded"
      >
        <FaComment />
        <span>Comment</span>
      </button>

      <button
        onClick={onShare}
        className="flex items-center justify-center space-x-2 py-2 hover:bg-gray-100 rounded"
      >
        <FaShare />
        <span>Share</span>
      </button>
    </div>
  );
}
