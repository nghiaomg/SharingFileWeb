import axios from "axios";
import Cookies from "js-cookie";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor for requests: attach token from cookies
apiClient.interceptors.request.use(
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
apiClient.interceptors.response.use(
  (response) => {
    // Nếu API trả về cấu trúc StandardResponse (có thuộc tính success và msg),
    // trích xuất phần 'data' để tương thích ngược với format cũ.
    if (
      response.data &&
      typeof response.data === "object" &&
      "success" in response.data
    ) {
      // Chúng ta vẫn return nguyên response axios, nhưng ghi đè axios data = spring boot data
      // Việc này giúp các component vẫn gọi req.data như bình thường
      response.data =
        response.data.data !== undefined ? response.data.data : response.data;
    }
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

        // Backend trả về StandardResponse cho refreshtoken nên dữ liệu payload nằm trong rs.data.data
        const payloadData =
          rs.data && "success" in rs.data ? rs.data.data : rs.data;
        const { accessToken } = payloadData;

        Cookies.set("access_token", accessToken, { expires: 1 });
        apiClient.defaults.headers.common["Authorization"] =
          `Bearer ${accessToken}`;

        return apiClient(originalRequest);
      } catch (_error) {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        Cookies.remove("user_data");
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(_error);
      }
    }

    return Promise.reject(error);
  },
);

export default apiClient;
