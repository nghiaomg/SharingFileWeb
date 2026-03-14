import api from "@/lib/api";
import Cookies from "js-cookie";

export interface LoginData {
  username: string;
  password?: string;
  email?: string; // Tùy chọn, tùy backend yêu cầu gửi username hay email. Nhìn backend thì cần username
}

export interface SignupData {
  username: string;
  email: string;
  password?: string;
}

export const authService = {
  login: async (data: LoginData) => {
    const response = await api.post("/auth/signin", data);
    if (response.data.accessToken) {
      Cookies.set("access_token", response.data.accessToken, { expires: 1 }); 
      if (response.data.refreshToken) {
        Cookies.set("refresh_token", response.data.refreshToken, { expires: 30 }); // expires 30 days
      }
      Cookies.set("user_data", JSON.stringify(response.data), { expires: 1 });
    }
    return response.data;
  },

  register: async (data: SignupData) => {
    const response = await api.post("/auth/signup", data);
    return response.data;
  },

  logout: async () => {
    try {
      await api.post("/auth/logout");
    } catch(err) {
      console.log("Error logic logout API", err);
    }
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    Cookies.remove("user_data");
  },

  getCurrentUser: () => {
    const userStr = Cookies.get("user_data");
    if (userStr) return JSON.parse(userStr);
    return null;
  },

  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  updateProfile: async (data: { email: string }) => {
    const response = await api.put("/user/profile", data);
    return response.data;
  }
};
