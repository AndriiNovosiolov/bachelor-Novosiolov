import apiService from "@/services/api";

export const autoService = {
  // Отримати всі сервіси з фільтрами
  getAll: (params?: {
    type?: string;
    minPrice?: number;
    maxPrice?: number;
    minRating?: number;
  }) => apiService.get("/auto-services", { params }),

  // Створити запит на сервіс
  createRequest: (data: {
    type: string;
    description: string;
    carWashId: string;
  }) => apiService.post("/auto-services/request", data),

  // Порівняти сервіси
  compare: (ids: string[]) =>
    apiService.get(`/auto-services/compare`, {
      params: { ids: ids.join(",") },
    }),

  // Пошук зовнішніх автосервісів (Google)
  searchExternal: (params: {
    lat: number;
    lng: number;
    radius?: number;
    type: string;
  }) => apiService.get("/auto-services/external/search", { params }),

  // Зберегти зовнішній сервіс у базу
  saveExternal: (data: any) =>
    apiService.post("/auto-services/external/save", data),
};
