export interface Review {
  id?: number;
  productId: number;
  rating: number;
  reviewText: string;
  username: string; 
  createdAt?: string;
}