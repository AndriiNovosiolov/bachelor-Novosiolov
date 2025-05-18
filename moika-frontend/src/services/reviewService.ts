import apiService from "@/services/api";
import { Review } from "@/types";

export const reviewService = {
  create: (
    carWashId: string,
    data: Omit<Review, "id" | "carWashId" | "createdAt" | "updatedAt" | "user">
  ) => apiService.post<Review>(`/reviews/car-wash/${carWashId}`, data),

  update: (
    id: string,
    data: Partial<
      Omit<Review, "id" | "carWashId" | "createdAt" | "updatedAt" | "user">
    >
  ) => apiService.patch<Review>(`/reviews/${id}`, data),

  getByCarWash: (
    carWashId: string,
    params?: { minRating?: number; maxRating?: number }
  ) => apiService.get<Review[]>(`/reviews/car-wash/${carWashId}`, { params }),

  getByUser: (userId: string) =>
    apiService.get<Review[]>(`/reviews/user/${userId}`),
};
