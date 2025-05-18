import { User } from "./user";

export interface Review {
  id: string;
  carWashId: string;
  userId: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  updatedAt: string;
  user?: User;
}
