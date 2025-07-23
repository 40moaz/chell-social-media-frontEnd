import { useEffect, useRef, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Loader2 } from "lucide-react";
import instance from "../axios/instance";
import StoriesSection from "../components/StoriesSection";
import ComposePost from "../components/Post/ComposePost";
import PostFeed from "../components/Post/PostFeed";
import CommentModal from "../components/Comment/CommentModal";
import SuggestionsSidebar from "../components/SuggestionsSidebar";
import "react-confirm-alert/src/react-confirm-alert.css"; // Import the CSS
import ShareModal from "../components/ShareModal";
const Home = ({ user }) => {
  const { posts: parentPosts, setPosts } = useOutletContext();
  const [modalImage, setModalImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [postUsers, setPostUsers] = useState({});
  const [latestUsers, setLatestUsers] = useState([]);
  const [openMenuPostId, setOpenMenuPostId] = useState(null);
  const [commentPost, setCommentPost] = useState(null);
  const [sharePost, setSharePost] = useState(null);

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
    if (!window.confirm("Are you sure you want to delete this post?")) {
      // Use custom modal instead of window.confirm in production
      return;
    }
    try {
      await instance.delete(`/posts/${postId}`);
      setPosts((prevPosts) => prevPosts.filter((p) => p._id !== postId));
      toast.success("Post deleted successfully ✅", { position: "top-center", autoClose: 1000 });
    } catch (err) {
      toast.error("Failed to delete the post ❌", { position: "top-center" });
      console.log(err);
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

  const handleShare = (post) => {
    setSharePost(post);
  };

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
        autoClose: 1000,
      });
    } catch (error) {
      console.error(error);
      toast.error("Add failed. Try Again ❌", {
        position: "top-center",
        autoClose: 1000,
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
  if (loading)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-600">
        <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
        <p className="text-xl font-semibold">Loading user data...</p>
        <p className="text-sm mt-1">Please wait a moment.</p>
      </div>
    );
  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 font-inter">
      {/* Main Area */}
      <div className="flex-grow pt-3">
        <h1 className="text-3xl font-bold text-gray-800 mb-3">Home</h1>

        <StoriesSection currentUser={user} stories={stories} />
        <ComposePost onPostCreated={addNewPost} userId={user._id} />

        <PostFeed
          posts={posts}
          currentUser={user}
          postUsers={postUsers}
          loading={loading}
          currentUserId={user._id}
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
          setModalImage={setModalImage}
            post={commentPost}
            onClose={closeCommentModal}
            onAddComment={handleAddComment}
            onShare={handleShare}
            timeAgo={timeAgo}
            postUsers={postUsers}
            currentUserId={user._id}
            currentUser={user}
          />
        )}
      </div>

      {/* Right Sidebar */}
      <SuggestionsSidebar
        currentUser={user}
        latestUsers={latestUsers}
        modalImage={modalImage}
        setModalImage={setModalImage}
      />
      {sharePost && (
        <ShareModal post={sharePost} onClose={() => setSharePost(null)} />
      )}
      <ToastContainer />
    </div>
  );
};

export default Home;
