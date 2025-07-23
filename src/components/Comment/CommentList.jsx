import React from "react";
import CommentItem from "./CommentItem";
import moment from "moment";

const CommentList = ({
  comments,
  users,
  currentUserId,
  onDeleteComment,
  loading,
}) => {
  if (loading) {
    return (
      <div className="mt-4 text-center text-gray-500">
        <div className="w-6 h-6 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin inline-block"></div>
        <p className="mt-2">Loading comments...</p>
      </div>
    );
  }

  if (!comments.length)
    return <p className="mt-4 text-gray-500">No comments yet.</p>;

  return (
    <div className="mt-6 space-y-4">
      {comments.map((comment) => {
        const user = users[comment.userId] || {};
        return (
          <CommentItem
            currentUserId={currentUserId}
            key={comment._id}
            comment={comment}
            user={user}
            timeAgo={moment(comment.createdAt).fromNow()}
            onDeleteComment={onDeleteComment}
          />
        );
      })}
    </div>
  );
};

export default CommentList;
