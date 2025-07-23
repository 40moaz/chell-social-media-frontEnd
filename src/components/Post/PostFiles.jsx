import React, { useState } from "react";
import { FaPlayCircle } from "react-icons/fa"; // أيقونة تشغيل

const PostFiles = ({ images, videos, setModalImage }) => {
  const [playingIndex, setPlayingIndex] = useState(null);

  const getGridCols = () => {
    const total = images.length + videos.length;
    if (total === 1) return "grid-cols-1";
    if (total === 2) return "grid-cols-2";
    return "grid-cols-3";
  };

  return (
    <div className={`grid ${getGridCols()} gap-2 mb-3`}>
      {images.map((img, i) => (
        <img
          key={i}
          src={img}
          alt={`Post image ${i + 1}`}
          className="rounded cursor-pointer object-cover w-full max-h-[300px]"
          onClick={() => setModalImage(img)}
        />
      ))}

      {videos.map((vid, i) => (
        <div
          key={i}
          className="relative w-full h-[300px] rounded overflow-hidden group"
        >
          <video
            src={vid}
            className="w-full h-full object-cover border-1 border-gray-300 rounded cursor-pointer"
            muted
            controls
            onClick={() => {
              setModalImage(vid);
            }}
          />
          {playingIndex !== i && (
            <div
              className="absolute inset-0 bg-black/40 flex items-center justify-center cursor-pointer"
              onClick={() => setPlayingIndex(i)}
            >
              <FaPlayCircle className="text-white text-5xl" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PostFiles;
