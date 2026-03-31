import apiClient from "@/lib/api-client";
import Cookies from "js-cookie";
import type {
  User,
  LoginInput,
  SignupInput,
  UpdateProfileInput,
  StorageUsage,
  ChangePasswordInput,
} from "./schemas";

export async function login(data: LoginInput): Promise<User> {
  const response = await apiClient.post("/auth/signin", data);
  const userData = response.data;

  if (userData.accessToken) {
    Cookies.set("access_token", userData.accessToken, { expires: 1 });
    if (userData.refreshToken) {
      Cookies.set("refresh_token", userData.refreshToken, { expires: 30 });
    }
    Cookies.set("user_data", JSON.stringify(userData), { expires: 1 });
  }

  return userData;
}

export async function loginWithGoogle(code: string): Promise<User> {
  const response = await apiClient.post("/auth/google", { code });
  const userData = response.data;

  if (userData.accessToken) {
    Cookies.set("access_token", userData.accessToken, { expires: 1 });
    if (userData.refreshToken) {
      Cookies.set("refresh_token", userData.refreshToken, { expires: 30 });
    }
    Cookies.set("user_data", JSON.stringify(userData), { expires: 1 });
  }

  return userData;
}

export async function loginWithGithub(code: string): Promise<User> {
  const response = await apiClient.post("/auth/github", { code });
  const userData = response.data;

  if (userData.accessToken) {
    Cookies.set("access_token", userData.accessToken, { expires: 1 });
    if (userData.refreshToken) {
      Cookies.set("refresh_token", userData.refreshToken, { expires: 30 });
    }
    Cookies.set("user_data", JSON.stringify(userData), { expires: 1 });
  }

  return userData;
}

export async function loginWithDribbble(code: string, redirectUri: string): Promise<User> {
  const response = await apiClient.post("/auth/dribbble", { code, redirectUri });
  const userData = response.data;

  if (userData.accessToken) {
    Cookies.set("access_token", userData.accessToken, { expires: 1 });
    if (userData.refreshToken) {
      Cookies.set("refresh_token", userData.refreshToken, { expires: 30 });
    }
    Cookies.set("user_data", JSON.stringify(userData), { expires: 1 });
  }

  return userData;
}

export async function loginWithZalo(code: string): Promise<User> {
  const response = await apiClient.post("/auth/zalo", { code });
  const userData = response.data;

  if (userData.accessToken) {
    Cookies.set("access_token", userData.accessToken, { expires: 1 });
    if (userData.refreshToken) {
      Cookies.set("refresh_token", userData.refreshToken, { expires: 30 });
    }
    Cookies.set("user_data", JSON.stringify(userData), { expires: 1 });
  }

  return userData;
}

export async function register(data: SignupInput): Promise<unknown> {
  const response = await apiClient.post("/auth/signup", data);
  return response.data;
}

export async function logout(): Promise<void> {
  try {
    await apiClient.post("/auth/logout");
  } catch (err) {
    console.error("Error logout API", err);
  }
  Cookies.remove("access_token");
  Cookies.remove("refresh_token");
  Cookies.remove("user_data");
}

export async function getMe(): Promise<User> {
  const response = await apiClient.get("/auth/me");
  return response.data;
}

export function getCurrentUser(): User | null {
  const userStr = Cookies.get("user_data");
  if (userStr) return JSON.parse(userStr);
  return null;
}

export async function updateProfile(data: UpdateProfileInput): Promise<User> {
  const response = await apiClient.put("/user/profile", data);
  return response.data;
}

export async function getStorageUsage(): Promise<StorageUsage> {
  const response = await apiClient.get<StorageUsage>("/user/storage");
  return response.data;
}

export async function upgradePlan(): Promise<User> {
  await apiClient.post("/subscription/upgrade");
  // Sau khi upgrade, nên lấy lại info mới
  return getMe();
}

export async function changePassword(
  data: Omit<ChangePasswordInput, "confirmPassword">,
): Promise<void> {
  await apiClient.put("/user/password", data);
}
