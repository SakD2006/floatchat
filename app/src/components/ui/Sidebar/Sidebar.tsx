import React from "react";

const Sidebar: React.FC = () => {
  return (
    <aside
      className="
        fixed top-0 left-0 h-full
        w-[80vw] sm:w-[60vw] md:w-[40vw] lg:w-[30vw] xl:w-[25vw]
        bg-[#1F1F1F] border-r-2 border-[#403F3F]
        shadow-xl z-50
      "
    >
      <div className="p-6 text-white">
        <h2 className="text-xl font-semibold mb-6">Sidebar</h2>
        <ul className="space-y-4">
          <li className="hover:text-gray-400 cursor-pointer">Dashboard</li>
          <li className="hover:text-gray-400 cursor-pointer">Projects</li>
          <li className="hover:text-gray-400 cursor-pointer">Settings</li>
          <li className="hover:text-gray-400 cursor-pointer">Logout</li>
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
