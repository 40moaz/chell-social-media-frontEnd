// App.jsx
import { useEffect, useState, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
// import { messaging, getToken } from "./firebase";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
// import Footer from "./components/Footer";
import instance from "./axios/instance";
import Suggestions from "./pages/Suggestions";
import Profile from "./pages/Profile";
import Messages from "./pages/Messages";
import Notification from "./pages/Notifications";
import SearchPage from "./pages/SearchPage";
import PostPage from "./pages/PostPage";
import { ToastContainer } from "react-toastify";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
    const [sharePost, setSharePost] = useState(null);

  const handleShare = (post) => {
    setSharePost(post);
  };

  const fetchUser = useCallback(async () => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    try {
      if (token) {
        const res = await instance.get("/auth/me");
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      } else if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("❌ Failed to fetch user:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllUsers = useCallback(async () => {
    try {
      const res = await instance.get("/auth/users");
      setUsers(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch users:", err);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    if (user) fetchAllUsers(); // بعد ما يجيب اليوزر الحالي، يجيب الباقي
  }, [user, fetchAllUsers]);

  const PrivateRoute = ({ children }) => {
    return user ? children : <Navigate to="/login" replace />;
  };

  if (loading) return <div>Loading...</div>;

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<SignUp />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard user={user} />
            </PrivateRoute>
          }
        >
          <Route index element={<Home user={user} />} />
          <Route path="/suggestions" element={<Suggestions user={user} />} />
          <Route path="/search" element={<SearchPage />} />
          <Route
            path="/notifications"
            element={<Notification currentUser={user} />}
          />
          <Route
            path="/profile"
            element={<Profile sharePost={sharePost} setSharePost={setSharePost} handleShare={handleShare} user={user} currentUser={user} />}
          />
          <Route
            path="/posts/:postId"
            element={<PostPage sharePost={sharePost} setSharePost={setSharePost} handleShare={handleShare} currentUser={user} />}
          />

          <Route
            path="/users/:id"
            element={
              <Profile currentUser={user} />
            }
          />
          <Route
            path="/messages"
            element={
              <Messages
                currentUser={user}
                users={(users || []).filter((u) => u._id !== user._id)}
              />
            }
          />
          <Route
            path="/messages/:userId"
            element={
              <Messages
                currentUser={user}
                users={(users || []).filter((u) => u._id !== user._id)}
              />
            }
          />
        </Route>
      </Routes>
      <ToastContainer position="top-right" autoClose={3000} />

      {/* <Footer /> */}
    </>
  );
}

export default App;
