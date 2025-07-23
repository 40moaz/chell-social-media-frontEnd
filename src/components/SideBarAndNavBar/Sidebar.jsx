import { useEffect, useState } from "react";
import {
  CiHome,
  CiBellOn,
  CiMail,
  CiBookmark,
  CiViewList,
  CiUser,
  CiCirclePlus,
  CiCalendar,
} from "react-icons/ci";
import { NavLink } from "react-router-dom";
import instance from "../../axios/instance";
const Sidebar = ({ user, onOpenEditor }) => {
  const navItemStyle = ({ isActive }) =>
    `flex items-center gap-3 cursor-pointer px-2 py-1 rounded-md transition ${
      isActive
        ? "text-blue-600 font-semibold"
        : "text-gray-500 hover:text-blue-600"
    }`;
  const [unseenCount, setUnseenCount] = useState(0);

  useEffect(() => {
    if (user?._id) {
      instance
        .get(`/notifications/unseen-count/${user._id}`)
        .then((res) => setUnseenCount(res.data.count))
        .catch((err) =>
          console.error("Failed to fetch unseen notifications", err)
        );
    }
  }, [user]);
  return (
    <aside
      style={{ border: "1px solid #E5E5E5" }}
      className="w-70 h-screen bg-white p-4 px-10 space-y-4"
    >
      <div className="mb-10 flex items-center gap-3">
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt="User Avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-sm uppercase">
            {user.fullName?.charAt(0)}
          </div>
        )}

        <div className="text-sm">
          <p className="font-semibold text-gray-700">{user.fullName}</p>
          <p className="text-gray-400">@{user.username}</p>
        </div>
      </div>

      <ul className="space-y-3 font-medium">
        <li>
          <NavLink to="/" className={navItemStyle}>
            <CiHome size={22} /> Home
          </NavLink>
        </li>
        <li className="relative">
          <NavLink     onClick={() => setUnseenCount(0)}  to="/notifications" className={navItemStyle}>
            <CiBellOn size={22} /> Notifications
          </NavLink>

          {unseenCount > 0 && (
            <span className="absolute top-0 left-5 w-2.5 h-2.5 bg-red-600 rounded-full animate-ping"></span>
          )}
        </li>

        <li>
          <NavLink to="/messages" className={navItemStyle}>
            <CiMail size={22} /> Messages
          </NavLink>
        </li>
        <li>
          <NavLink to="/bookmarks" className={navItemStyle}>
            <CiBookmark size={22} /> Bookmarks
          </NavLink>
        </li>
        <li>
          <NavLink to="/lists" className={navItemStyle}>
            <CiViewList size={22} /> Lists
          </NavLink>
        </li>
        <li>
          <NavLink to="/profile" className={navItemStyle}>
            <CiUser size={22} /> My Profile
          </NavLink>
        </li>
        <li>
          <NavLink to="/add-card" className={navItemStyle}>
            <CiCirclePlus size={22} /> Add Card
          </NavLink>
        </li>
        <li>
          <NavLink to="/events" className={navItemStyle}>
            <CiCalendar size={22} /> Private Event
          </NavLink>
        </li>
      </ul>

      <button
        onClick={onOpenEditor}
        className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
      >
        + New Post
      </button>
    </aside>
  );
};

export default Sidebar;
