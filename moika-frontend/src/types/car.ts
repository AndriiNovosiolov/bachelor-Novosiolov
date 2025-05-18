export interface Car {
  id: string;
  brand: string;
  model: string;
  year: number;
  engineType: "petrol" | "diesel" | "electric" | "hybrid";
  mileage: number;
  serviceFrequency: number;
  lastOilChangeDate: string; // ISO string
  lastDiagnosticsDate: string; // ISO string
  size: "micro" | "sedan" | "suv" | "minivan" | "pickup" | "other";
}
