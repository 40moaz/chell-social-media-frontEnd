import React from "react";

const PostImages = ({ images, setModalImage }) => {
  const getGridCols = () => {
    if (images.length === 1) return "grid-cols-1";
    if (images.length === 2) return "grid-cols-2";
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
    </div>
  );
};

export default PostImages;
