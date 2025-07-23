import React, { useState, useEffect, useCallback } from "react";
import { Search, User, Image, Loader2, AlertCircle } from "lucide-react";
import instance from "../axios/instance"; // Assuming you have your axios instance configured here
import { Link, useNavigate } from "react-router-dom"; // Assuming you are using react-router-dom for navigation
import PostFiles from "../components/Post/PostFiles";
import BackButton from "../components/BackButton";

// Debounce function to limit API calls while typing
const debounce = (func, delay) => {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState({ users: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false); // To show "No results" only after a search

  // Function to perform the actual search API call
  const performSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults({ users: [], posts: [] });
      setHasSearched(false); // Reset hasSearched if query is empty
      return;
    }

    setLoading(true);
    setError(null);
    setHasSearched(true); // Mark that a search has been initiated

    try {
      // Make the GET request to your Node.js endpoint
      // The endpoint supports 'q' for query and 'type' for specific search (optional)
      const response = await instance.get(
        `/search?q=${encodeURIComponent(query)}`
      );
      setSearchResults(response.data);
    } catch (err) {
      console.error("Search error:", err);
      setError("Failed to fetch search results. Please try again.");
      setSearchResults({ users: [], posts: [] }); // Clear results on error
    } finally {
      setLoading(false);
    }
  }, []); // useCallback to memoize the function

  // Debounced version of performSearch
  const debouncedSearch = useCallback(debounce(performSearch, 500), [
    performSearch,
  ]);

  // Effect to trigger search when searchTerm changes
  useEffect(() => {
    debouncedSearch(searchTerm);
  }, [searchTerm, debouncedSearch]);

  // Helper function to get user's initial for fallback avatar
  const getUserInitial = (user) => {
    if (!user) return "U";
    return (
      user.fullName?.charAt(0) ||
      user.username?.charAt(0) ||
      "U"
    ).toUpperCase();
  };
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8 font-inter">
      <BackButton onClick={() => navigate(-1)} />
      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-6">
        {/* Search Input */}
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Search for users or posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 text-gray-800 text-base"
          />
          <Search
            size={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center justify-center py-4 text-blue-600">
            <Loader2 size={24} className="animate-spin mr-2" />
            <span>Searching...</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center justify-center py-4 text-red-600 bg-red-50 rounded-lg p-3">
            <AlertCircle size={20} className="mr-2" />
            <span>{error}</span>
          </div>
        )}

        {/* Search Results */}
        {!loading && hasSearched && (
          <div className="mt-4">
            {/* Users Section */}
            {searchResults.users.length > 0 && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                  Users
                </h2>
                <div className="space-y-3">
                  {searchResults.users.map((user) => (
                    <Link
                      to={`/users/${user._id}`} // Adjust this path to your user profile route
                      key={user._id}
                      className="flex items-center p-3 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors duration-200"
                    >
                      {user.profileImage ? (
                        <img
                          src={user.profileImage}
                          alt={user.fullName || user.username}
                          className="w-10 h-10 rounded-full object-cover mr-3 border border-gray-200"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-lg font-bold uppercase mr-3">
                          {getUserInitial(user)}
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-gray-900">
                          {user.fullName || user.username}
                        </p>
                        {user.username &&
                          user.fullName && ( // Show username if different from full name
                            <p className="text-sm text-gray-600">
                              @{user.username}
                            </p>
                          )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Posts Section */}
            {searchResults.posts.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 border-b pb-2">
                  Posts
                </h2>
                <div className="space-y-4">
                  {searchResults.posts.map((post) => (
                    <div
                      key={post._id}
                      className="bg-white rounded-lg shadow-sm p-4 border border-gray-200"
                    >
                      {/* Post Author Info */}
                      {post.userId && (
                        <Link
                          to={`/users/${post.userId._id}`}
                          className="flex items-center mb-3"
                        >
                          {post.userId.profileImage ? (
                            <img
                              src={post.userId.profileImage}
                              alt={post.userId.fullName || post.userId.username}
                              className="w-8 h-8 rounded-full object-cover mr-2 border border-gray-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-md font-bold uppercase mr-2">
                              {getUserInitial(post.userId)}
                            </div>
                          )}
                          <p className="font-medium text-gray-900">
                            {post.userId.fullName || post.userId.username}
                          </p>
                        </Link>
                      )}
                      <Link to={`/posts/${post._id}`} className="block mb-3">
                        <p className="text-gray-800 mb-3">{post.text}</p>

                        {(post.images?.length > 0 ||
                          post.videos?.length > 0) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
                            {/* Images */}
                            {post.images?.map((imgUrl, index) => (
                              <img
                                key={`img-${index}`}
                                src={imgUrl}
                                alt={`Post image ${index + 1}`}
                                className="w-full h-full object-cover rounded-md border border-gray-200"
                              />
                            ))}

                            {/* Videos */}
                            {post.videos?.map((vid) => (
                              <video
                                key={`video`}
                                src={vid}
                                controls
                                className="w-full h-full object-cover rounded-md border border-gray-200"
                              />
                            ))}
                          </div>
                        )}
                      </Link>

                      {/* If your posts have other media like videos, you'd add similar logic here */}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* No Results Message */}
            {searchResults.users.length === 0 &&
              searchResults.posts.length === 0 && (
                <div className="text-center py-8 text-gray-600">
                  <p className="text-lg mb-2">
                    No results found for "{searchTerm}".
                  </p>
                  <p className="text-sm">
                    Try a different keyword or check your spelling.
                  </p>
                </div>
              )}
          </div>
        )}

        {/* Initial message before any search */}
        {!hasSearched && !loading && !error && searchTerm === "" && (
          <div className="text-center py-12 text-gray-500">
            <Search size={48} className="mx-auto mb-4" />
            <p className="text-xl font-medium">Start typing to search...</p>
            <p className="text-sm mt-1">
              Find users and posts across the platform.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;
