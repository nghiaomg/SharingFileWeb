"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { login, register, logout, updateProfile } from "./api";
import { authKeys } from "./queries";
import type { LoginInput, SignupInput, UpdateProfileInput } from "./schemas";

// ─── Login ───────────────────────────────────────────────────────────────────
export function useLogin() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: authKeys.me() });
      router.push("/dashboard");
    },
  });
}

// ─── Register ────────────────────────────────────────────────────────────────
export function useRegister() {
  const router = useRouter();

  return useMutation({
    mutationFn: (input: SignupInput) => register(input),
    onSuccess: () => {
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    },
  });
}

// ─── Logout ──────────────────────────────────────────────────────────────────
export function useLogout() {
  const qc = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: () => logout(),
    onSettled: () => {
      qc.removeQueries({ queryKey: authKeys.all() });
      router.push("/login");
    },
  });
}

// ─── Update Profile ──────────────────────────────────────────────────────────
export function useUpdateProfile() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateProfileInput) => updateProfile(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}
