import apiService from "@/services/api";
import { User } from "@/types";

export const userService = {
  create: (
    data: Omit<User, "id" | "createdAt" | "updatedAt"> & { password: string }
  ) => apiService.post<User>("/users", data),

  update: (
    id: string,
    data: Partial<Omit<User, "id" | "createdAt" | "updatedAt">>
  ) => apiService.patch<User>(`/users/${id}`, data),

  getAll: (params?: { email?: string; role?: string }) =>
    apiService.get<User[]>("/users", { params }),

  getById: (id: string) => apiService.get<User>(`/users/${id}`),
};
