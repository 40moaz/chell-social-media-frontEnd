import React from "react";
import PostHeader from "./PostHeader";
import PostFiles from "./PostFiles";
import PostActions from "./PostActions";
import { confirmAlert } from "react-confirm-alert";

const PostCard = ({
  post,
  postId,
  user,
  currentUser,
  timeAgo,
  onComment,
  onShare,
  isOwner,
  openMenuPostId,
  setOpenMenuPostId,
  menuRef,
  setModalImage,
  onDeletePost,
}) => {
  console.log(post._id);
  return (
    <div className="border-b mt-2 bg-white border-gray-300 last:border-b-0 p-4 relative">
      <div className="flex items-center mb-3 justify-between">
        <PostHeader
          post={post}
          postUsers={{ [user._id]: user }}
          timeAgo={timeAgo}
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
              className="cursor-pointer text-gray-600 text-2xl hover:text-gray-900 focus:outline-none"
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
              </div>
            )}
          </div>
        )}
      </div>
      <p className="text-gray-800 mb-3 whitespace-pre-wrap">{post.text}</p>
      {(post.images.length > 0 || post.videos.length > 0) && (
        <PostFiles
          videos={post.videos}
          images={post.images}
          setModalImage={setModalImage}
        />
      )}
      {postId && (
        <PostActions
          postId={postId}
          currentUser={currentUser}
          onComment={onComment}
          onShare={onShare}
        />
      )}
    </div>
  );
};

export default PostCard;
