import { useEffect, useRef, useState } from "react";
import { Search } from "lucide-react";
import { useOutletContext } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import instance from "../axios/instance";
import StoriesSection from "../components/StoriesSection";
import ComposePost from "../components/Post/ComposePost";
import PostFeed from "../components/Post/PostFeed";
import CommentModal from "../components/Comment/CommentModal";
import SuggestionsSidebar from "../components/SuggestionsSidebar";
import "react-confirm-alert/src/react-confirm-alert.css"; // Import the CSS

const Home = ({ user }) => {
  const { posts: parentPosts, setPosts } = useOutletContext();
  const [modalImage, setModalImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [postUsers, setPostUsers] = useState({});
  const [latestUsers, setLatestUsers] = useState([]);
  const [openMenuPostId, setOpenMenuPostId] = useState(null);
  const [commentPost, setCommentPost] = useState(null);

  const posts = parentPosts;
  const menuRef = useRef(null);

  const fetchUserById = async (userId) => {
    try {
      const res = await instance.get(`/auth/users/${userId}`);
      return res.data;
    } catch (err) {
      console.error("Failed to fetch user", err);
      return null;
    }
  };
  const handleDeletePost = async (postId) => {
    try {
      await instance.delete(`/posts/${postId}`);
      setPosts((prevPosts) => prevPosts.filter((p) => p._id !== postId));
      toast.success("Post deleted successfully ✅", { position: "top-center" });
    } catch (err) {
      toast.error("Failed to delete the post ❌", { position: "top-center" });
    }
  };

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await instance.get("/posts");
      const postsData = res.data;
      setPosts(postsData);

      const uniqueUserIds = [...new Set(postsData.map((p) => p.userId))];
      const usersMap = {};
      await Promise.all(
        uniqueUserIds.map(async (id) => {
          const userData = await fetchUserById(id);
          if (userData) usersMap[id] = userData;
        })
      );
      setPostUsers(usersMap);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLatestUsers = async () => {
    try {
      const res = await instance.get("/auth/users?limit=5&sort=desc");
      const filteredUsers = res.data.filter((u) => u._id !== user._id);
      setLatestUsers(filteredUsers.slice(0, 6));
    } catch (err) {
      console.error("Failed to fetch latest users", err);
    }
  };

  const handleLike = (postId) => toast.info(`Liked post ${postId}`);
  const handleShare = (postId) => toast.info(`Shared post ${postId}`);

  const addNewPost = async (post) => {
    if (!postUsers[post.userId]) {
      const userData = await fetchUserById(post.userId);
      if (userData) {
        setPostUsers((prev) => ({
          ...prev,
          [post.userId]: userData,
        }));
      }
    }
    setPosts((prevPosts) => [post, ...prevPosts]);
  };

  const handleAddComment = async (commentText) => {
    try {
      const res = await instance.post("/comments", {
        userId: user._id,
        text: commentText,
        postId: commentPost._id,
      });
      console.log(res.data);
      toast.success("Your Comment was added ✅", {
        position: "top-center",
        autoClose: 3000,
      });
    } catch (error) {
      console.error(error);
      toast.error("Add failed. Try Again ❌", {
        position: "top-center",
        autoClose: 3000,
      });
    }
  };

  const timeAgo = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const closeCommentModal = () => setCommentPost(null);
  const openCommentModal = (post) => setCommentPost(post);
  const isPostOwner = (postUserId) => postUserId === user._id;

  useEffect(() => {
    fetchPosts();
    fetchLatestUsers();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuPostId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const stories = [
    {
      id: 1,
      img: "https://placehold.co/80x80/FFD700/000000?text=User1",
      alt: "User 1",
    },
    {
      id: 2,
      img: "https://placehold.co/80x80/ADD8E6/000000?text=User2",
      alt: "User 2",
    },
    {
      id: 3,
      img: "https://placehold.co/80x80/90EE90/000000?text=User3",
      alt: "User 3",
    },
    {
      id: 4,
      img: "https://placehold.co/80x80/90EE90/000000?text=User4",
      alt: "User 4",
    },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 font-inter">
      {/* Main Area */}
      <div className="flex-grow pt-3">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Home</h1>

        <StoriesSection stories={stories} />
        <ComposePost onPostCreated={addNewPost} userId={user._id} />

        <PostFeed
          posts={posts}
          postUsers={postUsers}
          loading={loading}
          timeAgo={timeAgo}
          currentUserId={user._id}
          onLike={handleLike}
          onComment={openCommentModal}
          onShare={handleShare}
          isPostOwner={isPostOwner}
          openMenuPostId={openMenuPostId}
          setOpenMenuPostId={setOpenMenuPostId}
          menuRef={menuRef}
          setModalImage={setModalImage}
          onDeletePost={handleDeletePost}
        />

        {commentPost && (
          <CommentModal
            post={commentPost}
            onClose={closeCommentModal}
            onAddComment={handleAddComment}
            timeAgo={timeAgo}
            postUsers={postUsers}
            currentUserId={user._id}
          />
        )}
      </div>

      {/* Right Sidebar */}
      <SuggestionsSidebar
        latestUsers={latestUsers}
        modalImage={modalImage}
        setModalImage={setModalImage}
      />

      <ToastContainer />
    </div>
  );
};

export default Home;
