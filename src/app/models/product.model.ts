export interface ProductDTO {
  id?: number;
  name: string;
  description: string;
  images: string[];
  price: number;
  categoryId: number; 
  categoryName: string; 
  stockQuantity: number;
}
