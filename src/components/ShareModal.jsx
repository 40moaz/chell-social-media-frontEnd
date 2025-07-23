import { Facebook, LinkIcon, X } from "lucide-react";
import { toast } from "react-toastify";

const ShareModal = ({ post, onClose }) => {
  if (!post) return null;

  // Construct the URL for the post. Adjust base URL as needed.
  // Assuming your frontend post page URL structure is /post/:postId
  const postUrl = `${window.location.origin}/posts/${post._id}`;

  const handleFacebookShare = () => {
    const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      postUrl
    )}&quote=${encodeURIComponent(post.text || "Check out this post!")}`;
    window.open(facebookShareUrl, "_blank", "width=600,height=400");
    onClose();
  };

  const handleCopyLink = () => {
    // Using document.execCommand('copy') for better compatibility in iframes
    const tempInput = document.createElement("input");
    document.body.appendChild(tempInput);
    tempInput.value = postUrl;
    tempInput.select();
    try {
      document.execCommand("copy");
      toast.success("Link copied to clipboard! ✅", {
        position: "top-right",
        autoClose: 1000,
      });
    } catch (err) {
      console.error("Failed to copy link:", err);
      toast.error("Failed to copy link. Please try manually. ❌");
    } finally {
      document.body.removeChild(tempInput);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[#000000bd] flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-sm rounded-lg shadow-lg relative p-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Share Post</h2>
          <button
            className="text-gray-500 hover:bg-gray-200 rounded-full p-2 transition-colors duration-200"
            onClick={onClose}
          >
            <X size={24} />
          </button>
        </div>

        {/* Share Options */}
        <div className="space-y-4">
          <button
            onClick={handleFacebookShare}
            className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors duration-200"
          >
            <Facebook size={20} />
            Share on Facebook
          </button>

          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-3 border border-gray-300 text-gray-700 py-3 rounded-lg font-semibold bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
          >
            <LinkIcon size={20} />
            Copy Link
          </button>
        </div>

        {/* Post Preview (Optional - for better context in modal) */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 mb-2">Sharing:</p>
          <div className="bg-gray-100 p-3 rounded-lg text-gray-800 text-sm max-h-50 overflow-scroll">
            <p className="font-medium mb-1">{post.text || "No text content"}</p>
            {post.images && post.images.length > 0 && (
              <img
                src={post.images[0]}
                alt="Post media"
                className="w-full h-50 object-cover rounded-md mt-2"
              />
            )}
            {post.videos.length > 0 && 
            post.videos.map((vid, index) => 
              <video
                key={index}
                src={vid}
                controls
                muted
                className="w-full h-50 object-cover rounded-md mt-2"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default ShareModal;