import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // sends better-auth session cookie automatically
  headers: {
    "Content-Type": "application/json",
  },
});