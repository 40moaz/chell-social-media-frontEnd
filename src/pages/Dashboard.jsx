import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/SideBarAndNavBar/NavBar";
import Sidebar from "../components/SideBarAndNavBar/Sidebar";
import Editor from "../components/Editor"; // استيراد الـ Editor

const Dashboard = ({ user }) => {
  const [showEditorModal, setShowEditorModal] = useState(false);
  const [posts, setPosts] = useState([]); // هخزن البوستات هنا

  const openEditor = () => setShowEditorModal(true);
  const closeEditor = () => setShowEditorModal(false);

  const handlePostCreated = (post) => {
    setPosts((prevPosts) => [post, ...prevPosts]); // إضافة البوست الجديد للأعلى
    closeEditor();
  };

  return (
    <div>
      {/* Navbar ثابت فوق */}
      <Navbar />

      <div className="flex flex-col md:flex-row">
        <aside className="hidden md:block w-64">
          <Sidebar user={user} onOpenEditor={openEditor} />
        </aside>

        <main className="flex-1 px-2 sm:px-4 md:px-6 bg-gray-100 min-h-screen relative">
          <div className="w-full max-w-[900px] lg:max-w-[800px] md:max-w-[700px] sm:max-w-[600px] max-w-[100%] mx-auto transition-all duration-300">
            <Outlet context={{ posts, setPosts }} />
          </div>

          {/* Modal */}
          {showEditorModal && (
            <div
              className="fixed inset-0 bg-[#000000bd] flex items-center justify-center z-50"
              onClick={closeEditor}
            >
              <div
                style={{ opacity: "100%" }}
                className="bg-white rounded-lg p-6 w-full max-w-xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-xl font-semibold mb-4">Create New Post</h2>
                <Editor userId={user._id} onPostCreated={handlePostCreated} />
                <button
                  onClick={closeEditor}
                  className="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
