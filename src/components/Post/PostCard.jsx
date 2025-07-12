import React from "react";
import PostHeader from "./PostHeader";
import PostImages from "./PostImages";
import PostActions from "./PostActions";
import { confirmAlert } from "react-confirm-alert";

const PostCard = ({
  post,
  user,
  timeAgo,
  onLike,
  onComment,
  onShare,
  isOwner,
  openMenuPostId,
  setOpenMenuPostId,
  menuRef,
  setModalImage,
  onDeletePost,
}) => {
  return (
    <div className="border-b mt-2 bg-white border-gray-300 last:border-b-0 p-4 relative">
      <div className="flex items-center mb-3 justify-between">
        <PostHeader
          post={post}
          postUsers={{ [user._id]: user }}
          timeAgo={timeAgo}
          isOwner={isOwner}
          openMenuPostId={openMenuPostId}
          setOpenMenuPostId={setOpenMenuPostId}
          menuRef={menuRef}
        />

        {isOwner && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() =>
                setOpenMenuPostId(openMenuPostId === post._id ? null : post._id)
              }
              className="text-gray-600 text-2xl hover:text-gray-900 focus:outline-none"
            >
              &#x22EE;
            </button>

            {openMenuPostId === post._id && (
              <div className="absolute right-0 mt-2 w-36 bg-white border rounded shadow-lg z-10">
                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  Edit
                </button>

                <button
                  className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                  onClick={() => {
                    setOpenMenuPostId(null);
                    confirmAlert({
                      title: "Delete Confirmation",
                      message: "Are you sure you want to delete this post?",
                      buttons: [
                        {
                          label: "Yes, delete it",
                          onClick: () => onDeletePost(post._id),
                        },
                        {
                          label: "Cancel",
                          onClick: () => {},
                        },
                      ],
                    });
                  }}
                >
                  Delete
                </button>

                <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                  Share
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <p className="text-gray-800 mb-3 whitespace-pre-wrap">{post.text}</p>

      {post.images && post.images.length > 0 && (
        <PostImages images={post.images} setModalImage={setModalImage} />
      )}

      <PostActions onLike={onLike} onComment={onComment} onShare={onShare} />
    </div>
  );
};

export default PostCard;
