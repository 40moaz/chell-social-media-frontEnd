import React from "react";
import PostCard from "./PostCard";

const PostFeed = ({
  posts,
  postUsers,
  loading,
  timeAgo,
  onLike,
  onComment,
  onShare,
  isPostOwner,
  openMenuPostId,
  setOpenMenuPostId,
  menuRef,
  setModalImage,
  onDeletePost,
}) => {
  if (loading) return <p className="p-6">Loading posts...</p>;
  if (!posts || posts.length === 0)
    return <p className="p-6 text-gray-500">No posts available.</p>;

  return (
    <div className="rounded-lg shadow-sm">
      {posts.map((post) => {
        const postUser = postUsers[post.userId] || {};
        return (
          <PostCard
            key={post._id}
            post={post}
            user={postUser}
            timeAgo={timeAgo}
            onLike={() => onLike(post._id)}
            onComment={() => onComment(post)}
            onShare={() => onShare(post._id)}
            isOwner={isPostOwner(post.userId)}
            openMenuPostId={openMenuPostId}
            setOpenMenuPostId={setOpenMenuPostId}
            menuRef={menuRef}
            setModalImage={setModalImage}
            onDeletePost={onDeletePost}
          />
        );
      })}
    </div>
  );
};

export default PostFeed;
