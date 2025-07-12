import {
  FaInstagram,
  FaTiktok,
  FaXTwitter,
  FaFacebookF,
  FaRedditAlien,
} from "react-icons/fa6";

const Footer = () => {
  return (
    <footer style={{border: "1px solid #E5E5E5"}} className="bg-white pt-10 pb-6 px-6 md:px-20 text-gray-600 text-sm">
      <div className="max-w-screen-xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        {/* Column 1 */}
        <div className="space-y-4">
          <p className="hover:underline cursor-pointer">About</p>
          <p className="hover:underline cursor-pointer">Terms</p>
          <p className="hover:underline cursor-pointer">Privacy</p>
          <p className="hover:underline cursor-pointer">Disclaimer</p>
          <p className="hover:underline cursor-pointer">Acceptable Use</p>
        </div>

        {/* Column 2 */}
        <div className="space-y-4">
          <p className="hover:underline cursor-pointer">FAQ</p>
          <p className="hover:underline cursor-pointer">Complaints Policy</p>
          <p className="hover:underline cursor-pointer">Cookie Notice</p>
          <p className="hover:underline cursor-pointer">DMCA</p>
          <p className="hover:underline cursor-pointer">USC 2257</p>
        </div>

        {/* Column 3 */}
        <div className="space-y-4">
          <p className="hover:underline cursor-pointer">Contact</p>
          <p className="hover:underline cursor-pointer">Help</p>
          <p className="hover:underline cursor-pointer">Referral</p>
          <p className="hover:underline cursor-pointer">Standard Agreement</p>
        </div>

        {/* Social Column */}
        <div className="space-y-4">
          <p className="font-semibold text-gray-700">Share Chello</p>
          <div className="flex items-center gap-3 text-white">
            <a
              href="#"
              className="bg-blue-900 hover:bg-blue-800 p-2 rounded-full"
              aria-label="Instagram"
            >
              <FaInstagram />
            </a>
            <a
              href="#"
              className="bg-blue-900 hover:bg-blue-800 p-2 rounded-full"
              aria-label="TikTok"
            >
              <FaTiktok />
            </a>
            <a
              href="#"
              className="bg-blue-900 hover:bg-blue-800 p-2 rounded-full"
              aria-label="Twitter"
            >
              <FaXTwitter />
            </a>
            <a
              href="#"
              className="bg-blue-900 hover:bg-blue-800 p-2 rounded-full"
              aria-label="Facebook"
            >
              <FaFacebookF />
            </a>
            <a
              href="#"
              className="bg-blue-900 hover:bg-blue-800 p-2 rounded-full"
              aria-label="Reddit"
            >
              <FaRedditAlien />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="text-center mt-10 text-gray-400 text-xs">
        © 2022 Chello. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
