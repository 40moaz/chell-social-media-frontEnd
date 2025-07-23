import { ArrowLeft } from "lucide-react";
import React from "react";

const BackButton = ({onClick}) => {
  return (
    <>
      {/* Back Button */}
      <div className="p-4 border-b border-gray-200 flex items-center">
        <button
          onClick={onClick} // Navigate back to the previous screen
          className="flex items-center text-gray-600 hover:text-blue-600 transition-colors duration-200
                               px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span className="font-medium">Back</span>
        </button>
      </div>
    </>
  );
};

export default BackButton;
