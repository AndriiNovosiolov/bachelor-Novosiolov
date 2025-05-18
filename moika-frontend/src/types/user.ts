export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: "customer" | "owner";
  carWashId?: string; // тільки для owner
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}
