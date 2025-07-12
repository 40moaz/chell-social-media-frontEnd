import React from "react";
import CommentItem from "./CommentItem";

const CommentList = ({
  comments,
  users,
  timeAgo,
  currentUserId,
  onDeleteComment,
}) => {
  if (!comments.length)
    return <p className="mt-4 text-gray-500">No comments yet.</p>;

  return (
    <div className="mt-6 space-y-4">
      {comments.map((comment) => {
        const user = users[comment.userId] || {};
        return (
          <>
            <CommentItem
            currentUserId={currentUserId}
              key={comment._id}
              comment={comment}
              user={user}
              timeAgo={timeAgo}
              onDeleteComment={onDeleteComment}
            />
            
          </>
        );
      })}
    </div>
  );
};

export default CommentList;
