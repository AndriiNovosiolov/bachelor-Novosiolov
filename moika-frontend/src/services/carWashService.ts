import apiService from "@/services/api";
import { CarWash, CarWashSearchResponse } from "@/types";

export const carWashService = {
  create: (
    ownerId: string,
    data: Omit<
      CarWash,
      | "id"
      | "ownerId"
      | "createdAt"
      | "updatedAt"
      | "services"
      | "schedule"
      | "reviews"
      | "averageRating"
    > & {
      workingHours: Record<string, { open: string; close: string }>;
      photos: string[];
    }
  ) => apiService.post<CarWash>(`/car-washes/${ownerId}`, data),

  update: (
    id: string,
    data: Partial<Omit<CarWash, "id" | "ownerId" | "createdAt" | "updatedAt">>
  ) => apiService.patch<CarWash>(`/car-washes/${id}`, data),

  getAll: (params?: { city?: string; name?: string }) =>
    apiService.get<CarWash[]>("/car-washes", { params }),

  searchByLocation: (params: { lat: number; lon: number; radius: number }) =>
    apiService.get<CarWash[]>("/car-washes/search/location", { params }),

  searchByCity: (city: string) =>
    apiService.get<CarWash[]>(
      `/car-washes/search/city/${encodeURIComponent(city)}`
    ),

  getById: (id: string) => apiService.get(`/car-washes/${id}`),

  getByOwner: (ownerId: string) =>
    apiService.get<CarWash[]>(`/car-washes/owner/${ownerId}`),

  deleteById: (id: string) => apiService.delete(`/car-washes/${id}`),

  getAverageRating: (id: string) =>
    apiService.get<number>(`/car-washes/${id}/average-rating`),
};
