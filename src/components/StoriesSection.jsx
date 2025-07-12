import React from "react";
import { Plus } from "lucide-react";

const StoriesSection = ({ stories }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4 overflow-x-auto">
      <div className="flex items-center justify-between space-x-4">
        <div className="flex-shrink-0 w-22">
          <div className="w-full h-30 rounded-lg bg-blue-600 flex items-center justify-center text-white text-2xl border-2 border-blue-600 cursor-pointer">
            <Plus size={32} />
          </div>
          <p className="text-center text-blue-600 text-sm mt-1">Add Story</p>
        </div>

        {stories.map((story) => (
          <div key={story.id} className="flex-shrink-0 w-22 cursor-pointer">
            <img
              src={story.img}
              alt={story.alt}
              className="w-full h-30 rounded-lg object-cover border-2 border-blue-500 hover:border-blue-700 transition-colors duration-200"
            />
            <p className="text-center text-gray-700 text-sm mt-1 truncate">
              {story.alt}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StoriesSection;
