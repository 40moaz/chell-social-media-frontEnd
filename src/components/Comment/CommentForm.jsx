import React from "react";

const CommentForm = ({ commentText, setCommentText, handleSubmit, onCancel }) => {
  const isDisabled = !commentText.trim();

  return (
    <>
      <textarea
        value={commentText}
        onChange={(e) => setCommentText(e.target.value)}
        rows={4}
        placeholder="Write your comment here..."
        className="w-full p-3 border rounded resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex justify-end mt-4 gap-3">
        <button
          onClick={onCancel}
          className="py-2 px-4 text-sm rounded-full transition bg-gray-300 hover:bg-gray-400"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={isDisabled}
          className={`py-2 px-4 text-sm rounded-full transition text-white 
            ${isDisabled ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-700"}
          `}
        >
          Add
        </button>
      </div>
    </>
  );
};

export default CommentForm;
