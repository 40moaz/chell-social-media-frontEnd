// src/pages/PostPage.jsx
import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import instance from "../axios/instance";
import moment from "moment";
import PostCard from "../components/Post/PostCard";
import CommentModal from "../components/Comment/CommentModal";
import { X } from "lucide-react"; // Import the ArrowLeft icon
import ShareModal from "../components/ShareModal";
import BackButton from "../components/BackButton"; // Assuming you have a BackButton component
const PostPage = ({ currentUser }) => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [postUser, setPostUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalImage, setModalImage] = useState(null);
  const [openMenuPostId, setOpenMenuPostId] = useState(null);
  const [commentPost, setCommentPost] = useState(null);
  const menuRef = useRef(null);
  const timeAgo = useCallback((dateString) => moment(dateString).fromNow(), []);
  console.log(postId);
  const [sharePost, setSharePost] = useState(null);

  const handleShare = (post) => {
    setSharePost(post);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuPostId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDeletePost = useCallback(
    async (idToDelete) => {
      if (!window.confirm("Are you sure you want to delete this post?")) {
        return;
      }
      try {
        await instance.delete(`/posts/${idToDelete}`);
        toast.success("Post deleted successfully ✅", {
          position: "top-center",
          autoClose: 1000,
        });
        setPost(null);
        navigate("/");
      } catch (err) {
        toast.error("Failed to delete the post ❌", { position: "top-center" });
        console.error("Failed to delete the post:", err);
      }
    },
    [navigate]
  );

  const isPostOwner = useCallback(
    (postUserId) => {
      return postUserId === currentUser?._id;
    },
    [currentUser?._id]
  );

  const openCommentModal = useCallback(
    (postToComment) => setCommentPost(postToComment),
    []
  );
  const closeCommentModal = useCallback(() => setCommentPost(null), []);

  const handleAddComment = useCallback(
    async (commentText) => {
      if (!commentText.trim()) {
        toast.error("Comment cannot be empty.");
        return;
      }
      if (!currentUser?._id) {
        toast.error("You must be logged in to comment.");
        return;
      }
      if (!commentPost?._id) {
        toast.error("No post selected to comment on.");
        return;
      }

      try {
        await instance.post("/comments", {
          userId: currentUser._id,
          text: commentText,
          postId: commentPost._id,
        });
        toast.success("Your comment was added successfully ✅", {
          position: "top-center",
          autoClose: 1000,
        });
      } catch (error) {
        console.error("Failed to add comment:", error);
        toast.error("Failed to add comment. Please try again ❌", {
          position: "top-center",
        });
      }
    },
    [currentUser?._id, commentPost?._id]
  );

  useEffect(() => {
    const fetchPostAndUser = async () => {
      setLoading(true);
      try {
        const res = await instance.get(`/posts/${postId}`);
        const fetchedPost = res.data;
        setPost(fetchedPost);

        if (fetchedPost.userId) {
          const userRes = await instance.get(
            `/auth/users/${fetchedPost.userId}`
          );
          setPostUser(userRes.data);
        } else {
          setPostUser(null);
        }
      } catch (err) {
        console.error("Error fetching post:", err);
        toast.error(
          "Failed to load post. It might not exist or has been deleted."
        );
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchPostAndUser();
    }
  }, [postId]);

  const handleLike = useCallback((id) => toast.info(`Liked post ${id}`), []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-600">Loading post...</p>
      </div>
    );
  if (!post)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg text-gray-500">Post not found or deleted.</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <BackButton onClick={() => navigate(-1)} />

        <PostCard
          currentUser={currentUser}
          postId={postId}
          post={post}
          user={postUser}
          timeAgo={timeAgo(post.createdAt)}
          onLike={handleLike}
          onComment={() => openCommentModal(post)}
          onShare={handleShare}
          isOwner={isPostOwner(post.userId)}
          openMenuPostId={openMenuPostId}
          setOpenMenuPostId={setOpenMenuPostId}
          menuRef={menuRef}
          setModalImage={setModalImage}
          onDeletePost={handleDeletePost}
        />
      </div>
      {commentPost && (
        <CommentModal
          setModalImage={setModalImage}
          post={commentPost}
          onClose={closeCommentModal}
          onAddComment={handleAddComment}
          timeAgo={timeAgo}
          postUsers={{
            [postUser?._id]: postUser,
            [currentUser?._id]: currentUser,
          }}
          currentUserId={currentUser?._id}
          currentUser={currentUser}
        />
      )}
      {modalImage && (
        <div
          className="fixed inset-0 bg-[#000000bd] flex items-center justify-center z-50"
          onClick={() => setModalImage(null)} // Close modal on background click
        >
          <div
            className="relative max-h-[80vh] max-w-[90vw] rounded shadow-lg"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            {/* Close button */}
            <div className="absolute top-2 right-2 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setModalImage(null);
                }}
                className="cursor-pointer bg-white text-black font-bold rounded-full w-10 h-10 flex items-center justify-center shadow hover:bg-gray-200 transition"
              >
                <X size={20} />
              </button>
            </div>
            {/* Content */}
            {modalImage.match(/\.(mp4|webm|ogg)$/i) ? (
              <video
                src={modalImage}
                controls
                autoPlay
                className="max-h-[80vh] max-w-[90vw] rounded"
              />
            ) : (
              <img
                src={modalImage}
                alt="Enlarged"
                className="max-h-[80vh] max-w-[90vw] rounded object-contain"
              />
            )}
          </div>
        </div>
      )}
      {sharePost && (
        <ShareModal post={post} onClose={() => setSharePost(null)} />
      )}
      <ToastContainer />
    </div>
  );
};

export default PostPage;
