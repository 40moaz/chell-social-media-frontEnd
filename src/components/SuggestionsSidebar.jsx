import React from "react";
import { Search } from "lucide-react";
import { Link } from "react-router-dom";

const SuggestionsSidebar = ({ latestUsers, modalImage, setModalImage }) => {
  return (
    <div className="hidden lg:block w-full lg:w-90 p-4 lg:p-5 bg-white lg:bg-gray-100 flex-shrink-0">
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search"
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
        />
        <Search
          size={20}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
        />
      </div>

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
          {latestUsers.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No Suggestions Now</p>
          ) : (
            latestUsers.map((user) => (
              <div key={user._id} className="flex items-center space-x-3">
                <img
                  src={
                    user.profileImage || "https://placehold.co/60x60?text=User"
                  }
                  alt={user.fullName}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div className="flex-grow">
                  <p className="font-semibold text-gray-800 flex items-center">
                    <Link to={`/users/${user._id}`} className="hover:underline">
                    {user.fullName}
                    </Link>
                    {user.verified && (
                      <span className="ml-1 text-blue-500">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-badge-check"
                        >
                          <path d="M3.85 8.62L12 1L20.14 8.62A4 4 0 0 1 22 11.65V18a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6.35a4 4 0 0 1 1.85-3.03Z" />
                          <path d="m9 12 2 2 4-4" />
                        </svg>
                      </span>
                    )}
                  </p>
                  <p className="text-gray-500 text-sm">@{user.username}</p>
                </div>
                <button className="px-4 py-1 rounded-full bg-blue-600 text-white text-sm hover:bg-blue-700 transition-colors duration-200">
                  Follow
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {modalImage && (
        <div
          onClick={() => setModalImage(null)}
          className="fixed inset-0 bg-[#000000bd] flex items-center justify-center z-50"
        >
          <img
            src={modalImage}
            alt="Enlarged"
            className="max-h-[80vh] max-w-[90vw] rounded shadow-lg"
          />
        </div>
      )}
    </div>
  );
};

export default SuggestionsSidebar;
