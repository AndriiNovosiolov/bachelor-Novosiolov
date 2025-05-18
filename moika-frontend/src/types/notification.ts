export interface EmailNotification {
  to: string; // email
  subject: string;
  text: string;
}

export interface SmsNotification {
  to: string; // phone
  message: string;
}
