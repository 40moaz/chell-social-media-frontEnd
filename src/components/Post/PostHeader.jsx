import React from "react";
import { Link } from "react-router-dom";
import PostHoverCard from "./PostHoverCard";

const PostHeader = ({ post, postUsers, timeAgo }) => {
  const postUser = postUsers[post.userId] || {};
  const userProfileImage = postUser.profileImage || null;
  const fullName = postUser.fullName || "User";
  // const userId = postUser._id || "user";

  return (
    <div className="flex items-center mb-3 justify-between">
      <div className="flex items-center">
        {userProfileImage ? (
          <img
            src={userProfileImage}
            alt={fullName}
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold mr-3 text-lg select-none">
            {fullName.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          
          <PostHoverCard user={postUser} />

          <p className="text-xs text-gray-500">
            {timeAgo(post.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PostHeader;
