import React, { useEffect, useState } from "react";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";
import PostHeader from "../Post/PostHeader";
import PostActions from "../Post/PostActions";
import instance from "../../axios/instance";
import { toast } from "react-toastify";
import { confirmAlert } from "react-confirm-alert";
import moment from "moment";
import PostFiles from "../Post/PostFiles";
const CommentModal = ({
  post,
  onClose,
  onShare,
  onAddComment,
  postUsers,
  currentUserId,
  currentUser,
  setModalImage
}) => {
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);
  const [commentUsers, setCommentUsers] = useState({});

  const handleDeleteComment = (commentId) => {
    confirmAlert({
      title: "Delete Comment",
      message: "Are you sure you want to delete this comment?",
      buttons: [
        {
          label: "Yes, delete it",
          onClick: async () => {
            try {
              await instance.delete(`/comments/${commentId}`);
              setComments((prev) => prev.filter((c) => c._id !== commentId));
              toast.success("Comment deleted successfully ✅", {
                position: "top-center",
                autoClose: 1000,
              });
            } catch (err) {
              console.error(err);
              toast.error("Failed to delete comment ❌", {
                position: "top-center",
              });
            }
          },
        },
        {
          label: "Cancel",
          onClick: () => {},
        },
      ],
    });
  };

  const fetchComments = async () => {
    try {
      const res = await instance.get(`/comments?postId=${post._id}`);
      const fetchedComments = res.data;
      setComments(fetchedComments);

      const userIds = [...new Set(fetchedComments.map((c) => c.userId))];
      const userResponses = await Promise.all(
        userIds.map((id) => instance.get(`/auth/users/${id}`))
      );

      const usersMap = {};
      userResponses.forEach((res) => {
        const user = res.data;
        usersMap[user._id] = user;
      });

      setCommentUsers(usersMap);
    } catch (err) {
      console.error("Error fetching comments or users", err);
    }
  };

  useEffect(() => {
    if (post?._id) fetchComments();
  }, [post]);

  const handleSubmit = async () => {
    if (!commentText.trim()) return;
    await onAddComment(commentText);
    setCommentText("");
    fetchComments();
  };

  return (
    <div
      className="fixed inset-0 bg-[#000000bd] flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg p-6 w-2xl max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 border-b pb-3">
          <PostHeader
            post={post}
            postUsers={postUsers}
            timeAgo={moment(post.createdAt).fromNow()}
          />
          <p className="text-gray-700 whitespace-pre-wrap">{post.text}</p>
          {/* {post.images?.length > 0 && (
            <div className="grid grid-cols-1 gap-2 mt-3">
              {post.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt={`Post image ${i + 1}`}
                  className="w-full rounded object-cover"
                />
              ))}
            </div>
          )} */}
          <PostFiles setModalImage={setModalImage} videos={post.videos} images={post.images} />
          <PostActions
            postId={post._id}
            currentUser={currentUser}
            onComment={() => console.log("Comment clicked")}
            onShare={() => onShare(post)}
          />
        </div>

        <CommentForm
          commentText={commentText}
          setCommentText={setCommentText}
          handleSubmit={handleSubmit}
          onCancel={onClose}
        />

        <CommentList
          currentUserId={currentUserId}
          onDeleteComment={handleDeleteComment}
          comments={comments}
          users={commentUsers}
        />
      </div>
    </div>
  );
};

export default CommentModal;
