// App.jsx
import { useEffect, useState, useCallback } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Home from "./pages/Home";
import SignUp from "./pages/Signup";
import Login from "./pages/Login";
import Footer from "./components/Footer";
import instance from "./axios/instance";
import Suggestions from "./pages/Suggestions";
import Profile from "./pages/Profile";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    try {
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else if (token) {
        const res = await instance.get("/auth/me");
        setUser(res.data);
        localStorage.setItem("user", JSON.stringify(res.data));
      }
    } catch (error) {
      console.error("❌ Failed to fetch user:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

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
          <Route
            path="/profile"
            element={<Profile user={user} currentUser={user} />}
          />
          <Route path="/users/:id" element={<Profile currentUser={user} />} />
        </Route>
      </Routes>
      <Footer />
    </>
  );
}

export default App;
