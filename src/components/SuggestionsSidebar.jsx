import React, { useState, useEffect } from "react";
import { Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import instance from "../axios/instance";

const SuggestionsSidebar = ({
  latestUsers,
  modalImage,
  setModalImage,
  currentUser,
}) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setUsers(latestUsers);
  }, [latestUsers]);

  const handleFollow = async (userId) => {
    try {
      await instance.post(`/followers/${userId}`);

      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user._id === userId
            ? {
                ...user,
                followers: [...(user.followers || []), currentUser._id],
              }
            : user
        )
      );
    } catch (err) {
      console.error("Failed to follow user", err);
    }
  };

  const isUserFollowing = (user) => {
    return user.followers?.includes(currentUser._id);
  };

  return (
    <div className="hidden lg:block w-full lg:w-90 p-4 lg:p-5 bg-white lg:bg-gray-100 flex-shrink-0">
      <Link to="/search" className="relative mb-6">
        <div
          className="flex items-center w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700
               hover:bg-gray-100 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500
               transition-all duration-200 cursor-pointer"
        >
          <Search size={20} className="mr-2 text-gray-500" />
          <span className="text-base font-medium">Search</span>
        </div>
      </Link>

      <div className="bg-white p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Suggestions</h3>
          <Link
            to="/suggestions"
            className="text-blue-600 text-sm hover:underline"
          >
            See All
          </Link>
        </div>

        <div className="space-y-4">
          {users.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No Suggestions Now</p>
          ) : (
            users.map((user) => {
              const isFollowing = isUserFollowing(user);
              return (
                <div key={user._id} className="flex items-center space-x-3">
                  <img
                    src={
                      user.profileImage ||
                      "https://placehold.co/60x60?text=User"
                    }
                    alt={user.fullName}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="flex-grow">
                    <p className="font-semibold text-gray-800 flex items-center">
                      <Link
                        to={`/users/${user._id}`}
                        className="hover:underline"
                      >
                        {user.fullName}
                      </Link>
                      {user.verified && (
                        <span className="ml-1 text-blue-500">✅</span>
                      )}
                    </p>
                    <p className="text-gray-500 text-sm">@{user.username}</p>
                  </div>
                  <button
                    onClick={() => handleFollow(user._id)}
                    disabled={isFollowing}
                    className={`px-4 py-1 rounded-full text-sm transition-colors duration-200 ${
                      isFollowing
                        ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {modalImage && (
        <div
          className="fixed inset-0 bg-[#000000bd] flex items-center justify-center z-50"
          onClick={() => setModalImage(null)}
        >
          <div
            className="relative max-h-[80vh] max-w-[90vw] rounded shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* زر الإغلاق */}
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

            {/* المحتوى */}
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
    </div>
  );
};

export default SuggestionsSidebar;
