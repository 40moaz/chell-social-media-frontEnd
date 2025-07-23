import React from "react";
import PostCard from "./PostCard";
import moment from "moment";

const PostFeed = ({
  posts,
  currentUser,
  postUsers,
  loading,
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
    <div className="rounded-lg shadow-sm mb-10">
      {posts.map((post) => {
        const postUser = postUsers[post.userId] || {};
        return (
          <PostCard
            key={post._id}
            postId={post._id}
            post={post}
            user={postUser}
            currentUser={currentUser}
            timeAgo={moment(post.createdAt).fromNow()}
            onComment={() => onComment(post)}
            onShare={() => onShare(post)}
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
