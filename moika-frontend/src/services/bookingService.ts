import apiService from "@/services/api";
import { Booking } from "@/types";

export const bookingService = {
  create: (
    userId: string,
    data: Omit<
      Booking,
      | "id"
      | "userId"
      | "createdAt"
      | "updatedAt"
      | "user"
      | "carWash"
      | "service"
      | "status"
      | "reminderSent"
    > & {
      carWashId: string;
      serviceId: string;
      startTime: string;
      notes?: string;
      totalPrice: number;
    }
  ) => apiService.post<Booking>(`/bookings/user/${userId}`, data),

  updateStatus: (
    id: string,
    status: "pending" | "confirmed" | "completed" | "cancelled"
  ) => apiService.patch<Booking>(`/bookings/${id}/status`, { status }),

  getAll: (params?: {
    userId?: string;
    carWashId?: string;
    status?: string;
    date?: string;
  }) => apiService.get<Booking[]>("/bookings", { params }),

  getByUser: (userId: string) =>
    apiService.get<Booking[]>(`/bookings/user/${userId}`),

  getByCarWash: (carWashId: string) =>
    apiService.get<Booking[]>(`/bookings/car-wash/${carWashId}`),

  getAvailableSlots: (params: {
    carWashId: string;
    serviceId: string;
    date: string;
  }) => apiService.get<string[]>("/bookings/available-slots", { params }),

  getOptimalSlot: (params: {
    carWashId: string;
    serviceId: string;
    date: string;
  }) => apiService.get<string>("/bookings/optimal-slot", { params }),

  getRecommendation: (params: {
    userId: string;
    carWashId: string;
    serviceId: string;
  }) =>
    apiService.get<{
      slot?: { date: string; time: string };
      weather?: any;
      message?: string;
    }>("/bookings/recommendation", { params }),
};
