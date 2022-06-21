import axios from "axios";

const service = axios.create({
  baseURL: `${window.location.protocol}//${window.location.hostname}:3012`,
  timeout: 5000,
  // adapter: require("axios/lib/adapters/http"),
});

service.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
    }

    return config;
  },
  (err) => Promise.reject(err)
);

export default service;
