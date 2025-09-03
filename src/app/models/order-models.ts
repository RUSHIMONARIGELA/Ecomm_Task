import { ProductDTO } from "./product.model"; 

export interface OrderItemDTO {
  id?: number;
  productDetails: ProductDTO;
  quantity: number;
  price: number; 
}

export interface OrderDTO {
  id?: number;
  customerId: number;
  orderDate: string; 
  status: string; 
  totalAmount: number; 
  orderItems: OrderItemDTO[];
  shippingAddress: string; 

  
  couponCode?: string; 
  discountAmount?: number; 
}
