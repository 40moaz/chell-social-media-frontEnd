import { useEffect, useState } from "react";
import instance from "../axios/instance";
import { FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";

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
const filtered = users
  .filter((u) => u._id !== user._id)
  .filter(
    (u) =>
      u.username.toLowerCase().includes(query.toLowerCase()) ||
      u.fullName.toLowerCase().includes(query.toLowerCase())
  );


  return (
    <div className="p-6 max-w-4xl mx-auto">
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
        {filtered.map((u) => (
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
                <Link className="font-semibold" to={`/users/${u._id}`}>{u.fullName}</Link>
                <p className="text-sm text-gray-500">@{u.username}</p>
              </div>
            </div>
            <button className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm hover:bg-blue-600 transition">
              Follow
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
