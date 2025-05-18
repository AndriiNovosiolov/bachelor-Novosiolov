import apiService from "@/services/api";
import { Service } from "@/types";

export const serviceService = {
  create: (
    carWashId: string,
    data: Omit<Service, "id" | "carWashId" | "createdAt" | "updatedAt"> & {
      durationMinutes: number;
    }
  ) => apiService.post<Service>(`/services/car-wash/${carWashId}`, data),

  update: (
    id: string,
    data: Partial<Omit<Service, "id" | "carWashId" | "createdAt" | "updatedAt">>
  ) => apiService.patch<Service>(`/services/${id}`, data),

  getAll: (params?: { carWashId?: string; name?: string }) =>
    apiService.get<Service[]>("/services", { params }),

  getByCarWash: (carWashId: string) =>
    apiService.get<Service[]>(`/services/car-wash/${carWashId}`),

  delete: (id: string) => apiService.delete(`/services/${id}`),
};
