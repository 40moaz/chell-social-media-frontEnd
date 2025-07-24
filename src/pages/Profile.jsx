import React, { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import instance from "../axios/instance"; // Your configured axios instance
import CropModal from "../components/CropModal"; // Assuming this component exists and works
import CommentModal from "../components/Comment/CommentModal"; // Assuming this component exists and works
import PostFeed from "../components/Post/PostFeed"; // Assuming this component exists and works
import moment from "moment"; // For time formatting
import { toast } from "react-toastify"; // For notifications
import { Loader2, X } from "lucide-react"; // Add this import for the close icon
import ShareModal from "../components/ShareModal"; // Assuming this component exists for sharing posts
const CLOUDINARY_CLOUD_NAME = "ddxwe3wy1";
const CLOUDINARY_UPLOAD_PRESET = "chell-social-media";

const Profile = ({
  currentUser,
  onUserUpdate,
  sharePost,
  handleShare,
  setSharePost,
}) => {
  // Added onUserUpdate prop for global user state sync
  const { id } = useParams(); // ID from URL params (profile being viewed)
  const navigate = useNavigate();
  const [user, setUser] = useState(null); // The user whose profile is being viewed
  const [isLoadingProfile, setIsLoadingProfile] = useState(true); // Loading state for profile data
  const [showEditModal, setShowEditModal] = useState(null); // Controls which edit modal is open (e.g., 'bio', 'location')
  const [selectedImagePreview, setSelectedImagePreview] = useState(null); // Preview URL for selected image before crop
  const [showCropModal, setShowCropModal] = useState(false); // Controls crop modal visibility
  const [cropImageSrc, setCropImageSrc] = useState(null); // Image source for the cropper
  const [pendingField, setPendingField] = useState(null); // Which field is being updated (profileImage or cover)
  const [croppedBlob, setCroppedBlob] = useState(null); // Cropped image as a Blob for upload
  const [uploading, setUploading] = useState(false); // Loading state for image upload
  const [textValue, setTextValue] = useState(""); // Value for text-based edit fields (bio, location, etc.)
  const [userPosts, setUserPosts] = useState([]); // Posts belonging to the profile user
  const [followers, setFollowers] = useState([]); // List of follower IDs
  const [commentPost, setCommentPost] = useState(null); // Post selected for commenting
  const [openMenuPostId, setOpenMenuPostId] = useState(null); // ID of post with open context menu
  const [postUsers, setPostUsers] = useState({}); // Map of user data for posts (populated authors)
  const menuRef = useRef(null); // Ref for context menu outside click handling
  const [modalImage, setModalImage] = useState(null);

  // Helper to format time (e.g., "5 minutes ago")
  const timeAgo = useCallback((dateString) => moment(dateString).fromNow(), []);

  // Determine if the current logged-in user owns this profile
  const isOwner = currentUser && user && currentUser._id === user._id;

  // State to track if currentUser is following the viewed profile user
  const [isFollowing, setIsFollowing] = useState(false);

  // --- API Call Functions ---

  // Fetch user data for the profile being viewed
  const fetchUser = useCallback(async () => {
    setIsLoadingProfile(true);
    try {
      const userIdToFetch = id || currentUser?._id; // Use ID from params, or current user's ID if on own profile
      if (!userIdToFetch) {
        // If no ID and no currentUser, cannot fetch profile
        navigate("/login"); // Or handle as "user not found"
        return;
      }
      const res = await instance.get(`/auth/users/${userIdToFetch}`);
      setUser(res.data);
    } catch (err) {
      console.error("❌ Failed to load user profile:", err);
      toast.error("Failed to load profile. User may not exist.");
      navigate("/not-found"); // Redirect if user not found or error
    } finally {
      setIsLoadingProfile(false);
    }
  }, [id, currentUser?._id, navigate]); // Depend on id and currentUser._id

  // Fetch followers for the profile being viewed
  const fetchFollowers = useCallback(async () => {
    if (!user?._id) return; // Ensure user data is loaded before fetching followers
    try {
      const res = await instance.get(`/followers/${user._id}`);
      const fetchedFollowers = res.data.followers || []; // Assuming backend returns { followers: [...] }
      setFollowers(fetchedFollowers);
      // Check if currentUser is following this user
      if (currentUser?._id) {
        setIsFollowing(fetchedFollowers.includes(currentUser._id));
      }
    } catch (err) {
      console.error("❌ Failed to fetch followers:", err);
      setFollowers([]); // Clear followers on error
      setIsFollowing(false); // Assume not following on error
    }
  }, [user?._id, currentUser?._id]); // Depend on user._id and currentUser._id

  // Fetch posts by the profile user
  const fetchUserPosts = useCallback(async () => {
    if (!user?._id) return; // Ensure user data is loaded before fetching posts
    try {
      const res = await instance.get(`/posts/user/${user._id}`);
      const postsData = res.data;
      setUserPosts(postsData);

      // Collect unique user IDs from posts to fetch their details
      const uniqueUserIds = [
        ...new Set(postsData.map((p) => p.userId?._id || p.userId)),
      ]; // Handle both populated and unpopulated userId
      const usersMap = {};
      await Promise.all(
        uniqueUserIds.map(async (uid) => {
          if (uid) {
            // Ensure uid is not null/undefined
            // If the user data is already in currentUser or 'user' state, use it
            if (currentUser?._id === uid) {
              usersMap[uid] = currentUser;
            } else if (user?._id === uid) {
              usersMap[uid] = user;
            } else {
              // Otherwise, fetch user data
              try {
                const userDataRes = await instance.get(`/auth/users/${uid}`);
                usersMap[uid] = userDataRes.data;
              } catch (fetchErr) {
                console.error(
                  `❌ Failed to fetch user ${uid} for post:`,
                  fetchErr
                );
                // Optionally add a placeholder user object
                usersMap[uid] = {
                  _id: uid,
                  username: "Unknown",
                  profileImage:
                    "https://via.placeholder.com/50/CCCCCC/FFFFFF?text=U",
                };
              }
            }
          }
        })
      );
      setPostUsers(usersMap);
    } catch (err) {
      console.error("❌ Failed to load user posts:", err);
      setUserPosts([]); // Clear posts on error
      setPostUsers({}); // Clear post users on error
    }
  }, [user?._id, currentUser]); // Depend on user._id and currentUser

  // --- Effects for Data Fetching ---

  // Effect to fetch the main profile user data
  useEffect(() => {
    fetchUser();
  }, [fetchUser]); // fetchUser is a useCallback, so this is correct

  // Effect to fetch followers and posts once the profile user data is loaded
  useEffect(() => {
    if (user?._id) {
      // Only run if 'user' object and its ID are available
      fetchFollowers();
      fetchUserPosts();
    }
  }, [user?._id, fetchFollowers, fetchUserPosts]); // Depend on user._id and the memoized fetch functions

  // --- Action Handlers ---

  const handleFollowToggle = async () => {
    if (!user || !currentUser || !currentUser._id) {
      toast.error("Authentication required to follow/unfollow.");
      return;
    }
    if (user._id === currentUser._id) {
      toast.info("You cannot follow yourself.");
      return;
    }

    try {
      if (isFollowing) {
        await instance.delete(`/followers/${user._id}`);
        setFollowers((prev) => prev.filter((fId) => fId !== currentUser._id));
        setIsFollowing(false);
        toast.info(
          `You unfollowed ${user.username || user.fullName || "this user"} ❌`
        );
      } else {
        await instance.post(`/followers/${user._id}`);
        setFollowers((prev) => [...prev, currentUser._id]);
        setIsFollowing(true);
        toast.success(
          `You are now following ${
            user.username || user.fullName || "this user"
          } ✅`,
          {
            position: "top-right",
            autoClose: 1000,
          }
        );
      }
    } catch (err) {
      console.error("❌ Failed to toggle follow:", err);
      toast.error("Failed to update follow status. Please try again.");
      // Revert UI if API call fails (optional, but good for robustness)
      fetchFollowers(); // Re-fetch to sync with backend
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      // Use custom modal instead of window.confirm in production
      return;
    }
    try {
      await instance.delete(`/posts/${postId}`);
      setUserPosts((prev) => prev.filter((p) => p._id !== postId));
      toast.success("Post deleted successfully ✅", {
        position: "top-center",
        autoClose: 1000,
      });
    } catch (err) {
      toast.error("Failed to delete the post ❌");
      console.error("Failed to delete the post:", err);
    }
  };

  const openCommentModal = (post) => setCommentPost(post);
  const closeCommentModal = () => setCommentPost(null);

  // Helper to check if the current logged-in user owns a specific post
  const isPostOwner = useCallback(
    (postUserId) => {
      return currentUser?._id === postUserId;
    },
    [currentUser?._id]
  );

  // Opens the edit modal for a specific field (e.g., 'bio', 'profileImage')
  const openModal = (field) => {
    setShowEditModal(field);
    if (!["profileImage", "cover"].includes(field)) {
      setTextValue(user?.[field] || ""); // Pre-fill text input for non-image fields
    } else {
      // For image fields, clear previous image states
      setSelectedImagePreview(null);
      setCroppedBlob(null);
      setCropImageSrc(null);
      setPendingField(field); // Set which image field is being edited
    }
  };

  // Closes any open edit modal and resets related states
  const closeModal = () => {
    setShowEditModal(null);
    setSelectedImagePreview(null);
    setCroppedBlob(null);
    setCropImageSrc(null);
    setPendingField(null);
    setTextValue("");
    setUploading(false); // Ensure uploading state is reset
  };

  // Handles updating a user field (e.g., bio, location, profileImage URL)
  const handleFieldUpdate = async (field, value) => {
    try {
      const res = await instance.patch(`/auth/users/${user._id}`, {
        [field]: value,
      });
      const updatedUser = res.data;
      setUser(updatedUser); // Update local user state
      if (currentUser && currentUser._id === updatedUser._id && onUserUpdate) {
        // If updated user is the current logged-in user, update global state/localStorage
        onUserUpdate(updatedUser); // Call prop to update global user state
        localStorage.setItem("user", JSON.stringify(updatedUser)); // Update localStorage
      }
      toast.success(`${field} updated successfully! ✅`, {
        position: "top-right",
        autoClose: 1000,
      });
      closeModal(); // Close modal after successful update
    } catch (err) {
      console.error(`❌ Failed to update ${field}:`, err);
      toast.error(`Failed to update ${field}. Please try again ❌`);
    }
  };

  // Handles file input change for profile/cover images
  const handleImageChange = (e, field) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCropImageSrc(reader.result); // Set image source for the cropper
        setShowCropModal(true); // Open crop modal
        setPendingField(field); // Store which field is being updated
        setSelectedImagePreview(null); // Clear previous preview
      };
      reader.readAsDataURL(file);
    }
  };

  // Handles the save action in the edit modal
  const handleSaveEdit = async () => {
    if (["profileImage", "cover"].includes(showEditModal)) {
      // Logic for image upload
      if (!croppedBlob) {
        toast.error("Please select and crop an image first.");
        return;
      }
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append("file", croppedBlob); // Append the cropped Blob
        formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET); // Your Cloudinary upload preset
        formData.append("folder", "user_profiles"); // Optional: specific folder in Cloudinary

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.message || "Cloudinary upload failed");
        }
        const data = await res.json();
        await handleFieldUpdate(showEditModal, data.secure_url); // Update user field with Cloudinary URL
      } catch (err) {
        console.error("❌ Image upload failed:", err);
        toast.error(
          `Image upload failed: ${err.message || "Unknown error"} ❌`
        );
      } finally {
        setUploading(false);
      }
    } else {
      // Logic for text-based fields
      if (!textValue.trim()) {
        toast.error("Field cannot be empty.");
        return;
      }
      await handleFieldUpdate(showEditModal, textValue);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    // Use navigate for client-side routing
    navigate("/login"); // Redirect to login page
    toast.info("Logged out successfully.");
  };

  // Helper to render editable profile fields
  const renderField = (label, value, fieldName) => (
    <div className="flex items-center justify-between py-2 border-b">
      <div className="text-gray-700">
        <span className="font-semibold mr-2">{label}:</span>
        {value ? (
          value
        ) : (
          <span className="text-gray-400 italic">No {label.toLowerCase()}</span>
        )}
      </div>
      {isOwner && ( // Only show edit button if current user owns the profile
        <button
          onClick={() => openModal(fieldName)}
          className="text-sm text-blue-600 hover:underline"
        >
          Edit
        </button>
      )}
    </div>
  );
  useEffect(() => {
    console.log("croppedBlob inside useEffect:", croppedBlob);
    if (croppedBlob) {
      console.log("✅ updated croppedBlob in state:", croppedBlob);
    }
  }, [croppedBlob]);

  const handleSave = (croppedDataUrl, croppedBlobFile) => {
    setCroppedBlob(croppedBlobFile);
    setSelectedImagePreview(croppedDataUrl);
    console.log("b:", croppedBlobFile);
    console.log("Received in profile page:", croppedDataUrl, croppedBlob);
    setShowCropModal(false);
  };
  const handleAddComment = async (commentText) => {
    if (!commentText.trim()) {
      toast.error("Comment cannot be empty.");
      return;
    }
    if (!currentUser?._id) {
      toast.error("You must be logged in to comment.");
      return;
    }
    if (!commentPost?._id) {
      toast.error("No post selected to comment on.");
      return;
    }

    try {
      const res = await instance.post("/comments", {
        userId: currentUser._id,
        text: commentText,
        postId: commentPost._id,
      });
      // Assuming the backend returns the updated post or comment
      // You might need to refresh comments for the specific post or update its comment count
      toast.success("Your comment was added successfully ✅", {
        position: "top-center",
        autoClose: 1000,
      });
      // Optionally re-fetch posts or update the specific post in userPosts state
      fetchUserPosts(); // Re-fetch all user posts to update comments (less efficient but ensures sync)
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment. Please try again ❌", {
        position: "top-center",
        autoClose: 1000,
      });
    }
  };

  console.log(croppedBlob);

  // --- Render Logic ---

  if (isLoadingProfile)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-gray-600">
        <Loader2 size={48} className="animate-spin text-blue-500 mb-4" />
        <p className="text-xl font-semibold">Loading user data...</p>
        <p className="text-sm mt-1">Please wait a moment.</p>
      </div>
    );

  return (
    <div className="w-full min-h-screen bg-gray-100 pb-10">
      {/* Cover Section */}
      <div className="relative h-56 bg-gray-300">
        <div className="relative h-56 bg-gray-300 flex items-center justify-center overflow-hidden">
          {user.cover ? (
            <img
              src={user.cover}
              alt="cover"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-500 text-xl font-semibold">
              No Cover Photo
            </div>
          )}
          {isOwner && (
            <button
              onClick={() => openModal("cover")}
              className="absolute top-2 right-2 bg-white px-3 py-1 text-sm rounded shadow hover:bg-gray-100"
            >
              Change Cover
            </button>
          )}
        </div>
        <div className="absolute -bottom-14 left-4 sm:left-10">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt="profile"
              className="w-28 h-28 rounded-full border-4 border-white object-cover shadow-md"
            />
          ) : (
            <div className="w-28 h-28 rounded-full border-4 border-white bg-gray-300 text-gray-500 shadow-md flex items-center justify-center text-3xl font-bold uppercase">
              {user.fullName?.charAt(0) || user.username?.charAt(0) || "U"}
            </div>
          )}
          {isOwner && (
            <button
              onClick={() => openModal("profileImage")}
              className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 bg-white px-2 py-1 text-xs rounded shadow hover:bg-gray-100"
            >
              Change
            </button>
          )}
        </div>
      </div>

      {/* Profile Info Section */}
      <div className="mt-20 px-4 sm:px-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            {user.fullName || user.username || "User"}
          </h2>
          {user.username && (
            <p className="text-sm text-gray-500">@{user.username}</p>
          )}
          <p className="text-sm text-gray-500">{followers.length} Followers</p>
          <p className="mt-2 text-gray-600 flex items-center gap-2">
            {user.bio || <span className="text-gray-400 italic">No bio</span>}
            {isOwner && (
              <button
                onClick={() => openModal("bio")}
                className="text-sm text-blue-600 hover:underline"
              >
                Edit
              </button>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          {isOwner ? (
            <>
              {/* This "Edit Profile" button can open a comprehensive edit modal if you have one */}
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={handleFollowToggle}
                className={`px-4 py-2 ${
                  isFollowing
                    ? "bg-gray-300 text-gray-700"
                    : "bg-blue-600 text-white"
                } rounded-lg hover:opacity-90 transition`}
              >
                {isFollowing ? "Unfollow" : "Follow"}
              </button>
              <Link
                to={`/messages/${user._id}`} // Link to message user
                className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
              >
                Message
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Extra Info Section */}
      <div className="mt-8 px-4 sm:px-10">
        <div className="bg-white rounded-lg shadow p-4 space-y-2">
          {renderField("Location", user.location, "location")}
          {renderField("Website", user.website, "website")}
          {/* Ensure birthday is formatted if it's a Date object */}
          {renderField(
            "Birthday",
            user.birthday ? moment(user.birthday).format("MMM D, YYYY") : null,
            "birthday"
          )}
          {renderField("Email", user.email, "email")}
        </div>
      </div>

      {/* Tabs Section (Placeholder for future functionality) */}
      <div className="mt-6 border-t border-gray-200 px-4 sm:px-10">
        <ul className="flex gap-6 text-gray-600 font-medium pt-4 overflow-x-auto">
          <li className="cursor-pointer hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 pb-2">
            Posts
          </li>
          <li className="cursor-pointer hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 pb-2">
            About
          </li>
          <li className="cursor-pointer hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 pb-2">
            Friends
          </li>
          <li className="cursor-pointer hover:text-blue-600 border-b-2 border-transparent hover:border-blue-600 pb-2">
            Photos
          </li>
        </ul>
      </div>

      {/* User Posts Section */}
      <div className="mt-6 px-4 sm:px-10 space-y-4">
        {userPosts.length > 0 ? (
          <PostFeed
            posts={userPosts}
            postUsers={postUsers}
            loading={false}
            currentUserId={currentUser?._id}
            currentUser={currentUser}
            onComment={openCommentModal}
            onShare={handleShare}
            isPostOwner={isPostOwner}
            openMenuPostId={openMenuPostId}
            setOpenMenuPostId={setOpenMenuPostId}
            menuRef={menuRef}
            setModalImage={setModalImage} // Ensure this prop is passed so PostFiles can use it
            onDeletePost={handleDeletePost}
            timeAgo={timeAgo}
          />
        ) : (
          <p className="text-gray-500 italic text-center py-8">
            {isOwner
              ? "You haven't posted anything yet."
              : `${user.fullName || user.username} hasn't posted anything yet.`}
          </p>
        )}
      </div>

      {/* Edit Modal (for text fields and image selection) */}
      {showEditModal && (
        <div className="fixed inset-0 bg-[#000000bd] bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <h3 className="text-lg font-bold mb-4 capitalize">
              Edit{" "}
              {showEditModal === "cover"
                ? "Cover Image"
                : showEditModal === "profileImage"
                ? "Profile Image"
                : showEditModal}
            </h3>
            {["profileImage", "cover"].includes(showEditModal) ? (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageChange(e, showEditModal)}
                  className="mb-4 block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-full file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100"
                />
                {selectedImagePreview && ( // Show preview of cropped image
                  <div className="mb-4">
                    <img
                      src={selectedImagePreview}
                      alt="Preview"
                      className="w-full rounded border"
                    />
                  </div>
                )}
                {!selectedImagePreview &&
                  cropImageSrc && ( // Show message if image selected but not yet cropped
                    <p className="text-sm text-gray-500 mb-4">
                      Image selected. Please crop it in the modal.
                    </p>
                  )}
              </>
            ) : (
              <input
                type="text"
                placeholder={`Enter new ${showEditModal}`}
                className="w-full p-2 border rounded mb-4"
                value={textValue}
                onChange={(e) => setTextValue(e.target.value)}
              />
            )}
            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                disabled={
                  uploading ||
                  (["profileImage", "cover"].includes(showEditModal) &&
                    !croppedBlob)
                }
                onClick={handleSaveEdit} // Call the new  consolidated save handler
                className={`px-4 py-2 text-white rounded ${
                  uploading ||
                  (["profileImage", "cover"].includes(showEditModal) &&
                    !croppedBlob)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {uploading ? "Uploading..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Crop Modal */}
      {showCropModal && cropImageSrc && (
        <CropModal
          imageSrc={cropImageSrc}
          onClose={() => {
            setShowCropModal(false);
            setCropImageSrc(null); // Clear crop source on close
            setCroppedBlob(null); // Clear cropped blob if user cancels crop
          }}
          onSave={handleSave}
        />
      )}
      {/* Comment Modal */}
      {commentPost && (
        <CommentModal
          setModalImage={setModalImage}
          post={commentPost}
          onClose={closeCommentModal}
          onAddComment={handleAddComment}
          timeAgo={timeAgo}
          postUsers={{ ...postUsers, [currentUser?._id]: currentUser }}
          currentUserId={currentUser?._id}
          currentUser={currentUser}
        />
      )}
      {modalImage && (
        <div
          className="fixed inset-0 bg-[#000000bd] flex items-center justify-center z-50"
          onClick={() => setModalImage(null)} // Close modal on background click
        >
          <div
            className="relative max-h-[80vh] max-w-[90vw] rounded shadow-lg"
            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            {/* Close button */}
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
            {/* Content */}
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
      {sharePost && (
        <ShareModal post={sharePost} onClose={() => setSharePost(null)} />
      )}
    </div>
  );
};

export default Profile;
