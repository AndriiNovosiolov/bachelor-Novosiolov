export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export interface Schedule {
  id: string;
  carWashId: string;
  dayOfWeek: DayOfWeek;
  openTime: string; // HH:mm
  closeTime: string; // HH:mm
  isWorking: boolean;
  createdAt: string;
  updatedAt: string;
}
