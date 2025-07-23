import { useEffect, useState } from "react";
import instance from "../axios/instance";
import { FaSearch } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";

export default function Suggestions({ user }) {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await instance.get("/auth/users");
        setUsers(res.data);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);

  const handleFollow = async (userId) => {
    try {
      await instance.post(`/followers/${userId}`);

      // ✅ عدل المستخدم المحلي في الـ state
      setUsers((prevUsers) =>
        prevUsers.map((u) =>
          u._id === userId
            ? { ...u, followers: [...(u.followers || []), user._id] }
            : u
        )
      );
    } catch (err) {
      console.error("Failed to follow user", err);
    }
  };

  const isUserFollowing = (u) => u.followers?.includes(user._id);

  const filtered = users
    .filter((u) => u._id !== user._id)
    .filter(
      (u) =>
        u.username.toLowerCase().includes(query.toLowerCase()) ||
        u.fullName.toLowerCase().includes(query.toLowerCase())
    );
const navigate = useNavigate();
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <BackButton onClick={() => navigate(-1)} />
      <h1 className="text-2xl font-bold mb-4">Suggestions</h1>

      {/* Search bar */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search users..."
          className="w-full border border-gray-300 rounded-lg py-2 px-4 pr-10 focus:outline-none focus:ring focus:ring-blue-300"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <FaSearch className="absolute right-3 top-3 text-gray-400" />
      </div>

      {/* Users List */}
      <div className="grid gap-4">
        {filtered.map((u) => {
          const isFollowing = isUserFollowing(u);
          return (
            <div
              key={u._id}
              className="flex items-center justify-between border p-4 rounded-lg shadow-sm hover:shadow-md transition"
            >
              <div className="flex items-center gap-4">
                <img
                  src={u.profileImage || `https://ui-avatars.com/api/?name=${u.fullName}`}
                  alt={u.fullName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <Link className="font-semibold" to={`/users/${u._id}`}>
                    {u.fullName}
                  </Link>
                  <p className="text-sm text-gray-500 ">@{u.username}</p>
                </div>
              </div>
              <button
                onClick={() => handleFollow(u._id)}
                disabled={isFollowing}
                className={`px-4 py-1 rounded-full text-sm transition ${
                  isFollowing
                    ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                    : "bg-blue-500 text-white hover:bg-blue-600"
                }`}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
