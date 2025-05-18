import apiService from "@/services/api";
import { Schedule } from "@/types";

export const scheduleService = {
  create: (data: Omit<Schedule, "id" | "createdAt" | "updatedAt">) =>
    apiService.post<Schedule>("/schedules", data),

  update: (
    id: string,
    data: Partial<Omit<Schedule, "id" | "createdAt" | "updatedAt">>
  ) => apiService.patch<Schedule>(`/schedules/${id}`, data),

  getAll: (params?: { carWashId?: string; dayOfWeek?: string }) =>
    apiService.get<Schedule[]>("/schedules", { params }),

  getByCarWash: (carWashId: string) =>
    apiService.get<Schedule[]>(`/schedules/car-wash/${carWashId}`),
};
