import axios from "axios";

const apiService = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Додаємо токен, якщо є
apiService.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

// Обробка помилок (опційно)
apiService.interceptors.response.use(
  (response) => response,
  (error) => {
    // Можна додати глобальну обробку 401, 500 тощо
    return Promise.reject(error);
  }
);

export default apiService;
