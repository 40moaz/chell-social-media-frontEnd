import React, { useState, useRef } from "react";
import { X, Image, Video, Palette, Trash2 } from "lucide-react"; // Added Trash2 icon
import axios from "axios";
import { toast } from "react-toastify";
import instance from "../axios/instance";
const CLOUDINARY_CLOUD_NAME = "ddxwe3wy1";
const CLOUDINARY_UPLOAD_PRESET = "chell-social-media";

const COLORS = [
  "#1DA1F2", // Light Blue
  "#E0245E", // Pink
  "#FFAD1F", // Orange
  "#17BF63", // Green
  "#901A8E", // Purple
  "#007bff", // Blue
  "#6c757d", // Gray
  "#28a745", // Green
  "#dc3545", // Red
  "#ffc107", // Yellow
  "#6f42c1", // Indigo
];

const AddStoryModal = ({ onClose, currentUser, onStoryPosted }) => {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mediaType, setMediaType] = useState(null);
  const [duration, setDuration] = useState(null);
  const [bgColor, setBgColor] = useState(COLORS[0]); // Default to first color
  const [showColorPicker, setShowColorPicker] = useState(false);

  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    setMediaType(selected.type.startsWith("video") ? "video" : "image");

    if (selected.type.startsWith("video")) {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        const dur = video.duration;
        setDuration(dur);

        if (dur > 20) {
          toast.error("Video must be 20 seconds or less");
          setFile(null);
          setPreview(null);
          if (fileInputRef.current) fileInputRef.current.value = ""; // Clear input
        } else {
          setFile(selected);
          setPreview(URL.createObjectURL(selected));
        }
      };

      video.src = URL.createObjectURL(selected);
    } else {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setDuration(null);
    }
  };

  const uploadToCloudinary = async () => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
    formData.append("folder", "stories");

    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`,
      formData
    );
    return res.data.secure_url;
  };

  const handleSubmit = async () => {
    // A story must have either text, or a file, or both.
    if (!text.trim() && !file) {
      toast.error("Please add text or select media for your story.");
      return;
    }

    // If file is selected but video duration is too long, prevent submission
    if (file && mediaType === "video" && duration > 20) {
      toast.error("Video must be 20 seconds or less.");
      return;
    }

    try {
      setLoading(true);
      let mediaUrl = null;

      if (file) {
        mediaUrl = await uploadToCloudinary();
      }

      const payload = {
        userId: currentUser._id, // Ensure you pass the user's ID
        text,
        mediaUrl,
        mediaType,
        bgColor: !file && text.trim() ? bgColor : undefined,
        duration: mediaType === "video" ? duration : undefined,
      };

      await instance.post("/stories", payload);

      toast.success("Story added successfully!", {
        position: "top-right",
        autoClose: 1000,
      });
      onClose();
      if (onStoryPosted) {
        onStoryPosted(); // Notify parent to refresh stories
      }
    } catch (err) {
      console.error("Failed to add story:", err);
      toast.error("Failed to add story. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setMediaType(null);
    setDuration(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ""; // Clear the file input
    }
  };

  return (
    <div className="fixed inset-0 bg-[#000000bd] flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-lg relative flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-center flex-grow">Create Story</h2>
          <button
            className="text-gray-500 hover:bg-gray-200 rounded-full p-2 transition-colors duration-200"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-grow p-4 overflow-y-auto">
          {/* Story Preview Area */}
          {/* Always show a preview area. Its background color only applies if no media. */}
          <div
            className="w-full min-h-[200px] mb-4 rounded-lg flex items-center justify-center relative overflow-hidden"
            style={{ backgroundColor: !file && text.trim() ? bgColor : "transparent" }}
          >
            {preview ? (
              // If there's a file, display it as background/main content
              mediaType === "video" ? (
                <video src={preview} controls className="max-h-[400px] w-full object-contain rounded-lg" />
              ) : (
                <img src={preview} alt="preview" className="max-h-[400px] w-full object-contain rounded-lg" />
              )
            ) : (
              // If no file, show a large text input (for text-only stories)
              <textarea
                className={`w-full h-full p-4 text-center resize-none border-none focus:ring-0 text-xl font-bold rounded-lg
                  ${!file ? "bg-transparent text-white" : "bg-white text-gray-800"}`} // Text color changes based on media presence
                rows={5}
                placeholder="Start typing..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                style={{ color: !file ? "white" : "inherit" }}
              />
            )}

            {/* Always show text input, possibly overlaid on media */}
            {file && ( // Only overlay text if a file is present
                <textarea
                  className="absolute bottom-4 left-4 right-4 p-2 bg-black/50 text-white text-base resize-none rounded opacity-90"
                  rows={2}
                  placeholder="Add text... (optional)"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
            )}

            {preview && (
              <button
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                onClick={handleRemoveFile}
                title="Remove media"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {/* Action buttons (Add Photo/Video, Background Color) */}
          <div className="flex flex-col gap-3">
            <div className="bg-gray-100 hover:bg-gray-300 p-3 rounded-lg flex justify-center">
              <label htmlFor="file-upload" className="cursor-pointer flex items-center gap-2 text-blue-600 hover:text-blue-900">
                {file ? <Video size={20} /> : <Image size={20} />} {/* Icon changes if file selected */}
                <span>{file ? "Change Photo/Video" : "Add Photo/Video"}</span>
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*,video/*"
                onChange={handleFileChange}
                className="hidden"
                ref={fileInputRef}
              />
            </div>

            {/* Color picker only for text-only stories */}
            {!file && (
              <div className="bg-gray-100 hover:bg-gray-300 p-3 rounded-lg relative">
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="flex items-center gap-2 cursor-pointer text-purple-600 hover:text-purple-900 w-full justify-center"
                >
                  <Palette size={20} />
                  <span>Background Color</span>
                </button>
                {showColorPicker && (
                  <div className="absolute left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 grid grid-cols-5 gap-2 z-10">
                    {COLORS.map((color, index) => (
                      <div
                        key={index}
                        className="w-8 h-8 rounded-full cursor-pointer border-2 border-transparent hover:border-blue-500"
                        style={{ backgroundColor: color }}
                        onClick={() => {
                          setBgColor(color);
                          setShowColorPicker(false);
                        }}
                      ></div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Post Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleSubmit}
            disabled={loading || (!file && !text.trim())}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all duration-200
            ${
              loading || (!file && !text.trim())
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Posting..." : "Share Story"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddStoryModal;