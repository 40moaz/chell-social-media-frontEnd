import React, { useState } from "react";
import {
  FaGoogle,
  FaTwitter,
  FaFacebookF,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import instance from "../axios/instance";
const SignUp = () => {
  // --- Form Field States ---
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [countryCode, setCountryCode] = useState("+1"); // Default to +1
  const [selectedMonth, setSelectedMonth] = useState("Jan");
  const [selectedDay, setSelectedDay] = useState("01");
  const [selectedYear, setSelectedYear] = useState(
    new Date().getFullYear() - 18
  ); // Default to min age 18

  // --- Error States ---
  const [errors, setErrors] = useState({});

  // --- Password Visibility States ---
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  // --- Toggle Password Visibility ---
  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setShowPassword(!showPassword);
    } else if (field === "confirmPassword") {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  // --- Helper functions for birthday options ---
  const getMonths = () => {
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return months.map((month) => (
      <option key={month} value={month}>
        {month}
      </option>
    ));
  };

  const getDays = () => {
    const days = [];
    // Determine max days for the selected month and year for more accurate validation
    const yearNum = parseInt(selectedYear);
    const monthIndex = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ].indexOf(selectedMonth);
    const date = new Date(yearNum, monthIndex + 1, 0); // Day 0 of next month is last day of current month
    const maxDays = date.getDate();

    for (let i = 1; i <= maxDays; i++) {
      days.push(
        <option key={i} value={String(i).padStart(2, "0")}>
          {String(i).padStart(2, "0")}
        </option>
      );
    }
    return days;
  };

  const getYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i >= 1900; i--) {
      // Start from current year down to 1900
      years.push(
        <option key={i} value={i}>
          {i}
        </option>
      );
    }
    return years;
  };

  // Dummy country codes for the select dropdown (expanded slightly)
  const countryCodes = [
    { code: "+1", name: "USA" },
    { code: "+44", name: "UK" },
    { code: "+91", name: "India" },
    { code: "+20", name: "Egypt" },
    { code: "+49", name: "Germany" },
    { code: "+33", name: "France" },
    { code: "+81", name: "Japan" },
    { code: "+86", name: "China" },
    { code: "+55", name: "Brazil" },
    { code: "+7", name: "Russia" },
    { code: "+61", name: "Australia" },
    { code: "+27", name: "South Africa" },
  ];

  // --- Validation Function ---
  const validateForm = () => {
    let newErrors = {};
    let isValid = true;

    // Full Name Validation
    if (!fullName.trim()) {
      newErrors.fullName = "Full Name is required.";
      isValid = false;
    } else if (fullName.trim().length < 3) {
      newErrors.fullName = "Full Name must be at least 3 characters.";
      isValid = false;
    }

    // Username Validation
    if (!username.trim()) {
      newErrors.username = "Username is required.";
      isValid = false;
    } else if (username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters.";
      isValid = false;
    } else if (/\s/.test(username)) {
      newErrors.username = "Username cannot contain spaces.";
      isValid = false;
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      newErrors.username =
        "Username can only contain letters, numbers, and underscores.";
      isValid = false;
    }

    // Email Validation
    if (!email.trim()) {
      newErrors.email = "Email is required.";
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Email address is invalid.";
      isValid = false;
    }

    // Phone Number Validation
    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required.";
      isValid = false;
    } else if (!/^\d{7,15}$/.test(phoneNumber.replace(/\s/g, ""))) {
      // Allows 7-15 digits, removes spaces for validation
      newErrors.phoneNumber = "Phone number must be 7-15 digits.";
      isValid = false;
    }

    // Birthday Validation (Age 18+)
    const dob = new Date(
      selectedYear,
      [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ].indexOf(selectedMonth),
      parseInt(selectedDay)
    );
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
      // If current month is before DOB month, or same month but current day is before DOB day, decrement age.
      // This accounts for birthdays later in the year.
      if (
        selectedYear == new Date().getFullYear() - 18 &&
        dob.getMonth() > today.getMonth()
      ) {
        newErrors.birthday = "You must be at least 18 years old.";
        isValid = false;
      } else if (
        selectedYear == new Date().getFullYear() - 18 &&
        dob.getMonth() === today.getMonth() &&
        dob.getDate() > today.getDate()
      ) {
        newErrors.birthday = "You must be at least 18 years old.";
        isValid = false;
      } else if (age < 18) {
        newErrors.birthday = "You must be at least 18 years old.";
        isValid = false;
      }
    }
    // Also check for future dates
    if (dob > today) {
      newErrors.birthday = "Birthday cannot be in the future.";
      isValid = false;
    }

    // Password Validation
    if (!password) {
      newErrors.password = "Password is required.";
      isValid = false;
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
      isValid = false;
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter.";
      isValid = false;
    } else if (!/[a-z]/.test(password)) {
      newErrors.password =
        "Password must contain at least one lowercase letter.";
      isValid = false;
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Password must contain at least one number.";
      isValid = false;
    } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      newErrors.password =
        "Password must contain at least one special character.";
      isValid = false;
    }

    // Confirm Password Validation
    if (!confirmPassword) {
      newErrors.confirmPassword = "Confirm Password is required.";
      isValid = false;
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = "Passwords do not match.";
      isValid = false;
    }

    setErrors(newErrors); // Update error state
    return isValid; // Return overall validity
  };
  const RegisterAccount = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const res = await instance.post("/auth/register", {
          fullName,
          username,
          email,
          phone: countryCode + phoneNumber,
          birthday: `${selectedMonth} ${selectedDay}, ${selectedYear}`,
          password,
          profileImage: "",
          bio: "",
          location: "",
          website: "",
        });

        localStorage.setItem("user", JSON.stringify(res.data.user));
        window.location.href = "/";
      } catch (error) {
        // Handle backend validation errors
        const message = error.response?.data?.message;

        if (message) {
          // Map backend errors to appropriate field if possible
          const newErrors = {};
          if (message.includes("Email")) {
            newErrors.email = message;
          } else if (message.includes("Username")) {
            newErrors.username = message;
          } else if (message.includes("18")) {
            newErrors.birthday = message;
          } else {
            newErrors.general = message;
          }

          setErrors(newErrors);
        } else {
          setErrors({ general: "An unexpected error occurred." });
        }
      }
    } else {
      console.log("Form validation failed. Please check errors.");
    }
  };
  return (
    <div className="flex w-full">
      {/* Left Side - Branding */}
      <div className="hidden md:flex w-1/2 bg-gradient-to-br from-[#3554f5] to-[#5d81f7] flex-col items-center justify-center text-white relative">
        <h1 className="text-4xl font-extrabold mb-2">Chello</h1>
        <p className="text-xl">Creators + Fans = Chello</p>
        <p className="text-sm mt-1">#LetsGO</p>

        {/* Watermark Image - Updated path for the wallet icon based on previous suggestion */}
        <img
          src="https://www.svgrepo.com/show/367344/wallet.svg"
          alt="wallet-icon"
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-60 opacity-20"
        />
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 flex items-center justify-center bg-white p-4 sm:p-6 md:p-8">
        <div className="max-w-md w-full px-4 sm:px-6">
          {errors.general && (
            <p className="text-red-500 text-sm mt-2 text-center">
              {errors.general}
            </p>
          )}

          <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center sm:text-left">
            Sign Up
          </h2>
          {/* Form */}
          <form onSubmit={RegisterAccount} className="space-y-5">
            <div>
              <label
                htmlFor="fullName"
                className="text-sm font-medium text-gray-700 block mb-1"
              >
                Full Name
              </label>
              <input
                type="text"
                id="fullName"
                placeholder="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 bg-gray-50
                  ${
                    errors.fullName
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="username"
                className="text-sm font-medium text-gray-700 block mb-1"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 bg-gray-50
                  ${
                    errors.username
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700 block mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 bg-gray-50
                  ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Phone Number Input */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="text-sm font-medium text-gray-700 block mb-1"
              >
                Enter Your Phone Number
              </label>
              <div
                className={`flex rounded-md border bg-gray-50 focus-within:ring-2
                ${
                  errors.phoneNumber
                    ? "border-red-500 focus-within:ring-red-500"
                    : "border-gray-300 focus-within:ring-blue-500"
                }`}
              >
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="px-3 py-2 bg-gray-50 border-r border-gray-300 rounded-l-md focus:outline-none appearance-none"
                >
                  {countryCodes.map((cc) => (
                    <option key={cc.code} value={cc.code}>
                      {cc.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  id="phoneNumber"
                  placeholder=""
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="flex-grow px-3 py-2 bg-gray-50 rounded-r-md focus:outline-none"
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            {/* Birthday Input */}
            <div>
              <label className="text-sm font-medium text-gray-700 block mb-1">
                Enter Your Birthday.
              </label>
              <div
                className={`flex space-x-2 bg-gray-50 border rounded-md p-2 justify-between items-center
                ${errors.birthday ? "border-red-500" : "border-gray-300"}`}
              >
                {/* Month */}
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="flex-1 bg-transparent focus:outline-none text-center"
                >
                  {getMonths()}
                </select>
                <span className="text-gray-400">|</span>
                {/* Day */}
                <select
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="flex-1 bg-transparent focus:outline-none text-center"
                >
                  {getDays()}
                </select>
                <span className="text-gray-400">|</span>
                {/* Year */}
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="flex-1 bg-transparent focus:outline-none text-center"
                >
                  {getYears()}
                </select>
              </div>
              {errors.birthday && (
                <p className="text-red-500 text-xs mt-1">{errors.birthday}</p>
              )}
            </div>

            <div className="relative">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700 block mb-1"
              >
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 pr-10 bg-gray-50
                  ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
              />
              <span
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer mt-6"
                onClick={() => togglePasswordVisibility("password")}
              >
                {showPassword ? (
                  <FaEyeSlash className="text-gray-500" />
                ) : (
                  <FaEye className="text-gray-500" />
                )}
              </span>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>
            <div className="relative">
              <label
                htmlFor="confirmPassword"
                className="text-sm font-medium text-gray-700 block mb-1"
              >
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 pr-10 bg-gray-50
                  ${
                    errors.confirmPassword
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
              />
              <span
                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer mt-6"
                onClick={() => togglePasswordVisibility("confirmPassword")}
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="text-gray-500" />
                ) : (
                  <FaEye className="text-gray-500" />
                )}
              </span>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition duration-300 ease-in-out"
            >
              Sign Up
            </button>
          </form>

          {/* Terms and Policy */}
          <p className="text-xs text-gray-500 mt-4 text-center sm:text-left">
            By signing up you agree to our{" "}
            <Link
              to="/terms-of-service"
              className="text-blue-600 hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy-policy"
              className="text-blue-600 hover:underline"
            >
              Privacy Policy
            </Link>{" "}
            and confirm that you are at least 18 years old.
          </p>

          {/* Already have an account? Log In link */}
          <p className="text-sm text-center mt-4">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:underline">
              Log In
            </Link>
          </p>

          {/* OR Divider */}
          <div className="flex items-center my-6">
            <hr className="flex-grow border-t border-gray-300" />
            <span className="mx-4 text-gray-400 text-sm">or</span>
            <hr className="flex-grow border-t border-gray-300" />
          </div>

          {/* Social login buttons */}
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-3 border border-gray-300 py-2.5 rounded-md hover:bg-gray-50 text-gray-700 font-medium">
              <FaGoogle className="text-red-500 text-lg" /> Sign Up with Google
            </button>
            <button className="w-full flex items-center justify-center gap-3 border border-gray-300 py-2.5 rounded-md hover:bg-gray-50 text-gray-700 font-medium">
              <FaTwitter className="text-blue-400 text-lg" /> Sign Up with
              Twitter
            </button>
            <button className="w-full flex items-center justify-center gap-3 border border-gray-300 py-2.5 rounded-md hover:bg-gray-50 text-gray-700 font-medium">
              <FaFacebookF className="text-blue-700 text-lg" /> Sign Up with
              Facebook
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
