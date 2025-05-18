import { AuthResponse, User } from "@/types";
import apiService from "@/services/api";

export const authService = {
  register: (
    data: Omit<User, "id" | "createdAt" | "updatedAt"> & { password: string }
  ) => apiService.post<AuthResponse>("/auth/register", data),

  login: (data: { email: string; password: string }) =>
    apiService.post<AuthResponse>("/auth/login", data),
};
