// Notifications.jsx
import { useEffect, useState } from "react";
import axios from "../axios/instance";
import moment from "moment";
import { Link, useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
const Notifications = ({ currentUser }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (currentUser?._id) {
      axios.get(`/notifications/${currentUser._id}`).then((res) => {
        setNotifications(res.data);
        console.log(res.data);

        axios.put(`/notifications/seen/${currentUser._id}`); // Mark all as seen
      });
    }
  }, [currentUser]);
  const renderContent = (notif) => {
    const name = notif.senderId.fullName;
    const userId = notif.senderId._id;
    const content = notif.content;
    console.log(notif.senderId._id);

    switch (notif.type) {
      case "like":
        return (
          <Link
            to={"/users/" + userId}
            className="font-semibold flex items-center"
          >
            {name}
            <p>liked your post</p>
          </Link>
        );
      case "comment":
        return (
          <Link
            to={"/users/" + userId}
            className="flex items-center font-semibold"
          >
            {name}
            <p>commented: '{content}'</p>
          </Link>
        );
      case "follow":
        return (
          <Link
            to={"/users/" + userId}
            className="flex items-center font-semibold"
          >
            {name}
            <p> followed you</p>
          </Link>
        );
      case "message":
        return (
          <Link
            to={"/users/" + userId}
            className="flex items-center font-semibold"
          >
            {name}
            <p>sent a message: {content}</p>
          </Link>
        );
      default:
        return "You have a new notification";
    }
  };
  const navigate = useNavigate();
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md mt-6">
      <BackButton onClick={() => navigate(-1)} />

      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        🔔 Notifications
      </h2>
      {notifications.length === 0 ? (
        <p className="text-gray-500">No notifications yet.</p>
      ) : (
        <ul className="space-y-4">
          {notifications.map((notif) => (
            <li
              key={notif._id}
              className={`flex items-start p-4 border rounded-lg shadow-sm transition-all ${
                notif.seen ? "bg-gray-100" : "bg-blue-50"
              }`}
            >
              {notif.senderId.profileImage ? (
                <img
                  src={notif.senderId.profileImage}
                  alt="profile"
                  className="w-12 h-12 rounded-full object-cover mr-4"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gray-300 text-gray-500 flex items-center justify-center text-xl font-bold uppercase mr-4">
                  {notif.senderId.fullName?.charAt(0) || "U"}
                </div>
              )}

              {/* محتوى الإشعار */}
              <div className="flex-1">
                <div className="text-gray-800">{renderContent(notif)}</div>
                <p className="text-xs text-gray-500 mt-1">
                  {moment(notif.createdAt).fromNow()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Notifications;
