// components/PostActions.jsx
import { FaComment, FaShare } from "react-icons/fa";
import LikeButton from "./LikeButton";
export default function PostActions({
  onComment,
  postId,
  currentUser,
  onShare,
}) {

  return (
    <div className="flex justify-around border-t border-gray-300 pt-2 mt-2 text-gray-600 text-sm select-none">
      <LikeButton postId={postId} currentUserId={currentUser?._id} />
      <button
        onClick={onComment}
        className=" cursor-pointer gap-1 px-5 flex items-center justify-center space-x-2 py-2 hover:bg-gray-100 rounded"
      >
        <FaComment size={24} />
        <span>Comment</span>
      </button>

      <button
        onClick={onShare}
        className="cursor-pointer gap-1 px-5 flex items-center justify-center space-x-2 py-2 hover:bg-gray-100 rounded"
      >
        <FaShare size={24} />
        <span>Share</span>
      </button>
    </div>
  );
}
