import React, { useState } from "react";
import { Link } from "react-router-dom";

const PostHoverCard = ({ user }) => {
  const [isHovering, setIsHovering] = useState(false);

  if (!user) return null;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <Link
        to={`/users/${user._id}`}
        className="font-semibold text-gray-900 hover:underline"
      >
        {user.fullName}
      </Link>

      {isHovering && (
        <div className="absolute z-50 flex flex-col bg-white border border-gray-200 shadow-lg rounded-lg p-4 min-w-[250px] top-full left-0 mt-1">
          <div className="flex items-center gap-3">
            <img
              src={user.profileImage || "https://placehold.co/60x60?text=User"}
              alt={user.fullName}
              className="w-14 h-14 rounded-full object-cover border"
            />
            <div>
              <Link to={`/users/${user._id}`} className="font-semibold text-gray-900">
                {user.fullName}
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
      )}
    </div>
  );
};

export default PostHoverCard;
