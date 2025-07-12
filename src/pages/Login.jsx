import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaGoogle, FaTwitter, FaFacebookF } from "react-icons/fa";
import instance from "../axios/instance";

const Login = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrors({});
    setServerError("");

    if (!identifier || !password) {
      setErrors({
        identifier: !identifier ? "Username or Email is required" : "",
        password: !password ? "Password is required" : "",
      });
      return;
    }

    try {
      const res = await instance.post("/auth/login", {
        identifier,
        password,
      });

      const { token } = res.data;

      // احفظ التوكن والمستخدم في localStorage
      localStorage.setItem("token", token);

      // روح للداشبورد أو الصفحة الرئيسية
      navigate("/");
    } catch (err) {
      if (err.response?.data?.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError("Something went wrong, please try again later.");
      }
    }
  };

  return (
    <div className="flex">
      {/* Left Side */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#3554f5] to-[#5d81f7] flex-col items-center justify-center text-white relative">
        <h1 className="text-4xl font-extrabold mb-2">Chello</h1>
        <p className="text-xl">Creators + Fans = Chello</p>
        <p className="text-sm mt-1">#LetsGO</p>
        <img
          src="https://cdn-icons-png.flaticon.com/512/747/747376.png"
          alt="wallet-icon"
          className="absolute bottom-10 right-10 w-40 opacity-10"
        />
      </div>

      {/* Right Side */}
      <div className="mb-10 flex-1 flex items-center justify-center mt-30 bg-white">
        <div className="max-w-md w-full px-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Log In</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            {serverError && (
              <p className="text-red-500 text-sm mb-2">{serverError}</p>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700">
                Username or Email
              </label>
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className={`w-full px-4 py-2 mt-1 border ${
                  errors.identifier ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.identifier && (
                <p className="text-red-500 text-sm mt-1">{errors.identifier}</p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2 mt-1 border ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1">{errors.password}</p>
              )}
            </div>

            <div className="flex justify-between items-center text-sm">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
              >
                Log In
              </button>
              <a href="#" className="text-blue-600 hover:underline">
                Forgot Password?
              </a>
            </div>
          </form>

          <p className="text-sm text-center mt-4">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline">
              Sign Up
            </Link>
          </p>

          <div className="flex items-center my-6">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="mx-4 text-gray-400 text-sm">or</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>

          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-3 border border-gray-300 py-2 rounded-md hover:bg-gray-50">
              <FaGoogle className="text-red-500" /> Log in with Google
            </button>
            <button className="w-full flex items-center justify-center gap-3 border border-gray-300 py-2 rounded-md hover:bg-gray-50">
              <FaTwitter className="text-blue-400" /> Log in with Twitter
            </button>
            <button className="w-full flex items-center justify-center gap-3 border border-gray-300 py-2 rounded-md hover:bg-gray-50">
              <FaFacebookF className="text-blue-700" /> Log in with Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
