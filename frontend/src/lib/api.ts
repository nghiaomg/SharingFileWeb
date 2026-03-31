import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor for requests: attach token from cookies
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("access_token");
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Interceptor for responses: handle global errors like 401 Unauthorized
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/refreshtoken" &&
      originalRequest.url !== "/auth/signin"
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = Cookies.get("refresh_token");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        const rs = await axios.post(`${API_BASE_URL}/auth/refreshtoken`, {
          refreshToken,
        });

        const { accessToken } = rs.data;

        Cookies.set("access_token", accessToken, { expires: 1 });
        api.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

        return api(originalRequest);
      } catch (_error) {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        Cookies.remove("user_data");
        // Có thể redirect user đến trang login ở client side. Thông thường kết hợp với event bus hoặc store.
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(_error);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
