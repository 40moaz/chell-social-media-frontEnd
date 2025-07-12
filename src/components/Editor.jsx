import React, { useState, useRef } from "react";
import { FaCamera } from "react-icons/fa";
import { AiOutlineCloseCircle } from "react-icons/ai";
import { toast, ToastContainer } from "react-toastify"; // استيراد toast
import "react-toastify/dist/ReactToastify.css"; // استيراد ستايلات toast

const CLOUDINARY_CLOUD_NAME = "ddxwe3wy1";
const CLOUDINARY_UPLOAD_PRESET = "chell-social-media";
import instance from "../axios/instance";

export default function Editor({ userId, onPostCreated }) {
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  const handleRemoveImage = (index) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };
const handlePost = async () => {
  if (!text.trim() && files.length === 0) return;

  setUploading(true);
  const uploadedUrls = [];

  for (const file of files) {
    const formData = new FormData();
    formData.append("file", file);
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
        uploadedUrls.push(data.secure_url);
      } else {
        throw new Error("Upload failed");
      }
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Error uploading images.");
      setUploading(false);
      return;
    }
  }
  try {
    const response = await instance.post("/posts", {
      userId,
      text,
      images: uploadedUrls,
    });

    toast.success("Post created successfully!");
    setText("");
    setFiles([]);

    // هنا بنضيف البوست الجديد فوراً في الـ feed
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


  const canPost = (text.trim().length > 0 || files.length > 0) && !uploading;

  return (
    <>
      <textarea
        className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
        rows={4}
        placeholder="What's on your mind?"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      {files.length > 0 && (
        <div className="grid grid-cols-3 gap-2 relative mt-2">
          {files.map((file, i) => (
            <div key={i} className="relative">
              <img
                src={URL.createObjectURL(file)}
                alt="preview"
                className="h-24 w-full object-cover rounded border"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage(i)}
                className="absolute -top-2 -right-2 text-red-600 bg-white rounded-full hover:text-red-800"
                title="Remove image"
              >
                <AiOutlineCloseCircle size={20} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-between items-center gap-4 mt-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            className="flex items-center gap-2 text-blue-600 hover:underline"
          >
            <FaCamera className="text-xl" />
            Images
          </button>
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <span className="text-sm text-gray-500">
            {files.length > 0 && `${files.length} file(s) selected`}
          </span>
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
          {uploading ? "Uploading..." : "Post"}
        </button>
      </div>

      {/* هنا تضيف ToastContainer مرة واحدة في الكومبوننت */}
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}
