import axios from "axios";

const authToken = localStorage.getItem("authToken");
const baseURL = import.meta.env.VITE_BACKEND_BASE_URL;

export const api = axios.create({
  baseURL: baseURL,
  headers: {
    Authorization: authToken,
  },
});

// Add a request interceptor
api.interceptors.request.use(
  function(config) {
    const authToken = localStorage.getItem("authToken");
    config.headers.Authorization = authToken;
    return config;
  },
  function(error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  function(response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  function(error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (
      error?.response?.status === 401 &&
      error?.config?.url?.includes("/auth/current-user")
    ) {
      window.location.href = `${window.location.origin}/auth`;
    }
    return Promise.reject(error);
  }
);
