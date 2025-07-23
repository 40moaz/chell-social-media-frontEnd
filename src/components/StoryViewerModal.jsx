import React, { useState, useEffect, useRef, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";
const STORY_DURATION = 5000; // Default duration for image/text stories in milliseconds (5 seconds)
import moment from "moment";
import instance from "../axios/instance";
import { toast } from "react-toastify";
import { Users } from "lucide-react";
const StoryViewerModal = ({
  stories,
  initialStoryIndex,
  onClose,
  loggedInUserId,
  onView,
}) => {
  const [currentStoryIndex, setCurrentStoryIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0); // 0 to 100
  const [isPlaying, setIsPlaying] = useState(true);
  const progressIntervalRef = useRef(null);
  const videoRef = useRef(null);
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const currentStory = stories[currentStoryIndex];
  const menuRef = useRef(null);
  const [viewers, setViewers] = useState([]); // State to hold viewers
  const [showViewersModal, setShowViewersModal] = useState(false);
  // Function to reset progress and start timer for current story
  const startStoryTimer = useCallback(() => {
    setProgress(0);
    clearInterval(progressIntervalRef.current); // Clear any existing interval

    let durationToUse = STORY_DURATION;
    if (currentStory.mediaType === "video" && currentStory.duration) {
      durationToUse = currentStory.duration * 1000; // Convert seconds to milliseconds
    }

    if (isPlaying) {
      progressIntervalRef.current = setInterval(() => {
        setProgress((prevProgress) => {
          const newProgress = prevProgress + 100 / (durationToUse / 100); // Increment by percentage per 100ms
          if (newProgress >= 100) {
            clearInterval(progressIntervalRef.current);
            return 100;
          }
          return newProgress;
        });
      }, 100); // Update every 100ms
    }
  }, [currentStory, isPlaying]);

  // Handle story completion
  const handleStoryEnd = useCallback(() => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex((prevIndex) => prevIndex + 1);
    } else {
      // Last story, close modal
      onClose();
    }
  }, [currentStoryIndex, stories.length, onClose]);

  const getViewers = async (storyId) => {
    try {
      const res = await instance.get(`/stories/${storyId}/viewers`);
      setViewers(res.data);
    } catch (err) {
      console.error("Error fetching viewers", err);
    }
  };

  // Effect to manage progress and story transitions
  useEffect(() => {
    if (!currentStory) return;

    // استدعاء onView لتسجيل المشاهدة
    if (onView) {
      onView(currentStory._id);
    }

    // Reset video state if it exists
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }

    // If it's a video, use video's natural duration
    if (currentStory.mediaType === "video") {
      const handleVideoEnd = () => {
        handleStoryEnd();
      };
      const handleVideoPlay = () => {
        setIsPlaying(true);
      };
      const handleVideoPause = () => {
        setIsPlaying(false);
      };
      const handleVideoLoadedMetadata = () => {
        if (isPlaying) {
          startStoryTimer();
          videoRef.current
            .play()
            .catch((e) => console.error("Error playing video:", e));
        }
      };

      videoRef.current.addEventListener("ended", handleVideoEnd);
      videoRef.current.addEventListener("play", handleVideoPlay);
      videoRef.current.addEventListener("pause", handleVideoPause);
      videoRef.current.addEventListener(
        "loadedmetadata",
        handleVideoLoadedMetadata
      );

      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener("ended", handleVideoEnd);
          videoRef.current.removeEventListener("play", handleVideoPlay);
          videoRef.current.removeEventListener("pause", handleVideoPause);
          videoRef.current.removeEventListener(
            "loadedmetadata",
            handleVideoLoadedMetadata
          );
        }
        clearInterval(progressIntervalRef.current);
      };
    } else {
      // For image/text stories, use fixed timer
      startStoryTimer();
      const timeoutId = setTimeout(handleStoryEnd, STORY_DURATION);
      return () => {
        clearInterval(progressIntervalRef.current);
        clearTimeout(timeoutId);
      };
    }
  }, [currentStory, handleStoryEnd, startStoryTimer, isPlaying, onView]);

  // Pause/Play functionality
  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
    if (currentStory.mediaType === "video" && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current
          .play()
          .catch((e) => console.error("Error playing video:", e));
      }
    }
  }, [isPlaying, currentStory, videoRef]);

  // Manual navigation
  const goToNextStory = useCallback(() => {
    if (currentStoryIndex < stories.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setIsPlaying(true);
    } else {
      onClose();
    }
  }, [currentStoryIndex, stories.length, onClose]);

  const goToPreviousStory = useCallback(() => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setIsPlaying(true);
    }
  }, [currentStoryIndex]);

  // Keyboard navigation (optional)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") {
        goToNextStory();
      } else if (e.key === "ArrowLeft") {
        goToPreviousStory();
      } else if (e.key === "Escape") {
        onClose();
      } else if (e.key === " ") {
        e.preventDefault();
        togglePlayPause();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNextStory, goToPreviousStory, onClose, togglePlayPause]);

  const handleDeleteStory = async (storyId) => {
    try {
      setIsPlaying(false);
      if (videoRef.current) {
        videoRef.current.pause();
      }
      clearInterval(progressIntervalRef.current);

      await instance.delete(`/stories/${storyId}`);
      toast.success(`Story deleted.`, {
        position: "top-right",
        autoClose: 1000,
      });
      onClose();
    } catch (error) {
      console.error("Error deleting story:", error);
      toast.error(`Failed to delete story.`, {
        position: "top-right",
        autoClose: 3000,
      });
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current
          .play()
          .catch((e) => console.error("Error playing video:", e));
      }
      startStoryTimer();
    }
  };

  useEffect(() => {
    // جلب المشاهدين فقط لو كانت الستوري بتاعتي
    if (currentStory.userId?._id === loggedInUserId && currentStory._id) {
      getViewers(currentStory._id);
    } else {
      setViewers([]); // إخفاء عدد المشاهدين لو الستوري مش بتاعتي
    }
  }, [currentStory, loggedInUserId]);

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 bg-[#000000bd] flex items-center justify-center z-50 p-4">
      <div
        className="relative w-full max-w-md h-[90vh] bg-black rounded-lg overflow-hidden flex flex-col"
        onClick={togglePlayPause}
      >
        {/* Progress bars at the top */}
        <div className="absolute top-2 left-0 right-0 flex justify-between px-3 gap-1 z-20">
          {stories.map((_, idx) => (
            <div
              key={idx}
              className="flex-1 h-1 bg-gray-500/50 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white transition-all duration-100 ease-linear"
                style={{
                  width: `${
                    idx === currentStoryIndex
                      ? progress
                      : idx < currentStoryIndex
                      ? 100
                      : 0
                  }%`,
                }}
              ></div>
            </div>
          ))}
        </div>

        {/* Close Button */}
        <button
          className="absolute top-4 right-4 text-white z-30 p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          <X size={24} />
        </button>

        {/* User Info and Menu */}
        <div className="absolute top-10 left-4 z-20 flex items-center gap-2">
          {currentStory.userId?.profileImage ? (
            <Link to={`/users/${currentStory.userId._id}`}>
              <img
                src={currentStory.userId.profileImage}
                alt={currentStory.userId.fullName || "User"}
                className="w-10 h-10 rounded-full object-cover border-2 border-white"
              />
            </Link>
          ) : (
            <Link to={`/users/${currentStory.userId._id}`}>
              <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-300 text-gray-600 flex items-center justify-center text-xl font-bold uppercase">
                {currentStory.userId?.fullName?.charAt(0) || "U"}
              </div>
            </Link>
          )}
          <Link to={`/users/${currentStory.userId._id}`}>
            <div className="text-white font-semibold text-lg drop-shadow">
              {currentStory.userId?.fullName ||
                currentStory.userId?.username ||
                "Unknown User"}
            </div>
            <div className="text-white text-sm ml-2">
              {moment(currentStory.createdAt).calendar()}
            </div>
          </Link>

          {currentStory.userId?._id === loggedInUserId && (
            <div className="relative flex items-center gap-2 ml-auto">

              <button
                className="flex items-center text-white/80 text-sm px-2 py-1 rounded-full bg-gray-800/50 hover:bg-gray-700/50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowViewersModal(true); // فتح مودال المشاهدين
                }}
              >
                <Users size={16} className="mr-1" /> {/* أيقونة المشاهدين */}
                <span>{viewers.length - 1}</span>
              </button>
              <button
                className="text-white p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteMenu((prev) => !prev);
                }}
              >
                <MoreVertical size={20} />
              </button>
              {showDeleteMenu && (
                <div
                  ref={menuRef}
                  className="absolute top-full right-0 mt-2 w-40 bg-white rounded-md shadow-lg py-1 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                    onClick={() => {
                      handleDeleteStory(currentStory._id);
                      setShowDeleteMenu(false);
                    }}
                  >
                    Delete Story
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Story Content */}
        <div className="flex-grow flex items-center justify-center relative">
          {currentStory.mediaUrl ? (
            currentStory.mediaType === "video" ? (
              <video
                ref={videoRef}
                src={currentStory.mediaUrl}
                controls={false}
                autoPlay
                className="max-h-full max-w-full object-contain mx-auto"
                onLoadedMetadata={() =>
                  videoRef.current
                    .play()
                    .catch((e) => console.error("Video auto-play failed:", e))
                }
                onEnded={handleStoryEnd}
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <img
                src={currentStory.mediaUrl}
                alt={currentStory.text || "Story"}
                className="max-h-full max-w-full object-contain mx-auto"
              />
            )
          ) : (
            <div
              className="w-full h-full flex items-center justify-center p-8 text-center"
              style={{ backgroundColor: currentStory.bgColor || "#1DA1F2" }}
            >
              <p className="text-white text-3xl font-bold break-words">
                {currentStory.text}
              </p>
            </div>
          )}
          {/* Navigation Arrows */}
          <button
            className="absolute left-0 top-1/2 transform -translate-y-1/2 p-2 bg-black/30 rounded-r-lg text-white hover:bg-black/50 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              goToPreviousStory();
            }}
          >
            <ChevronLeft size={30} />
          </button>
          <button
            className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 bg-black/30 rounded-l-lg text-white hover:bg-black/50 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              goToNextStory();
            }}
          >
            <ChevronRight size={30} />
          </button>
        </div>

        {/* Story Text (if any) overlaid on media or within text story */}
        {currentStory.text && currentStory.mediaUrl && (
          <div className="p-4 bg-black bg-opacity-50 text-white text-center">
            <p className="text-lg">{currentStory.text}</p>
          </div>
        )}
      </div>
      {showViewersModal && (
        <div className="fixed inset-0 bg-[#000000bd] flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-sm h-auto max-h-[80vh] bg-gray-800 rounded-lg overflow-hidden flex flex-col p-6">
            <h2 className="text-white text-xl font-bold mb-4">
              Viewers ({viewers.length -1})
            </h2>

            <button
              className="absolute top-4 right-4 text-white z-10 p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setShowViewersModal(false);
              }}
            >
              <X size={20} />
            </button>
            <ul className="flex-grow overflow-y-auto space-y-4">
              {viewers.length > 0 ? (
                // نستخدم filter عشان نستثني صاحب الستوري من القائمة
                viewers
                  .filter((viewer) => viewer._id !== currentStory.userId._id)
                  .map((viewer) => (
                    <li key={viewer._id} className="flex items-center gap-3">
                      <Link
                        to={`/users/${viewer._id}`}
                        onClick={() => setShowViewersModal(false)}
                      >
                        {viewer.profileImage ? (
                          <img
                            src={viewer.profileImage}
                            alt={viewer.fullName}
                            className="w-12 h-12 rounded-full object-cover border-2 border-gray-400"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-full border-2 border-gray-400 bg-gray-600 text-white flex items-center justify-center text-lg font-bold uppercase">
                            {viewer.fullName?.charAt(0) || "U"}
                          </div>
                        )}
                      </Link>
                      <div className="flex-1">
                        <Link
                          to={`/users/${viewer._id}`}
                          onClick={() => setShowViewersModal(false)}
                        >
                          <p className="text-white font-semibold">
                            {viewer.fullName || "Unknown User"}
                          </p>
                        </Link>
                        <p className="text-gray-400 text-sm">
                          @{viewer.username}
                        </p>
                      </div>
                    </li>
                  ))
              ) : (
                <p className="text-center text-gray-400">No viewers yet.</p>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default StoryViewerModal;
