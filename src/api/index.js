import axios from "axios";

const authToken = localStorage.getItem("authToken");

export const api = axios.create({
  baseURL: " http://localhost:4000/api",
  headers: {
    Authorization: authToken,
  },
});

// Add a response interceptor
api.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    return response;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    if (error?.response?.status === 401) {
      window.location.href = `${window.location.origin}/auth`;
    }
    return Promise.reject(error);
  }
);
