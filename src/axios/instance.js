// src/axios/instance.js
import axios from "axios";

// لو هتجيب التوكن من localStorage أو context
const token = localStorage.getItem("token"); // optional
console.log(token);

const instance = axios.create({
  baseURL: "https://chell-social-media-back-end.vercel.app/api", // أو من .env
  headers: {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

export default instance;
