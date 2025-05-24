import type { Car, User, BlogPost, Message, Favorite, Review, Payment } from "@shared/schema";

export interface CarWithSeller extends Car {
  seller: User;
}

export interface BlogPostWithAuthor extends BlogPost {
  author: User;
}

export interface MessageWithUsers extends Message {
  sender: User;
  receiver: User;
}

export interface FavoriteWithCar extends Favorite {
  car: CarWithSeller;
}

export interface ReviewWithUser extends Review {
  reviewer: User;
  car?: Car;
}

export interface SearchFilters {
  make?: string;
  priceMin?: number;
  priceMax?: number;
  location?: string;
  county?: string;
  fuelType?: string;
  transmission?: string;
  bodyType?: string;
  year?: number;
  page?: number;
  limit?: number;
}

export interface AuthUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  profileImage?: string;
  isVerified: boolean;
  location?: string;
  userType: string;
  bio?: string;
  rating: string;
  totalRatings: number;
  createdAt: Date;
  updatedAt: Date;
}
