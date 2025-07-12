import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import instance from "../axios/instance"; // أو مسار axios الخاص بك
import CropModal from "../components/CropModal";

const Profile = ({ currentUser }) => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(null);
  const [selectedImagePreview, setSelectedImagePreview] = useState(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState(null);
  const [pendingField, setPendingField] = useState(null);
  const [croppedBlob, setCroppedBlob] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [textValue, setTextValue] = useState("");

  const openModal = (field) => {
    setShowEditModal(field);

    // Set text field value if not an image
    if (!["profileImage", "coverImage"].includes(field)) {
      setTextValue(user[field] || "");
    }
  };
  const closeModal = () => setShowEditModal(null);

  const isOwner = currentUser && user && currentUser._id === user._id;
  useEffect(() => {
    const fetchUser = async () => {
      if (id) {
        try {
          const res = await instance.get(`/auth/users/${id}`);
          setUser(res.data);
        } catch (err) {
          console.error("❌ Failed to load user by ID", err);
        }
      } else {
        setUser(currentUser); // عرض البروفايل الشخصي
      }
    };

    fetchUser();
  }, [id, currentUser]);

  if (!user)
    return (
      <div className="p-10 text-center text-gray-600">Loading profile...</div>
    );
  const handleFieldUpdate = async (field, value) => {
    try {
      const res = await instance.patch(`/auth/users/${user._id}`, {
        [field]: value,
      });

      const updatedUser = res.data;

      console.log(`✅ ${field} updated successfully`, updatedUser);

      // ✅ تحديث الحالة
      setUser(updatedUser);

      // ✅ لو المستخدم الحالي هو اللي بيتعدل، نحدث localStorage
      if (currentUser && currentUser._id === updatedUser._id) {
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (err) {
      console.error(`❌ Failed to update ${field}`, err);
    }
  };

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
      {isOwner && (
        <button
          onClick={() => openModal(fieldName)}
          className="text-sm text-blue-600 hover:underline"
        >
          Edit
        </button>
      )}
    </div>
  );
  console.log(user);

  return (
    <div className="w-full min-h-screen bg-gray-100">
      {/* Cover */}
      <div className="relative h-56 bg-gray-300">
        <div className="relative h-56 bg-gray-300 flex items-center justify-center overflow-hidden">
          {user.coverImage ? (
            <img
              src={user.coverImage}
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
              onClick={() => openModal("coverImage")}
              className="absolute top-2 right-2 bg-white px-3 py-1 text-sm rounded shadow hover:bg-gray-100"
            >
              change cover
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
              {user.fullName?.charAt(0) || "U"}
            </div>
          )}
          {isOwner && (
            <button
              onClick={() => openModal("profileImage")}
              className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 bg-white px-2 py-1 text-xs rounded shadow hover:bg-gray-100"
            >
              change
            </button>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="mt-20 px-4 sm:px-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{user.fullName}</h2>
          <p className="text-sm text-gray-500">@{user.username}</p>
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

        {isOwner ? (
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition">
              Edit Profile
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("user");
                localStorage.removeItem("token");
                window.location.href = "/login"; // redirect manually
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
              Follow
            </button>
            <button className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition">
              Message
            </button>
          </div>
        )}
      </div>

      {/* Extra Info */}
      <div className="mt-8 px-4 sm:px-10">
        <div className="bg-white rounded-lg shadow p-4 space-y-2">
          {renderField("Location", user.location, "location")}
          {renderField("Website", user.website, "website")}
          {renderField("Birthday", user.birthday, "birthday")}
          {renderField("Email", user.email, "email")}
        </div>
      </div>

      {/* Tabs */}
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

      {/* Posts Placeholder */}
      <div className="mt-6 px-4 sm:px-10">
        <div className="bg-white rounded-lg shadow p-4 mb-4">
          <p className="text-gray-800">✍️ User posts will go here.</p>
        </div>
      </div>

      {showEditModal && (
        <div className="fixed inset-0 bg-[#000000bd] bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
            <h3 className="text-lg font-bold mb-4 capitalize">
              Edit{" "}
              {showEditModal === "coverImage"
                ? "cover Image"
                : showEditModal === "profileImage"
                ? "profile Image"
                : showEditModal}
            </h3>

            {["coverImage", "profileImage"].includes(showEditModal) ? (
              <>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setCropImageSrc(reader.result);
                        setShowCropModal(true);
                        setPendingField(showEditModal);
                        setSelectedImagePreview(null);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />

                {selectedImagePreview && (
                  <div className="mb-4">
                    <img
                      src={selectedImagePreview}
                      alt="Preview"
                      className="w-full rounded border"
                    />
                  </div>
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
                onClick={() => {
                  console.log(`📝 Edited ${showEditModal}:`, textValue);
                  setSelectedImagePreview(null);
                  closeModal();
                }}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
              >
                Cancel
              </button>
              <button
                disabled={uploading}
                onClick={async () => {
                  if (["profileImage", "coverImage"].includes(showEditModal)) {
                    if (!croppedBlob) return;
                    setUploading(true);

                    try {
                      const formData = new FormData();
                      formData.append("file", croppedBlob);
                      formData.append("upload_preset", "chell-social-media");

                      const res = await fetch(
                        "https://api.cloudinary.com/v1_1/ddxwe3wy1/image/upload",
                        {
                          method: "POST",
                          body: formData,
                        }
                      );

                      const data = await res.json();
                      console.log(
                        `✅ Edited ${showEditModal}:`,
                        data.secure_url
                      );

                      await handleFieldUpdate(showEditModal, data.secure_url);

                      setSelectedImagePreview(null);
                      setCroppedBlob(null);
                      closeModal();
                    } catch (err) {
                      console.error("❌ Upload failed", err);
                    } finally {
                      setUploading(false);
                    }
                  } else {
                    console.log(`📝 Edited ${showEditModal}:`, textValue);
                    await handleFieldUpdate(showEditModal, textValue);
                    setTextValue("");
                    closeModal();
                  }
                }}
                className={`px-4 py-2 text-white rounded ${
                  uploading
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
      {showCropModal && cropImageSrc && (
        <CropModal
          imageSrc={cropImageSrc}
          onClose={() => setShowCropModal(false)}
          onSave={(croppedDataUrl, croppedBlobFile) => {
            setSelectedImagePreview(croppedDataUrl);
            setCroppedBlob(croppedBlobFile);
            setShowCropModal(false);
          }}
        />
      )}
    </div>
  );
};

export default Profile;
