export type FuelType = "PETROL" | "DIESEL" | "ELECTRIC" | "HYBRID";
export type Transmission = "AUTOMATIC" | "MANUAL";

export interface CarImage {
  id: string;
  url: string;
  carId: string;
  createdAt: string;
}

export interface Car {
  id: string;
  brand: string;
  model: string;
  type: string;
  fuelType: FuelType;
  transmission: Transmission;
  description: string;
  seats: number;
  doors: number;
  color: string;
  images: CarImage[];
  pricePerDay: number;
  available: boolean;
  createdAt: string;
  updatedAt: string;
}

export type NewCarFormValues = {
  brand: string;
  model: string;
  type: string;
  fuelType: FuelType;
  transmission: Transmission;
  description: string;
  seats: number;
  doors: number;
  color: string;
  images: CarImage[];
  pricePerDay: number;
  available: boolean;
};
