import React from "react";
import Editor from "./../Editor";

const ComposePost = ({ onPostCreated, userId }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Compose new post
      </h3>
      <Editor onPostCreated={onPostCreated} userId={userId} />
    </div>
  );
};

export default ComposePost;
