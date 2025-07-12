// src/components/UserCard.jsx
import { Link } from "react-router-dom";

const UserCard = ({ user, timeAgo, extraContent, showTime = false }) => {
  if (!user) return null;

  const { fullName = "User", profileImage, username, _id, createdAt } = user;

  return (
    <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-sm">
      <img
        src={profileImage || "https://placehold.co/40x40"}
        alt={fullName}
        className="w-10 h-10 rounded-full object-cover"
      />

      <div className="flex-1">
        <div className="flex items-center justify-between">
          <Link to={`/users/${_id}`} className="font-semibold text-gray-800 hover:underline">
            {fullName}
          </Link>

          {showTime && (
            <span className="text-xs text-gray-500">
              {typeof timeAgo === "function"
                ? timeAgo(createdAt)
                : timeAgo || ""}
            </span>
          )}
        </div>

        {username && (
          <p className="text-sm text-gray-500">@{username}</p>
        )}

        {extraContent && <div className="mt-2">{extraContent}</div>}
      </div>
    </div>
  );
};

export default UserCard;
