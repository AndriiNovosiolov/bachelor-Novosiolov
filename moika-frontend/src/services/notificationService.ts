import apiService from "@/services/api";
import { EmailNotification, SmsNotification } from "@/types";

export const notificationService = {
  sendTestEmail: (data: EmailNotification) =>
    apiService.post("/notifications/test-email", data),

  sendTestSms: (data: SmsNotification) =>
    apiService.post("/notifications/test-sms", data),

  getAll: () => apiService.get("/notifications"),
};
