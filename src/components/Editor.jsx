import React, { useState, useRef } from "react";
import { FaCamera, FaVideo } from "react-icons/fa";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import instance from "../axios/instance";

const CLOUDINARY_CLOUD_NAME = "ddxwe3wy1";
const CLOUDINARY_UPLOAD_PRESET = "chell-social-media";

export default function Editor({ userId, onPostCreated }) {
  const [text, setText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);

  const imageInputRef = useRef();
  const videoInputRef = useRef();

  const handleFileChange = (e, type) => {
    const selected = Array.from(e.target.files).map((file) => ({
      file,
      type,
    }));
    setMediaFiles((prev) => [...prev, ...selected]);
  };

  const handleRemoveMedia = (index) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!text.trim() && mediaFiles.length === 0) return;

    setUploading(true);
    const uploadedImages = [];
    const uploadedVideos = [];

    for (const item of mediaFiles) {
      const formData = new FormData();
      formData.append("file", item.file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`,
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await res.json();
        if (data.secure_url) {
          if (item.type === "image") uploadedImages.push(data.secure_url);
          else if (item.type === "video") uploadedVideos.push(data.secure_url);
        }
      } catch (err) {
        console.error("Upload error:", err);
        toast.error("Error uploading media.");
        setUploading(false);
        return;
      }
    }

    try {
      const response = await instance.post("/posts", {
        userId,
        text,
        images: uploadedImages,
        videos: uploadedVideos,
      });

      toast.success("Post created successfully!", {
        position: "top-right",
        autoClose: 1000,
      });

      setText("");
      setMediaFiles([]);

      if (onPostCreated) {
        onPostCreated(response.data);
      }
    } catch (err) {
      console.error("Post creation error:", err);
      toast.error("Failed to create post.");
    } finally {
      setUploading(false);
    }
  };

  const canPost = (text.trim().length > 0 || mediaFiles.length > 0) && !uploading;

  return (
    <>
      <textarea
        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        rows={4}
        placeholder="What's on your mind?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-3 gap-2 mt-2">
          {mediaFiles.map((item, i) => (
            <div key={i} className="relative">
              {item.type === "image" ? (
                <img
                  src={URL.createObjectURL(item.file)}
                  alt="preview"
                  className="h-24 w-full object-cover rounded border"
                />
              ) : (
                <video
                  src={URL.createObjectURL(item.file)}
                  className="h-24 w-full object-cover rounded border"
                  controls
                />
              )}
              <button
                type="button"
                onClick={() => handleRemoveMedia(i)}
                className="absolute -top-2 -right-2 text-red-600 bg-white rounded-full hover:text-red-800"
                title="Remove"
              >
                <AiOutlineCloseCircle size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center gap-4 mt-3">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => imageInputRef.current.click()}
            className="flex items-center gap-2 text-blue-600 hover:underline"
          >
            <FaCamera className="text-xl" />
            images
          </button>
          <input
            type="file"
            ref={imageInputRef}
            multiple
            accept="image/*"
            onChange={(e) => handleFileChange(e, "image")}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => videoInputRef.current.click()}
            className="flex items-center gap-2 text-purple-600 hover:underline"
          >
            <FaVideo className="text-xl" />
            videos
          </button>
          <input
            type="file"
            ref={videoInputRef}
            multiple
            accept="video/*"
            onChange={(e) => handleFileChange(e, "video")}
            className="hidden"
          />
        </div>

        <button
          onClick={handlePost}
          disabled={!canPost}
          className={`py-2 px-6 rounded-lg text-white font-semibold transition duration-200 ${
            canPost
              ? "bg-blue-600 hover:bg-blue-700 cursor-pointer"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          {uploading ? "Uploading" : "Post"}
        </button>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
