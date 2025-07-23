// src/api/messages.js
import axios from "../axios/instance";

export const getMessages = (user1Id, user2Id) =>
  axios.get(`/messages/${user1Id}/${user2Id}`);

export const sendMessageAPI = (data) =>
  axios.post("/messages", data);

export const markAsSeen = (id) =>
  axios.patch(`/messages/${id}/seen`);
