"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { login, logout, updateProfile, changePassword } from "./api";
import { authKeys } from "./queries";
import type {
  LoginInput,
  UpdateProfileInput,
  User,
  ChangePasswordInput,
} from "./schemas";

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

    onMutate: async (newProfile) => {
      await qc.cancelQueries({ queryKey: authKeys.me() });
      const previous = qc.getQueryData<User>(authKeys.me());

      qc.setQueryData<User>(authKeys.me(), (old) => {
        if (!old) return old;
        return { ...old, ...newProfile };
      });

      return { previous };
    },

    onError: (_err, _vars, ctx) => {
      if (ctx?.previous) qc.setQueryData(authKeys.me(), ctx.previous);
    },

    onSettled: () => {
      qc.invalidateQueries({ queryKey: authKeys.me() });
    },
  });
}

// ─── Change Password ─────────────────────────────────────────────────────────
export function useChangePassword() {
  return useMutation({
    mutationFn: (input: Omit<ChangePasswordInput, "confirmPassword">) =>
      changePassword(input),
  });
}
