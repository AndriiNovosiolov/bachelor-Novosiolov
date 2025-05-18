import { User } from "./user";
import { CarWash } from "./carWash";
import { Service } from "./service";

export interface Booking {
  id: string;
  userId: string;
  carWashId: string;
  serviceId: string;
  startTime: string; // ISO date
  endTime: string; // ISO date
  notes: string;
  totalPrice: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  reminderSent: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
  carWash?: CarWash;
  service?: Service;
}
