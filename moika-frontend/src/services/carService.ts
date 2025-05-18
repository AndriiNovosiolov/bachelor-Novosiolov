import apiService from "@/services/api";
import { Car } from "@/types";

export const carService = {
  getAll: () => apiService.get<Car[]>(`/auto-services/user-cars`),
  getById: (id: string) =>
    apiService.get<Car>(`/auto-services/user-cars/${id}`),
  create: (data: Omit<Car, "id">) =>
    apiService.post<Car>(`/auto-services/user-cars`, data),
  update: (id: string, data: Partial<Omit<Car, "id">>) =>
    apiService.patch<Car>(`/auto-services/user-cars/${id}`, data),
  delete: (id: string) => apiService.delete(`/auto-services/user-cars/${id}`),
};
