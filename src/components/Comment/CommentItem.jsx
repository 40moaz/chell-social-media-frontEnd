import React from "react";
import { Link } from "react-router-dom";

const CommentItem = ({ comment, user, timeAgo, onDeleteComment, currentUserId }) => {
  return (
    <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm">
      <img
        src={user.profileImage || "https://placehold.co/40x40"}
        alt="User Avatar"
        className="w-10 h-10 rounded-full object-cover"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          
          <div className="relative group inline-block">
            <Link
              to={`/users/${user._id}`}
              className="font-semibold text-gray-800 hover:underline"
            >
              {user.fullName || "User"}
            </Link>

            {/* Hover card */}
            <div className="absolute z-50 hidden group-hover:flex flex-col bg-white border border-gray-200 shadow-lg rounded-lg p-4 min-w-[250px] bottom-full left-0 mt-0 transition-opacity duration-300 group-hover:opacity-100">
              <div className="flex items-center gap-3">
                <img
                  src={user.profileImage || "https://placehold.co/60x60?text=User"}
                  alt={user.fullName}
                  className="w-14 h-14 rounded-full object-cover border"
                />
                <div>
                  <Link
                    to={`/users/${user._id}`}
                    className="font-semibold text-gray-900"
                  >
                    {user.fullName || "User"}
                  </Link>
                  <p className="text-sm text-gray-500">@{user.username}</p>
                  <p className="text-sm text-gray-400">
                    Joined:{" "}
                    {user.createdAt
                      ? new Date(user.createdAt).toLocaleDateString()
                      : "N/A"}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex justify-between items-center">
                <button className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition">
                  Follow
                </button>
              </div>
            </div>
          </div>

          <span className="text-xs text-gray-500">
            {timeAgo}
          </span>
        </div>

        <p className="text-gray-700 mt-1">{comment.text}</p>
        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
          <button className="hover:underline">Like</button>
          <button className="hover:underline">Reply</button>
          {comment.userId === currentUserId && (
              <button
                className="text-red-600 text-sm hover:underline"
                onClick={() => onDeleteComment(comment._id)}
              >
                Delete
              </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
