import { Service } from "./service";
import { Schedule } from "./schedule";
import { Review } from "./review";

export interface CarWash {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  description: string;
  phone: string;
  ownerId: string;
  services: Service[];
  schedule: Schedule[];
  reviews: Review[];
  averageRating: number;
  createdAt: string;
  updatedAt: string;
  supportedSizes: string[];
}

export interface CarWashSearchResponse {
  carWash_id: string;
  carWash_ownerId: string;
  carWash_name: string;
  carWash_address: string;
  carWash_latitude: string;
  carWash_longitude: string;
  carWash_city: string;
  carWash_description: string;
  carWash_phone: string;
  carWash_createdAt: string;
  carWash_updatedAt: string;
  distance: number;
}
