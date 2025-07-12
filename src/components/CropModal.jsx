// components/CropModal.jsx
import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "./cropImageHelper";

const CropModal = ({ imageSrc, onClose, onSave }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [loading, setLoading] = useState(false);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = async () => {
    try {
      setLoading(true);
      const croppedDataUrl = await getCroppedImg(imageSrc, croppedAreaPixels);
      const blob = await fetch(croppedDataUrl).then((r) => r.blob());
      onSave(croppedDataUrl, blob); // 👈 بنبعت dataURL + Blob للـ Profile.jsx
    } catch (err) {
      console.error("❌ Failed to crop image:", err);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white p-4 rounded-lg w-[90%] max-w-md">
        <div className="relative w-full h-80 bg-gray-100">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="mt-4 flex justify-between">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className={`px-4 py-2 text-white rounded ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Cropping..." : "Crop & Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CropModal;
