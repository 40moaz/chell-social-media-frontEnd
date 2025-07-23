import {
  CiHome,
  CiBellOn,
  CiMail,
  CiUser,
  CiSearch,
  CiCirclePlus,
} from "react-icons/ci";
import { FaUsers, FaFacebookMessenger } from "react-icons/fa";
import { Link, NavLink } from "react-router-dom";

const Navbar = () => {
  const navIconStyle = ({ isActive }) =>
    `flex flex-col items-center justify-center text-[#4747d8] border-1 p-2 rounded-lg ${
      isActive
        ? "bg-[#5858FA] text-white"
        : "hover:bg-[#5858FA] hover:text-white"
    }`;

  return (
    <nav className="bg-[#fff] border-t-1 shadow-md z-50 fixed bottom-0 left-0 w-full md:relative md:hidden">
      {/* Top bar: Logo & actions */}
      <div className="flex items-center justify-between px-4 py-2">
        <a href="/" className="text-2xl font-extrabold text-[#5858FA]">
          Chell
        </a>
        <div className="flex items-center gap-3 text-2xl  text-[#5858FA]">
          <Link to="/search">
            <CiSearch className="cursor-pointer " />
          </Link>
          <Link to="/profile">
            <CiUser className="cursor-pointer " />
          </Link>
          <CiCirclePlus className="cursor-pointer " />
        </div>
      </div>

      {/* Bottom nav icons */}
      <div className="flex justify-around items-center w-full px-1 py-1 pb-2 bg-[#fff] rounded-md">
        <NavLink to="/" className={navIconStyle}>
          <CiHome size={20} />
        </NavLink>
        <NavLink to="/friends" className={navIconStyle}>
          <FaUsers size={20} />
        </NavLink>
        <NavLink to="/messages" className={navIconStyle}>
          <FaFacebookMessenger size={20} />
        </NavLink>
        <NavLink to="/notifications" className={navIconStyle}>
          <CiBellOn size={20} />
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
