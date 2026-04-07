import { Car, FuelType, Transmission } from "@/types/car";

export type { Car, FuelType, Transmission };

export interface User {
  id: string;
  name?: string;
  email?: string;
  role: "USER" | "ADMIN";
}

export interface Booking {
  id: string;
  userId: string;
  carId: string;
  startDate: string;
  endDate: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  createdAt: string;
  updatedAt: string;
  user?: User;
  car?: Car;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED";
  method: string;
  createdAt: string;
  updatedAt: string;
}
