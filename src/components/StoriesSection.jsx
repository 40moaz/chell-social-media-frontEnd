import React, { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import AddStoryModal from "./AddStoryModal";
import StoryViewerModal from "./StoryViewerModal";
import instance from "../axios/instance";

// Helper to get user's initial for fallback if no profile image
const getUserInitial = (user) => {
  if (!user) return "U";
  return (
    user.fullName?.charAt(0) ||
    user.username?.charAt(0) ||
    "U"
  ).toUpperCase();
};

const StoriesSection = ({ currentUser }) => {
  const [showAddStoryModal, setShowAddStoryModal] = useState(false);
  const [showStoryViewerModal, setShowStoryViewerModal] = useState(false);
  const [selectedUserStories, setSelectedUserStories] = useState([]); // Stories for the selected user
  const [selectedStoryInitialIndex, setSelectedStoryInitialIndex] = useState(0); // Index for the current story in the viewer
  const [usersWithStories, setUsersWithStories] = useState([]); // To hold unique users who have stories
  const storiesContainerRef = useRef(null);

  const fetchStories = async () => {
    try {
      const res = await instance.get("/stories");
      const fetchedStories = res.data; // This should ideally be an array of story objects

      // Group stories by user
      const storiesByUser = {};
      fetchedStories.forEach((story) => {
        const userId = story.userId?._id;
        if (userId) {
          if (!storiesByUser[userId]) {
            storiesByUser[userId] = {
              user: story.userId, // Assuming userId is populated with user object
              stories: [],
            };
          }
          storiesByUser[userId].stories.push(story);
        }
      });

      // Convert grouped stories into an array of users with their stories
      const usersArray = Object.values(storiesByUser);

      // Separate current user's stories
      let currentUserStoriesGroup = null;
      const otherUsersStories = [];

      usersArray.forEach((group) => {
        if (group.user._id === currentUser?._id) {
          currentUserStoriesGroup = group;
        } else {
          otherUsersStories.push(group);
        }
      });

      // Sort other users by some criteria if desired (e.g., most recent story first)
      // otherUsersStories.sort((a, b) => new Date(b.stories[0].createdAt) - new Date(a.stories[0].createdAt));

      // Combine them: Current user's stories first (if any), then others
      const orderedUsersWithStories = currentUserStoriesGroup
        ? [currentUserStoriesGroup, ...otherUsersStories]
        : otherUsersStories;

      setUsersWithStories(orderedUsersWithStories);
    } catch (err) {
      console.error("Failed to fetch stories", err);
    }
  };

  useEffect(() => {
    fetchStories();
  }, [currentUser]); // Re-fetch if currentUser changes

  const handleUserStoryClick = async (userStories, initialIndex = 0) => {
    setSelectedUserStories(userStories);
    setSelectedStoryInitialIndex(initialIndex);
    setShowStoryViewerModal(true);

    const storyId = userStories[initialIndex]._id;

    try {
      const res = await instance.put(`/stories/${storyId}/view`);
      console.log(res.data)
    } catch (error) {
      console.error("Error marking story as seen", error);
    }
  };

  return (
    <>
      <div
        className="bg-white p-4 rounded-lg shadow-sm mb-4 overflow-x-auto custom-scrollbar"
        ref={storiesContainerRef}
      >
        <div className="flex items-center space-x-4">
          {/* Create Story Card (Your Story) */}
          <div
            className="flex-shrink-0 flex flex-col items-center cursor-pointer"
            onClick={() => setShowAddStoryModal(true)}
          >
            <div className="w-16 h-16 rounded-full border-2 border-gray-300 flex items-center justify-center overflow-hidden relative group hover:border-blue-500 transition-colors">
              {currentUser?.profileImage ? (
                <img
                  src={currentUser.profileImage}
                  alt="Your Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-3xl">
                  {getUserInitial(currentUser)}
                </div>
              )}
              {/* Plus icon on the bottom right for "Your Story" */}
              <div className="absolute bottom-0 right-0 bg-blue-600 rounded-full p-1 border-2 border-white group-hover:bg-blue-700 transition-colors">
                <Plus size={16} className="text-white" />
              </div>
            </div>
            <p className="text-center text-gray-700 text-xs mt-1 truncate w-20">
              Your Story
            </p>
          </div>

          {/* Other Users' Stories */}
          {usersWithStories.map((userGroup) => (
            <div
              key={userGroup.user._id}
              className="flex-shrink-0 flex flex-col items-center cursor-pointer"
              onClick={() => handleUserStoryClick(userGroup.stories)}
            >
              {/* Story Border - will act as the "progress" indicator */}
              <div
                className={`w-16 h-16 rounded-full p-0.5 flex items-center justify-center transition-all duration-200 ease-in-out
                            ${
                              userGroup.user._id === currentUser?._id
                                ? "border-2 border-blue-600"
                                : "border-2 border-green-500 hover:border-green-600"
                            }`}
              >
                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white">
                  {userGroup.user?.profileImage ? (
                    <img
                      src={userGroup.user.profileImage}
                      alt={userGroup.user.fullName || userGroup.user.username}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-3xl">
                      {getUserInitial(userGroup.user)}
                    </div>
                  )}
                </div>
              </div>
              <p className="text-center text-gray-700 text-xs mt-1 truncate w-20">
                {userGroup.user.fullName || userGroup.user.username || "User"}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showAddStoryModal && (
        <AddStoryModal
          currentUser={currentUser}
          onClose={() => setShowAddStoryModal(false)}
          onStoryPosted={fetchStories} // Refresh stories after a new one is posted
        />
      )}

      {showStoryViewerModal && selectedUserStories.length > 0 && (
        <StoryViewerModal
          loggedInUserId={currentUser?._id}
          stories={selectedUserStories}
          initialStoryIndex={selectedStoryInitialIndex}
          onClose={() => setShowStoryViewerModal(false)}
          onView={async (storyId) => {
            try {
              await instance.put(`/stories/${storyId}/view`);
            } catch (e) {
              console.error("Error marking viewed:", e);
            }
          }}
        />
      )}
    </>
  );
};

export default StoriesSection;
